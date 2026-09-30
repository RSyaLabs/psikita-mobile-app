import { fixture } from "./base";

export function devTriageSummary(flag?: string) {
  return fixture(
    {
      completedAt: "2026-01-15T09:30:00.000Z",
      instrument: "Kuesioner awal",
      stageReached: "COMPLETED" as const,
    },
    flag,
  );
}

export function devTriageAssessment(id: string = "dev-triage-0001", flag?: string) {
  return fixture(
    {
      id: id || "dev-triage-0001",
      patientId: "dev-patient-0001",
      assessedBy: "dev-patient-0001",
      assessmentType: "SELF_ASSESSMENT" as const,
      score: 12,
      hasRedFlags: false,
      level: "YELLOW" as const,
      disposition: "COUNSELING" as const,
      answers: {
        q1: "Sering cemas saat menghadapi tenggat waktu kerja",
        q2: "Sulit tidur dan sering terbangun di malam hari",
        q3: "Mudah lelah dan sulit berkonsentrasi",
        q4: "Otot bahu dan leher terasa tegang",
      },
      notes: "Keluhan kecemasan berlebih dan gangguan pola tidur sejak 2 minggu terakhir.",
      createdAt: "2026-01-15T09:30:00.000Z",
      updatedAt: "2026-01-15T09:30:00.000Z",
    },
    flag,
  );
}

export function devTriageQueue(flag?: string) {
  return fixture([devTriageAssessment("dev-triage-0001", flag)], flag);
}

export function devPrescriptions(flag?: string) {
  return fixture(
    {
      data: [
        {
          id: "dev-rx-0001",
          patientId: "dev-patient-0001",
          consultationId: "dev-consultation-0001",
          practitionerId: "dev-prac-0002",
          prescriptionNumber: "RX-20260116-0001",
          doctorName: "dr. Andi Pratama, Sp.KJ",
          doctorSip: "SIP: 446.1/1234/DS/2023",
          notes: "Konsumsi obat secara teratur sesudah makan malam. Hindari menghentikan obat tiba-tiba dan kontrol kembali 14 hari lagi.",
          validUntil: "2026-02-15T00:00:00.000Z",
          items: [
            {
              id: "item-1",
              medication: {
                id: "med-1",
                name: "Sertraline 50mg",
              },
              dosage: "1x sehari sesudah makan (malam)",
              frequency: "1x1",
              duration: "14 hari",
              refill: 1,
            },
            {
              id: "item-2",
              medication: {
                id: "med-2",
                name: "Vitamin B Kompleks",
              },
              dosage: "1x sehari pagi hari",
              frequency: "1x1",
              duration: "30 hari",
              refill: 0,
            },
          ],
          createdAt: "2026-01-16T10:00:00.000Z",
          updatedAt: "2026-01-16T10:00:00.000Z",
        },
      ],
      meta: {
        itemCount: 1,
        totalItems: 1,
        itemsPerPage: 10,
        totalPages: 1,
        currentPage: 1,
      },
    },
    flag,
  );
}

export function devConsultationNotes(
  consultationId: string = "dev-consultation-0001",
  flag?: string,
) {
  return fixture(
    [
      {
        id: "dev-note-0001",
        consultationId: consultationId || "dev-consultation-0001",
        contentType: "soap" as const,
        soap: {
          subjective:
            "Pasien mengeluhkan kecemasan dan insomnia sejak 2 minggu terakhir karena beban kerja yang meningkat.",
          objective:
            "Afek cemas, kontak mata adekuat, respon verbal jelas, skor GAD-7: 12 (Kecemasan Sedang).",
          assessment:
            "F41.1 Generalized Anxiety Disorder (GAD) derajat sedang responsif terhadap intervensi awal.",
          plan: "Psikoedukasi teknik relaksasi napas 4-7-8, perbaikan sleep hygiene, pembatasan kafein, dan kontrol evaluasi 2 minggu mendatang.",
        },
        createdAt: "2026-01-15T09:45:00.000Z",
        updatedAt: "2026-01-15T09:45:00.000Z",
      },
    ],
    flag,
  );
}

export function devCreateSoapNote(
  consultationId: string,
  body?: unknown,
  flag?: string,
) {
  let subjective = "Pasien mengeluhkan rasa cemas dan gelisah.";
  let objective = "Keadaan umum baik, kontak mata adekuat.";
  let assessment = "F41.1 Generalized Anxiety Disorder.";
  let plan = "Konseling berkala dan latihan relaksasi pernapasan.";

  if (body) {
    try {
      const parsed = typeof body === "string" ? JSON.parse(body) : body;
      if (parsed && typeof parsed === "object") {
        if ((parsed as any).subjective) subjective = (parsed as any).subjective;
        if ((parsed as any).objective) objective = (parsed as any).objective;
        if ((parsed as any).assessment) assessment = (parsed as any).assessment;
        if ((parsed as any).plan) plan = (parsed as any).plan;
      }
    } catch {
      // fallback to defaults
    }
  }

  return fixture(
    {
      id: `dev-note-${Date.now()}`,
      consultationId: consultationId || "dev-consultation-0001",
      contentType: "soap" as const,
      soap: {
        subjective,
        objective,
        assessment,
        plan,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    flag,
  );
}

export function devFinalizeNote(noteId: string, flag?: string) {
  return fixture(
    {
      id: noteId || "dev-note-0001",
      consultationId: "dev-consultation-0001",
      contentType: "soap" as const,
      soap: {
        subjective: "Pasien mengeluhkan kecemasan situasional.",
        objective: "Skor GAD-7: 12.",
        assessment: "F41.1 Gangguan Kecemasan Menyeluruh.",
        plan: "Psikoterapi kognitif perilaku.",
      },
      createdAt: "2026-01-15T09:45:00.000Z",
      updatedAt: new Date().toISOString(),
    },
    flag,
  );
}

export function devConsultationReferral(
  consultationId: string = "dev-consultation-0001",
  flag?: string,
) {
  return fixture(
    [
      {
        id: "dev-ref-0001",
        consultationId: consultationId || "dev-consultation-0001",
        destinationInstitutionId: "RSUP Dr. Cipto Mangunkusumo (RSCM)",
        targetHospital: "RSUP Dr. Cipto Mangunkusumo (RSCM)",
        targetDepartment: "Poliklinik Psikiatri Dewasa",
        hospitalAddress: "Jl. Diponegoro No. 71, Jakarta Pusat",
        referralNumber: "RUJ-2026-0928-0042",
        currentStatus: "TERBIT",
        bpjsCovered: true,
        icd10Code: "F41.1",
        icd10Description: "Gangguan Kecemasan Menyeluruh",
        reason: {
          id: "F41.1",
          name: "Generalized Anxiety Disorder",
          description:
            "Perlu evaluasi farmakoterapi lanjutan dan pemantauan spesialis psikiatri.",
        },
        histories: [
          {
            id: "h-1",
            status: "TERBIT",
            timestamp: "2026-01-15T10:00:00.000Z",
            comment: "Rujukan Satu Sehat berhasil diterbitkan secara digital",
          },
        ],
        createdAt: "2026-01-15T10:00:00.000Z",
        updatedAt: "2026-01-15T10:00:00.000Z",
      },
    ],
    flag,
  );
}
