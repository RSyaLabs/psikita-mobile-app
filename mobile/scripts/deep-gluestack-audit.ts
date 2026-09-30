import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, "app");
const SRC_DIR = path.join(ROOT, "src");

interface Finding {
  file: string;
  type: string;
  line: number;
  content: string;
}

const findings: Finding[] = [];

const BRAND_HEX_ALLOWLIST: Record<string, ReadonlySet<string>> = {
  "app/(auth)/login.tsx": new Set(["#4285F4", "#34A853", "#FBBC05", "#EA4335"]),
};

const NON_SEMANTIC_TAILWIND =
  /(?:bg|text|border)-(?:emerald|green|blue|slate|zinc|gray|red|rose|amber|orange|purple|indigo|cyan|sky|violet|fuchsia|yellow|lime|teal)-\d{2,3}/g;

const RN_PRIMITIVES = [
  "View",
  "Text",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableWithoutFeedback",
  "TextInput",
  "Modal",
  "ScrollView",
  "Image",
  "Switch",
  "ActivityIndicator",
];

function scanDir(dir: string, excludeDirs: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const normalized = fullPath.replace(/\\/g, "/");
    if (entry.isDirectory()) {
      if (!excludeDirs.some((d) => normalized.includes(d))) {
        scanDir(fullPath, excludeDirs);
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))
    ) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath: string) {
  const relPath = path.relative(ROOT, filePath).replace(/\\/g, "/");
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  // Check 1: React Native primitive imports
  const rnMultilineMatch = content.match(
    /import\s*\{([\s\S]*?)\}\s*from\s*["']react-native["']/g,
  );

  if (rnMultilineMatch) {
    for (const match of rnMultilineMatch) {
      for (const prim of RN_PRIMITIVES) {
        // match word boundary
        const wordRegex = new RegExp(`\\b${prim}\\b`);
        if (wordRegex.test(match)) {
          findings.push({
            file: relPath,
            type: "RN_PRIMITIVE_IMPORT",
            line: 1,
            content: `Imported '${prim}' from 'react-native' instead of '@/components/ui'`,
          });
        }
      }
    }
  }

  // Check 2: Hardcoded Hex colors in JSX className or style or props
  lines.forEach((line, idx) => {
    // Ignore config files, tests, mock data, and pure SVG colors
    if (
      relPath.includes("config.ts") ||
      relPath.includes("theme/colors") ||
      relPath.includes("mocks/") ||
      relPath.includes("deep-gluestack-audit")
    ) {
      return;
    }
    // Only detect actual hex colors (e.g. #fff, #ffffff, #ffffff80, #D1FAE5) in quotes or brackets, NOT ticket #1234
    const hexMatches = line.match(
      /(?:["'`]|\[)#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})(?:["'`]|\])/g,
    );
    if (hexMatches) {
      for (const hex of hexMatches) {
        const normalizedHex = hex.slice(1, -1).toUpperCase();
        if (BRAND_HEX_ALLOWLIST[relPath]?.has(normalizedHex)) {
          continue;
        }
        findings.push({
          file: relPath,
          type: "HARDCODED_HEX",
          line: idx + 1,
          content: `Hex color '${hex}': ${line.trim().slice(0, 80)}`,
        });
      }
    }

    // Check 3: Raw non-semantic Tailwind palette in className (e.g. bg-emerald-, bg-green-, bg-blue-)
    const rawColorMatch = line.match(NON_SEMANTIC_TAILWIND);
    if (rawColorMatch) {
      findings.push({
        file: relPath,
        type: "NON_SEMANTIC_TAILWIND",
        line: idx + 1,
        content: `Raw palette '${rawColorMatch.join(", ")}': ${line.trim().slice(0, 80)}`,
      });
    }
  });
}

// Gluestack usage frequency scan
const GLUESTACK_COMPONENTS = [
  "Accordion",
  "Actionsheet",
  "Alert",
  "AlertDialog",
  "Avatar",
  "Badge",
  "Box",
  "Button",
  "Card",
  "Checkbox",
  "Fab",
  "FormControl",
  "Heading",
  "HStack",
  "Icon",
  "Image",
  "Input",
  "Modal",
  "Pressable",
  "Progress",
  "Radio",
  "ScrollView",
  "Spinner",
  "Switch",
  "Text",
  "Textarea",
  "Toast",
  "VStack",
];

const componentUsage: Record<string, number> = {};
GLUESTACK_COMPONENTS.forEach((c) => (componentUsage[c] = 0));

function scanUsage(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanUsage(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      GLUESTACK_COMPONENTS.forEach((comp) => {
        const regex = new RegExp(`<${comp}\\b`, "g");
        const matches = content.match(regex);
        if (matches) {
          componentUsage[comp] += matches.length;
        }
      });
    }
  }
}

console.log("=================================================");
console.log("🔍 DEEP FORENSIC AUDIT: GLUESTACk UI CODESPACE");
console.log("=================================================");

// Exclude src/components/ui since that IS the Gluestack implementation itself
scanDir(APP_DIR);
scanDir(SRC_DIR, ["src/components/ui"]);

console.log("\n📊 1. TEMUAN REACT NATIVE PRIMITIVES:");
const primFindings = findings.filter((f) => f.type === "RN_PRIMITIVE_IMPORT");
if (primFindings.length === 0) {
  console.log(
    "✅ Bersih: 0 primitif UI diimpor dari 'react-native' di luar src/components/ui!",
  );
} else {
  primFindings.forEach((f) => console.log(`❌ [${f.file}] ${f.content}`));
}

console.log("\n📊 2. TEMUAN HARDCODED HEX COLORS DI KODE LAYAR:");
const hexFindings = findings.filter((f) => f.type === "HARDCODED_HEX");
if (hexFindings.length === 0) {
  console.log(
    "✅ Bersih: 0 warna hex hardcode di seluruh kode layar & layout!",
  );
} else {
  hexFindings.forEach((f) =>
    console.log(`⚠️ [${f.file}:${f.line}] ${f.content}`),
  );
}

console.log("\n📊 3. TEMUAN RAW TAILWIND PALETTE (NON-SEMANTIK):");
const rawColorFindings = findings.filter(
  (f) => f.type === "NON_SEMANTIC_TAILWIND",
);
if (rawColorFindings.length === 0) {
  console.log(
    "✅ Bersih: 0 kelas Tailwind raw palette (100% menggunakan token semantik)!",
  );
} else {
  console.log(
    `Ditemukan ${rawColorFindings.length} kelas Tailwind raw palette.`,
  );
  rawColorFindings
    .slice(0, 15)
    .forEach((f) => console.log(`⚠️ [${f.file}:${f.line}] ${f.content}`));
  if (rawColorFindings.length > 15) {
    console.log(`... dan ${rawColorFindings.length - 15} lainnya.`);
  }
}

// Component Usage Frequency
scanUsage(APP_DIR);
scanUsage(path.join(SRC_DIR, "components"));

console.log("\n📊 4. FREKUENSI PENGGUNAAN 28 KOMPONEN GLUESTACK UI:");
const sortedUsage = Object.entries(componentUsage).sort((a, b) => b[1] - a[1]);
sortedUsage.forEach(([comp, count]) => {
  const bar = "█".repeat(Math.min(Math.ceil(count / 10), 30));
  console.log(`- ${comp.padEnd(14)}: ${count.toString().padStart(4)}x ${bar}`);
});

const unused = sortedUsage.filter(([_, count]) => count === 0).map(([c]) => c);
console.log(
  "\n⚠️ Komponen yang BELUM/JARANG digunakan di layar:",
  unused.join(", ") || "Semua terpakai!",
);

const primitiveContractFindings: string[] = [];
const headingSources = [
  path.join(SRC_DIR, "components/ui/heading/index.tsx"),
  path.join(SRC_DIR, "components/ui/heading/index.web.tsx"),
];
for (const filePath of headingSources) {
  const source = fs.readFileSync(filePath, "utf8");
  if (
    !/level\?:\s*1\s*\|\s*2\s*\|\s*3\s*\|\s*4\s*\|\s*5\s*\|\s*6/.test(source)
  ) {
    primitiveContractFindings.push(
      `${filePath}: missing independent semantic heading level`,
    );
  }
  if (!/resolvedLevel\s*=\s*level\s*\?\?\s*2/.test(source)) {
    primitiveContractFindings.push(
      `${filePath}: heading level is not resolved independently of size`,
    );
  }
}
const formControlPath = path.join(
  SRC_DIR,
  "components/ui/form-control/index.tsx",
);
const formControlSource = fs.readFileSync(formControlPath, "utf8");
if (
  !/\bisRequired\b/.test(formControlSource) ||
  !/\bisInvalid\b/.test(formControlSource)
) {
  primitiveContractFindings.push(
    `${formControlPath}: missing required/invalid form semantics`,
  );
}
if (!/accessibilityRole\s*=\s*["']alert["']/.test(formControlSource)) {
  primitiveContractFindings.push(
    `${formControlPath}: missing accessible error role`,
  );
}
console.log("\n📊 5. KONTRAK AKSESIBILITAS PRIMITIF:");
if (primitiveContractFindings.length === 0) {
  console.log("✅ Heading level dan form semantics terverifikasi.");
} else {
  primitiveContractFindings.forEach((finding) => console.log(`❌ ${finding}`));
  process.exitCode = 1;
}

if (findings.length > 0) {
  console.error(`\n❌ Audit gagal: ${findings.length} temuan UI semantics.`);
  process.exitCode = 1;
}
