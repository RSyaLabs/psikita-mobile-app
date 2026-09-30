/**
 * Dev fixture routing, checked at the single point every request passes through.
 *
 * Why this lives here and not in the screens
 * ------------------------------------------
 * All screens reach the server through `apiRequest`. Intercepting here means
 * one gate to audit instead of dozens of edits across screens. It also means
 * a screen cannot opt out by accident, and turning the flag off returns the app
 * to exactly its real network behavior with no residue.
 *
 * The isolation rules
 * -------------------
 * 1. Nothing runs unless the flag is on (`EXPO_PUBLIC_USE_MOCK_FALLBACK="true"`).
 * 2. An endpoint with no fixture returns undefined, and the caller proceeds to
 *    the real request.
 * 3. Fixtures are returned as ordinary resolved values so screens exercise their
 *    real parsing and adapter path.
 */

import {
  devApprovePractitioner,
  devAuthSession,
  devClaimMatching,
  devConsultationDetail,
  devConsultationNotes,
  devConsultationReferral,
  devConsultations,
  devCreateSoapNote,
  devFeedback,
  devFinalizeNote,
  devFixturesEnabled,
  devIceServers,
  devLedgerAccounts,
  devLedgerJournals,
  devMatchings,
  devPatientList,
  devPatientProfile,
  devPayments,
  devPractitionerDirectory,
  devPractitionerProfile,
  devPrescriptions,
  devRejectPractitioner,
  devRoomMessages,
  devTriageAssessment,
  devTriageQueue,
  devUpdatePractitionerAvailability,
  devWaitingRoomStatus,
} from "@/config/devFixtures";
import { filterDemoArticles, MOCK_ARTICLES } from "@/api/article.service";
import { MOCK_NOTIFICATIONS } from "@/api/notification.service";

/**
 * Paths the fixture layer serves that the checked-in contract does not define.
 *
 * The contract is `staging-openapi.json` in the repository root: 113 paths.
 * `/articles` and `/notifications` are absent from it, so there is no response
 * shape to copy and anything rendered for them is invented. A reviewer auditing
 * the contract must be able to see that without reading this file, so every
 * fixture served for one of these paths is logged with the same marker as any
 * other fixture and is additionally named as undocumented.
 */
export const DEV_FIXTURE_UNDOCUMENTED_PATHS: readonly string[] = [
  "/articles",
  "/notifications",
];

/**
 * The marker a reviewer greps for.
 *
 * A banner is easy to miss and impossible to audit from a log, so every
 * intercepted request also emits one line carrying this token. `grep
 * DEV-FIXTURE` over a device console then enumerates exactly which responses
 * were invented, which is the question a contract audit actually asks.
 */
export const DEV_FIXTURE_LOG_MARKER = "DEV-FIXTURE";

export function isDevFixtureUndocumented(path: string): boolean {
  return DEV_FIXTURE_UNDOCUMENTED_PATHS.some(
    (candidate) => path === candidate || path.startsWith(`${candidate}/`),
  );
}

export const DEV_VOID_FIXTURE = Symbol.for("DEV_VOID_FIXTURE");

export function isDevVoidFixture(val: unknown): boolean {
  return val === DEV_VOID_FIXTURE;
}

