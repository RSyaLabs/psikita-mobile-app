import { fixture } from "./base";

export function devConsultations(flag?: string) {
  return fixture(
    [
      {
        id: "dev-consultation-0001",
        patientId: "dev-patient-0001",
        practitionerId: "dev-prac-0001",
        durationMinutes: 45,
        status: "ACTIVE" as const,
        participants: [
          {
            id: "part-1",
            userId: "dev-patient-0001",
            role: "PATIENT" as const,
          },
          {
            id: "part-2",
            userId: "dev-prac-0001",
            role: "PRACTITIONER" as const,
          },
        ],
        roomId: "dev-room-0001",
        billingOrderId: "dev-billing-0001",
        startedAt: "2026-01-15T09:00:00.000Z",
        finishedAt: null,
        cancelledAt: null,
        createdAt: "2026-01-15T08:55:00.000Z",
        updatedAt: "2026-01-15T09:00:00.000Z",
        practitionerName: "dr. Rina Amelia, M.Psi",
        practitionerTitle: "Psikolog Klinis",
        practitionerSpecialization: "Psikologi Klinis Dewasa & CBT",
        practitionerAvatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
        patientName: "Siti Rahayu",
        patientAvatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
        icdCode: "F41.1 (GAD)",
        note: "Sesi berjalan: evaluasi tingkat kecemasan dan respon terhadap teknik pernapasan diafragma.",
      },
      {
        id: "dev-consultation-0002",
        patientId: "dev-patient-0001",
        practitionerId: "dev-prac-0002",
        durationMinutes: 45,
        status: "FINISHED" as const,
        participants: [
          {
            id: "part-3",
            userId: "dev-patient-0001",
            role: "PATIENT" as const,
          },
          {
            id: "part-4",
            userId: "dev-prac-0002",
            role: "PRACTITIONER" as const,
          },
        ],
        roomId: "dev-room-0002",
        billingOrderId: "dev-billing-0002",
        startedAt: "2026-01-10T14:00:00.000Z",
        finishedAt: "2026-01-10T14:45:00.000Z",
        cancelledAt: null,
        createdAt: "2026-01-10T13:55:00.000Z",
        updatedAt: "2026-01-10T14:45:00.000Z",
        practitionerName: "dr. Andi Pratama, Sp.KJ",
        practitionerTitle: "Dokter Spesialis Kedokteran Jiwa",
        practitionerSpecialization: "Psikiatri Dewasa & Gangguan Kecemasan",
        practitionerAvatar:
          "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
        patientName: "Budi Santoso",
        patientAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        icdCode: "F32.1 (Depresi Sedang)",
        note: "Sesi selesai: mood membaik, jadwal kontrol lanjutan 2 minggu ke depan.",
      },
      {
        id: "dev-consultation-0003",
        patientId: "dev-patient-0001",
        practitionerId: "dev-prac-0001",
        durationMinutes: 30,
        status: "CANCELLED" as const,
        participants: [
          {
            id: "part-5",
            userId: "dev-patient-0001",
            role: "PATIENT" as const,
          },
          {
            id: "part-6",
            userId: "dev-prac-0001",
            role: "PRACTITIONER" as const,
          },
        ],
        roomId: "dev-room-0003",
        billingOrderId: "dev-billing-0003",
        startedAt: null,
        finishedAt: null,
        cancelledAt: "2026-01-08T10:00:00.000Z",
        createdAt: "2026-01-08T09:55:00.000Z",
        updatedAt: "2026-01-08T10:00:00.000Z",
        practitionerName: "dr. Rina Amelia, M.Psi",
        practitionerTitle: "Psikolog Klinis",
        practitionerSpecialization: "Psikologi Klinis Dewasa & CBT",
        practitionerAvatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
        patientName: "Dewi Lestari",
        patientAvatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
        icdCode: "F51.0 (Insomnia Non-Organik)",
        note: "Dibatalkan oleh pasien: jadwal ulang untuk konsultasi berikutnya.",
      },
    ],
    flag,
  );
}

export function devConsultationDetail(
  id: string = "dev-consultation-0001",
  flag?: string,
) {
  const all = devConsultations(flag);
  const found = all.find((c) => c.id === id);
  if (found) {
    return fixture(found, flag);
  }
  // Return active consultation with requested ID if not in static list
  return fixture(
    {
      id,
      patientId: "dev-patient-0001",
      practitionerId: "dev-prac-0001",
      durationMinutes: 45,
      status: "ACTIVE" as const,
      participants: [
        {
          id: "part-1",
          userId: "dev-patient-0001",
          role: "PATIENT" as const,
        },
        {
          id: "part-2",
          userId: "dev-prac-0001",
          role: "PRACTITIONER" as const,
        },
      ],
      roomId: "dev-room-0001",
      billingOrderId: "dev-billing-0001",
      startedAt: "2026-01-15T09:00:00.000Z",
      finishedAt: null,
      cancelledAt: null,
      createdAt: "2026-01-15T08:55:00.000Z",
      updatedAt: "2026-01-15T09:00:00.000Z",
      practitionerName: "dr. Rina Amelia, M.Psi",
      practitionerTitle: "Psikolog Klinis",
      practitionerSpecialization: "Psikologi Klinis Dewasa & CBT",
      practitionerAvatar:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
      patientName: "Siti Rahayu",
      patientAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
      icdCode: "F41.1 (GAD)",
      note: "Sesi berjalan: evaluasi tingkat kecemasan dan respon terhadap teknik pernapasan diafragma.",
    },
    flag,
  );
}

