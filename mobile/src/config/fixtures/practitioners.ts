import { fixture } from "./base";

export interface DevPractitionerRecord {
  id: string;
  userId: string;
  type: "PSYCHOLOGIST" | "PSYCHIATRIST";
  fullName: string;
  title: string;
  specialization: string;
  avatar: string;
  consultationFee: number;
  totalSessions: number;
  experienceYears: number;
  supportsBpjs: boolean;
  nik: string;
  nikVerificationStatus: "VERIFIED" | "NOT_VERIFIED" | "RETRYABLE" | "MANUAL_REVIEW";
  taxIdentificationNumber: string;
  availabilityStatus: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE";
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  averageRating: number;
  educations: Array<{
    id: string;
    institution: string;
    degree: string;
    major: string;
    graduationYear: number;
    fieldOfStudy: string;
    startYear: number;
    endYear: number;
  }>;
  experiences: Array<{
    id: string;
    facilityName: string;
    position: string;
    startDate: string;
    endDate?: string;
    workplace: string;
  }>;
  psychologistProfile?: {
    level: string;
    totalPracticeHours: number;
    sippNumber: string;
  };
  psychiatristProfile?: {
    strNumber: string;
    sipNumber: string;
    canPrescribe: boolean;
  };
}

export let devPractitionersState: DevPractitionerRecord[] = [
  {
    id: "dev-prac-0001",
    userId: "01M34MQZ30P5GE757D3178RB4W",
    type: "PSYCHOLOGIST",
    fullName: "dr. Rina Amelia, M.Psi (Dokter Contoh Satu)",
    title: "Psikolog Klinis Dewasa",
    specialization: "Psikologi Klinis & Konseling Remaja",
    avatar:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80",
    consultationFee: 150000,
    totalSessions: 142,
    experienceYears: 8,
    supportsBpjs: true,
    nik: "0000000000000001",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.000",
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    averageRating: 4.9,
    educations: [
      {
        id: "edu-1",
        institution: "Universitas Indonesia",
        degree: "M.Psi, Psikolog",
        major: "Psikologi Klinis",
        graduationYear: 2015,
        fieldOfStudy: "Psikologi Klinis",
        startYear: 2011,
        endYear: 2015,
      },
    ],
    experiences: [
      {
        id: "exp-1",
        facilityName: "RS Jiwa Soeharto Heerdjan",
        position: "Psikolog Klinis",
        startDate: "2015-01-01T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
        workplace: "RS Jiwa Soeharto Heerdjan",
      },
    ],
    psychologistProfile: {
      level: "level_1",
      totalPracticeHours: 1200,
      sippNumber: "SIPP-DEV-0001",
    },
  },
  {
    id: "dev-prac-0002",
    userId: "01M34MQZ3069AHXD42BZVDWTP7",
    type: "PSYCHIATRIST",
    fullName: "dr. Andi Pratama, Sp.KJ (Dokter Contoh Dua)",
    title: "Dokter Spesialis Kedokteran Jiwa",
    specialization: "Psikiatri Dewasa & Gangguan Kecemasan",
    avatar:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80",
    consultationFee: 200000,
    totalSessions: 184,
    experienceYears: 10,
    supportsBpjs: true,
    nik: "0000000000000002",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.000",
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    averageRating: 4.8,
    educations: [
      {
        id: "edu-2",
        institution: "Universitas Airlangga",
        degree: "Sp.KJ",
        major: "Kedokteran Jiwa",
        graduationYear: 2015,
        fieldOfStudy: "Kedokteran Jiwa",
        startYear: 2011,
        endYear: 2015,
      },
    ],
    experiences: [
      {
        id: "exp-2",
        facilityName: "RSUP Cipto Mangunkusumo",
        position: "Dokter Spesialis Kejiwaan",
        startDate: "2015-01-01T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
        workplace: "RSUP Cipto Mangunkusumo",
      },
    ],
    psychiatristProfile: {
      strNumber: "STR-DEV-0002",
      sipNumber: "SIP-DEV-0002",
      canPrescribe: true,
    },
  },
  {
    id: "dev-prac-0003",
    userId: "01M34MQZ30PENDING0001",
    type: "PSYCHIATRIST",
    fullName: "dr. Hendra Setiawan, Sp.KJ (Dokter Contoh Menunggu)",
    title: "Dokter Spesialis Kejiwaan",
    specialization: "Depresi & Gangguan Mood",
    avatar:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&auto=format&fit=crop&q=80",
    consultationFee: 175000,
    totalSessions: 45,
    experienceYears: 4,
    supportsBpjs: true,
    nik: "0000000000000003",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.003",
    availabilityStatus: "INACTIVE",
    verificationStatus: "PENDING",
    averageRating: 4.7,
    educations: [
      {
        id: "edu-3",
        institution: "Universitas Padjadjaran",
        degree: "Sp.KJ",
        major: "Kedokteran Jiwa",
        graduationYear: 2021,
        fieldOfStudy: "Kedokteran Jiwa",
        startYear: 2017,
        endYear: 2021,
      },
    ],
    experiences: [
      {
        id: "exp-3",
        facilityName: "RS Hasan Sadikin Bandung",
        position: "Dokter Residen Jiwa",
        startDate: "2021-01-01T00:00:00.000Z",
        endDate: "2025-01-01T00:00:00.000Z",
        workplace: "RS Hasan Sadikin Bandung",
      },
    ],
    psychiatristProfile: {
      strNumber: "STR-DEV-0003",
      sipNumber: "SIP-DEV-0003",
      canPrescribe: true,
    },
  },
  {
    id: "dev-prac-0004",
    userId: "01M34MQZ30REJECTED001",
    type: "PSYCHOLOGIST",
    fullName: "Budi Santoso, S.Psi (Dokter Contoh Ditolak)",
    title: "Sarjana Psikologi",
    specialization: "Konseling Umum",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    consultationFee: 100000,
    totalSessions: 0,
    experienceYears: 1,
    supportsBpjs: false,
    nik: "0000000000000004",
    nikVerificationStatus: "NOT_VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.004",
    availabilityStatus: "SUSPENDED",
    verificationStatus: "REJECTED",
    averageRating: 3.5,
    educations: [
      {
        id: "edu-4",
        institution: "Universitas Negeri Jakarta",
        degree: "S.Psi",
        major: "Psikologi",
        graduationYear: 2023,
        fieldOfStudy: "Psikologi",
        startYear: 2019,
        endYear: 2023,
      },
    ],
    experiences: [
      {
        id: "exp-4",
        facilityName: "Klinik Pratama Swasta",
        position: "Asisten Konselor",
        startDate: "2023-06-01T00:00:00.000Z",
        endDate: "2024-01-01T00:00:00.000Z",
        workplace: "Klinik Pratama Swasta",
      },
    ],
    psychologistProfile: {
      level: "level_1",
      totalPracticeHours: 150,
      sippNumber: "SIPP-DEV-0004",
    },
  },
  {
    id: "dev-prac-0005",
    userId: "01M34MQZ30MAYA00000001",
    type: "PSYCHOLOGIST",
    fullName: "dr. Maya Indah, M.Psi (Dokter Contoh Konselor Remaja)",
    title: "Psikolog Perkembangan & Remaja",
    specialization: "Konseling Remaja & Masalah Akademik",
    avatar:
      "https://images.unsplash.com/photo-1594824813589-9a74c2d326f5?w=200&auto=format&fit=crop&q=80",
    consultationFee: 120000,
    totalSessions: 88,
    experienceYears: 6,
    supportsBpjs: true,
    nik: "0000000000000005",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.005",
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    averageRating: 4.9,
    educations: [
      {
        id: "edu-5",
        institution: "Universitas Gadjah Mada",
        degree: "M.Psi, Psikolog",
        major: "Psikologi Perkembangan",
        graduationYear: 2018,
        fieldOfStudy: "Psikologi Perkembangan",
        startYear: 2014,
        endYear: 2018,
      },
    ],
    experiences: [
      {
        id: "exp-5",
        facilityName: "Pusat Konseling Remaja Yogyakarta",
        position: "Konselor Remaja Utama",
        startDate: "2018-01-01T00:00:00.000Z",
        endDate: "2025-01-01T00:00:00.000Z",
        workplace: "Pusat Konseling Remaja Yogyakarta",
      },
    ],
    psychologistProfile: {
      level: "level_1",
      totalPracticeHours: 950,
      sippNumber: "SIPP-DEV-0005",
    },
  },
  {
    id: "dev-prac-0006",
    userId: "01M34MQZ30FARHAN000001",
    type: "PSYCHIATRIST",
    fullName: "dr. Farhan Malik, Sp.KJ (Dokter Contoh Konsultan)",
    title: "Konsultan Psikiatri Klinis",
    specialization: "Gangguan Bipolar & Skizofrenia",
    avatar:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&auto=format&fit=crop&q=80",
    consultationFee: 300000,
    totalSessions: 210,
    experienceYears: 12,
    supportsBpjs: false,
    nik: "0000000000000006",
    nikVerificationStatus: "VERIFIED",
    taxIdentificationNumber: "00.000.000.0-000.006",
    availabilityStatus: "AVAILABLE",
    verificationStatus: "VERIFIED",
    averageRating: 4.9,
    educations: [
      {
        id: "edu-6",
        institution: "Universitas Indonesia",
        degree: "Sp.KJ",
        major: "Kedokteran Jiwa",
        graduationYear: 2012,
        fieldOfStudy: "Kedokteran Jiwa",
        startYear: 2008,
        endYear: 2012,
      },
    ],
    experiences: [
      {
        id: "exp-6",
        facilityName: "RS Khusus Jiwa Dharmawangsa",
        position: "Dokter Spesialis Konsultan",
        startDate: "2012-01-01T00:00:00.000Z",
        endDate: "2025-01-01T00:00:00.000Z",
        workplace: "RS Khusus Jiwa Dharmawangsa",
      },
    ],
    psychiatristProfile: {
      strNumber: "STR-DEV-0006",
      sipNumber: "SIP-DEV-0006",
      canPrescribe: true,
    },
  },
];

