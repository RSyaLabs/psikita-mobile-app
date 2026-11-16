import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function ScheduleScreen() {
  return <InformationScreen
    title="Jadwal Praktik"
    description="Pengaturan jadwal harus berasal dari data dan kemampuan backend."
    items={[
      { title: "Jadwal aktif", description: "Belum tersedia." },
      { title: "Mengubah ketersediaan", description: "Ubah status tersedia dari Beranda." },
    ]}
  />;
}