export function devRoomMessages(
  flag?: string,
  roomId: string = "dev-room-0001",
) {
  const targetRoomId = roomId || "dev-room-0001";
  return fixture(
    {
      data: [
        {
          id: "dev-msg-0001",
          roomId: targetRoomId,
          senderId: "dev-prac-0001",
          senderRole: "PRACTITIONER" as const,
          contentType: "TEXT" as const,
          clientMessageId: "dev-cmid-0001",
          ciphertext: "Halo Ibu Siti, selamat pagi. Bagaimana perasaan Anda hari ini?",
          deliveryStatus: "DELIVERED" as const,
          readStatus: "READ" as const,
          createdAt: "2026-01-15T09:02:00.000Z",
          updatedAt: "2026-01-15T09:02:00.000Z",
        },
        {
          id: "dev-msg-0002",
          roomId: targetRoomId,
          senderId: "dev-patient-0001",
          senderRole: "PATIENT" as const,
          contentType: "TEXT" as const,
          clientMessageId: "dev-cmid-0002",
          ciphertext: "Pagi Dok, belakangan ini saya merasa cemas berlebihan dan susah tidur.",
          deliveryStatus: "DELIVERED" as const,
          readStatus: "READ" as const,
          createdAt: "2026-01-15T09:03:00.000Z",
          updatedAt: "2026-01-15T09:03:00.000Z",
        },
        {
          id: "dev-msg-0003",
          roomId: targetRoomId,
          senderId: "dev-prac-0001",
          senderRole: "PRACTITIONER" as const,
          contentType: "TEXT" as const,
          clientMessageId: "dev-cmid-0003",
          ciphertext: "Baik, mari kita bahas pelan-pelan ya. Apakah ada pemicu tertentu dalam 2 minggu ini?",
          deliveryStatus: "DELIVERED" as const,
          readStatus: "READ" as const,
          createdAt: "2026-01-15T09:04:00.000Z",
          updatedAt: "2026-01-15T09:04:00.000Z",
        },
      ],
      meta: {
        itemCount: 3,
        totalItems: 3,
        itemsPerPage: 50,
        totalPages: 1,
        currentPage: 1,
      },
    },
    flag,
  );
}

export function devIceServers(flag?: string) {
  return fixture(
    {
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
      ],
    },
    flag,
  );
}

export function devWaitingRoomStatus(flag?: string) {
  return fixture(
    {
      matchingRequestId: "dev-match-0001",
      status: "MATCHED",
      queuePosition: 1,
      estimatedWaitMinutes: 0,
      assignedDoctor: {
        id: "dev-prac-0001",
        name: "dr. Rina Amelia, M.Psi (Dokter Contoh Satu)",
        title: "Psikolog Klinis",
        rating: 4.9,
        avatar:
          "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
      },
    },
    flag,
  );
}

export function devMatchings(flag?: string) {
  return fixture(
    [
      {
        id: "dev-match-0001",
        patientId: "dev-patient-0001",
        triageId: "dev-triage-0001",
        requiredLevel: "level_2" as const,
        status: { type: "MATCHED" },
        candidatePractitionerIds: ["dev-prac-0001", "dev-prac-0002"],
        assignedPractitionerId: "dev-prac-0001",
        deadlineAt: "2026-01-15T12:00:00.000Z",
        createdAt: "2026-01-15T09:30:00.000Z",
        updatedAt: "2026-01-15T09:30:00.000Z",
        consultationId: "dev-consultation-0001",
        roomId: "dev-room-0001",
        practitionerId: "dev-prac-0001",
        consultation: {
          id: "dev-consultation-0001",
          consultationId: "dev-consultation-0001",
          patientId: "dev-patient-0001",
          practitionerId: "dev-prac-0001",
          roomId: "dev-room-0001",
          status: "ACTIVE",
        },
      },
    ],
    flag,
  );
}

export function devClaimMatching(matchingRequestId: string, flag?: string) {
  return fixture(
    {
      id: matchingRequestId || "dev-match-0001",
      patientId: "dev-patient-0001",
      triageId: "dev-triage-0001",
      requiredLevel: "level_2" as const,
      status: { type: "MATCHED" },
      candidatePractitionerIds: ["dev-prac-0001", "dev-prac-0002"],
      assignedPractitionerId: "dev-prac-0001",
      deadlineAt: "2026-01-15T12:00:00.000Z",
      createdAt: "2026-01-15T09:30:00.000Z",
      updatedAt: "2026-01-15T09:30:00.000Z",
      consultationId: "dev-consultation-0001",
      roomId: "dev-room-0001",
      practitionerId: "dev-prac-0001",
      consultation: {
        id: "dev-consultation-0001",
        consultationId: "dev-consultation-0001",
        patientId: "dev-patient-0001",
        practitionerId: "dev-prac-0001",
        roomId: "dev-room-0001",
        status: "ACTIVE",
      },
    },
    flag,
  );
}