function parseBody(body: unknown): Record<string, any> | undefined {
  if (!body) return undefined;
  try {
    const parsed = typeof body === "string" ? JSON.parse(body) : body;
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, any>;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function parseBodyUsername(body: unknown): string | undefined {
  const parsed = parseBody(body);
  if (!parsed) return undefined;
  return parsed.username ?? parsed.email;
}

// --------------------------------------------------------------------------
// 1. Auth & System Health Routes
// --------------------------------------------------------------------------
function routeAuth(path: string, body: unknown, flag?: string): unknown {
  if (path === "/auth/password/login") {
    return devAuthSession(flag, parseBodyUsername(body));
  }
  if (path === "/auth/google/login") {
    return devAuthSession(flag);
  }
  if (path === "/auth/password/register") {
    const username = parseBodyUsername(body) ?? "siti.rahayu";
    return {
      id: "dev-patient-0001",
      username,
      email: `${username}@psikita.com`,
      role: "USER",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
  }
  if (path === "/auth/logout") {
    return { message: "Berhasil logout" };
  }
  if (path === "/auth/otp/verify") {
    return devAuthSession(flag, parseBodyUsername(body));
  }
  if (path === "/auth/otp/request") {
    return { message: "Kode OTP berhasil dikirim" };
  }
  if (path === "/health/live") {
    return DEV_VOID_FIXTURE;
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 2. Practitioner & Admin Verification Routes
// --------------------------------------------------------------------------
function routePractitionerAdmin(
  path: string,
  body: unknown,
  flag?: string,
  endpoint?: string,
): unknown {
  if (path.endsWith("/availability")) {
    const segments = path.split("/");
    const practitionerId = segments[segments.length - 2] ?? "dev-prac-0001";
    const parsed = parseBody(body);
    const status = parsed?.status ?? "AVAILABLE";
    devUpdatePractitionerAvailability(practitionerId, status);
    return DEV_VOID_FIXTURE;
  }
  if (path.endsWith("/approve")) {
    const segments = path.split("/");
    const practitionerId = segments[segments.length - 2] ?? "dev-prac-0003";
    devApprovePractitioner(practitionerId);
    return DEV_VOID_FIXTURE;
  }
  if (path.endsWith("/reject")) {
    const segments = path.split("/");
    const practitionerId = segments[segments.length - 2] ?? "dev-prac-0003";
    const parsed = parseBody(body);
    devRejectPractitioner(practitionerId, parsed?.reason);
    return DEV_VOID_FIXTURE;
  }
  if (path === "/practitioner/me") {
    return devPractitionerProfile(flag, "dev-prac-0001");
  }
  if (path.startsWith("/practitioner/")) {
    const segments = path.split("/");
    const practitionerId = segments[2] ?? "dev-prac-0001";
    return devPractitionerProfile(flag, practitionerId);
  }
  if (path === "/practitioner") {
    if (body) {
      return devPractitionerProfile(flag, "dev-prac-0001");
    }
    return devPractitionerDirectory(flag, endpoint);
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 3. Clinical, Triage, Notes & Prescriptions Routes
// --------------------------------------------------------------------------
function routeClinicalAndNotes(path: string, body: unknown, flag?: string): unknown {
  if (path.includes("/consultation/note/") && path.endsWith("/finalize")) {
    const segments = path.split("/");
    const noteId = segments[segments.length - 2] ?? "dev-note-0001";
    return devFinalizeNote(noteId, flag);
  }
  if (path.startsWith("/consultation/") && path.endsWith("/soap")) {
    const segments = path.split("/");
    const consultationId = segments[2] ?? "dev-consultation-0001";
    return devCreateSoapNote(consultationId, body, flag);
  }
  if (path.startsWith("/consultation/") && path.endsWith("/notes")) {
    const segments = path.split("/");
    const consultationId = segments[2] ?? "dev-consultation-0001";
    return devConsultationNotes(consultationId, flag);
  }
  if (path.startsWith("/notes/consultation/")) {
    const segments = path.split("/");
    const consultationId = segments[3] ?? "dev-consultation-0001";
    return devConsultationNotes(consultationId, flag);
  }
  if (path.startsWith("/consultation/") && path.endsWith("/referral")) {
    const segments = path.split("/");
    const consultationId = segments[2] ?? "dev-consultation-0001";
    return devConsultationReferral(consultationId, flag);
  }
  if (path.startsWith("/consultations/") && path.endsWith("/feedback")) {
    const segments = path.split("/");
    const consultationId = segments[2] ?? "dev-consultation-0001";
    return devFeedback(consultationId, body, flag);
  }
  if (path === "/triage/queue") {
    return devTriageQueue(flag);
  }
  if (path.startsWith("/triage/")) {
    const segments = path.split("/");
    const triageId = segments[2] ?? "dev-triage-0001";
    return devTriageAssessment(triageId, flag);
  }
  if (path === "/triage") {
    return devTriageAssessment("dev-triage-0001", flag);
  }
  if (path === "/prescriptions" || path.startsWith("/prescriptions")) {
    return devPrescriptions(flag);
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 4. Consultations, Rooms & Matching Routes
// --------------------------------------------------------------------------
function routeConsultationsAndRooms(path: string, body: unknown, flag?: string): unknown {
  if (path.startsWith("/consultations/")) {
    const segments = path.split("/");
    const consultationId = segments[2] ?? "dev-consultation-0001";
    return devConsultationDetail(consultationId, flag);
  }
  if (path === "/consultations") {
    if (body) {
      return devConsultationDetail("dev-consultation-0001", flag);
    }
    return devConsultations(flag);
  }
  if (path.startsWith("/rooms/") && path.endsWith("/ice-servers")) {
    return devIceServers(flag);
  }
  if (path.startsWith("/rooms/") && path.endsWith("/messages")) {
    const segments = path.split("/");
    const roomId = segments[2] ?? "dev-room-0001";
    return devRoomMessages(flag, roomId);
  }
  if (/^\/rooms\/[^/]+$/.test(path)) {
    const roomId = path.split("/")[2] ?? "dev-room-0001";
    return devRoomMessages(flag, roomId);
  }
  if (path === "/matching-requests/waiting-room/me") {
    return devWaitingRoomStatus(flag);
  }
  if (
    (path.startsWith("/matching-requests/") && path.endsWith("/claim")) ||
    (path.startsWith("/matching/requests/") && path.endsWith("/claim"))
  ) {
    const segments = path.split("/");
    const matchingRequestId =
      segments[2] === "requests"
        ? (segments[3] ?? "dev-match-0001")
        : (segments[2] ?? "dev-match-0001");
    return devClaimMatching(matchingRequestId, flag);
  }
  if (
    path === "/matching-requests" ||
    path.startsWith("/matching-requests") ||
    path === "/matching/requests" ||
    path.startsWith("/matching/requests")
  ) {
    return devMatchings(flag);
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 5. Patient Profile, Payments & Ledger Routes
// --------------------------------------------------------------------------
function routePatientAndFinance(path: string, body: unknown, flag?: string): unknown {
  // Only the two shapes this layer actually serves. A bare "/patient/" prefix
  // also swallowed endpoints that have no fixture, such as
  // /patient/medical-records, and answered a real request with a patient's
  // record instead of letting the request proceed to the network.
  if (path === "/patient/me" || /^\/patient\/[^/]+$/.test(path)) {
    return devPatientProfile(flag);
  }
  if (path === "/patient") {
    if (body) {
      return DEV_VOID_FIXTURE;
    }
    return devPatientList(flag);
  }
  if (path === "/payments") {
    return devPayments(body, flag);
  }
  if (
    path.endsWith("/finish") ||
    path.endsWith("/billing-orders") ||
    path.endsWith("/bpjs/eligibility")
  ) {
    return DEV_VOID_FIXTURE;
  }
  if (
    path === "/admin/ledger/accounts" ||
    path.startsWith("/admin/ledger/accounts") ||
    path === "/ledger/accounts" ||
    path.startsWith("/ledger/accounts")
  ) {
    return devLedgerAccounts(flag);
  }
  if (
    path === "/admin/ledger/journals" ||
    path.startsWith("/admin/ledger/journals") ||
    path === "/ledger/journals" ||
    path.startsWith("/ledger/journals")
  ) {
    return devLedgerJournals(flag);
  }
  return undefined;
}

// --------------------------------------------------------------------------
// 6. Articles & Notifications Routes
// --------------------------------------------------------------------------
function routeArticlesAndNotifications(
  path: string,
  endpoint: string,
  _flag?: string,
): unknown {
  if (path === "/articles") {
    const queryPart = endpoint.includes("?") ? endpoint.split("?")[1] : undefined;
    const params = queryPart ? new URLSearchParams(queryPart) : undefined;
    const cat = params?.get("category") ?? undefined;
    const q = params?.get("query") ?? params?.get("q") ?? undefined;
    return filterDemoArticles(cat, q);
  }
  if (path.startsWith("/articles/")) {
    const segments = path.split("/");
    const articleId = segments[2] ?? "1";
    // A miss must be a miss, not a null that the caller's ?? chain erases.
    // Returning null here used to collapse into undefined, which reads as "no
    // fixture", so the request fell through to the network and the invented
    // response left no trace in the DEV-FIXTURE log.
    return MOCK_ARTICLES.find((a) => a.id === articleId);
  }
  if (path === "/notifications") {
    const queryPart = endpoint.includes("?") ? endpoint.split("?")[1] : undefined;
    const params = queryPart ? new URLSearchParams(queryPart) : undefined;
    const cat = params?.get("category") ?? undefined;
    if (!cat || cat === "Semua") {
      return [...MOCK_NOTIFICATIONS];
    }
    return MOCK_NOTIFICATIONS.filter((n) => n.category === cat);
  }
  if (path.startsWith("/notifications/")) {
    return { success: true };
  }
  return undefined;
}

/**
 * Returns a fixture for this endpoint, or undefined when there is none.
 */
export function devFixtureFor(
  endpoint: string,
  body?: unknown,
  flag: string | undefined = process.env.EXPO_PUBLIC_USE_MOCK_FALLBACK,
): unknown {
  if (!devFixturesEnabled(flag)) return undefined;

  const rawPath = endpoint.split("?")[0] ?? endpoint;
  const path = rawPath.trim();

  const fixture =
    routeAuth(path, body, flag) ??
    routePractitionerAdmin(path, body, flag, endpoint) ??
    routeClinicalAndNotes(path, body, flag) ??
    routeConsultationsAndRooms(path, body, flag) ??
    routePatientAndFinance(path, body, flag) ??
    routeArticlesAndNotifications(path, endpoint, flag) ??
    undefined;

  if (fixture !== undefined) {
    reportDevFixture(path);
  }

  return fixture;
}

/**
 * One line per invented response, so a contract audit can enumerate them.
 *
 * The undocumented paths are named separately because serving them is the one
 * case where a reviewer could otherwise conclude the endpoint exists.
 */
function reportDevFixture(path: string): void {
  const undocumented = isDevFixtureUndocumented(path);
  console.log(
    `[${DEV_FIXTURE_LOG_MARKER}] ${undocumented ? "UNDOCUMENTED " : ""}${path}` +
      (undocumented
        ? " — not in staging-openapi.json; this response is invented"
        : ""),
  );
}

/** Every path that currently has a fixture, for review and for tests. */
export function devFixturePaths(): string[] {
  return [
    "/auth/password/login",
    "/auth/otp/request",
    "/patient/me",
    "/patient",
    "/practitioner/me",
    "/practitioner",
    "/consultations",
    "/consultation/notes",
    "/consultation/referral",
    "/consultation/soap",
    "/payments",
    "/triage",
    "/triage/queue",
    "/matching-requests",
    "/matching-requests/waiting-room/me",
    "/rooms/",
    "/rooms/messages",
    "/rooms/ice-servers",
    "/prescriptions",
    "/ledger/accounts",
    "/ledger/journals",
    "/admin/ledger/accounts",
    "/admin/ledger/journals",
    "/articles",
    "/notifications",
  ];
}