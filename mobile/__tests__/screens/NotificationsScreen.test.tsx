import React from "react";
import { fireEvent, screen } from "@testing-library/react-native";
import { renderWithClient } from "../utils/test-utils";
import NotificationsScreen from "../../app/(patient)/patient/notifications";
import { mockRouter } from "../../jest.setup";
import { ROUTES } from "@/constants";
import { MOCK_NOTIFICATIONS } from "@/api/notification.service";
import { haptics } from "@/utils/haptics";

const mockUseNotifications = jest.fn();
const mockUseMarkReadHook = jest.fn();
const mockMarkRead = jest.fn();
const mockMarkAll = jest.fn();
const mockGetCapability = jest.fn();

jest.mock("@/config/capabilities", () => ({
  getCapability: () => mockGetCapability(),
}));

jest.mock("@/hooks/useApiQueries", () => ({
  useNotifications: (...args: unknown[]) => mockUseNotifications(...args),
  useMarkNotificationRead: (...args: unknown[]) => mockUseMarkReadHook(...args),
  useMarkAllNotificationsRead: () => ({ mutate: mockMarkAll }),
}));

jest.mock("@/utils/haptics", () => ({
  haptics: {
    light: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockHaptics = jest.mocked(haptics);

describe("NotificationsScreen route actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCapability.mockReturnValue("demo");
    mockUseNotifications.mockReturnValue({ data: MOCK_NOTIFICATIONS });
    mockUseMarkReadHook.mockReturnValue({ mutate: mockMarkRead });
  });

  it("navigates a valid notification action to its public patient route", () => {
    const notification = MOCK_NOTIFICATIONS[0];
    mockUseNotifications.mockReturnValue({ data: [notification] });

    renderWithClient(<NotificationsScreen />);
    fireEvent.press(screen.getByText(notification.title));

    expect(mockUseMarkReadHook).toHaveBeenCalledWith("Semua");
    expect(mockMarkRead).toHaveBeenCalledWith(notification.id);
    expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.PATIENT.CHAT_ROOM);
  });

  it("does not navigate an invalid route-valued notification action", () => {
    const notification = {
      ...MOCK_NOTIFICATIONS[0],
      actionRoute: "/(patient)/chat-room",
    };
    mockUseNotifications.mockReturnValue({ data: [notification] });

    renderWithClient(<NotificationsScreen />);
    fireEvent.press(screen.getByText(notification.title));

    expect(mockMarkRead).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("plays success feedback only after mark-all succeeds", () => {
    const order: string[] = [];
    mockHaptics.success.mockImplementation(() => order.push("success"));
    mockMarkAll.mockImplementation(
      (_variables: void, options?: { onSuccess?: () => void }) => {
        order.push("mutate");
        options?.onSuccess?.();
      },
    );
    renderWithClient(<NotificationsScreen />);

    fireEvent.press(screen.getByLabelText("Tandai semua dibaca"));

    expect(order).toEqual(["mutate", "success"]);
  });
});
