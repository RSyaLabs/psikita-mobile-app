import { z } from "zod";
import { PRACTITIONER_TYPES } from "@/constants/enums";

export const practitionerRegisterSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap beserta gelar wajib diisi"),
  strNumber: z.string().min(5, "Nomor STR aktif wajib diisi"),
  sippNumber: z.string().min(5, "Nomor SIPP/SIP wajib diisi"),
  type: z.enum(PRACTITIONER_TYPES),
  specialization: z
    .string()
    .min(3, "Bidang peminatan/spesialisasi wajib diisi"),
});

