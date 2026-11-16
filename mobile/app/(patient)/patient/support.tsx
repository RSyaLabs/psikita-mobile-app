import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function SupportScreen() {
  return <InformationScreen
    title="Hubungi Dukungan"
    description="Bantuan untuk masalah aplikasi, pembayaran, atau konsultasi."
    items={[
      { title: "Bantuan aplikasi", description: "Siapkan informasi waktu kejadian dan nama layar saat melaporkan kendala. Jangan kirim kata sandi, token, atau data medis sensitif ke saluran yang belum terverifikasi." },
      { title: "Kontak resmi", description: "Kanal kontak dukungan belum diverifikasi dalam konfigurasi aplikasi. Gunakan kanal resmi yang diterbitkan oleh SeraPhany." },
      { title: "Situasi darurat", description: "Aplikasi dan halaman dukungan ini bukan layanan tanggap darurat. Untuk kondisi mendesak, hubungi layanan darurat atau fasilitas kesehatan setempat." },
    ]}
  />;
}
