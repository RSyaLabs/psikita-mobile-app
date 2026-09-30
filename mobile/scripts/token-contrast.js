// Reports every design token in global.css whose text/surface pairing fails
// WCAG AA, and proposes the smallest correction that passes.
//
// Pairings are explicit because the obvious "foreground against every surface"
// sweep is wrong: --primary-foreground is white and is meant to sit on
// --primary, not on --background. An earlier version of this script checked
// foreground tokens against background and card and reported three
// "failures" that were artifacts of the script, not defects in the palette.
//
// Run: node scripts/token-contrast.js
const fs = require("fs");
const path = require("path");

const css = fs.readFileSync(path.join(__dirname, "..", "global.css"), "utf8");
const root = /:root\s*\{([^}]*)\}/.exec(css);
if (!root) {
  console.error("no :root block found in global.css");
  process.exit(1);
}

const tokens = {};
for (const m of root[1].matchAll(/--([\w-]+):\s*([\d\s.]+);/g)) {
  const parts = m[2].trim().split(/\s+/).map(Number);
  if (parts.length >= 3)
    tokens[m[1]] = { r: parts[0], g: parts[1], b: parts[2] };
}

const lin = (v) => {
  v /= 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};
const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const ratio = (a, b) => {
  const l1 = lum(a);
  const l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};
const hex = (c) =>
  "#" +
  [c.r, c.g, c.b]
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("");
const triple = (c) =>
  `${Math.round(c.r)} ${Math.round(c.g)} ${Math.round(c.b)}`;

// Each foreground token against the surfaces it is actually placed on.
const PAIRINGS = [
  { fg: "foreground", on: ["background", "card"], role: "body text" },
  {
    fg: "muted-foreground",
    on: ["background", "card", "muted"],
    role: "secondary text",
  },
  { fg: "primary-foreground", on: ["primary"], role: "text on primary button" },
  {
    fg: "secondary-foreground",
    on: ["secondary"],
    role: "text on secondary button",
  },
  { fg: "popover-foreground", on: ["popover"], role: "popover text" },
  { fg: "accent-foreground", on: ["accent"], role: "text on accent" },
  { fg: "warning-foreground", on: ["warning"], role: "text on warning" },
  // Solid colours are routinely used as text in this codebase.
  {
    fg: "primary",
    on: ["background", "card", "muted", "accent"],
    role: "brand text",
  },
  {
    fg: "secondary",
    on: ["background", "card", "muted", "accent"],
    role: "accent text",
  },
  {
    fg: "destructive",
    on: ["background", "card", "muted"],
    role: "error text",
  },
  { fg: "warning", on: ["background", "card"], role: "warning text" },
];

const findings = [];
for (const p of PAIRINGS) {
  const fg = tokens[p.fg];
  if (!fg) continue;
  for (const sName of p.on) {
    const bg = tokens[sName];
    if (!bg) continue;
    const r = ratio(fg, bg);
    if (r < 4.5) {
      findings.push({
        token: p.fg,
        role: p.role,
        fgHex: hex(fg),
        surface: sName,
        surfaceHex: hex(bg),
        ratio: Math.round(r * 100) / 100,
      });
    }
  }
}

console.log(`tokens parsed: ${Object.keys(tokens).length}`);
console.log(`pairings checked: ${PAIRINGS.length}`);
console.log(`\nAA failures (ratio < 4.5): ${findings.length}`);

const byToken = new Map();
for (const f of findings) {
  if (!byToken.has(f.token)) byToken.set(f.token, []);
  byToken.get(f.token).push(f);
}

for (const [token, list] of byToken) {
  console.log(`\n  --${token}  (${hex(tokens[token])}) — ${list[0].role}`);
  for (const f of list) {
    console.log(`      ${f.ratio} on --${f.surface} (${f.surfaceHex})`);
  }
}

function darkenUntilPass(fg, surfaces) {
  for (let step = 100; step >= 30; step -= 1) {
    const cand = {
      r: Math.round(fg.r * (step / 100)),
      g: Math.round(fg.g * (step / 100)),
      b: Math.round(fg.b * (step / 100)),
    };
    if (surfaces.every((s) => ratio(cand, s) >= 4.5)) return { cand, step };
  }
  return null;
}

if (byToken.size) {
  console.log(
    "\nproposed corrections (smallest uniform darkening that clears 4.5):",
  );
  for (const [token, list] of byToken) {
    const fg = tokens[token];
    const surfaces = [...new Set(list.map((f) => f.surface))].map(
      (s) => tokens[s],
    );
    const fix = darkenUntilPass(fg, surfaces);
    if (!fix) {
      console.log(`  --${token}: no scaling of this hue passes`);
      continue;
    }
    const after = surfaces
      .map((s) => `${Math.round(ratio(fix.cand, s) * 100) / 100}`)
      .join(" / ");
    console.log(
      `  --${token}: ${triple(fg)} -> ${triple(fix.cand)}  (${hex(
        fix.cand,
      )}, x${fix.step / 100})  now ${after} on ${[...new Set(list.map((f) => f.surface))].join(", ")}`,
    );
  }
}

process.exit(findings.length ? 1 : 0);
