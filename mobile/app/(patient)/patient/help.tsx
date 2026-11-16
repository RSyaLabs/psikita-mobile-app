import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function HelpScreen() {
  return <InformationScreen
    title="Pusat Bantuan"
    description="Panduan singkat menggunakan layanan SeraPhany."
    items={[
      { title: "Memulai konsultasi", description: "Lengkapi profil, lakukan verifikasi identitas bila diminta, lalu pilih praktisi dan jadwal yang tersedia." },
      { title: "Pembayaran dan BPJS", description: "Periksa metode pembayaran dan syarat layanan pada halaman checkout. Ketersediaan BPJS bergantung pada verifikasi dan ketentuan layanan." },
      { title: "Melihat riwayat", description: "Buka menu Riwayat untuk melihat sesi yang tersedia pada akun Anda." },
      { title: "Masalah koneksi", description: "Periksa jaringan lalu coba buka kembali sesi. Jika status transaksi atau sesi tidak jelas, jangan mengulangi pembayaran sebelum memeriksa riwayat." },
    ]}
  />;
}
