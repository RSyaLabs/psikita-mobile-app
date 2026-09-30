import { fixture } from "./base";

export function devPayments(body?: unknown, flag?: string) {
  let contextId = "dev-billing-0001";
  if (body) {
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      if (parsed && typeof parsed === "object" && (parsed as any).contextId) {
        contextId = (parsed as any).contextId;
      }
    } catch {
      // fallback
    }
  }

  return fixture(
    {
      id: "pay-dev-0001",
      status: "SUCCESS" as const,
      amount: 150000,
      contextType: "BILLING_ORDER" as const,
      contextId,
      instruction: {
        methodType: "E_WALLET" as const,
        provider: "GOPAY",
        checkoutUrl: "https://example.com/checkout/pay-dev-0001",
      },
    },
    flag,
  );
}

export function devFeedback(
  consultationId: string,
  body?: unknown,
  flag?: string,
) {
  let star = 5;
  let comment = "Konsultasi sangat memuaskan dan solutif.";
  if (body) {
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      if (parsed && typeof parsed === "object") {
        if (typeof (parsed as any).star === "number") star = (parsed as any).star;
        if (typeof (parsed as any).comment === "string")
          comment = (parsed as any).comment;
      }
    } catch {
      // fallback
    }
  }

  return fixture(
    {
      id: "fb-dev-0001",
      consultationId: consultationId || "dev-consultation-0001",
      patientId: "dev-patient-0001",
      star,
      comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    flag,
  );
}

// --------------------------------------------------------------------------
// Admin Ledger & Management Fixtures
// --------------------------------------------------------------------------

export function devLedgerAccounts(flag?: string) {
  return fixture(
    {
      data: [
        {
          id: "acc-1001",
          name: "Kas & Bank Operasional",
          type: "ASSET" as const,
          balance: 85400000,
          currency: "IDR",
        },
        {
          id: "acc-1002",
          name: "Piutang Klaim BPJS Kesehatan",
          type: "ASSET" as const,
          balance: 24500000,
          currency: "IDR",
        },
        {
          id: "acc-2001",
          name: "Hutang Pembayaran Honor Praktisi",
          type: "LIABILITY" as const,
          balance: 18200000,
          currency: "IDR",
        },
        {
          id: "acc-4001",
          name: "Pendapatan Sesi Konsultasi",
          type: "REVENUE" as const,
          balance: 142000000,
          currency: "IDR",
        },
      ],
      meta: {
        itemCount: 4,
        totalItems: 4,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
    flag,
  );
}

export function devLedgerJournals(flag?: string) {
  return fixture(
    {
      data: [
        {
          id: "jrn-001",
          referenceId: "PAY-2026-001",
          description: "Pembayaran Konsultasi Reguler Pasien Siti Rahayu",
          status: "POSTED" as const,
          postedAt: "2026-01-15T09:00:00.000Z",
          lines: [
            {
              accountId: "acc-1001",
              amount: 150000,
              currency: "IDR",
              entryType: "CREDIT" as const,
            },
          ],
        },
        {
          id: "jrn-002",
          referenceId: "BPJS-CLAIM-001",
          description: "Klaim Paket Konsultasi BPJS Faskes 1",
          status: "POSTED" as const,
          postedAt: "2026-01-15T10:00:00.000Z",
          lines: [
            {
              accountId: "acc-1002",
              amount: 250000,
              currency: "IDR",
              entryType: "DEBIT" as const,
            },
          ],
        },
        {
          id: "jrn-003",
          referenceId: "PAY-2026-002",
          description: "Pembayaran Konsultasi Psikiatri Pasien Budi",
          status: "POSTED" as const,
          postedAt: "2026-01-16T11:00:00.000Z",
          lines: [
            {
              accountId: "acc-1001",
              amount: 200000,
              currency: "IDR",
              entryType: "CREDIT" as const,
            },
          ],
        },
      ],
      meta: {
        itemCount: 3,
        totalItems: 3,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
    flag,
  );
}
