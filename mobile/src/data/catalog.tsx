import React from "react";
import { KeyRound, User, Stethoscope, ShieldCheck } from "lucide-react-native";
import { ROUTES } from "@/constants";

/**
 * Every literal path ROUTES can produce, flattened across its nested groups.
 * Typing the catalog route as this union instead of `string` lets expo-router
 * verify each entry against the real route table, which is what removes the
 * `as any` cast at the push site.
 *
 * ROUTES mixes plain strings (INDEX) with nested groups, so the flattening has
 * to distribute over the union rather than index it directly.
 */
type RoutePath<T = (typeof ROUTES)[keyof typeof ROUTES]> = T extends string
  ? T
  : T[keyof T];

export interface CatalogScreen {
  id: string;
  name: string;
  desc: string;
  route: RoutePath;
  tag?: string;
}

export interface CatalogSubGroup {
  subTitle: string;
  screens: CatalogScreen[];
}

export interface CatalogRoleGroup {
  roleId: "all" | "auth" | "patient" | "practitioner" | "admin";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  themeColor: string;
  badgeBg: string;
  badgeText: string;
  subGroups: CatalogSubGroup[];
}

/**
 * Catalog links resolve through the public URL values in ROUTES; role group
 * directories remain an Expo Router implementation detail.
 */
