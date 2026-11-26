import fs from "fs";
import path from "path";
import { communityService } from "../src/api/community.service";

describe("Tahap 10: Komunitas Feed & Diskusi Interaktif (Screens 57–63)", () => {
  const componentsDir = path.resolve(
    __dirname,
    "../src/components/patient/community",
  );
  const routesDir = path.resolve(__dirname, "../app/(patient)/patient");

  const componentFiles = [
    "CommunityFeedView.tsx",
    "CommunityDetailView.tsx",
    "CreatePostView.tsx",
    "EditPostView.tsx",
    "MyPostsView.tsx",
    "CrisisHelpView.tsx",
    "CommunityEmptyView.tsx",
  ];

  const routeFiles = ["community.tsx", "community-detail.tsx"];

  describe("1. Universal Rule of 14px & Typography Compliance", () => {
    it("should ensure zero sub-14px typography (no text-xs or size='xs') in all community components", () => {
      componentFiles.forEach((file) => {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        expect(content).not.toMatch(/text-xs/);
        expect(content).not.toMatch(/size=["']xs["']/);
      });
    });

    it("should ensure zero sub-14px typography in community route orchestrators", () => {
      routeFiles.forEach((file) => {
        const filePath = path.join(routesDir, file);
        const content = fs.readFileSync(filePath, "utf8");

        expect(content).not.toMatch(/text-xs/);
        expect(content).not.toMatch(/size=["']xs["']/);
      });
    });
  });

  describe("2. Screen 57 (FD1 · Feed: daftar) Content & Elements", () => {
    const feedContent = fs.readFileSync(
      path.join(componentsDir, "CommunityFeedView.tsx"),
      "utf8",
    );

    it("should display main heading and community subtitle", () => {
      expect(feedContent).toContain("Feed");
      expect(feedContent).toContain("Cerita dan edukasi komunitas.");
    });

    it("should contain + Posting CTA button", () => {
      expect(feedContent).toContain("Posting");
      expect(feedContent).toContain("onCreatePost");
    });

    it("should render filter pills for 'Semua' and 'Postinganmu'", () => {
      expect(feedContent).toContain("Semua");
      expect(feedContent).toContain("Postinganmu");
    });

    it("should render clinical disclaimer dashed notice box", () => {
      expect(feedContent).toContain(
        "Isi Feed adalah cerita dan edukasi dari pengguna, bukan nasihat klinis atau pengganti konsultasi.",
      );
    });

    it("should render post cards with author, timestamp, category badge, and 'Lihat balasan ›'", () => {
      expect(feedContent).toContain("PENGALAMAN");
      expect(feedContent).toContain("Lihat balasan ›");
    });
  });

  describe("3. Screen 58 (FD2 · Detail posting & balasan) Content & Elements", () => {
    const detailContent = fs.readFileSync(
      path.join(componentsDir, "CommunityDetailView.tsx"),
      "utf8",
    );

    it("should render back navigation and 'Posting' heading", () => {
      expect(detailContent).toContain("Posting");
      expect(detailContent).toContain("Kembali ke feed");
    });

    it("should render self-post actions notice and buttons for author", () => {
      expect(detailContent).toContain(
        "Tombol di kanan hanya tampil di postinganmu sendiri",
      );
      expect(detailContent).toContain("Ubah");
      expect(detailContent).toContain("Hapus");
    });

    it("should render replies section and empty state hint", () => {
      expect(detailContent).toContain("BALASAN");
      expect(detailContent).toContain("Belum ada balasan? Tulis yang pertama.");
    });

    it("should include professional referral card leading to clinical consultation", () => {
      expect(detailContent).toContain("Butuh bicara dengan profesional?");
      expect(detailContent).toContain(
        "Diskusi di sini tidak menggantikan konsultasi. Kamu bisa mulai dengan psikolog kapan saja.",
      );
      expect(detailContent).toContain("Bicara dengan psikolog ›");
    });

    it("should enforce 280-character limit and character counter for reply input", () => {
      expect(detailContent).toContain("maxLength={280}");
      expect(detailContent).toContain("/ 280");
    });
  });

  describe("4. Screen 59 (FD3 · Buat posting) Content & Elements", () => {
    const createContent = fs.readFileSync(
      path.join(componentsDir, "CreatePostView.tsx"),
      "utf8",
    );

    it("should render 'Buat posting' title and cancel navigation", () => {
      expect(createContent).toContain("Buat posting");
      expect(createContent).toContain("Batal");
    });

    it("should provide radio selector for Pengalaman and Edukasi", () => {
      expect(createContent).toContain("Jenis posting");
      expect(createContent).toContain("Pengalaman");
      expect(createContent).toContain("Ceritakan yang kamu alami");
      expect(createContent).toContain("Edukasi");
      expect(createContent).toContain("Bagikan informasi yang bermanfaat");
    });

    it("should enforce privacy disclaimer against sharing medical or personal data", () => {
      expect(createContent).toContain(
        "Jangan membagikan data pribadi (nomor telepon, alamat, nama psikolog) atau data medis.",
      );
    });

    it("should provide emergency notice linking to crisis support", () => {
      expect(createContent).toContain(
        "Sedang dalam kondisi darurat? Posting tidak dibaca langsung.",
      );
      expect(createContent).toContain("Lihat bantuan segera");
    });

    it("should include fallback error banner when submission fails", () => {
      expect(createContent).toContain(
        "Posting belum terkirim. Isinya aman, coba lagi.",
      );
    });

    it("should have primary 'Kirim Posting' and secondary 'Batal' CTAs", () => {
      expect(createContent).toContain("Kirim Posting");
      expect(createContent).toContain("Batal");
    });
  });

  describe("5. Screen 60 (FD4 · Ubah posting) Content & Elements", () => {
    const editContent = fs.readFileSync(
      path.join(componentsDir, "EditPostView.tsx"),
      "utf8",
    );

    it("should render 'Ubah posting' title and cancel navigation", () => {
      expect(editContent).toContain("Ubah posting");
    });

    it("should inform user that post type cannot be modified", () => {
      expect(editContent).toContain("Jenis posting:");
      expect(editContent).toContain("tidak bisa diubah.");
    });

    it("should render editable textarea with 280 char limit", () => {
      expect(editContent).toContain("maxLength={280}");
      expect(editContent).toContain("/ 280");
    });

    it("should display author ownership and modification policy", () => {
      expect(editContent).toContain(
        "Hanya isi yang bisa diubah. Hanya penulis yang bisa mengubah atau menghapus postingnya.",
      );
    });

    it("should contain 'Simpan Perubahan' and 'Batal' CTAs", () => {
      expect(editContent).toContain("Simpan Perubahan");
      expect(editContent).toContain("Batal");
    });
  });

  describe("6. Screen 61 (FD5 · Postinganmu) Content & Elements", () => {
    const myPostsContent = fs.readFileSync(
      path.join(componentsDir, "MyPostsView.tsx"),
      "utf8",
    );

    it("should render 'Postinganmu' heading", () => {
      expect(myPostsContent).toContain("Postinganmu");
    });

    it("should render post cards with Lihat, Ubah, and Hapus actions", () => {
      expect(myPostsContent).toContain("Lihat");
      expect(myPostsContent).toContain("Ubah");
      expect(myPostsContent).toContain("Hapus");
    });

    it("should provide inline deletion confirmation modal/card with irreversible notice", () => {
      expect(myPostsContent).toContain("Hapus posting ini?");
      expect(myPostsContent).toContain("Tidak bisa dibatalkan.");
    });

    it("should display empty state when user has no posts", () => {
      expect(myPostsContent).toContain("Kamu belum punya posting");
    });

    it("should contain bottom '+ Buat Posting' CTA button", () => {
      expect(myPostsContent).toContain("+ Buat Posting");
    });
  });

  describe("7. Screen 62 (FD6 · Bantuan segera / krisis) Content & Elements", () => {
    const crisisContent = fs.readFileSync(
      path.join(componentsDir, "CrisisHelpView.tsx"),
      "utf8",
    );

    it("should render 'Bantuan segera' title and empathy statement", () => {
      expect(crisisContent).toContain("Bantuan segera");
      expect(crisisContent).toContain("Kamu tidak sendirian");
      expect(crisisContent).toContain(
        "Jika kamu atau seseorang sedang dalam bahaya, hubungi bantuan darurat sekarang.",
      );
    });

    it("should render verified crisis hotlines with phone trigger actions", () => {
      expect(crisisContent).toContain("HUBUNGI SEKARANG");
      expect(crisisContent).toContain("Layanan Sejiwa (Kemenkes RI)");
      expect(crisisContent).toContain("119");
      expect(crisisContent).toContain("Kedaruratan Nasional");
      expect(crisisContent).toContain("112");
      expect(crisisContent).toContain("Into The Light Indonesia");
      expect(crisisContent).toContain("Telepon ›");
    });

    it("should state verification disclaimer from official team", () => {
      expect(crisisContent).toContain(
        "Nomor layanan krisis harus diverifikasi dan diisi tim, bukan dikarang di sini.",
      );
    });

    it("should have 'Bicara dengan psikolog' and 'Kembali ke Feed' CTAs", () => {
      expect(crisisContent).toContain("Bicara dengan psikolog");
      expect(crisisContent).toContain("Kembali ke Feed");
    });
  });

  describe("8. Screen 63 (FD7 · Feed tidak tersedia / kosong) Content & Elements", () => {
    const emptyContent = fs.readFileSync(
      path.join(componentsDir, "CommunityEmptyView.tsx"),
      "utf8",
    );

    it("should render Feed heading and empty state copy", () => {
      expect(emptyContent).toContain("Feed");
      expect(emptyContent).toContain("Belum ada posting");
      expect(emptyContent).toContain("Jadilah yang pertama membuka percakapan.");
    });

    it("should offer 'Buat Posting Pertama' button", () => {
      expect(emptyContent).toContain("Buat Posting Pertama");
    });

    it("should display error and offline fallback disclaimer with retry action", () => {
      expect(emptyContent).toContain(
        "Feed sedang tidak tersedia. Coba lagi nanti. Fitur lain tetap bisa dipakai.",
      );
      expect(emptyContent).toContain("Coba Lagi");
    });
  });

  describe("9. API Service Contract & Hook Methods", () => {
    it("should define communityService methods matching backend specifications", () => {
      expect(typeof communityService.getPosts).toBe("function");
      expect(typeof communityService.getPostById).toBe("function");
      expect(typeof communityService.getReplies).toBe("function");
      expect(typeof communityService.createPost).toBe("function");
      expect(typeof communityService.updatePost).toBe("function");
      expect(typeof communityService.deletePost).toBe("function");
      expect(typeof communityService.createReply).toBe("function");
    });
  });
});
