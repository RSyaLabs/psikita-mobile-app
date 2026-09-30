import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, ChevronRight, ArrowLeft } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  Card,
  VStack,
  HStack,
  Pressable,
  Badge,
  BadgeText,
  Input,
  InputField,
  ScrollView,
  Image,
  FormControl,
} from "@/components/ui";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import {
  DataSourceBanner,
  EmptyState,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import { getCapability } from "@/config/capabilities";
import { DEV_FIXTURE_UNDOCUMENTED_NOTICE } from "@/config/devFixtures";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { useArticles, useDebounce, usePrefetchData } from "@/hooks";
import type { ArticleDto } from "@/api/article.service";

export default function ArticlesScreen() {
  const router = useRouter();
  const { prefetchArticle } = usePrefetchData();
  const [activeCat, setActiveCat] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  const {
    data: articles = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useArticles(activeCat, debouncedSearch);
  const articlesCapability = getCapability("articles");
  const articlesUnavailable = articlesCapability === "unavailable";

  const categories = ["Semua", "Anxiety", "Self-Love", "Tidur"];
  const isPending = isLoading || isFetching;
  const showDemoBanner =
    articlesCapability === "demo" &&
    !isPending &&
    !isError &&
    !articlesUnavailable &&
    articles.length > 0;
  const featuredArticle = articles[0];

  const handleOpenArticle = (item: ArticleDto) => {
    haptics.light();
    router.push({
      pathname: ROUTES.PATIENT.ARTICLE_DETAIL,
      params: {
        id: item.id,
        title: item.title,
        category: item.category,
        duration: item.duration,
        image: item.image,
        summary: item.summary,
      },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <Box className="bg-primary px-5 pt-4 pb-5 rounded-b-3xl">
        <VStack space="md">
          <HStack space="sm" className="items-center">
            <Pressable
              onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke Dashboard"
              className="p-1 -ml-1 active:opacity-70"
            >
              <ArrowLeft size={22} className="text-primary-foreground" />
            </Pressable>
            <Heading
              level={1}
              size="lg"
              bold
              className="text-primary-foreground"
            >
              Artikel & Edukasi
            </Heading>
          </HStack>

          {/* Search Box */}
          <FormControl id="article-search-field">
            <Box className="relative">
              <Input className="rounded-2xl border-0 bg-card h-12 pl-10 pr-4">
                <InputField
                  id="article-search"
                  name="articleSearch"
                  accessibilityLabel="Cari artikel"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Cari topik, gejala, atau kata kunci..."
                  className="text-foreground text-xs"
                />
              </Input>
              <Box className="absolute left-3.5 top-3.5">
                <Search size={18} className="text-muted-foreground" />
              </Box>
            </Box>
          </FormControl>

          {/* Category Chips */}
          <HStack space="xs" className="items-center flex-wrap gap-1.5 pt-1">
            {categories.map((cat) => {
              const active = activeCat === cat;
              return (
                <Pressable
                  key={cat}
                  accessibilityRole="button"
                  accessibilityLabel={`Kategori ${cat}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    haptics.light();
                    setActiveCat(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-full active:opacity-80 ${
                    active ? "bg-card" : "bg-primary-foreground/10"
                  }`}
                >
                  <Text
                    size="xs"
                    className={`font-semibold ${
                      active
                        ? "text-foreground font-bold"
                        : "text-primary-foreground/80"
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </VStack>
      </Box>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {showDemoBanner && (
          <DataSourceBanner
            source="demo"
            label="Mode demo — endpoint tidak ada di kontrak"
            description={DEV_FIXTURE_UNDOCUMENTED_NOTICE}
          />
        )}
        {articlesUnavailable ? (
          <UnavailableState
            label="Artikel belum tersedia"
            description="Capability artikel live belum memiliki endpoint server yang terverifikasi."
          />
        ) : isPending ? (
          <LoadingState label="Memuat artikel" />
        ) : isError ? (
          <ErrorState
            errorLabel="Artikel gagal dimuat"
            description="Server tidak dapat mengembalikan artikel saat ini."
            onRetry={refetch}
          />
        ) : null}

        {/* Editor's Featured Card */}
        {!isPending &&
          !isError &&
          !articlesUnavailable &&
          featuredArticle &&
          activeCat === "Semua" &&
          searchQuery === "" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Artikel pilihan editor: ${featuredArticle.title}`}
              onPress={() => handleOpenArticle(featuredArticle)}
              className="relative w-full h-[210px] rounded-3xl overflow-hidden mb-3 bg-primary active:opacity-95"
            >
              <Image
                source={{
                  uri: featuredArticle.image,
                }}
                alt={featuredArticle.title}
                className="w-full h-full opacity-60"
                resizeMode="cover"
              />
              <Box className="absolute bottom-3 left-3 right-3 bg-primary/95 rounded-2xl p-3.5">
                <VStack space="xs">
                  <Badge className="self-start bg-secondary px-2.5 py-0.5 rounded-full border-0">
                    <BadgeText className="text-[10px] font-bold text-secondary-foreground">
                      {featuredArticle.category} • {featuredArticle.duration}
                    </BadgeText>
                  </Badge>
                  <Heading size="xs" bold className="text-primary-foreground">
                    {featuredArticle.title}
                  </Heading>
                  <Text
                    size="xs"
                    className="text-primary-foreground/80 text-[10px]"
                  >
                    {featuredArticle.summary}
                  </Text>
                </VStack>
              </Box>
            </Pressable>
          )}

        {/* Empty State when no results */}
        {!isPending &&
        !isError &&
        !articlesUnavailable &&
        articles.length === 0 ? (
          <EmptyState
            label="Artikel tidak ditemukan"
            description={`Tidak ada artikel yang cocok dengan pencarian "${searchQuery}" di kategori "${activeCat}".`}
            actionLabel="Tampilkan semua artikel"
            onAction={() => {
              haptics.light();
              setSearchQuery("");
              setActiveCat("Semua");
            }}
          />
        ) : !isPending && !isError && !articlesUnavailable ? (
          <VStack space="sm">
            {articles.map((item) => (
              <Card
                key={item.id}
                className="bg-card rounded-2xl p-3 border border-border"
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Baca artikel: ${item.title}`}
                  onPressIn={() => prefetchArticle(item.id)}
                  onPress={() => handleOpenArticle(item)}
                  className="flex-row items-center gap-3 active:opacity-80"
                >
                  <Image
                    source={{ uri: item.image }}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl bg-muted"
                    resizeMode="cover"
                  />
                  <VStack space="xs" className="flex-1">
                    <HStack space="xs" className="items-center">
                      <Box className="bg-muted px-2 py-0.5 rounded-md">
                        <Text
                          size="xs"
                          bold
                          className="text-secondary text-[10px]"
                        >
                          {item.category}
                        </Text>
                      </Box>
                      <Text
                        size="xs"
                        className="text-muted-foreground text-[10px]"
                      >
                        • {item.duration}
                      </Text>
                    </HStack>
                    <Text
                      size="xs"
                      bold
                      className="text-foreground leading-snug"
                    >
                      {item.title}
                    </Text>
                  </VStack>
                  <ChevronRight size={18} className="text-secondary" />
                </Pressable>
              </Card>
            ))}
          </VStack>
        ) : null}
      </ScrollView>

      {/* Persistent Bottom Tab Bar */}
      <PatientTabBar activeTab="jurnal" />
    </SafeAreaView>
  );
}
