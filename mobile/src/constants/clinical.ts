export const ICD_10_DESCRIPTION_MAP = {
  "F41.1": "Gangguan kecemasan menyeluruh",
  "F32.0": "Episode depresif ringan",
  "F43.2": "Gangguan penyesuaian",
  "F51.0": "Insomnia non-organik",
} as const;

export function getIcd10Description(
  code: string | undefined,
): string | undefined {
  return code
    ? ICD_10_DESCRIPTION_MAP[code as keyof typeof ICD_10_DESCRIPTION_MAP]
    : undefined;
}

export const CLINICAL_CONSTANTS = {
  ICD_10_CODES: Object.entries(ICD_10_DESCRIPTION_MAP).map(
    ([code, description]) => ({
      code,
      description,
      label: `${code} — ${description}`,
    }),
  ),
  SEVERITY_LEVELS: ["Ringan", "Sedang", "Berat"] as const,
  SPECIALTIES: [
    "Psikolog Klinis Dewasa",
    "Psikolog Anak & Remaja",
    "Psikiater (Sp.KJ)",
    "Trauma & Konseling Adiksi",
  ],
  ACADEMIC_DEGREES: [
    "S.Psi., M.Psi.",
    "M.Psi., Psikolog",
    "dr., Sp.KJ",
    "dr., Sp.KJ(K)",
  ],
} as const;
