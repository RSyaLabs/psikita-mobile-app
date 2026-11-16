import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function PrivacyScreen() {
  return <InformationScreen
    title="Privasi & Data Pribadi"
    description="Informasi ringkas terkait akses dan perlindungan data pada aplikasi."
    items={[
      { title: "Akses akun", description: "Jaga kata sandi dan OTP tetap pribadi." },
      { title: "Data konsultasi", description: "Data kesehatan bersifat sensitif." },
      { title: "Kebijakan lengkap", description: "Lihat dokumen kebijakan resmi untuk ketentuan lengkap." },
    ]}
  />;
}