export const CATALOG_DATA: CatalogRoleGroup[] = [
  {
    roleId: "auth",
    title: "1. Autentikasi & Akun",
    subtitle: "Akses masuk, pendaftaran, dan pemulihan akun seluruh role",
    icon: <KeyRound size={20} className="text-primary" />,
    themeColor: "primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    subGroups: [
      {
        subTitle: "Gerbang Masuk & Registrasi",
        screens: [
          {
            id: "P-00",
            name: "Masuk & Lupa Sandi (Pop-up Terpadu)",
            desc: "Hero edukasi mental, Google SSO, serta modal pop-up login & reset sandi OTP",
            route: ROUTES.AUTH.LOGIN,
            tag: "Pop-up Terpadu",
          },
          {
            id: "P-00b",
            name: "Registrasi Pasien Baru",
            desc: "Pendaftaran akun baru dengan validasi syarat & privasi data medis Satu Sehat",
            route: ROUTES.AUTH.REGISTER,
            tag: "Pasien Baru",
          },
          {
            id: "P-00c",
            name: "Lupa Sandi (Reset OTP)",
            desc: "Pemulihan kata sandi akun dengan kode verifikasi OTP WhatsApp/SMS",
            route: ROUTES.AUTH.FORGOT_PASSWORD,
            tag: "Reset Akun",
          },
        ],
      },
    ],
  },
  {
    roleId: "patient",
    title: "2. Alur Pasien (End-to-End)",
    subtitle:
      "Perjalanan pasien dari skrining, konsultasi, hingga perawatan lanjutan",
    icon: <User size={20} className="text-secondary" />,
    themeColor: "secondary",
    badgeBg: "bg-secondary/15",
    badgeText: "text-secondary",
    subGroups: [
      {
        subTitle: "Beranda & Skrining Triase",
        screens: [
          {
            id: "P-01",
            name: "Beranda Pasien (Dashboard)",
            desc: "Status online dokter, check-in perasaan harian & akses triase cepat",
            route: ROUTES.PATIENT.DASHBOARD,
            tag: "Utama",
          },
          {
            id: "P-01d",
            name: "Pusat Notifikasi",
            desc: "Pemberitahuan jadwal sesi, obat, dan status rujukan",
            route: ROUTES.PATIENT.NOTIFICATIONS,
            tag: "Notifikasi",
          },
          {
            id: "P-02",
            name: "Triase & Skrining GAD-7",
            desc: "Asesmen bertahap evaluasi tingkat kecemasan & deteksi red flags",
            route: ROUTES.PATIENT.TRIAGE,
            tag: "Klinis",
          },
          {
            id: "P-02b",
            name: "Hasil Evaluasi Skrining",
            desc: "Skor tingkat keparahan, rekomendasi penanganan & dokter yang tepat",
            route: ROUTES.PATIENT.ASSESSMENT_RESULT,
            tag: "Skor GAD-7",
          },
        ],
      },
      {
        subTitle: "Pencarian Dokter & Transaksi",
        screens: [
          {
            id: "P-01b",
            name: "Katalog Dokter & Psikolog",
            desc: "Filter spesialisasi, pencarian almamater, tarif & rating praktisi",
            route: ROUTES.PATIENT.DOCTORS,
            tag: "Pencarian",
          },
          {
            id: "P-01c",
            name: "Profil & Jadwal Praktisi",
            desc: "Informasi STR, SIP, kuota konsultasi & slot jam praktik",
            route: ROUTES.PATIENT.DOCTOR_DETAIL,
            tag: "Jadwal",
          },
          {
            id: "P-03",
            name: "Radar Pencarian (Matching)",
            desc: "Pencocokan otomatis ke dokter siaga secara real-time",
            route: ROUTES.PATIENT.MATCHING,
            tag: "Real-time",
          },
          {
            id: "P-04",
            name: "Checkout & Rincian Pesanan",
            desc: "Ringkasan biaya konsultasi, admin, dan pemilihan jalur pembayaran",
            route: ROUTES.PATIENT.CHECKOUT,
            tag: "Billing",
          },
          {
            id: "P-05A",
            name: "Pembayaran QRIS / VA (Reguler)",
            desc: "Pembayaran instan QRIS dinamis, virtual account & countdown batas bayar",
            route: ROUTES.PATIENT.PAYMENT_REGULAR,
            tag: "QRIS",
          },
          {
            id: "P-05B",
            name: "Validasi BPJS Kesehatan (Gratis Rp0)",
            desc: "Bridging eligibilitas faskes 1 & rujukan Satu Sehat tanpa biaya tambahan",
            route: ROUTES.PATIENT.PAYMENT_BPJS,
            tag: "BPJS Rp0",
          },
        ],
      },
      {
        subTitle: "Ruang Konsultasi Aktif",
        screens: [
          {
            id: "P-06",
            name: "Ruang Chat Konsultasi",
            desc: "Pesan terenkripsi, timer sesi konsultasi & attachment berkas medis",
            route: ROUTES.PATIENT.CHAT_ROOM,
            tag: "Chat Medis",
          },
          {
            id: "P-06b",
            name: "Ruang Video Call",
            desc: "Konsultasi tatap muka WebRTC dengan audio/video jernih",
            route: ROUTES.PATIENT.VIDEO_CALL,
            tag: "WebRTC",
          },
          {
            id: "P-07",
            name: "Modal Perpanjang Sesi (Overtime)",
            desc: "Pilihan penambahan waktu sesi (+15 / +30 menit) saat darurat",
            route: ROUTES.PATIENT.OVERTIME_MODAL,
            tag: "Overtime",
          },
        ],
      },
      {
        subTitle: "Pasca Konsultasi & Dokumen Medis",
        screens: [
          {
            id: "P-08",
            name: "Rating & Ulasan Sesi",
            desc: "Evaluasi kualitas praktisi & umpan balik pelayanan",
            route: ROUTES.PATIENT.RATING,
            tag: "Ulasan",
          },
          {
            id: "P-09",
            name: "Riwayat Konsultasi",
            desc: "Daftar seluruh sesi konseling yang telah selesai maupun berjalan",
            route: ROUTES.PATIENT.HISTORY,
            tag: "Arsip",
          },
          {
            id: "P-09b",
            name: "Ringkasan Medis (SOAP Pasien)",
            desc: "Catatan rekam medis Subjective, Objective, Assessment, Plan",
            route: ROUTES.PATIENT.SESSION_SUMMARY,
            tag: "SOAP RME",
          },
          {
            id: "P-12",
            name: "Resep Digital Obat",
            desc: "Resep resmi dokter spesialis jiwa dengan QR tebus di apotek",
            route: ROUTES.PATIENT.PRESCRIPTION,
            tag: "Resep Medis",
          },
          {
            id: "P-13",
            name: "Surat Rujukan RS (SATUSEHAT)",
            desc: "Surat rujukan resmi terintegrasi barcode Kemenkes RI",
            route: ROUTES.PATIENT.REFERRAL,
            tag: "SATUSEHAT",
          },
        ],
      },
      {
        subTitle: "Edukasi & Profil Pasien",
        screens: [
          {
            id: "P-10",
            name: "Artikel & Edukasi Mental",
            desc: "Kumpulan artikel psikoedukasi, tips tidur & manajemen kecemasan",
            route: ROUTES.PATIENT.ARTICLES,
            tag: "Edukasi",
          },
          {
            id: "P-10b",
            name: "Detail Artikel Edukasi",
            desc: "Tampilan baca lengkap dengan estimasi durasi baca & referensi klinis",
            route: ROUTES.PATIENT.ARTICLE_DETAIL,
            tag: "Bacaan",
          },
          {
            id: "P-11",
            name: "Profil & Rekam Medis Pasien",
            desc: "Informasi pasien, riwayat alergi, kartu BPJS & kontak darurat",
            route: ROUTES.PATIENT.PROFILE,
            tag: "Profil",
          },
          {
            id: "P-11b",
            name: "Ubah Profil & Integrasi NIK",
            desc: "Pembaruan identitas resmi, sinkronisasi NIK Dukcapil & BPJS",
            route: ROUTES.PATIENT.EDIT_PROFILE,
            tag: "Sinkronisasi",
          },
        ],
      },
    ],
  },
  {
    roleId: "practitioner",
    title: "3. Alur Praktisi Klinis",
    subtitle:
      "Ruang kerja profesional bagi Psikolog Klinis dan Dokter Psikiater (Sp.KJ)",
    icon: <Stethoscope size={20} className="text-primary" />,
    themeColor: "primary",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    subGroups: [
      {
        subTitle: "Praktik & Pelayanan Pasien",
        screens: [
          {
            id: "K-00",
            name: "Registrasi STR & SIP Praktisi",
            desc: "Pendaftaran kredensial medis 2-step terproteksi zero-trust sandbox",
            route: ROUTES.PRACTITIONER.REGISTER,
            tag: "Kemenkes RI",
          },
          {
            id: "K-01",
            name: "Dashboard Praktisi (Online/Offline)",
            desc: "Toggle status siaga, statistik sesi harian & antrian pasien terjadwal",
            route: ROUTES.PRACTITIONER.DASHBOARD,
            tag: "Workspace",
          },
          {
            id: "K-02",
            name: "War Room (Klaim Pasien Masuk)",
            desc: "Terima atau alihkan permintaan konsultasi darurat & reguler",
            route: ROUTES.PRACTITIONER.WAR_ROOM,
            tag: "Siaga Darurat",
          },
          {
            id: "K-03",
            name: "Chat & Quick SOAP",
            desc: "Ruang komunikasi pasien dengan sidebar pencatatan diagnosa cepat",
            route: ROUTES.PRACTITIONER.CHAT,
            tag: "Quick SOAP",
          },
          {
            id: "K-04",
            name: "Finalisasi RME ICD-10 (SATUSEHAT)",
            desc: "Pengisian lengkap SOAP & sinkronisasi rekam medis ke Kemenkes",
            route: ROUTES.PRACTITIONER.DIAGNOSIS,
            tag: "ICD-10 RME",
          },
        ],
      },
      {
        subTitle: "Finansial, Riwayat & Akun",
        screens: [
          {
            id: "K-05",
            name: "Dompet & Penarikan Saldo (Withdraw)",
            desc: "Total pendapatan bersih sesi, pemotongan PPh 21 & permohonan penarikan dana",
            route: ROUTES.PRACTITIONER.WITHDRAW,
            tag: "Payout",
          },
          {
            id: "K-05b",
            name: "Rekening Bank Mitra",
            desc: "Manajemen rekening penerima transfer bagi dokter dan psikolog",
            route: ROUTES.PRACTITIONER.BANK_ACCOUNT,
            tag: "Rekening",
          },
          {
            id: "K-06",
            name: "Riwayat Sesi Praktisi",
            desc: "Arsip konsultasi selesai, status finalisasi RME & pencarian pasien",
            route: ROUTES.PRACTITIONER.HISTORY,
            tag: "Arsip Kasus",
          },
          {
            id: "K-07",
            name: "Profil, Tarif & Jam Praktik",
            desc: "Pengaturan kuota pasien harian, jadwal operasional & tarif konsultasi",
            route: ROUTES.PRACTITIONER.PROFILE,
            tag: "Pengaturan",
          },
        ],
      },
    ],
  },
  {
    roleId: "admin",
    title: "4. Alur Admin & Pengawasan",
    subtitle:
      "Pusat kendali kepatuhan regulasi medis, verifikasi STR & pembukuan platform",
    icon: <ShieldCheck size={20} className="text-foreground" />,
    themeColor: "foreground",
    badgeBg: "bg-muted",
    badgeText: "text-foreground",
    subGroups: [
      {
        subTitle: "Audit, Finansial & Konfigurasi",
        screens: [
          {
            id: "A-01",
            name: "Admin Dashboard Platform",
            desc: "Ringkasan metrik konsultasi, praktisi aktif & kepuasan layanan",
            route: ROUTES.ADMIN.DASHBOARD,
            tag: "Eksekutif",
          },
          {
            id: "A-02",
            name: "Verifikasi STR/SIP Praktisi",
            desc: "Validasi 4-titik nomor STR KKI/KTKI, NIK Satu Sehat & persetujuan akun",
            route: ROUTES.ADMIN.VERIFICATION,
            tag: "Audit Medis",
          },
          {
            id: "A-03",
            name: "Ledger Transaksi & Klaim BPJS",
            desc: "Pembukuan berpasangan (Double-Entry), rekonsiliasi QRIS & tagihan BPJS",
            route: ROUTES.ADMIN.LEDGER,
            tag: "Akuntansi",
          },
          {
            id: "A-04",
            name: "Pengaturan Platform & SATUSEHAT API",
            desc: "Konfigurasi bridging Kemenkes, parameter triase & manajemen staf",
            route: ROUTES.ADMIN.SETTINGS,
            tag: "Kemenkes API",
          },
        ],
      },
    ],
  },
];
