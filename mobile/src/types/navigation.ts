export type PatientTab = "beranda" | "sesi" | "jurnal" | "akun";

export type PractitionerTab = "beranda" | "sesi" | "keuangan" | "profil";

export interface NavTabItem<T extends string> {
  id: T;
  label: string;
  route: string;
  iconName: string;
}
