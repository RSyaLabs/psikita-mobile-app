import { consultationService } from "@/api/consultation.service";
import { ledgerService } from "@/api/ledger.service";
import { patientService } from "@/api/patient.service";
import { practitionerService } from "@/api/practitioner.service";
import { prescriptionService } from "@/api/prescription.service";
import { paginatedAdapter } from "@/api/response";

const originalFetch = global.fetch;

function response(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    redirected: false,
    url: "",
    body: {},
    headers: { get: () => "application/json" },
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(""),
  } as unknown as Response;
}

function meta(currentPage = 1) {
  return {
    itemCount: 1,
    totalItems: 21,
    itemsPerPage: 10,
    totalPages: 3,
    currentPage,
  };
}

function patient() {
  return {
    patientId: "patient-1",
    status: "ACTIVE",
    fullName: "Siti Rahayu",
    birthDate: "1990-01-01",
    gender: "FEMALE",
    phoneNumber: "081200000000",
    address: "Jakarta",
    medicalRecordNumber: "RM-1",
  };
}

function practitioner() {
  return {
    id: "practitioner-1",
    userId: "user-1",
    type: "PSYCHOLOGIST",
    nik: "1234567890123456",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "123456789012345",
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    averageRating: 4.8,
    educations: [],
    experiences: [],
    psychologistProfile: {
      level: "level_1",
      totalPracticeHours: 100,
      sippNumber: "SIPP-1",
    },
  };
}

function prescription() {
  return {
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
        refill: 0,
      },
    ],
    createdAt: "2026-09-24T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  };
}

function message() {
  return {
    id: "message-1",
    roomId: "room-1",
    senderId: "patient-1",
    clientMessageId: "client-1",
    ciphertext: "encrypted",
    deliveryStatus: "DELIVERED",
    readStatus: "READ",
    createdAt: "2026-09-24T00:00:00.000Z",
    updatedAt: "2026-09-24T00:00:00.000Z",
  };
}

describe("documented list pagination", () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("preserves every documented pagination metadata field", () => {
    const adapter = paginatedAdapter((value) => value);

    expect(adapter({ data: ["item"], meta: meta(2) })).toEqual({
      data: ["item"],
      meta: {
        itemCount: 1,
        totalItems: 21,
        itemsPerPage: 10,
        totalPages: 3,
        currentPage: 2,
      },
    });
  });

  it("forwards patient page, limit, and fullName and returns metadata", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ data: [patient()], meta: meta(2) }),
      ) as unknown as typeof fetch;

    const result = await patientService.getPatients({
      page: 2,
      limit: 10,
      fullName: "Siti",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/patient?page=2&limit=10&fullName=Siti"),
      expect.any(Object),
    );
    expect(result.meta).toEqual(meta(2));
  });

  it("forwards practitioner filters and preserves metadata", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ data: [practitioner()], meta: meta(2) }),
      ) as unknown as typeof fetch;

    const result = await practitionerService.getPractitioners({
      page: 2,
      limit: 5,
      type: "PSYCHOLOGIST",
      availabilityStatus: "AVAILABLE",
      verificationStatus: "VERIFIED",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/practitioner?type=PSYCHOLOGIST&availabilityStatus=AVAILABLE&verificationStatus=VERIFIED&page=2&limit=5",
      ),
      expect.any(Object),
    );
    expect(result.meta).toEqual(meta(2));
  });

  it("forwards ledger filters and pagination", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        response({
          data: [
            { id: "account-1", name: "Cash", type: "ASSET", balance: 100 },
          ],
          meta: meta(2),
        }),
      )
      .mockResolvedValueOnce(
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
                  accountId: "account-1",
                  amount: 100,
                  currency: "IDR",
                  entryType: "DEBIT",
                },
              ],
            },
          ],
          meta: meta(3),
        }),
      ) as unknown as typeof fetch;

    const accounts = await ledgerService.getAccounts({
      page: 2,
      limit: 5,
      type: "ASSET",
      name: "Cash",
    });
    const journals = await ledgerService.getJournals({
      page: 3,
      limit: 5,
      referenceId: "invoice-1",
      status: "POSTED",
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(
        "/ledger/accounts?page=2&limit=5&type=ASSET&name=Cash",
      ),
      expect.any(Object),
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(
        "/ledger/journals?page=3&limit=5&referenceId=invoice-1&status=POSTED",
      ),
      expect.any(Object),
    );
    expect(accounts.meta).toEqual(meta(2));
    expect(journals.meta).toEqual(meta(3));
  });

  it("forwards prescription filters and pagination", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ data: [prescription()], meta: meta(2) }),
      ) as unknown as typeof fetch;

    const result = await prescriptionService.getPrescriptions({
      page: 2,
      limit: 5,
      patientId: "patient-1",
      practitionerId: "practitioner-1",
      consultationId: "consultation-1",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/prescriptions?page=2&limit=5&patientId=patient-1&practitionerId=practitioner-1&consultationId=consultation-1",
      ),
      expect.any(Object),
    );
    expect(result.meta).toEqual(meta(2));
  });

  it("forwards room-message pagination and returns metadata", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(
        response({ data: [message()], meta: meta(2) }),
      ) as unknown as typeof fetch;

    const result = await consultationService.getRoomMessages("room-1", {
      page: 2,
      limit: 20,
      before: "cursor-before",
      after: "cursor-after",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/rooms/room-1/messages?page=2&limit=20&before=cursor-before&after=cursor-after",
      ),
      expect.any(Object),
    );
    expect(result.meta).toEqual(meta(2));
  });
});