export function devApprovePractitioner(id: string): void {
  const target = devPractitionersState.find((p) => p.id === id);
  if (target) {
    target.verificationStatus = "VERIFIED";
    target.availabilityStatus = "AVAILABLE";
  }
}

export function devRejectPractitioner(id: string, _reason?: string): void {
  const target = devPractitionersState.find((p) => p.id === id);
  if (target) {
    target.verificationStatus = "REJECTED";
    target.availabilityStatus = "INACTIVE";
  }
}

export function devUpdatePractitionerAvailability(
  id: string,
  status: "AVAILABLE" | "ON_LEAVE" | "SUSPENDED" | "INACTIVE",
): void {
  const target = devPractitionersState.find((p) => p.id === id);
  if (target) {
    target.availabilityStatus = status;
  }
}

function normalizePractitioner(d: DevPractitionerRecord): any {
  const cloned = JSON.parse(JSON.stringify(d));
  if (cloned.rating === undefined && cloned.averageRating !== undefined) {
    cloned.rating = cloned.averageRating;
  }
  if (!cloned.sippNumber && cloned.psychologistProfile?.sippNumber) {
    cloned.sippNumber = cloned.psychologistProfile.sippNumber;
  }
  if (!cloned.strNumber && cloned.psychiatristProfile?.strNumber) {
    cloned.strNumber = cloned.psychiatristProfile.strNumber;
  }
  return cloned;
}

