/**
 * Test Suite: Double-Entry Financial Ledger & Payout Engine
 * Sesuai Standar Akuntansi Keuangan & Modul /ledger OpenAPI 3.0
 */

import { mockBalancedJournalFixture } from "../utils/fixtures";
import { TransactionLineDto } from "@/api";

/**
 * Validasi integritas jurnal entri ganda: Total Debit harus sama persis dengan Total Kredit
 */
export function validateDoubleEntryBalance(lines: TransactionLineDto[]): {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
} {
  let totalDebit = 0;
  let totalCredit = 0;

  for (const line of lines) {
    if (line.entryType === "DEBIT") {
      totalDebit += line.amount;
    } else if (line.entryType === "CREDIT") {
      totalCredit += line.amount;
    }
  }

  const difference = Math.abs(totalDebit - totalCredit);
  return {
    isBalanced: difference === 0,
    totalDebit,
    totalCredit,
    difference,
  };
}

/**
 * Kalkulasi pencairan saldo praktisi (fee platform 20% & PPh 21)
 */
export function calculatePractitionerPayout(grossAmount: number): {
  grossAmount: number;
  platformFee: number;
  taxPph21: number;
  netPayout: number;
} {
  const platformFee = Math.round(grossAmount * 0.2);
  const taxableBase = grossAmount * 0.5; // Norma 50% untuk tenaga ahli
  const taxPph21 = Math.round(taxableBase * 0.05); // Tarif 5% lapis 1
  const netPayout = grossAmount - platformFee - taxPph21;

  return {
    grossAmount,
    platformFee,
    taxPph21,
    netPayout,
  };
}

describe("Double-Entry Financial Ledger Engine", () => {
  it("harus memvalidasi jurnal pembayaran seimbang (Debit = Kredit)", () => {
    const check = validateDoubleEntryBalance(
      mockBalancedJournalFixture.lines || [],
    );

    expect(check.isBalanced).toBe(true);
    expect(check.totalDebit).toBe(150000);
    expect(check.totalCredit).toBe(150000);
    expect(check.difference).toBe(0);
  });

  it("harus menolak jurnal yang tidak seimbang (Unbalanced Entry)", () => {
    const unbalancedLines: TransactionLineDto[] = [
      {
        accountId: "acc_cash_01",
        amount: 150000,
        currency: "IDR",
        entryType: "DEBIT",
      },
      {
        accountId: "acc_rev_01",
        amount: 100000, // Selisih 50.000
        currency: "IDR",
        entryType: "CREDIT",
      },
    ];

    const check = validateDoubleEntryBalance(unbalancedLines);

    expect(check.isBalanced).toBe(false);
    expect(check.difference).toBe(50000);
  });

  it("harus menghitung potongan platform fee dan PPh 21 dengan akurat pada pencairan saldo", () => {
    // Penarikan Rp 3.240.000 (sesuai data layar K-05 Withdraw)
    const payout = calculatePractitionerPayout(3240000);

    expect(payout.grossAmount).toBe(3240000);
    expect(payout.platformFee).toBe(648000); // 20%
    expect(payout.taxPph21).toBe(81000); // 5% dari 50%
    expect(payout.netPayout).toBe(3240000 - 648000 - 81000); // Rp 2.511.000
  });
});
