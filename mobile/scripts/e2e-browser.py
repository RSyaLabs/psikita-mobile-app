"""
Interim browser check for the patient-facing app.

What this does
--------------
Drives the running web dev server in a real browser, clicks through screens, and
records what the console says. It exists because the session's own browser tool is
only connected when the agent runs inside the desktop app, and a terminal session
cannot attach to it.

Credentials are read from `.env` and never printed. They are passed straight to
the login form and are not written to any output file.

Usage
-----
  python scripts/e2e-browser.py            # public screens only
  python scripts/e2e-browser.py --screens  # after a successful login
"""

import asyncio
import os
import re
import sys
from pathlib import Path

from camoufox import AsyncCamoufox
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
APP = os.environ.get("PSIKITA_APP_URL", "http://localhost:8081")

# Screens reachable without signing in.
PUBLIC = ["/login", "/register", "/forgot-password", "/"]

# Screens behind the auth wall, visited once a session exists.
GATED = [
    "/patient/dashboard",
    "/patient/triage",
    "/patient/doctors",
    "/patient/articles",
    "/patient/history",
    "/patient/notifications",
    "/patient/profile",
    "/patient/edit-profile",
    "/patient/checkout",
    "/patient/chat-room",
    "/patient/payment-regular",
    "/patient/prescription",
    "/practitioner/dashboard",
    "/practitioner/history",
    "/practitioner/chat",
    "/practitioner/war-room",
    "/practitioner/withdraw",
    "/practitioner/bank-account",
    "/practitioner/profile",
    "/practitioner/diagnosis",
    "/admin/dashboard",
    "/admin/verification",
    "/admin/ledger",
    "/admin/settings",
]


def env_value(key: str) -> str:
    text = (ROOT / ".env").read_text(encoding="utf-8", errors="ignore")
    m = re.search(rf"^{key}=(.*)$", text, re.MULTILINE)
    return m.group(1).strip() if m else ""


async def main() -> None:
    # Prefer process environment so a credential never has to be written to a
    # file. Fall back to .env, whose test credentials are placeholders.
    username = os.environ.get("PSIKITA_E2E_USERNAME") or env_value("PSIKITA_TEST_USERNAME")
    password = os.environ.get("PSIKITA_E2E_PASSWORD") or env_value("PSIKITA_TEST_PASSWORD")
    print(f"app      : {APP}")
    print(f"creds    : {'present' if username and password else 'MISSING in .env'}")
    if not username or not password:
        print("cannot sign in; stopping before any authenticated screen")
        return

    errors: list[str] = []

    async with AsyncCamoufox(headless=True) as browser:
        page = await browser.new_page()
        page.on(
            "console",
            lambda m: (
                errors.append(f"{m.type}: {m.text[:160]}")
                if m.type == "error"
                else None
            ),
        )
        page.on("pageerror", lambda e: errors.append(f"pageerror: {str(e)[:160]}"))

        await page.goto(f"{APP}/login", wait_until="domcontentloaded", timeout=90_000)
        await page.wait_for_timeout(3_000)

        # Open the account form, which is behind one button on the landing screen.
        for label in ("Masuk dengan Akun", "Masuk dengan Akun Psikita"):
            btn = page.get_by_role("button", name=label)
            if await btn.count():
                await btn.first.click()
                await page.wait_for_timeout(1_500)
                break

        # Address by input type, not by label text: the "Lupa kata sandi" button
        # carries the word "sandi" in its accessible name and a label-based
        # selector resolves to that button instead of the field.
        await page.locator("input[type='text'], input:not([type])").first.fill(username)
        await page.locator("input[type='password']").first.fill(password)
        await page.get_by_role(
            "button", name=re.compile("Masuk Sekarang", re.I)
        ).first.click()
        await page.wait_for_timeout(6_000)

        landed = page.url
        token_stored = await page.evaluate(
            "() => Object.keys(localStorage).length + Object.keys(sessionStorage).length"
        )
        print(f"after login url : {landed}")
        print(f"storage keys    : {token_stored}")
        print(f"login worked    : {'yes' if '/login' not in landed else 'NO'}")

        targets = GATED if "/login" not in landed else PUBLIC
        mode = "gated" if targets is GATED else "public"
        print(f"\nvisiting {len(targets)} {mode} screens\n")

        for path in targets:
            before = len(errors)
            try:
                await page.goto(
                    f"{APP}{path}", wait_until="domcontentloaded", timeout=60_000
                )
                await page.wait_for_timeout(2_500)
                buttons = await page.get_by_role("button").count()
                new = errors[before:]
                status = "ERRORS" if new else "ok"
                print(f"  {path:<38} buttons={buttons:<3} {status}")
                for e in new:
                    print(f"      {e}")
            except Exception as exc:  # noqa: BLE001 - reported, not swallowed
                print(f"  {path:<38} FAILED {str(exc)[:90]}")

        print(f"\ntotal console errors: {len(errors)}")


if __name__ == "__main__":
    asyncio.run(main())
