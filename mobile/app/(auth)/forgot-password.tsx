import React from "react";
import { Redirect } from "expo-router";
import { ROUTES } from "@/constants/routes";

/**
 * Lupa Kata Sandi dialihkan langsung ke pop-up modal di Login screen.
 * Tidak lagi menggunakan halaman tersendiri.
 */
export default function ForgotPasswordRedirect() {
  return (
    <Redirect
      href={{ pathname: ROUTES.AUTH.LOGIN, params: { mode: "forgot" } } as any}
    />
  );
}
