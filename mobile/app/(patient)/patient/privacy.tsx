import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function PrivacyScreen() {
  return <InformationScreen
    title="Privasi & Data Pribadi"
    description="Informasi ringkas terkait akses dan perlindungan data pada aplikasi."
    items={[
      { title: "Akses akun", description: "Gunakan kata sandi yang kuat dan jangan membagikan kode autentikasi. Keluar dari akun pada perangkat yang tidak digunakan." },
      { title: "Data konsultasi", description: "Data kesehatan dan riwayat konsultasi termasuk informasi sensitif. Hak akses dan masa retensi mengikuti kebijakan resmi serta ketentuan yang berlaku." },
      { title: "Kebijakan lengkap", description: "Untuk ketentuan hukum, hak subjek data, retensi, dan pemrosesan data, rujuk dokumen kebijakan privasi resmi SeraPhany. Ringkasan ini bukan pengganti dokumen hukum." },
    ]}
  />;
}
