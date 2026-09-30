import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");

function source(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("live contract fallback surfaces", () => {
  it("does not use legacy demo identifiers or hospital labels in live screens", () => {
    const prescription = source("app/(patient)/patient/prescription.tsx");
    const referral = source("app/(patient)/patient/referral.tsx");

    expect(prescription).not.toContain("RX-2026-0910");
    expect(prescription).toContain("Nomor resep belum tersedia");
    expect(referral).not.toContain("REF-2026-0451");
    expect(referral).not.toContain("Poli Jiwa • RS Sehat Mental Jakarta");
    expect(referral).not.toContain("Prioritas: Sedang");
    expect(referral).not.toContain('useReferral("cons_88213")');
    expect(referral).not.toContain("cons_88213");
    expect(referral).not.toContain("RS Dr. Soeharto Heerdjan");
    expect(referral).toContain("useLocalSearchParams");
    expect(referral).toContain("consultationId");
    expect(referral).toContain("Rujukan rumah sakit belum tersedia");

    const savedPrescriptionModal = source(
      "src/components/modals/PatientModals.tsx",
    );
    expect(savedPrescriptionModal).not.toContain("RX-2026-0910");

    const bpjsScreen = source("app/(patient)/patient/payment-bpjs.tsx");
    expect(bpjsScreen).not.toContain("Puskesmas Tebet");
    expect(bpjsScreen).not.toContain("0115R0010926P000412");
  });

  it("does not make the service script depend on undocumented response fields", () => {
    const script = source("scripts/test-services.ts");

    expect(script).not.toContain("prescriptionNumber");
    expect(script).not.toContain("referralNumber");
    expect(script).not.toContain("targetHospital");
  });
});
