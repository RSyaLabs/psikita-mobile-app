import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function ScheduleScreen() {
  return <InformationScreen
    title="Jadwal Praktik"
    items={[
      { title: "Jadwal aktif", description: "Belum tersedia." },
      { title: "Mengubah ketersediaan", description: "Ubah status tersedia dari Beranda." },
    ]}
  />;
}
