/**
 * Local development fixtures for all roles: Patient, Practitioner (Psychologist, Psychiatrist), and Admin.
 *
 * This module is a barrel re-exporting modular domain fixtures from `./fixtures/`:
 * - base: Core utilities, flags, encoding
 * - auth: Account definitions, tokens, patient profiles
 * - practitioners: Practitioner directory, profiles, verification, availability
 * - clinical: Triage, prescriptions, SOAP notes, referrals
 * - consultations: Consultations, rooms, messages, ICE servers, matchings
 * - finance: Payments, feedback, ledger accounts, journals
 */

export * from "./fixtures/base";
export * from "./fixtures/auth";
export * from "./fixtures/practitioners";
export * from "./fixtures/clinical";
export * from "./fixtures/consultations";
export * from "./fixtures/finance";