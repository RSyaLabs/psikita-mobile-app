import { ApiError } from "./response";
import { getCapability } from "@/config/capabilities";
import { ROUTES } from "../constants/routes";

export interface NotificationDto {
  id: string;
  category: "Konsultasi" | "Resep & Medis" | "Pengingat";
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
  actionText: string;
  actionRoute: string;
  iconType: "video" | "pill" | "assessment" | "reminder" | "satusehat";
}

export const NOTIFICATION_ACTION_ROUTES = [
  ROUTES.PATIENT.CHAT_ROOM,
  ROUTES.PATIENT.PRESCRIPTION,
  ROUTES.PATIENT.ASSESSMENT_RESULT,
  ROUTES.PATIENT.DASHBOARD,
  ROUTES.PATIENT.SESSION_SUMMARY,
] as const;

export type NotificationActionRoute =
  (typeof NOTIFICATION_ACTION_ROUTES)[number];
const notificationActionRouteSet: ReadonlySet<string> = new Set(
  NOTIFICATION_ACTION_ROUTES,
);

export function isNotificationActionRoute(
  actionRoute: string,
): actionRoute is NotificationActionRoute {
  return notificationActionRouteSet.has(actionRoute);
}

export const MOCK_NOTIFICATIONS: NotificationDto[] = [
  {
    id: "notif-1",
    category: "Konsultasi",
    title: "Sesi Dimulai dalam 15 Menit",
    description:
      "dr. Andi Pratama, Sp.KJ telah membuka ruang konsultasi. Silakan masuk ke ruang tunggu.",
    timestamp: "15 mnt yang lalu",
    isUnread: true,
    actionText: "Masuk Sesi",
    actionRoute: ROUTES.PATIENT.CHAT_ROOM,
    iconType: "video",
  },
  {
    id: "notif-2",
    category: "Resep & Medis",
    title: "Resep Digital Telah Diterbitkan",
    description:
      "Resep obat Sertraline 25mg telah disahkan secara digital dengan QR-Code Kemenkes.",
    timestamp: "2 jam yang lalu",
    isUnread: true,
    actionText: "Lihat Resep",
    actionRoute: ROUTES.PATIENT.PRESCRIPTION,
    iconType: "pill",
  },
  {
    id: "notif-3",
    category: "Resep & Medis",
    title: "Hasil Skrining GAD-7 Selesai",
    description:
      "Skor kecemasan Anda adalah 12/21 (Sedang). Baca anjuran klinis dan langkah pemulihan.",
    timestamp: "Kemarin, 14:20",
    isUnread: false,
    actionText: "Lihat Evaluasi",
    actionRoute: ROUTES.PATIENT.ASSESSMENT_RESULT,
    iconType: "assessment",
  },
  {
    id: "notif-4",
    category: "Pengingat",
    title: "Waktunya Check-in Perasaan",
    description:
      "Bagaimana kabarmu sore ini? Luangkan 30 detik untuk mencatat emosimu hari ini.",
    timestamp: "2 hari yang lalu",
    isUnread: false,
    actionText: "Check-in",
    actionRoute: ROUTES.PATIENT.DASHBOARD,
    iconType: "reminder",
  },
  {
    id: "notif-5",
    category: "Resep & Medis",
    title: "Tersinkronisasi Satu Sehat",
    description:
      "Resume medis sesi lampau (ICD-10 F41.1) telah terdata aman di sistem Kemenkes RI.",
    timestamp: "4 hari yang lalu",
    isUnread: false,
    actionText: "Lihat SOAP",
    actionRoute: ROUTES.PATIENT.SESSION_SUMMARY,
    iconType: "satusehat",
  },
];

function unavailableError(): ApiError {
  return new ApiError(
    "Notifikasi belum tersedia",
    501,
    "CAPABILITY_UNAVAILABLE",
  );
}

export const notificationService = {
  async getNotifications(
    category?: string,
    _signal?: AbortSignal,
  ): Promise<NotificationDto[]> {
    const capability = getCapability("notifications");
    if (capability === "demo") {
      if (!category || category === "Semua") {
        return [...MOCK_NOTIFICATIONS];
      }
      return MOCK_NOTIFICATIONS.filter(
        (notification) => notification.category === category,
      );
    }
    throw unavailableError();
  },

  async markAsRead(_id: string): Promise<{ success: boolean }> {
    if (getCapability("notifications") === "demo") {
      return { success: true };
    }
    throw unavailableError();
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    if (getCapability("notifications") === "demo") {
      return { success: true };
    }
    throw unavailableError();
  },
};
