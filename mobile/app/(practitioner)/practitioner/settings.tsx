import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function SettingsScreen() {
  return <InformationScreen
    title="Pengaturan Praktisi"
    description="Ringkasan pengaturan akun. Status integrasi ditampilkan hanya jika tersedia dari server."
    items={[
      { title: "Notifikasi konsultasi", description: "Periksa izin notifikasi pada pengaturan perangkat untuk menerima pemberitahuan yang didukung aplikasi." },
      { title: "Integrasi layanan", description: "Status sinkronisasi SATUSEHAT dan penyimpanan rekam medis belum ditampilkan tanpa konfirmasi server." },
      { title: "Keamanan akun", description: "Jaga kerahasiaan kredensial dan keluarlah dari akun pada perangkat bersama." },
    ]}
  />;
}
