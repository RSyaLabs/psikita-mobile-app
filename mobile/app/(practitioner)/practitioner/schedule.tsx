import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function ScheduleScreen() {
  return <InformationScreen
    title="Jadwal Praktik"
    description="Pengaturan jadwal harus berasal dari data dan kemampuan backend."
    items={[
      { title: "Jadwal aktif", description: "Jadwal tersimpan belum tersedia pada layar ini. Jangan menganggap jam contoh sebagai jadwal yang telah diterapkan." },
      { title: "Mengubah ketersediaan", description: "Status tersedia atau tidak tersedia dapat diubah dari beranda praktisi. Pengaturan slot dan kuota belum tersedia pada aplikasi." },
    ]}
  />;
}
