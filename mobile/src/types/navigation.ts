export type PatientTab = "beranda" | "sesi" | "edukasi" | "akun";

export type PractitionerTab = "beranda" | "sesi" | "profil";

export interface NavTabItem<T extends string> {
  id: T;
  label: string;
  route: string;
  iconName: string;
}
