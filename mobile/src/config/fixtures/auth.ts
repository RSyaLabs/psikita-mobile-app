import { base64url, fixture } from "./base";

/** Pre-configured dev fixture accounts for quick login testing */
export const DEV_FIXTURE_ACCOUNTS = {
  patient: {
    username: "siti.rahayu@psikita.com",
    role: "USER" as const,
    displayName: "Siti Rahayu (Pasien Contoh)",
    sub: "dev-patient-0001",
  },
  psychologist: {
    username: "rina.amelia@psikita.com",
    role: "PSYCHOLOGIST" as const,
    displayName: "dr. Rina Amelia, M.Psi (Dokter Contoh Satu)",
    sub: "dev-prac-0001",
  },
  psychiatrist: {
    username: "andi.pratama@psikita.com",
    role: "PSYCHIATRIST" as const,
    displayName: "dr. Andi Pratama, Sp.KJ (Dokter Contoh Dua)",
    sub: "dev-prac-0002",
  },
  admin: {
    username: "admin@psikita.com",
    role: "ADMIN" as const,
    displayName: "Admin Local (Admin Contoh)",
    sub: "dev-admin-0001",
  },
} as const;

export function createDevFixtureToken(
  role: "USER" | "PSYCHOLOGIST" | "PSYCHIATRIST" | "ADMIN",
  email?: string,
  sub?: string,
): string {
  const resolvedSub =
    sub ??
    (role === "ADMIN"
      ? DEV_FIXTURE_ACCOUNTS.admin.sub
      : role === "USER"
        ? DEV_FIXTURE_ACCOUNTS.patient.sub
        : role === "PSYCHIATRIST"
          ? DEV_FIXTURE_ACCOUNTS.psychiatrist.sub
          : DEV_FIXTURE_ACCOUNTS.psychologist.sub);

  const resolvedEmail =
    email ??
    (role === "ADMIN"
      ? DEV_FIXTURE_ACCOUNTS.admin.username
      : role === "USER"
        ? DEV_FIXTURE_ACCOUNTS.patient.username
        : role === "PSYCHIATRIST"
          ? DEV_FIXTURE_ACCOUNTS.psychiatrist.username
          : DEV_FIXTURE_ACCOUNTS.psychologist.username);

  return [
    base64url(JSON.stringify({ alg: "none", typ: "JWT" })),
    base64url(
      JSON.stringify({
        sub: resolvedSub,
        sid: "dev-session-0001",
        email: resolvedEmail,
        isActive: true,
        iat: 1767225600,
        role,
        exp: 4102444800,
      }),
    ),
    "",
  ].join(".");
}

export const DEV_FIXTURE_TOKEN = createDevFixtureToken("USER");

export interface DevAuthSession {
  accessToken: string;
  refreshToken: string;
}

export function devAuthSession(
  flag?: string,
  usernameOrEmail?: string,
): DevAuthSession {
  const normalized = (usernameOrEmail ?? "").toLowerCase();
  let role: "USER" | "PSYCHOLOGIST" | "PSYCHIATRIST" | "ADMIN" = "USER";
  let sub: string = DEV_FIXTURE_ACCOUNTS.patient.sub;
  let email: string = DEV_FIXTURE_ACCOUNTS.patient.username;

  if (normalized.includes("admin")) {
    role = "ADMIN";
    sub = DEV_FIXTURE_ACCOUNTS.admin.sub;
    email = DEV_FIXTURE_ACCOUNTS.admin.username;
  } else if (normalized.includes("psikiater") || normalized.includes("andi")) {
    role = "PSYCHIATRIST";
    sub = DEV_FIXTURE_ACCOUNTS.psychiatrist.sub;
    email = DEV_FIXTURE_ACCOUNTS.psychiatrist.username;
  } else if (
    normalized.includes("psikolog") ||
    normalized.includes("rina") ||
    normalized.includes("practitioner")
  ) {
    role = "PSYCHOLOGIST";
    sub = DEV_FIXTURE_ACCOUNTS.psychologist.sub;
    email = DEV_FIXTURE_ACCOUNTS.psychologist.username;
  }

  const token = createDevFixtureToken(role, email, sub);
  return fixture(
    { accessToken: token, refreshToken: `${token}-refresh` },
    flag,
  );
}

// --------------------------------------------------------------------------
// Patient Profile Fixtures
// --------------------------------------------------------------------------

export function devPatientProfile(flag?: string) {
  return fixture(
    {
      id: "dev-patient-0001",
      patientId: "dev-patient-0001",
      fullName: "Pasien Contoh Satu",
      email: "contoh.pasien@dev.invalid",
      phoneNumber: "+6280000000000",
      nik: "0000000000000001",
      birthDate: "1995-01-01",
      gender: "FEMALE" as const,
      address: "Jl. Kesehatan Mental No. 1, Jakarta Pusat",
      medicalRecordNumber: "RM-2026-0001",
      bpjsNumber: "0001234567890",
      faskes1: "Puskesmas Gambir",
      status: "ACTIVE" as const,
      avatarUrl: null,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    flag,
  );
}

export function devPatientList(flag?: string) {
  const patient = devPatientProfile(flag);
  return fixture(
    {
      data: [patient],
      meta: {
        itemCount: 1,
        totalItems: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
    flag,
  );
}
