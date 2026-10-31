import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lmsService, LmsCourseDto, LmsCourseDetailDto, LmsProgressDto } from "@/api/lms.service";
import { queryKeys } from "../useQueryKeys";
import { callWithSignal } from "./shared";

export function useLmsCourses(topic?: string) {
  return useQuery<LmsCourseDto[]>({
    queryKey: queryKeys.lms.list(topic),
    queryFn: ({ signal }) => callWithSignal(lmsService.getCourses, signal, topic),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLmsCourseDetail(courseId?: string) {
  return useQuery<LmsCourseDetailDto | null>({
    queryKey: queryKeys.lms.detail(courseId ?? ""),
    queryFn: ({ signal }) =>
      courseId ? callWithSignal(lmsService.getCourseById, signal, courseId) : Promise.resolve(null),
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLmsProgress() {
  return useQuery<LmsProgressDto>({
    queryKey: queryKeys.lms.progress(),
    queryFn: ({ signal }) => callWithSignal(lmsService.getMyProgress, signal),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => lmsService.completeLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lms.all });
    },
  });
}
