import { queryKeys } from "@/hooks/useQueryKeys";

describe("Query key factory", () => {
  it("keeps public namespaces and pagination readable", () => {
    expect(queryKeys.auth.me()).toEqual(["auth", "me"]);
    expect(queryKeys.patient.me()).toEqual(["patient", "me"]);
    expect(
      queryKeys.practitioner.list({ type: "PSYCHOLOGIST", page: 2 }),
    ).toEqual(["practitioner", "list", { type: "PSYCHOLOGIST", page: 2 }]);
  });

  it("keeps sensitive identifiers out of detail and room keys", () => {
    const consultationKey = queryKeys.consultations.detail(
      "consultation-secret",
    );
    const roomKey = queryKeys.consultations.roomMessages("room-secret");
    const serialized = JSON.stringify([consultationKey, roomKey]);

    expect(serialized).not.toContain("consultation-secret");
    expect(serialized).not.toContain("room-secret");
    expect(consultationKey[0]).toBe("consultations");
    expect(roomKey[0]).toBe("consultations");
  });
});
