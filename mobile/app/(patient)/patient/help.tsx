import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function HelpScreen() {
  return <InformationScreen
    title="Pusat Bantuan"
    items={[
      { title: "Memulai konsultasi", description: "Pilih praktisi dan jadwal yang tersedia." },
      { title: "Pembayaran dan BPJS", description: "Periksa opsi dan ketentuan di checkout." },
      { title: "Melihat riwayat", description: "Lihat sesi pada menu Riwayat." },
      { title: "Masalah koneksi", description: "Periksa Riwayat sebelum mengulang pembayaran." },
    ]}
  />;
}
