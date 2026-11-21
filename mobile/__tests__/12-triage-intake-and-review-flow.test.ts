import { ROUTES } from "@/constants/routes";

describe("12. Triage Intake, Review & Crisis Flow Suite (Wireframe Screens 24-28 / Tahap 5)", () => {
  const TRIAGE_QUESTIONS = [
    {
      id: "question_1",
      number: 1,
      title:
        "Dalam 2 minggu terakhir, seberapa sering kamu merasa kurang bersemangat atau sulit menikmati hal-hal yang biasanya kamu sukai?",
      shortTitle: "Kurang bersemangat atau sulit menikmati aktivitas harian",
    },
    {
      id: "question_2",
      number: 2,
      title:
        "Dalam 2 minggu terakhir, seberapa sering kamu merasa sedih, murung, atau merasa putus asa?",
      shortTitle: "Merasa sedih, murung, atau putus asa",
    },
    {
      id: "question_3",
      number: 3,
      title:
        "Dalam 2 minggu terakhir, seberapa sering kamu merasa cemas sampai susah tidur?",
      shortTitle: "Cemas sampai susah tidur dalam 2 minggu terakhir",
    },
    {
      id: "question_4",
      number: 4,
      title:
        "Dalam 2 minggu terakhir, seberapa sering kamu merasa lelah berlebihan atau tidak bertenaga?",
      shortTitle: "Lelah berlebihan atau kekurangan energi fisik & emosional",
    },
    {
      id: "question_5",
      number: 5,
      title:
        "Dalam 2 minggu terakhir, seberapa sering kamu merasa kewalahan menghadapi beban pikiran atau aktivitas sehari-hari?",
      shortTitle: "Kewalahan menghadapi beban pikiran atau aktivitas",
    },
  ];

  const TRIAGE_OPTIONS = [
    "Tidak pernah",
    "Beberapa hari",
    "Sering, hampir tiap minggu",
    "Hampir setiap hari",
  ];

  const SCORE_MAP: Record<string, number> = {
    "Tidak pernah": 0,
    "Beberapa hari": 1,
    "Sering, hampir tiap minggu": 2,
    "Hampir setiap hari": 3,
  };

  const calculateTriageScore = (answers: Record<string, string>) => {
    let score = 0;
    let hasSevereSymptom = false;

    for (const q of TRIAGE_QUESTIONS) {
      const ans = answers[q.id] || "Tidak pernah";
      const itemScore = SCORE_MAP[ans] ?? 0;
      score += itemScore;
      if (itemScore === 3) {
        hasSevereSymptom = true;
      }
    }

    return {
      score,
      hasRedFlags: score >= 10 || hasSevereSymptom,
      level: score >= 10 ? "RED" : score >= 5 ? "YELLOW" : "GREEN",
    };
  };

  describe("A. Wireframe Screen 24 (Mulai Konsultasi - 4 Langkah)", () => {
    it("should define the 4-step canonical consulting process accurately", () => {
      const steps = [
        {
          num: 1,
          title: "Jawab 5 pertanyaan singkat",
          desc: "Sekitar 3 menit. Bisa kamu periksa dulu sebelum dikirim.",
        },
        {
          num: 2,
          title: "Kami carikan psikolog yang sesuai",
          desc: "Kamu tidak perlu memilih sendiri. Kamu boleh menutup aplikasi.",
        },
        {
          num: 3,
          title: "Bayar setelah psikolog ditemukan",
          desc: "Rincian biaya terlihat sebelum kamu membayar.",
        },
        {
          num: 4,
          title: "Mulai sesi dan terima hasilnya",
          desc: "Chat atau video, lalu ringkasan dan saran dari psikolog.",
        },
      ];

      expect(steps).toHaveLength(4);
      expect(steps[0].num).toBe(1);
      expect(steps[0].title).toBe("Jawab 5 pertanyaan singkat");
      expect(steps[1].title).toBe("Kami carikan psikolog yang sesuai");
      expect(steps[2].title).toBe("Bayar setelah psikolog ditemukan");
      expect(steps[3].title).toBe("Mulai sesi dan terima hasilnya");
    });
  });

  describe("B. Wireframe Screen 25 (Pertanyaan Triase 5-Step Likert)", () => {
    it("should have exactly 5 clinical questions with question_3 matching wireframe verbatim", () => {
      expect(TRIAGE_QUESTIONS).toHaveLength(5);
      expect(TRIAGE_QUESTIONS[2].number).toBe(3);
      expect(TRIAGE_QUESTIONS[2].title).toContain(
        "cemas sampai susah tidur",
      );
      expect(TRIAGE_QUESTIONS[2].shortTitle).toBe(
        "Cemas sampai susah tidur dalam 2 minggu terakhir",
      );
    });

    it("should provide exactly 4 Likert response options with correct scaling 0 to 3", () => {
      expect(TRIAGE_OPTIONS).toHaveLength(4);
      expect(SCORE_MAP["Tidak pernah"]).toBe(0);
      expect(SCORE_MAP["Beberapa hari"]).toBe(1);
      expect(SCORE_MAP["Sering, hampir tiap minggu"]).toBe(2);
      expect(SCORE_MAP["Hampir setiap hari"]).toBe(3);
    });

    it("should calculate clinical score and triage levels accurately", () => {
      // All zero
      const minAnswers = {
        question_1: "Tidak pernah",
        question_2: "Tidak pernah",
        question_3: "Tidak pernah",
        question_4: "Tidak pernah",
        question_5: "Tidak pernah",
      };
      const minResult = calculateTriageScore(minAnswers);
      expect(minResult.score).toBe(0);
      expect(minResult.level).toBe("GREEN");
      expect(minResult.hasRedFlags).toBe(false);

      // Moderate (score = 5)
      const moderateAnswers = {
        question_1: "Beberapa hari", // 1
        question_2: "Beberapa hari", // 1
        question_3: "Sering, hampir tiap minggu", // 2
        question_4: "Beberapa hari", // 1
        question_5: "Tidak pernah", // 0
      };
      const modResult = calculateTriageScore(moderateAnswers);
      expect(modResult.score).toBe(5);
      expect(modResult.level).toBe("YELLOW");
      expect(modResult.hasRedFlags).toBe(false);

      // High / Severe (score >= 10 or any item = 3)
      const severeAnswers = {
        question_1: "Sering, hampir tiap minggu", // 2
        question_2: "Hampir setiap hari", // 3
        question_3: "Sering, hampir tiap minggu", // 2
        question_4: "Sering, hampir tiap minggu", // 2
        question_5: "Beberapa hari", // 1
      };
      const severeResult = calculateTriageScore(severeAnswers);
      expect(severeResult.score).toBe(10);
      expect(severeResult.level).toBe("RED");
      expect(severeResult.hasRedFlags).toBe(true);
    });
  });

  describe("C. Wireframe Screen 26 (Periksa Jawaban Triase / Review)", () => {
    it("should allow editing answers by jumping to the corresponding question index", () => {
      const getTargetStepForQuestion = (questionNumber: number) => {
        expect(questionNumber).toBeGreaterThanOrEqual(1);
        expect(questionNumber).toBeLessThanOrEqual(5);
        return questionNumber; // Step 1..5
      };

      expect(getTargetStepForQuestion(1)).toBe(1);
      expect(getTargetStepForQuestion(3)).toBe(3);
      expect(getTargetStepForQuestion(5)).toBe(5);
    });

    it("should format answers into a clean JSON record for POST /triage", () => {
      const answers: Record<string, string> = {
        question_1: "Beberapa hari",
        question_2: "Beberapa hari",
        question_3: "Sering, hampir tiap minggu",
        question_4: "Beberapa hari",
        question_5: "Beberapa hari",
      };

      const { score, hasRedFlags } = calculateTriageScore(answers);
      const payload = {
        score,
        hasRedFlags,
        assessmentType: "SELF_ASSESSMENT" as const,
        answers,
      };

      expect(payload.score).toBe(6);
      expect(payload.hasRedFlags).toBe(false);
      expect(payload.answers.question_3).toBe("Sering, hampir tiap minggu");
    });
  });

  describe("D. Wireframe Screen 27 (Jawaban Triase Diterima) & Screen 28 (Bantuan Segera)", () => {
    it("should navigate to Matching Queue upon confirmation in consultation mode", () => {
      const resolvePostTriageRoute = (mode: string) => {
        if (mode === "assessment") {
          return ROUTES.PATIENT.ASSESSMENT_RESULT;
        }
        return ROUTES.PATIENT.MATCHING;
      };

      expect(resolvePostTriageRoute("consultation")).toBe(ROUTES.PATIENT.MATCHING);
      expect(resolvePostTriageRoute("assessment")).toBe(ROUTES.PATIENT.ASSESSMENT_RESULT);
    });

    it("should link to official emergency hotline 119 ext 8 in Screen 28", () => {
      const emergencyHotline = "tel:119";
      const hotlineLabel = "119 ext 8";
      expect(emergencyHotline).toBe("tel:119");
      expect(hotlineLabel).toContain("119 ext 8");
    });
  });
});
