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

function unavailableError(): ApiError {
  return new ApiError(
    "Notifikasi belum tersedia",
    501,
    "CAPABILITY_UNAVAILABLE",
  );
}

export const notificationService = {
  async getNotifications(
    _category?: string,
    _signal?: AbortSignal,
  ): Promise<NotificationDto[]> {
    if (getCapability("notifications") === "live") {
      return [];
    }
    throw unavailableError();
  },

  async markAsRead(_id: string): Promise<{ success: boolean }> {
    if (getCapability("notifications") === "live") {
      return { success: true };
    }
    throw unavailableError();
  },

  async markAllAsRead(): Promise<{ success: boolean }> {
    if (getCapability("notifications") === "live") {
      return { success: true };
    }
    throw unavailableError();
  },
};
