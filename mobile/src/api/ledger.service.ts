import { z } from "zod";
import { apiRequest } from "./client";
import {
  paginatedAdapter,
  withQueryParams,
  zodAdapter,
  type PaginatedResult,
} from "./response";

export interface LedgerAccountDto {
  id: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
  balance: number;
  currency?: string;
}

export interface TransactionLineDto {
  accountId: string;
  amount: number;
  currency?: string;
  entryType: "DEBIT" | "CREDIT";
}

export interface JournalEntryDto {
  id: string;
  referenceId: string;
  description: string;
  amount: number;
  type?: "DEBIT" | "CREDIT";
  date: string;
  postedAt?: string;
  status: "DRAFT" | "POSTED" | "VOIDED";
  lines?: TransactionLineDto[];
}

const ledgerAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]),
  balance: z.number(),
  currency: z.string().optional(),
});

const transactionLineSchema = z.object({
  accountId: z.string(),
  amount: z.number(),
  currency: z.string(),
  entryType: z.enum(["DEBIT", "CREDIT"]),
});

const journalEntrySchema = z.object({
  id: z.string(),
  referenceId: z.string(),
  description: z.string(),
  status: z.enum(["DRAFT", "POSTED", "VOIDED"]),
  postedAt: z.string(),
  lines: z.array(transactionLineSchema),
});

const ledgerAccountAdapter = zodAdapter(ledgerAccountSchema);
const journalEntryAdapter = (value: unknown): JournalEntryDto => {
  const entry = journalEntrySchema.parse(value);
  const debitTotal = entry.lines.reduce(
    (total, line) => (line.entryType === "DEBIT" ? total + line.amount : total),
    0,
  );
  const creditTotal = entry.lines.reduce(
    (total, line) =>
      line.entryType === "CREDIT" ? total + line.amount : total,
    0,
  );
  return {
    id: entry.id,
    referenceId: entry.referenceId,
    description: entry.description,
    amount: debitTotal || creditTotal,
    type: entry.lines[0]?.entryType,
    date: entry.postedAt,
    status: entry.status,
    postedAt: entry.postedAt,
    lines: entry.lines,
  };
};
const accountListAdapter = paginatedAdapter(ledgerAccountAdapter);
const journalListAdapter = paginatedAdapter(journalEntryAdapter);

export const ledgerService = {
  /**
   * Ambil daftar akun ledger keuangan
   */
  async getAccounts(
    params?: {
      page?: number;
      limit?: number;
      type?: LedgerAccountDto["type"];
      name?: string;
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<LedgerAccountDto>> {
    const path = withQueryParams("/ledger/accounts", {
      page: params?.page,
      limit: params?.limit,
      type: params?.type,
      name: params?.name,
    });
    return apiRequest<PaginatedResult<LedgerAccountDto>>(path, {
      adapter: accountListAdapter,
      signal,
    });
  },

  /**
   * Ambil daftar jurnal mutasi keuangan
   */
  async getJournals(
    params?: {
      page?: number;
      limit?: number;
      referenceId?: string;
      status?: JournalEntryDto["status"];
    },
    signal?: AbortSignal,
  ): Promise<PaginatedResult<JournalEntryDto>> {
    const path = withQueryParams("/ledger/journals", {
      page: params?.page,
      limit: params?.limit,
      referenceId: params?.referenceId,
      status: params?.status,
    });
    return apiRequest<PaginatedResult<JournalEntryDto>>(path, {
      adapter: journalListAdapter,
      signal,
    });
  },
};
