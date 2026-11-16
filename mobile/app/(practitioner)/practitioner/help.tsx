import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function HelpScreen() {
  return <InformationScreen
    title="Bantuan Praktisi"
    description="Informasi untuk alur konsultasi dan penggunaan ruang praktik."
    items={[
      { title: "Catatan klinis", description: "Gunakan format catatan yang disediakan aplikasi dan pastikan informasi berasal dari hasil pemeriksaan yang benar." },
      { title: "Penanganan krisis", description: "Ikuti protokol klinis dan eskalasi fasilitas tempat Anda berpraktik. Aplikasi tidak menggantikan layanan tanggap darurat." },
      { title: "Dukungan teknis", description: "Kanal dukungan praktisi yang tervalidasi belum tersedia pada aplikasi." },
    ]}
  />;
}
