import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function SettingsScreen() {
  return <InformationScreen
    title="Pengaturan Praktisi"
    description="Ringkasan pengaturan akun. Status integrasi ditampilkan hanya jika tersedia dari server."
    items={[
      { title: "Notifikasi konsultasi", description: "Atur izin melalui pengaturan perangkat." },
      { title: "Integrasi layanan", description: "Status sinkronisasi belum tersedia." },
      { title: "Keamanan akun", description: "Lindungi kredensial akun." },
    ]}
  />;
}
