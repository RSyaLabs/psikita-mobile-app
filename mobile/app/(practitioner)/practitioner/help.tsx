import React from "react";
import { InformationScreen } from "@/components/common/InformationScreen";
export default function HelpScreen() {
  return <InformationScreen
    title="Bantuan Praktisi"
    items={[
      { title: "Catatan klinis", description: "Gunakan format klinis yang tersedia." },
      { title: "Penanganan krisis", description: "Ikuti protokol klinis dan eskalasi setempat." },
      { title: "Dukungan teknis", description: "Kanal resmi belum tersedia." },
    ]}
  />;
}
