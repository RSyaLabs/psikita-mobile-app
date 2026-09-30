import * as keyModule from "@/hooks/useQueryKeys";
import { queryKeys } from "@/hooks/useQueryKeys";

function serialized(key: unknown): string {
  return JSON.stringify(key);
}

describe("PII-safe query key factory", () => {
  it("does not serialize sensitive values from list, detail, room, notes, referral, or ICE keys", () => {
    const patientId = "patient-secret-701";
    const practitionerId = "practitioner-secret-702";
    const consultationId = "consultation-secret-703";
    const referenceId = "invoice-secret-704";
    const roomId = "room-secret-705";
    const orderId = "order-secret-706";
    const fullName = "Full Name Secret 707";
    const nik = "NIK-SECRET-708";
    const bpjsNumber = "BPJS-SECRET-709";
    const beforeCursor = "cursor-before-secret-710";
    const afterCursor = "cursor-after-secret-711";

    const keys = [
      queryKeys.patient.list({
        fullName,
        patientId,
        nik,
        bpjsNumber,
        orderId,
        page: 2,
        limit: 20,
      } as any),
      queryKeys.practitioner.list({
        practitionerId,
        consultationId,
        referenceId,
        roomId,
        type: "PSYCHOLOGIST",
        page: 3,
      } as any),
      queryKeys.consultations.list({
        consultationId,
        patientId,
        roomId,
        orderId,
        status: "FINISHED",
        limit: 10,
      } as any),
      queryKeys.prescriptions.list({
        patientId,
        consultationId,
        orderId,
        bpjsNumber,
        nik,
      } as any),
      queryKeys.ledger.journals({ referenceId, page: 4, limit: 25 }),
      queryKeys.patient.detail(patientId),
      queryKeys.practitioner.detail(practitionerId),
      queryKeys.consultations.detail(consultationId),
      queryKeys.consultations.roomMessages(roomId, {
        before: beforeCursor,
        after: afterCursor,
        page: 2,
      }),
      queryKeys.consultations.notes(consultationId),
      queryKeys.consultations.referral(consultationId),
      queryKeys.consultations.iceServers(roomId),
      queryKeys.prescriptions.detail(orderId),
    ];

    const keyText = serialized(keys);
    for (const sensitiveValue of [
      patientId,
      practitionerId,
      consultationId,
      referenceId,
      roomId,
      orderId,
      fullName,
      nik,
      bpjsNumber,
      beforeCursor,
      afterCursor,
    ]) {
      expect(keyText).not.toContain(sensitiveValue);
    }
  });

  it("keeps identical inputs stable and sensitive changes isolated", () => {
    const first = queryKeys.patient.list({
      fullName: "Stable Person",
      page: 1,
    });
    const same = queryKeys.patient.list({ fullName: "Stable Person", page: 1 });
    const changed = queryKeys.patient.list({
      fullName: "Different Person",
      page: 1,
    });

    expect(same).toEqual(first);
    expect(changed).not.toEqual(first);
    // Deterministic within a process: the same id always yields the same key.
    expect(queryKeys.consultations.detail("same-id")).toEqual(
      queryKeys.consultations.detail("same-id"),
    );
    expect(queryKeys.consultations.roomMessages("same-room")).toEqual(
      queryKeys.consultations.roomMessages("same-room"),
    );

    // A different id must not collide with the first, otherwise two patients
    // would share one cache entry.
    expect(queryKeys.consultations.detail("other-id")).not.toEqual(
      queryKeys.consultations.detail("same-id"),
    );
    expect(queryKeys.consultations.roomMessages("other-room")).not.toEqual(
      queryKeys.consultations.roomMessages("same-room"),
    );

    // The raw id must never survive into the key, only its digest.
    expect(
      serialized(queryKeys.consultations.detail("patient-secret-999")),
    ).not.toContain("patient-secret-999");
    expect(
      serialized(queryKeys.consultations.roomMessages("room-secret-999")),
    ).not.toContain("room-secret-999");
  });

  it("keeps non-sensitive enums and pagination readable without exporting privacy internals", () => {
    const practitionerKey = queryKeys.practitioner.list({
      type: "PSYCHOLOGIST",
      verificationStatus: "VERIFIED",
      page: 2,
      limit: 10,
    });
    const keyText = serialized(practitionerKey);

    expect(keyText).toContain("PSYCHOLOGIST");
    expect(keyText).toContain("VERIFIED");
    expect(keyText).toContain("page");
    expect(keyText).toContain('"page":2');
    expect(keyText).toContain("limit");
    expect(keyText).toContain('"limit":10');
    expect(Object.keys(keyModule)).not.toEqual(
      expect.arrayContaining(["privacySalt", "privacyDigest", "privacyScope"]),
    );
  });
});
