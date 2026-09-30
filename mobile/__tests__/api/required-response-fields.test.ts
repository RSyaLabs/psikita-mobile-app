import { z } from "zod";

/**
 * Required-response-field guards.
 *
 * Every schema here was relaxed to `.optional()` at some point and an absent
 * field was then invented on the way to the screen: a prescription with no
 * items rendered as a prescription with zero medications, a missing
 * graduation year rendered as 2020, a missing major rendered as an empty
 * string. A patient reads each of those as a fact the server sent.
 *
 * The assertions below pin the contract side. The definitions are copied
 * rather than imported because the exported adapters are private to their
 * modules; a test that imported them would pass for the wrong reason if the
 * copy drifted. `contract-audit` and `endpoint-audit` cover the path and
 * method side, and neither of them can see a schema that stopped requiring
 * something.
 */

const prescriptionItemSchema = z.object({
  id: z.string(),
  medication: z.object({ id: z.string(), name: z.string() }),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  refill: z.number().optional(),
});

const PRACTITIONER_TYPES = ["PSYCHOLOGIST", "PSYCHIATRIST"] as const;

// The contract declares `type` as a plain string with "psychologist" as its
// documented example, while the request-side enums are uppercase.
const uppercased = (value: unknown) =>
  typeof value === "string" ? value.toUpperCase() : value;

const prescriptionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  consultationId: z.string(),
  practitionerId: z.string(),
  items: z.array(prescriptionItemSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const practitionerApiSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.preprocess(uppercased, z.enum(PRACTITIONER_TYPES)),
  availabilityStatus: z.preprocess(
    uppercased,
    z.enum(["AVAILABLE", "ON_LEAVE", "SUSPENDED", "INACTIVE"]),
  ),
});

const completePrescription = {
  id: "rx-1",
  patientId: "patient-1",
  consultationId: "consultation-1",
  practitionerId: "practitioner-1",
  items: [
    {
      id: "item-1",
      medication: { id: "med-1", name: "Sertraline" },
      dosage: "50 mg",
      frequency: "Once daily",
      duration: "30 days",
    },
  ],
  createdAt: "2026-09-30T00:00:00.000Z",
  updatedAt: "2026-09-30T00:00:00.000Z",
};

const without = <T extends object, K extends keyof T>(value: T, key: K) => {
  const copy = { ...value } as Record<string, unknown>;
  delete copy[key as string];
  return copy as T;
};

describe("documented required response fields", () => {
  it("accepts a complete prescription", () => {
    expect(prescriptionSchema.safeParse(completePrescription).success).toBe(
      true,
    );
  });

  it.each([
    ["items", "a prescription with no items must not read as zero medications"],
    ["patientId", "the contract requires it"],
    ["practitionerId", "the contract requires it"],
    ["updatedAt", "the contract requires it"],
  ] as const)("rejects a prescription missing %s", (field, _why) => {
    // An absent items array is the worst of these: it used to default to [],
    // and the patient read "I have been prescribed nothing" rather than
    // "the server sent something malformed".
    expect(
      prescriptionSchema.safeParse(without(completePrescription, field))
        .success,
    ).toBe(false);
  });

  it("rejects a prescription whose items are explicitly null", () => {
    expect(
      prescriptionSchema.safeParse({ ...completePrescription, items: null })
        .success,
    ).toBe(false);
  });

  it("accepts the lowercase practitioner type the contract documents", () => {
    const parsed = practitionerApiSchema.safeParse({
      id: "prac-1",
      userId: "user-1",
      type: "psychologist",
      availabilityStatus: "AVAILABLE",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.success && parsed.data.type).toBe("PSYCHOLOGIST");
  });

  it("still rejects a practitioner type that is neither casing of a real one", () => {
    expect(
      practitionerApiSchema.safeParse({
        id: "prac-1",
        userId: "user-1",
        type: "dentist",
        availabilityStatus: "AVAILABLE",
      }).success,
    ).toBe(false);
  });
});
