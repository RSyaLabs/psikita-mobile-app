import {
  PatientResponseDto,
  PractitionerResponseDto,
  SubmitTriageDto,
  NoteResponseDto,
} from "@/types/api";
import { LedgerAccountDto, JournalEntryDto } from "@/api";

export const mockPatientFixture: PatientResponseDto = {
  id: "pat_siti_1",
  userId: "usr_siti_1",
  fullName: "Siti Rahmawati",
  phoneNumber: "0812-3456-7890",
  nik: "3174051209900001",
  birthDate: "1998-05-12",
  gender: "FEMALE",
  bpjsNumber: "0000 1234 5678 90",
  faskes1: "Puskesmas Tebet",
  medicalRecordNumber: "RM-2026-8821",
  address: "Jakarta Selatan",
  status: "ACTIVE",
};

export const mockPractitionerFixture: PractitionerResponseDto = {
  id: "doc_1",
  userId: "usr_doc_1",
  fullName: "Andi Pratama",
  title: "dr. Andi Pratama, Sp.KJ",
  strNumber: "STR-3171-8821-2024",
  sippNumber: "SIPP-DKI-2024-0012",
  specialization: "Spesialis Kedokteran Jiwa (Psikiater)",
  type: "PSYCHIATRIST",
  availabilityStatus: "AVAILABLE",
  verificationStatus: "VERIFIED",
  rating: 4.9,
  totalSessions: 142,
  consultationFee: 150000,
};

export const mockSoapNoteFixture: NoteResponseDto = {
  id: "note_soap_001",
  consultationId: "cons_88213",
  type: "SOAP",
  soapData: {
    subjective: "Pasien mengeluhkan insomnia awal dan rasa cemas berlebih.",
    objective: "Kontak mata baik, afek cemas terarah, tidak ada waham.",
    assessment: "F41.1 • Generalized Anxiety Disorder (GAD)",
    plan: "Psikoedukasi, sleep hygiene, evaluasi 14 hari.",
    icd10Code: "F41.1",
    icd10Description: "Generalized Anxiety Disorder",
    severity: "Sedang",
  },
  isFinalized: true,
  createdAt: "2026-09-18T14:45:00Z",
};

export const mockLedgerAccountsFixture: LedgerAccountDto[] = [
  {
    id: "acc_cash_01",
    name: "Kas Operasional Bank BCA",
    type: "ASSET",
    balance: 42500000,
    currency: "IDR",
  },
  {
    id: "acc_rev_01",
    name: "Pendapatan Sesi Konsultasi",
    type: "REVENUE",
    balance: 34000000,
    currency: "IDR",
  },
  {
    id: "acc_liab_01",
    name: "Utang Titipan Saldo Praktisi",
    type: "LIABILITY",
    balance: 8500000,
    currency: "IDR",
  },
];

export const mockBalancedJournalFixture: JournalEntryDto = {
  id: "jrn_001",
  referenceId: "INV-20260920-001",
  description: "Penerimaan Biaya Konsultasi Pasien Siti",
  amount: 150000,
  date: "2026-09-20",
  status: "POSTED",
  postedAt: "2026-09-20T14:00:00Z",
  lines: [
    {
      accountId: "acc_cash_01",
      amount: 150000,
      currency: "IDR",
      entryType: "DEBIT",
    },
    {
      accountId: "acc_rev_01",
      amount: 150000,
      currency: "IDR",
      entryType: "CREDIT",
    },
  ],
};
