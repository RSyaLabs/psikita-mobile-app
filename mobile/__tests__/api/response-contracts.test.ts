import { ApiError, apiRequest } from "@/api/client";
import {
  BPJS_ELIGIBILITY_ACCEPTED,
  parsePaymentResponse,
} from "@/api/payment.service";
import * as capabilities from "@/config/capabilities";
import {
  consultationService,
  ledgerService,
  matchingService,
  patientService,
  paymentService,
  practitionerService,
  prescriptionService,
} from "@/api";

const originalFetch = global.fetch;
const acceptResponse = (value: unknown): unknown => value;

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "",
    body: body === undefined ? null : {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(typeof body === "string" ? body : ""),
  } as unknown as Response;
}

describe("documented response contracts", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("maps nested practitioner profiles, education, and experience data", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        id: "practitioner-1",
        userId: "user-1",
        type: "PSYCHIATRIST",
        nik: "1234567890123456",
        nikVerificationStatus: "VERIFIED",
        taxIdentificationNumber: "123456789012345",
        availabilityStatus: "AVAILABLE",
        verificationStatus: "VERIFIED",
        averageRating: 4.8,
        educations: [
          {
            id: "education-1",
            institution: "University",
            degree: "S2",
            major: "Psychiatry",
            graduationYear: 2020,
          },
        ],
        experiences: [
          {
            id: "experience-1",
            facilityName: "Clinic",
            position: "Psychiatrist",
            startDate: "2021-01-01T00:00:00.000Z",
          },
        ],
        psychiatristProfile: {
          strNumber: "STR-1",
          sipNumber: "SIP-1",
          canPrescribe: true,
        },
      }),
    ) as unknown as typeof fetch;

    const profile = await practitionerService.getMyProfile();
    expect(profile).toMatchObject({
      id: "practitioner-1",
      userId: "user-1",
      type: "PSYCHIATRIST",
      strNumber: "STR-1",
      sippNumber: "SIP-1",
      educations: expect.any(Array),
      experiences: expect.any(Array),
    });
    expect(profile.fullName).toBeUndefined();
    expect(profile.title).toBeUndefined();
    expect(profile.specialization).toBeUndefined();
  });

  it.each(["WAITING", "ACTIVE"] as const)(
    "accepts the documented %s consultation status",
    async (status) => {
      global.fetch = jest.fn().mockResolvedValue(
        response({
          id: "consultation-1",
          patientId: "patient-1",
          practitionerId: "practitioner-1",
          durationMinutes: 60,
          status,
          participants: [],
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        }),
      ) as unknown as typeof fetch;

      await expect(
        consultationService.create({
          patientId: "patient-1",
          practitionerId: "practitioner-1",
        }),
      ).resolves.toMatchObject({
        id: "consultation-1",
        status,
      });
    },
  );

  it("maps documented matching fields and object status", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        response({
          matchingRequestId: "matching-1",
          status: "WAITING",
          queuePosition: 2,
          estimatedWaitMinutes: 5,
        }),
      )
      .mockResolvedValueOnce(
        response({
          id: "matching-1",
          patientId: "patient-1",
          triageId: "triage-1",
          requiredLevel: "level_2",
          status: { value: "MATCHED" },
          candidatePractitionerIds: ["practitioner-1"],
          assignedPractitionerId: "practitioner-1",
          deadlineAt: "2026-09-24T01:00:00.000Z",
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        }),
      ) as unknown as typeof fetch;

    await expect(
      matchingService.getMyWaitingRoomStatus(),
    ).resolves.toMatchObject({
      position: 2,
      estimatedWaitSeconds: 300,
    });
    await expect(
      matchingService.claimMatchingRequest("matching-1"),
    ).resolves.toMatchObject({
      id: "matching-1",
      status: { value: "MATCHED" },
    });
  });

  it("maps a balanced ledger entry to one journal amount", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        data: [
          {
            id: "journal-1",
            referenceId: "invoice-1",
            description: "Payment",
            status: "POSTED",
            postedAt: "2026-09-24T00:00:00.000Z",
            lines: [
              {
                accountId: "cash",
                amount: 150000,
                currency: "IDR",
                entryType: "DEBIT",
              },
              {
                accountId: "revenue",
                amount: 150000,
                currency: "IDR",
                entryType: "CREDIT",
              },
            ],
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      }),
    ) as unknown as typeof fetch;

    await expect(ledgerService.getJournals()).resolves.toMatchObject({
      data: [
        {
          id: "journal-1",
          amount: 150000,
          date: "2026-09-24T00:00:00.000Z",
          postedAt: "2026-09-24T00:00:00.000Z",
        },
      ],
      meta: {
        itemCount: 1,
        totalItems: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    });
  });

  it("normalizes paginated prescriptions without substituting refill or update time", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        data: [
          {
            id: "prescription-1",
            patientId: "patient-1",
            consultationId: "consultation-1",
            practitionerId: "practitioner-1",
            items: [
              {
                id: "item-1",
                medication: { id: "medication-1", name: "Medication" },
                dosage: "10 mg",
                frequency: "Once daily",
                duration: "30 days",
                refill: 2,
              },
            ],
            createdAt: "2026-09-24T00:00:00.000Z",
            updatedAt: "2026-09-25T00:00:00.000Z",
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        },
      }),
    ) as unknown as typeof fetch;

    const prescriptions = await prescriptionService.getPrescriptions();
    expect(prescriptions.data[0].medications[0]).toMatchObject({
      name: "Medication",
      refill: 2,
    });
    expect(prescriptions.data[0].medications[0].quantity).toBeUndefined();
    expect(prescriptions.data[0].prescriptionNumber).toBeUndefined();
    expect(prescriptions.data[0].validUntil).toBeUndefined();
    expect(prescriptions.data[0].updatedAt).toBe("2026-09-25T00:00:00.000Z");
  });

  it("uses the first valid referral for the single-referral consumer", async () => {
    const referral = (id: string) => ({
      id,
      consultationId: "consultation-1",
      destinationInstitutionId: "hospital-1",
      currentStatus: "DRAFT",
      reason: {
        id: "F41.1",
        name: "Anxiety",
        description: "Generalized anxiety",
      },
      histories: [
        {
          id: `${id}-history`,
          status: "DRAFT",
          timestamp: "2026-09-25T00:00:00.000Z",
        },
      ],
      createdAt: "2026-09-24T00:00:00.000Z",
      updatedAt: "2026-09-25T00:00:00.000Z",
    });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(response([]))
      .mockResolvedValueOnce(response([referral("referral-1")]))
      .mockResolvedValueOnce(
        response([referral("referral-1"), referral("referral-2")]),
      ) as unknown as typeof fetch;

    await expect(
      prescriptionService.getReferralByConsultation("consultation-1"),
    ).resolves.toBeNull();
    const one =
      await prescriptionService.getReferralByConsultation("consultation-1");
    expect(one).toMatchObject({
      id: "referral-1",
      destinationInstitutionId: "hospital-1",
      currentStatus: "DRAFT",
      icd10Code: "F41.1",
      icd10Description: "Generalized anxiety",
    });
    expect(one?.referralNumber).toBeUndefined();
    expect(one?.targetHospital).toBeUndefined();
    expect(one?.targetDepartment).toBeUndefined();
    expect(one?.validUntil).toBeUndefined();

    const multiple =
      await prescriptionService.getReferralByConsultation("consultation-1");
    expect(multiple?.id).toBe("referral-1");
  });

  it("keeps the documented 201 no-content BPJS result accepted but unknown", () => {
    expect(BPJS_ELIGIBILITY_ACCEPTED).toEqual({
      accepted: true,
      eligibility: "UNKNOWN",
    });
  });

  it("maps the documented payment response and rejects contradictory feedback", async () => {
    const paymentBody = {
      id: "payment-1",
      status: "SUCCESS",
      amount: 43250,
      contextType: "BILLING_ORDER",
      contextId: "order-1",
      instruction: {
        methodType: "QRIS",
        qrUrl: "https://pay.example/qr/1",
      },
    };

    expect(parsePaymentResponse(paymentBody, "order-1")).toMatchObject({
      id: "payment-1",
      status: "SUCCESS",
      transactionStatus: "SETTLEMENT",
      billingOrderId: "order-1",
      grossAmount: 43250,
      qrCodeUrl: "https://pay.example/qr/1",
    });

    global.fetch = jest.fn().mockResolvedValue(
      response({
        success: false,
        id: "feedback-1",
        consultationId: "consultation-1",
        patientId: "patient-1",
        star: 5,
        comment: "Not accepted",
        createdAt: "2026-09-24T00:00:00.000Z",
        updatedAt: "2026-09-24T00:00:00.000Z",
      }),
    ) as unknown as typeof fetch;

    await expect(
      paymentService.submitFeedback("consultation-1", {
        star: 5,
        comment: "Not accepted",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("binds feedback to the consultation path and returns the documented response", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response(
        {
          id: "feedback-server-1",
          consultationId: "consultation/1",
          patientId: "patient-1",
          star: 5,
          comment: "Sesi membantu.",
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        },
        201,
      ),
    ) as unknown as typeof fetch;

    await expect(
      paymentService.submitFeedback("consultation/1", {
        star: 5,
        comment: "Sesi membantu.",
      }),
    ).resolves.toMatchObject({
      id: "feedback-server-1",
      consultationId: "consultation/1",
      patientId: "patient-1",
      star: 5,
      comment: "Sesi membantu.",
    });

    const [url, request] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toContain("/consultations/consultation%2F1/feedback");
    expect(JSON.parse(request.body)).toEqual({
      star: 5,
      comment: "Sesi membantu.",
    });
  });

  it("rejects a feedback response for a different consultation", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response(
        {
          id: "feedback-other-consultation",
          consultationId: "other-consultation",
          patientId: "patient-1",
          star: 5,
          comment: "Sesi membantu.",
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        },
        201,
      ),
    ) as unknown as typeof fetch;

    await expect(
      paymentService.submitFeedback("consultation-1", {
        star: 5,
        comment: "Sesi membantu.",
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("rejects malformed payment response fields", () => {
    expect(() =>
      parsePaymentResponse(
        { id: "payment-1", status: "UNKNOWN", amount: 1 },
        "order-1",
      ),
    ).toThrow();
  });

  it("rejects incomplete documented shapes for each normalized adapter", async () => {
    jest.spyOn(capabilities, "getCapability").mockReturnValue("live");
    const cases: Array<{
      name: string;
      operation: () => Promise<unknown>;
      body: unknown;
    }> = [
      {
        name: "practitioner",
        operation: () => practitionerService.getMyProfile(),
        body: {
          id: "practitioner-1",
          userId: "user-1",
          type: "PSYCHIATRIST",
          nik: "1234567890123456",
          nikVerificationStatus: "VERIFIED",
          taxIdentificationNumber: "123456789012345",
          availabilityStatus: "AVAILABLE",
          verificationStatus: "VERIFIED",
          averageRating: 4.8,
          educations: [],
          experiences: [],
        },
      },
      {
        name: "consultation",
        operation: () =>
          consultationService.create({ patientId: "p", practitionerId: "d" }),
        body: {
          id: "consultation-1",
          patientId: "patient-1",
          practitionerId: "practitioner-1",
          durationMinutes: 60,
          status: "UNKNOWN",
          participants: [],
          createdAt: "2026-09-24T00:00:00.000Z",
          updatedAt: "2026-09-24T00:00:00.000Z",
        },
      },
      {
        name: "matching",
        operation: () => matchingService.getMyWaitingRoomStatus(),
        body: { matchingRequestId: "matching-1", status: "WAITING" },
      },
      {
        name: "ledger",
        operation: () => ledgerService.getJournals(),
        body: {
          data: [
            {
              id: "journal-1",
              referenceId: "invoice-1",
              description: "Payment",
              status: "POSTED",
              postedAt: "2026-09-24T00:00:00.000Z",
            },
          ],
          meta: { totalItems: 1 },
        },
      },
      {
        name: "prescription",
        operation: () => prescriptionService.getPrescriptions(),
        body: {
          data: [
            {
              id: "prescription-1",
              patientId: "patient-1",
              consultationId: "consultation-1",
              practitionerId: "practitioner-1",
              items: [{}],
              createdAt: "2026-09-24T00:00:00.000Z",
              updatedAt: "2026-09-24T00:00:00.000Z",
            },
          ],
          meta: { totalItems: 1 },
        },
      },
      {
        name: "patient",
        operation: () => patientService.getMyProfile(),
        body: {
          patientId: "patient-1",
          status: "ACTIVE",
          fullName: "Patient",
          birthDate: "1990-01-01",
          gender: "FEMALE",
          phoneNumber: "0812",
          address: "Address",
        },
      },
    ];

    for (const testCase of cases) {
      global.fetch = jest
        .fn()
        .mockResolvedValue(response(testCase.body)) as unknown as typeof fetch;
      await expect(testCase.operation()).rejects.toMatchObject({
        name: "ApiError",
        statusCode: 502,
        error: "INVALID_RESPONSE",
      });
    }
  });

  it("does not let a non-void adapter consume an empty response", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response(undefined, 201)) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/empty", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 502,
      error: "INVALID_RESPONSE",
    });
  });

  it("keeps missing patient sensitive fields unknown", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      response({
        patientId: "patient-1",
        status: "ACTIVE",
        fullName: "Patient",
        birthDate: "1990-01-01",
        gender: "FEMALE",
        phoneNumber: "0812",
        address: "Address",
        medicalRecordNumber: "RM-1",
      }),
    ) as unknown as typeof fetch;

    const patient = await patientService.getMyProfile();
    expect(patient.nik).toBeUndefined();
    expect(patient.bpjsNumber).toBeUndefined();
    expect(patient.faskes1).toBeUndefined();
  });

  it("uses no-content handling for patient profile creation", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(response(undefined, 201)) as unknown as typeof fetch;

    await expect(
      patientService.createProfile({
        fullName: "Patient",
        phoneNumber: "0812",
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects an HTTPS response redirected to local cleartext", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ...response({ ok: true }),
      redirected: true,
      url: "http://localhost:3000/records",
    } as unknown as Response) as unknown as typeof fetch;

    await expect(
      apiRequest("https://api.example.test/records", {
        skipAuth: true,
        adapter: acceptResponse,
      }),
    ).rejects.toMatchObject({
      name: "ApiError",
      statusCode: 0,
      error: "INSECURE_API_URL",
    });
  });
});
