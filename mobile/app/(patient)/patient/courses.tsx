import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Input,
  InputField,
  Badge,
  BadgeText,
  Spinner,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import { useLmsCourses, useLmsProgress } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

const TOPICS = ["Semua", "Kecemasan", "Tidur", "Depresi", "Manajemen Stres", "Mindfulness"];

export default function CoursesScreen() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const activeTopicParam = selectedTopic === "Semua" ? undefined : selectedTopic;
  const { data: courses, isLoading, isError } = useLmsCourses(activeTopicParam);
  const { data: progress } = useLmsProgress();

  const filteredCourses = (courses ?? []).filter((course) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      course.title.toLowerCase().includes(q) ||
      (course.description && course.description.toLowerCase().includes(q))
    );
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <VStack space="xs" className="px-5 pt-3 pb-2 bg-card border-b border-border">
        <HStack space="xs" className="items-center justify-between">
          <VStack space="xs">
            <HStack space="xs" className="items-center">
              <Sparkles size={16} className="text-secondary" />
              <Text size="xs" bold className="text-secondary uppercase tracking-widest text-[11px]">
                Psikoedukasi Klinis
              </Text>
            </HStack>
            <Heading size="lg" bold className="text-foreground">
              Kelas & Modul Edukasi
            </Heading>
          </VStack>
          {progress && (
            <Badge variant="solid" action="success" className="rounded-full px-2.5 py-1">
              <HStack space="xs" className="items-center">
                <CheckCircle2 size={12} className="text-white" />
                <BadgeText className="text-[11px] font-bold text-white">
                  {progress.totalCoursesCompleted ?? 0} Selesai
                </BadgeText>
              </HStack>
            </Badge>
          )}
        </HStack>
        <Text size="xs" className="text-muted-foreground mt-0.5">
          Pelajari modul kesehatan mental berbasis sains dan panduan klinis dokter.
        </Text>

        {/* Search Bar */}
        <Box className="mt-2.5 mb-1">
          <Input className="h-10 bg-muted rounded-xl border-border px-3">
            <Search size={16} className="text-muted-foreground mr-2" />
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari topik atau materi kelas..."
              placeholderTextColor="#625E6E"
              className="text-xs text-foreground"
            />
          </Input>
        </Box>

        {/* Topic Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2 -mx-1">
          <HStack space="xs" className="px-1">
            {TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <Pressable
                  key={topic}
                  onPress={() => {
                    haptics.selection();
                    setSelectedTopic(topic);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? "bg-secondary border-secondary"
                      : "bg-card border-border"
                  }`}
                >
                  <Text
                    size="xs"
                    className={`font-semibold text-[11px] ${
                      isSelected ? "text-secondary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {topic}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </ScrollView>
      </VStack>

      {/* Main Course List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Box className="py-20 items-center justify-center">
            <Spinner size="large" />
            <Text size="xs" className="text-muted-foreground mt-3">
              Memuat kurikulum kelas...
            </Text>
          </Box>
        ) : isError ? (
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Gagal memuat materi kelas
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Periksa koneksi internet Anda atau coba muat ulang.
            </Text>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-8 items-center bg-card rounded-2xl border border-border">
            <BookOpen size={36} className="text-muted-foreground/60 mb-2" />
            <Text size="sm" bold className="text-foreground text-center">
              Belum ada kelas untuk topik ini
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Materi psikoedukasi sedang disiapkan oleh tim klinis SeraPhany.
            </Text>
          </Card>
        ) : (
          <VStack space="md">
            {filteredCourses.map((course) => (
              <Pressable
                key={course.id}
                onPress={() => {
                  haptics.light();
                  router.push({
                    pathname: ROUTES.PATIENT.COURSE_DETAIL,
                    params: { id: course.id },
                  } as any);
                }}
                className="bg-card rounded-2xl p-4 border border-border active:bg-muted"
              >
                <HStack space="sm" className="items-start justify-between">
                  <VStack space="xs" className="flex-1 pr-2">
                    {course.topic && (
                      <Badge variant="outline" action="muted" className="self-start rounded-md px-2 py-0.5 mb-1">
                        <BadgeText className="text-[10px] font-semibold text-secondary">
                          {course.topic}
                        </BadgeText>
                      </Badge>
                    )}
                    <Heading size="sm" bold className="text-foreground">
                      {course.title}
                    </Heading>
                    <Text size="xs" className="text-muted-foreground line-clamp-2 mt-1">
                      {course.description}
                    </Text>
                    <HStack space="md" className="items-center mt-3 pt-2 border-t border-border/50">
                      <HStack space="xs" className="items-center">
                        <Clock size={13} className="text-muted-foreground" />
                        <Text size="xs" className="text-[11px] text-muted-foreground font-medium">
                          {course.estimatedMinutes ?? 15} Menit
                        </Text>
                      </HStack>
                      <HStack space="xs" className="items-center">
                        <Award size={13} className="text-muted-foreground" />
                        <Text size="xs" className="text-[11px] text-muted-foreground font-medium">
                          {course.totalLessons ?? 3} Modul
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                  <Box className="w-8 h-8 rounded-full bg-muted items-center justify-center mt-1">
                    <ChevronRight size={18} className="text-muted-foreground" />
                  </Box>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        )}
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="edukasi" />
    </SafeAreaView>
  );
}
