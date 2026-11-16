import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function SupportScreen() {
  return <InformationScreen
    title="Hubungi Dukungan"
    description="Bantuan untuk masalah aplikasi, pembayaran, atau konsultasi."
    items={[
      { title: "Bantuan aplikasi", description: "Catat waktu kendala dan layar terkait. Jangan kirim kata sandi atau OTP." },
      { title: "Kontak resmi", description: "Gunakan kanal resmi SeraPhany." },
      { title: "Situasi darurat", description: "Untuk kondisi darurat, hubungi layanan darurat setempat." },
    ]}
  />;
}
