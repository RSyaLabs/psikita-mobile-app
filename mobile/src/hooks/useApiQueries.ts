/**
 * Barrel for the query hooks, replacing the former 1400-line single file.
 *
 * Every export keeps its name and signature, so no call site changed.
 */
export * from "./queries/patient";
export * from "./queries/practitioner";
export * from "./queries/triage";
export * from "./queries/consultation";
export * from "./queries/auth";
export * from "./queries/payment";
export * from "./queries/notes";
export * from "./queries/prescription";
export * from "./queries/admin";
export * from "./queries/articles";
export * from "./queries/notifications";
export * from "./queries/chat";
export * from "./queries/engagement";
export * from "./queries/prefetch";
export { queryKeys } from "./useQueryKeys";
