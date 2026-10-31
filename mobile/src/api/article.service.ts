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

function unavailableError(): ApiError {
  return new ApiError("Artikel belum tersedia", 501, "CAPABILITY_UNAVAILABLE");
}

export const articleService = {
  async getArticles(
    _category?: string,
    _query?: string,
    _signal?: AbortSignal,
  ): Promise<ArticleDto[]> {
    if (getCapability("articles") === "live") {
      return [];
    }
    throw unavailableError();
  },

  async getArticleById(
    _id: string,
    _signal?: AbortSignal,
  ): Promise<ArticleDto | null> {
    if (getCapability("articles") === "live") {
      return null;
    }
    throw unavailableError();
  },
};
