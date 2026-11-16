import { secureStorage } from "@/utils/storage";

// Non-sensitive, installation-scoped marker. Authentication/KYC are unaffected.
const TUTORIAL_SEEN_KEY = "seraphany_tutorial_v1_seen";
let completedInSession = false;

export async function shouldShowFirstLaunchTutorial(): Promise<boolean> {
  if (completedInSession) return false;
  try {
    return (await secureStorage.getItem(TUTORIAL_SEEN_KEY)) !== "1";
  } catch {
    // If storage is temporarily unavailable, still let the user skip.
    return true;
  }
}

export async function completeFirstLaunchTutorial(): Promise<void> {
  // Avoid loops when SecureStore is temporarily unavailable.
  completedInSession = true;
  try {
    await secureStorage.setItem(TUTORIAL_SEEN_KEY, "1");
  } catch {
    // A fresh launch can offer the tour again if persistence failed.
  }
}