export function devPractitionerProfile(
  flag?: string,
  typeOrId: string = "PSYCHOLOGIST",
) {
  let doc: DevPractitionerRecord | undefined;
  if (typeOrId === "PSYCHOLOGIST") {
    doc = devPractitionersState.find((p) => p.id === "dev-prac-0001");
  } else if (typeOrId === "PSYCHIATRIST") {
    doc = devPractitionersState.find((p) => p.id === "dev-prac-0002");
  } else {
    doc = devPractitionersState.find((p) => p.id === typeOrId);
  }

  if (!doc) {
    doc = devPractitionersState[0]!;
  }

  return fixture(normalizePractitioner(doc), flag);
}

export function devPractitionerDirectory(
  flag?: string,
  queryStringOrUrl?: string,
) {
  let docs = devPractitionersState.map((d) => normalizePractitioner(d));

  if (queryStringOrUrl) {
    try {
      const queryPart = queryStringOrUrl.includes("?")
        ? queryStringOrUrl.split("?")[1]
        : queryStringOrUrl;
      if (queryPart) {
        const params = new URLSearchParams(queryPart);
        const verificationStatus = params.get("verificationStatus");
        const type = params.get("type");
        const availabilityStatus = params.get("availabilityStatus");

        if (verificationStatus) {
          docs = docs.filter((d) => d.verificationStatus === verificationStatus);
        }
        if (type) {
          docs = docs.filter((d) => d.type === type);
        }
        if (availabilityStatus) {
          docs = docs.filter((d) => d.availabilityStatus === availabilityStatus);
        }
      }
    } catch {
      // fallback to unfiltered
    }
  }

  const list: any = [...docs];
  list.data = docs;
  list.meta = {
    itemCount: docs.length,
    totalItems: docs.length,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  };

  return fixture(list, flag);
}
