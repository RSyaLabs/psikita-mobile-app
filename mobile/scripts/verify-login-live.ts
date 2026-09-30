// Proves the real login path end to end without jest, so the suite's
// "network access is disabled in unit tests" guard stays intact.
import { authService } from "@/api/auth.service";
import { getHomeRouteForResponse, parseServerSession } from "@/hooks/useAuth";

const accounts: Array<[string, string]> = [
  ["siti_rahayu", "patient"],
  ["dr_rina_amelia", "practitioner"],
  ["dr_andi_pratama", "practitioner"],
  ["ADMIN_LOCAL", "admin"],
];

async function main() {
  const password = process.env.PSIKITA_TEST_PASSWORD;
  let pass = 0;
  let fail = 0;

  console.log("=".repeat(64));
  console.log("LOGIN NYATA — kode aplikasi, server staging");
  console.log("=".repeat(64));

  for (const [username, expectedRole] of accounts) {
    try {
      const res = await authService.loginWithPassword({
        username,
        password: password as string,
      });
      const session = parseServerSession(res);
      const route = getHomeRouteForResponse(res);

      if (!session || !route) {
        console.log(
          `  ${username.padEnd(18)} GAGAL  session=${session ? "ada" : "null"} route=${route ?? "null"}`,
        );
        fail++;
        continue;
      }
      const ok = session.user.role === expectedRole;
      if (ok) pass++;
      else fail++;
      console.log(
        `  ${username.padEnd(18)} ${ok ? "OK   " : "SALAH"} role=${session.user.role.padEnd(12)} id=${session.user.id}`,
      );
      console.log(`  ${" ".repeat(18)}       email=${session.user.email}`);
      console.log(`  ${" ".repeat(18)}       route=${route}`);
    } catch (err) {
      fail++;
      console.log(`  ${username.padEnd(18)} ERROR  ${(err as Error).message}`);
    }
  }

  console.log("");
  console.log(`  ${pass} berhasil, ${fail} gagal`);
  console.log("");
  console.log(
    fail === 0
      ? "  LOGIN JALAN UNTUK SEMUA AKUN, TANPA BYPASS."
      : "  MASIH ADA YANG GAGAL.",
  );
  process.exit(fail === 0 ? 0 : 1);
}

void main();
