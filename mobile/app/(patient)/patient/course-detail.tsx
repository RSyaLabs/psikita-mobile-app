import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
  Badge,
  BadgeText,
  Spinner,
} from "@/components/ui";
import { useLmsCourseDetail, useCompleteLesson } from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

export default function CourseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: course, isLoading, isError } = useLmsCourseDetail(id);
  const completeLessonMutation = useCompleteLesson();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  const chapters = course?.chapters ?? [];
  const allLessons = chapters.flatMap((c) => c.lessons);
  const currentLesson = allLessons.find((l) => l.id === activeLessonId) ?? allLessons[0];

  const handleCompleteCurrentLesson = () => {
    if (!currentLesson) return;
    haptics.medium();
    completeLessonMutation.mutate(currentLesson.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <HStack space="sm" className="items-center justify-between px-5 pt-3.5 pb-2 bg-card border-b border-border">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PATIENT.COURSES);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Detail Materi Kelas
        </Heading>
        <Box className="w-10" />
      </HStack>

      {isLoading ? (
        <Box className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text size="xs" className="text-muted-foreground mt-3">
            Membuka modul pembelajaran...
          </Text>
        </Box>
      ) : isError || !course ? (
        <Box className="flex-1 items-center justify-center p-6">
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Kelas tidak ditemukan
            </Text>
            <Button
              size="sm"
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.COURSES)}
              className="mt-3 bg-secondary"
            >
              <ButtonText>Kembali ke Katalog</ButtonText>
            </Button>
          </Card>
        </Box>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Course Hero Info */}
          <Box className="bg-primary rounded-3xl p-5 mb-4 relative overflow-hidden">
            {course.topic && (
              <Badge variant="solid" action="success" className="self-start rounded-full px-2.5 py-0.5 mb-2">
                <BadgeText className="text-[10px] font-bold text-white uppercase tracking-wider">
                  {course.topic}
                </BadgeText>
              </Badge>
            )}
            <Heading size="md" bold className="text-primary-foreground">
              {course.title}
            </Heading>
            <Text size="xs" className="text-primary-foreground/80 mt-1.5 leading-relaxed">
              {course.description}
            </Text>
            <HStack space="md" className="items-center mt-4 pt-3 border-t border-primary-foreground/20">
              <HStack space="xs" className="items-center">
                <Clock size={13} className="text-primary-foreground/90" />
                <Text size="xs" className="text-primary-foreground/90 text-[11px] font-semibold">
                  {course.estimatedMinutes ?? 15} Menit
                </Text>
              </HStack>
              <HStack space="xs" className="items-center">
                <Award size={13} className="text-primary-foreground/90" />
                <Text size="xs" className="text-primary-foreground/90 text-[11px] font-semibold">
                  {chapters.length} Bab • {allLessons.length} Modul
                </Text>
              </HStack>
            </HStack>
          </Box>

          {/* Current Lesson Reading Viewer */}
          {currentLesson && (
            <Card className="bg-card rounded-2xl p-4 border border-border mb-4">
              <HStack space="xs" className="items-center justify-between mb-2 pb-2 border-b border-border/50">
                <HStack space="xs" className="items-center">
                  <PlayCircle size={16} className="text-secondary" />
                  <Text size="xs" bold className="text-foreground">
                    Modul Aktif: {currentLesson.title}
                  </Text>
                </HStack>
                {currentLesson.durationMinutes && (
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    {currentLesson.durationMinutes} mnt
                  </Text>
                )}
              </HStack>
              <Text size="xs" className="text-foreground leading-relaxed my-2">
                {currentLesson.content || "Pelajari panduan langkah demi langkah dari psikolog klinis SeraPhany untuk menerapkan strategi koping yang sehat dalam kehidupan harian Anda."}
              </Text>
              <Button
                size="sm"
                isDisabled={completeLessonMutation.isPending}
                onPress={handleCompleteCurrentLesson}
                className="mt-3 bg-secondary rounded-xl"
              >
                <HStack space="xs" className="items-center">
                  <CheckCircle2 size={14} className="text-white" />
                  <ButtonText className="text-xs font-bold text-white">
                    {completeLessonMutation.isPending ? "Menyimpan Progres..." : "Tandai Modul Selesai"}
                  </ButtonText>
                </HStack>
              </Button>
            </Card>
          )}

          {/* Syllabus Chapters & Lessons List */}
          <Heading size="xs" bold className="text-foreground px-1 mb-2">
            Silabus Pembelajaran
          </Heading>
          <VStack space="sm">
            {chapters.map((chapter, cIdx) => (
              <Card key={chapter.id} className="bg-card rounded-2xl p-4 border border-border">
                <Text size="xs" bold className="text-secondary uppercase tracking-wider text-[10px] mb-1">
                  Bab {cIdx + 1}
                </Text>
                <Heading size="xs" bold className="text-foreground mb-2">
                  {chapter.title}
                </Heading>
                <VStack space="xs" className="mt-1">
                  {chapter.lessons.map((lesson, lIdx) => {
                    const isSelected = lesson.id === currentLesson?.id;
                    return (
                      <Pressable
                        key={lesson.id}
                        onPress={() => {
                          haptics.selection();
                          setActiveLessonId(lesson.id);
                        }}
                        className={`p-2.5 rounded-xl flex-row items-center justify-between border ${
                          isSelected
                            ? "bg-muted border-secondary"
                            : "bg-background border-border"
                        }`}
                      >
                        <HStack space="xs" className="items-center flex-1 pr-2">
                          <BookOpen size={14} className={isSelected ? "text-secondary" : "text-muted-foreground"} />
                          <Text
                            size="xs"
                            className={`font-medium text-[11px] ${
                              isSelected ? "text-foreground font-bold" : "text-muted-foreground"
                            }`}
                          >
                            {lIdx + 1}. {lesson.title}
                          </Text>
                        </HStack>
                        {lesson.isCompleted && (
                          <CheckCircle2 size={14} className="text-green-600" />
                        )}
                      </Pressable>
                    );
                  })}
                </VStack>
              </Card>
            ))}
          </VStack>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
