import { apiRequest } from "./client";
import { isRecord, withQueryParams } from "./response";

export interface LmsCourseDto {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  topic?: string;
  targetLevel?: string;
  isPublished?: boolean;
  totalChapters?: number;
  totalLessons?: number;
  estimatedMinutes?: number;
  createdAt: string;
}

export interface LmsLessonDto {
  id: string;
  chapterId: string;
  title: string;
  content: string;
  durationMinutes?: number;
  orderIndex: number;
  isCompleted?: boolean;
}

export interface LmsChapterDto {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: LmsLessonDto[];
}

export interface LmsCourseDetailDto extends LmsCourseDto {
  chapters: LmsChapterDto[];
}

export interface LmsProgressDto {
  completedLessonIds: string[];
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  level?: string;
}

export const lmsService = {
  getCourses: async (topic?: string, signal?: AbortSignal): Promise<LmsCourseDto[]> => {
    const path = topic ? withQueryParams("/lms/courses", { topic }) : "/lms/courses";
    const response = await apiRequest<unknown>(path, { signal, adapter: (v) => v });
    if (Array.isArray(response)) {
      return response as LmsCourseDto[];
    }
    if (isRecord(response) && Array.isArray((response as any).data)) {
      return (response as any).data as LmsCourseDto[];
    }
    return [];
  },

  getCourseById: async (courseId: string, signal?: AbortSignal): Promise<LmsCourseDetailDto> => {
    const response = await apiRequest<LmsCourseDetailDto>(`/lms/courses/${courseId}`, {
      signal,
      adapter: (v) => v as LmsCourseDetailDto,
    });
    return response;
  },

  completeLesson: async (lessonId: string): Promise<{ success: boolean }> => {
    return apiRequest<{ success: boolean }>(`/lms/lessons/${lessonId}/complete`, {
      method: "POST",
      adapter: (v) => (isRecord(v) ? (v as any) : { success: true }),
    });
  },

  getMyProgress: async (signal?: AbortSignal): Promise<LmsProgressDto> => {
    return apiRequest<LmsProgressDto>("/lms/my-progress", {
      signal,
      adapter: (v) => v as LmsProgressDto,
    });
  },

  getActiveTest: async (signal?: AbortSignal): Promise<any> => {
    return apiRequest<any>("/lms/active-test", {
      signal,
      adapter: (v) => v,
    });
  },

  getTestHistory: async (signal?: AbortSignal): Promise<any[]> => {
    const res = await apiRequest<any>("/lms/test-history", {
      signal,
      adapter: (v) => v,
    });
    if (Array.isArray(res)) return res;
    if (isRecord(res) && Array.isArray((res as any).data)) return (res as any).data;
    return [];
  },

  evaluatePromotion: async (): Promise<any> => {
    return apiRequest<any>("/lms/evaluate-promotion", {
      method: "POST",
      adapter: (v) => v,
    });
  },

  startCompetencyTest: async (targetLevel: number = 1): Promise<any> => {
    return apiRequest<any>("/lms/competency-test/start", {
      method: "POST",
      body: JSON.stringify({ targetLevel }),
      adapter: (v) => v,
    });
  },

  submitCompetencyTest: async (dto: {
    attemptId: string;
    questionId: string;
    selectedOptionId: string;
  }): Promise<any> => {
    return apiRequest<any>("/lms/competency-test/submit", {
      method: "POST",
      body: JSON.stringify(dto),
      adapter: (v) => v,
    });
  },
};
