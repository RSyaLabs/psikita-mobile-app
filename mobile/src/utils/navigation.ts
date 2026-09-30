import { Router } from "expo-router";
import { haptics } from "./haptics";

/**
 * Universal safe back navigation helper for Expo Router.
 * Mencegah pengguna terjebak pada layar jika diakses secara langsung / deep link
 * atau dari halaman katalog (/), dengan otomatis beralih ke fallbackRoute jika tidak ada history stack.
 */
export function safeNavigateBack(router: Router, fallbackRoute: string = "/") {
  haptics.light();
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackRoute as any);
  }
}
