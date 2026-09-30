import { ApiError } from "./response";
import { getCapability } from "@/config/capabilities";

export interface ArticleDto {
  id: string;
  title: string;
  category: string;
  duration: string;
  readsCount: string;
  image: string;
  summary: string;
  content?: string;
  author?: string;
  reviewedBy?: string;
  publishedAt?: string;
}

export const MOCK_ARTICLES: ArticleDto[] = [
  {
    id: "1",
    title: "5 cara grounding saat panic attack melanda",
    category: "Anxiety",
    duration: "3 mnt baca",
    readsCount: "14 rb dibaca",
    image:
      "https://images.unsplash.com/photo-1646941785701-892dc6652a3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzA0MzB8&ixlib=rb-4.1.0&q=80&w=1080",
    summary:
      "Teknik 5-4-3-2-1 untuk membantu sistem saraf parasimpatis meredakan lonjakan hormon adrenalin saat serangan panik.",
    content:
      "Panic attack atau serangan panik sering kali datang tiba-tiba dengan gejala fisik yang nyata: jantung berdebar kencang, sesak napas, hingga sensasi melayang. Teknik grounding 5-4-3-2-1 adalah intervensi berbasis kognitif yang dirancang untuk mengembalikan fokus pikiran ke sensasi fisik saat ini (here and now).\n\nLangkah-langkahnya:\n1. 5 Hal yang bisa Anda lihat di sekitar ruangan.\n2. 4 Hal yang bisa Anda sentuh atau rasakan teksturnya.\n3. 3 Suara yang bisa Anda dengar di kejauhan.\n4. 2 Aroma yang bisa Anda cium.\n5. 1 Rasa yang ada di lidah Anda.\n\nDengan memfokuskan panca indera, sistem saraf simpatis yang memicu respon fight-or-flight akan mereda secara bertahap.",
    author: "dr. Andi Pratama, Sp.KJ",
    reviewedBy: "Tim Medis PsiKita",
    publishedAt: "18 Sep 2026",
  },
  {
    id: "2",
    title: "Belajar self-love tanpa rasa bersalah untuk people pleaser",
    category: "Self-Love",
    duration: "4 mnt baca",
    readsCount: "9 rb dibaca",
    image:
      "https://images.unsplash.com/photo-1546678076-c0012adfcdd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzA0MzF8&ixlib=rb-4.1.0&q=80&w=1080",
    summary:
      "Menetapkan batasan sehat (boundaries) bukan berarti egois, melainkan langkah penting menjaga kesehatan mental diri.",
    content:
      "Menolak permintaan orang lain sering kali memicu rasa bersalah yang intens pada seorang people pleaser. Namun, terus-menerus mengatakan 'ya' kepada orang lain sering kali berarti mengatakan 'tidak' kepada kesehatan mental dan batasan diri sendiri.\n\nSelf-love dimulai dari mengenali batas kapasitas energi emosional Anda. Batasan (boundaries) bukanlah tembok untuk memisahkan Anda dari orang lain, melainkan pintu gerbang yang menjaga agar integritas diri tetap utuh.",
    author: "Rina Amelia, M.Psi",
    reviewedBy: "Tim Klinis PsiKita",
    publishedAt: "14 Sep 2026",
  },
  {
    id: "3",
    title: "Sleep hygiene praktis agar tidur lebih nyenyak malam ini",
    category: "Tidur",
    duration: "6 mnt baca",
    readsCount: "21 rb dibaca",
    image:
      "https://images.unsplash.com/photo-1588704146203-8c1c5927ff23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODkwNzA0MzJ8&ixlib=rb-4.1.0&q=80&w=1080",
    summary:
      "Panduan suhu ruangan, ritual peregangan ringan, dan pembatasan paparan blue light 60 menit sebelum waktu tidur.",
    content:
      "Tidur yang berkualitas adalah pondasi regulasi emosi dan kesehatan neurotransmiter otak. Kebersihan tidur (sleep hygiene) merujuk pada kebiasaan yang mendukung tidur nyenyak.\n\nTips utama meliputi:\n- Hindari layar gadget minimal 45-60 menit sebelum tidur untuk membiarkan pelepasan melatonin alami.\n- Pertahankan suhu kamar tidur tetap sejuk (sekitar 20-22°C).\n- Hindari konsumsi kafein setelah pukul 14.00 siang.\n- Lakukan peregangan otot ringan dan latihan pernapasan diafragma sebelum berbaring.",
    author: "dr. Hendra Setiawan, Sp.KJ",
    reviewedBy: "Tim Psikiatri PsiKita",
    publishedAt: "10 Sep 2026",
  },
  {
    id: "4",
    title: "Mengurai perbedaan cemas wajar dan generalized anxiety (GAD)",
    category: "Anxiety",
    duration: "5 mnt baca",
    readsCount: "16 rb dibaca",
    image:
      "https://images.unsplash.com/photo-1769133755091-945858d2073b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    summary:
      "Kapan saatnya berkonsultasi dengan psikiater atau psikolog klinis saat kecemasan mengganggu fungsi pekerjaan dan relasi.",
    content:
      "Kecemasan adalah respon emosional alami manusia terhadap situasi stres atau ancaman nyata. Namun, pada Generalized Anxiety Disorder (GAD), rasa cemas berlangsung berlebihan, menetap hampir setiap hari selama minimal 6 bulan, dan sulit dikendalikan.\n\nJika kekhawatiran Anda mulai mengganggu kualitas tidur, konsentrasi kerja, atau memicu ketegangan otot kronis, skrining klinis (seperti GAD-7) dan konsultasi profesional merupakan langkah terbaik.",
    author: "Dr. Nadia Prameswari, M.Psi",
    reviewedBy: "Komite Etik Psikologi",
    publishedAt: "06 Sep 2026",
  },
];
export function filterDemoArticles(category?: string, query?: string): ArticleDto[] {
  const normCat = category?.trim().toLowerCase();
  const normQuery = query?.trim().toLowerCase();

  return MOCK_ARTICLES.filter((item) => {
    const matchCat =
      !normCat ||
      normCat === "semua" ||
      normCat === "all" ||
      item.category.toLowerCase() === normCat;
    const matchQuery =
      !normQuery ||
      item.title.toLowerCase().includes(normQuery) ||
      item.summary.toLowerCase().includes(normQuery) ||
      (item.content && item.content.toLowerCase().includes(normQuery));
    return matchCat && matchQuery;
  });
}

function unavailableError(): ApiError {
  return new ApiError("Artikel belum tersedia", 501, "CAPABILITY_UNAVAILABLE");
}

export const articleService = {
  async getArticles(
    category?: string,
    query?: string,
    _signal?: AbortSignal,
  ): Promise<ArticleDto[]> {
    if (getCapability("articles") === "demo") {
      return filterDemoArticles(category, query);
    }
    throw unavailableError();
  },

  async getArticleById(
    id: string,
    _signal?: AbortSignal,
  ): Promise<ArticleDto | null> {
    if (getCapability("articles") === "demo") {
      return MOCK_ARTICLES.find((article) => article.id === id) || null;
    }
    throw unavailableError();
  },
};
