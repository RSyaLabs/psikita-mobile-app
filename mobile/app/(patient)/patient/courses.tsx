import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Image as RNImage } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BookOpen,
  Clock,
  Award,
  ChevronRight,
  Search,
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
import { AppIcon } from "@/components/common/AppIcon";
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
      {/* Branded Curved Header (Root Tab - Consistent with Riwayat & Akun) */}
      <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
        <HStack space="xs" className="items-center justify-between">
          <VStack space="xs" className="flex-1 pr-3">
            <Heading level={1} size="lg" bold className="text-primary-foreground">
              Kelas & Modul Edukasi
            </Heading>
            <Text size="sm" className="text-primary-foreground/90 font-medium">
              Modul psikoedukasi berbasis panduan klinis
            </Text>
          </VStack>
          <HStack space="xs" className="items-center">
            {progress && (
              <Badge variant="default" className="rounded-full px-2.5 py-1 bg-primary-foreground/20 mr-1">
                <HStack space="xs" className="items-center">
                  <AppIcon icon={CheckCircle2} size={14} color="#FFFFFF" />
                  <BadgeText className="text-sm font-bold text-white">
                    {progress.totalCoursesCompleted ?? 0} Selesai
                  </BadgeText>
                </HStack>
              </Badge>
            )}
            <RNImage
              source={require("@/../assets/icon.png")}
              style={{ width: 32, height: 32, borderRadius: 8 }}
              resizeMode="cover"
            />
          </HStack>
        </HStack>

        {/* Search Bar inside Branded Header */}
        <Box className="mt-4 mb-2">
          <Input className="h-11 bg-card rounded-xl border-0 px-3.5 flex-row items-center">
            <AppIcon icon={Search} size={18} color="#4A3B6B" style={{ marginRight: 8 }} />
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Cari topik atau materi kelas..."
              placeholderTextColor="#757086"
              className="text-sm font-medium text-foreground p-0 flex-1"
            />
          </Input>
        </Box>

        {/* Topic Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-1 -mx-1">
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
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  className={`px-3.5 py-1.5 rounded-full ${
                    isSelected ? "bg-card" : "bg-primary-foreground/15"
                  }`}
                >
                  <Text
                    size="sm"
                    bold
                    className={
                      isSelected
                        ? "text-foreground font-bold"
                        : "text-primary-foreground font-medium"
                    }
                  >
                    {topic}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </ScrollView>
      </Box>

      {/* Main Course List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Box className="py-20 items-center justify-center">
            <Spinner size="large" />
            <Text size="sm" className="text-muted-foreground mt-3 font-medium">
              Memuat kurikulum kelas...
            </Text>
          </Box>
        ) : isError ? (
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Gagal memuat materi kelas
            </Text>
            <Text size="sm" className="text-muted-foreground text-center mt-1 font-medium">
              Periksa koneksi internet Anda atau coba muat ulang.
            </Text>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card className="p-8 items-center bg-card rounded-2xl border border-border">
            <AppIcon icon={BookOpen} size={36} color="#757086" className="mb-2" />
            <Text size="sm" bold className="text-foreground text-center">
              Belum ada kelas untuk topik ini
            </Text>
            <Text size="sm" className="text-muted-foreground text-center mt-1 font-medium">
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
                      <Badge variant="outline" className="self-start rounded-full px-2.5 py-0.5 mb-1.5 border-primary/30 bg-primary/5">
                        <BadgeText className="text-sm font-semibold text-primary">
                          {course.topic}
                        </BadgeText>
                      </Badge>
                    )}
                    <Heading size="sm" bold className="text-foreground">
                      {course.title}
                    </Heading>
                    <Text size="sm" className="text-muted-foreground line-clamp-2 mt-1 font-normal leading-relaxed">
                      {course.description}
                    </Text>
                    <HStack space="md" className="items-center mt-3 pt-2.5 border-t border-border/50">
                      <HStack space="xs" className="items-center">
                        <AppIcon icon={Clock} size={16} color="#4B4656" />
                        <Text size="sm" className="text-sm text-muted-foreground font-medium">
                          {course.estimatedMinutes ?? 15} Menit
                        </Text>
                      </HStack>
                      <HStack space="xs" className="items-center">
                        <AppIcon icon={Award} size={16} color="#4B4656" />
                        <Text size="sm" className="text-sm text-muted-foreground font-medium">
                          {course.totalLessons ?? 3} Modul
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                  <Box className="w-8 h-8 rounded-full bg-muted items-center justify-center mt-1">
                    <AppIcon icon={ChevronRight} size={18} color="#4B4656" />
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
