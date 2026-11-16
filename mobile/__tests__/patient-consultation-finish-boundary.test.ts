import fs from "fs";
import path from "path";

describe("patient consultation closure boundary", () => {
  it("does not expose a client action to finish a clinical session", () => {
    const screen = fs.readFileSync(
      path.resolve(__dirname, "../app/(patient)/patient/chat-room.tsx"),
      "utf8",
    );
    expect(screen).not.toContain("useFinishConsultation");
    expect(screen).not.toContain("Akhiri sesi");
    expect(screen).toContain("Sesi hanya dapat diakhiri oleh praktisi yang ditugaskan");
  });
});
