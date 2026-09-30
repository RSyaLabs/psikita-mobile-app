import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/**
 * Universal Haptic Feedback Utility
 * Native (iOS/Android): Provides tactile vibration cues
 * Web: Safe no-op natively to prevent unhandled rejection crashes
 */
const isWeb = Platform.OS === "web";

function safeHaptic(action: () => Promise<void>) {
  if (isWeb) return;
  try {
    action().catch(() => {});
  } catch {
    // safe fallback if native module is unavailable
  }
}

export const haptics = {
  light: () => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  selection: () => {
    safeHaptic(() => Haptics.selectionAsync());
  },
  medium: () => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  heavy: () => {
    safeHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
  },
  success: () => {
    safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    );
  },
  error: () => {
    safeHaptic(() =>
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );
  },
};
