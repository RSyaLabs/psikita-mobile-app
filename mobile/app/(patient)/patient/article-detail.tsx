import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  Clock,
  UserCheck,
  ArrowRight,
  X,
} from "lucide-react-native";
import {
  DataSourceBanner,
  ErrorState,
  LoadingState,
  UnavailableState,
} from "@/components/common";
import { getCapability } from "@/config/capabilities";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  ScrollView,
  Image,
  Button,
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { useArticle } from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants";

export default function ArticleDetailScreen() {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const params = useLocalSearchParams<{ id?: string }>();
  // Route parameter only. A fabricated article id made the screen show a
  // document the server never sent, on a path the contract does not define
  // anyway; the reader reaches it through the article list instead.
  const articleId = params.id;
  const articleCapability = getCapability("articles");
  const {
    data: remoteArticle,
    isLoading,
    isError,
    refetch,
  } = useArticle(articleId);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <LoadingState label="Memuat artikel" />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        {articleCapability === "unavailable" ? (
          <UnavailableState
            label="Artikel belum tersedia"
            description="Endpoint artikel belum memiliki kontrak server yang terverifikasi."
          />
        ) : (
          <ErrorState
            errorLabel="Artikel gagal dimuat"
            description="Server tidak dapat mengembalikan artikel saat ini."
            onRetry={refetch}
          />
        )}
      </SafeAreaView>
    );
  }

  if (!remoteArticle) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <UnavailableState
          label="Artikel tidak ditemukan"
          description="Artikel yang diminta tidak tersedia dari server."
        />
      </SafeAreaView>
    );
  }

  const title = remoteArticle.title;
  const category = remoteArticle.category;
  const duration = remoteArticle.duration;
  const image = remoteArticle.image;

  const handleToggleBookmark = () => {
    haptics.light();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    haptics.light();
    setShowShareModal(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Bar */}
      <HStack
        space="sm"
        className="items-center justify-between px-5 pt-3.5 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Daftar Artikel"
          onPress={() => {
            safeNavigateBack(router, ROUTES.PATIENT.ARTICLES);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>

        <Box className="bg-muted px-3 py-1 rounded-full border border-border">
          <Text
            size="xs"
            bold
            className="text-secondary text-[11px] uppercase tracking-wider"
          >
            {category}
          </Text>
        </Box>

        <HStack space="xs" className="items-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Simpan artikel"
            onPress={handleToggleBookmark}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
          >
            <Bookmark
              size={18}
              className={
                isBookmarked
                  ? "text-secondary fill-secondary"
                  : "text-muted-foreground"
              }
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan artikel"
            onPress={handleShare}
            className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
          >
            <Share2 size={18} className="text-foreground" />
          </Pressable>
        </HStack>
      </HStack>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {articleCapability === "demo" && (
          <DataSourceBanner
            source="demo"
            label="Mode demo"
            description="Artikel ini memakai data demo dan bukan informasi klinis live."
          />
        )}
        {/* Title */}
        <Heading
          level={1}
          size="lg"
          bold
          className="text-foreground leading-tight mt-2"
        >
          {title}
        </Heading>

        {/* Clinical Byline */}
        {(remoteArticle.reviewedBy ||
          remoteArticle.publishedAt ||
          duration) && (
          <HStack
            space="md"
            className="items-center my-3 py-2 border-y border-border"
          >
            {remoteArticle.reviewedBy ? (
              <HStack space="xs" className="items-center">
                <UserCheck size={14} className="text-secondary" />
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  Ditinjau oleh{" "}
                  <Text size="xs" bold className="text-foreground">
                    {remoteArticle.reviewedBy}
                  </Text>
                </Text>
              </HStack>
            ) : null}
            {remoteArticle.publishedAt || duration ? (
              <>
                <Box className="w-[1px] h-3.5 bg-border" />
                <HStack space="xs" className="items-center">
                  <Clock size={12} className="text-muted-foreground" />
                  <Text size="xs" className="text-muted-foreground text-[11px]">
                    {remoteArticle.publishedAt || duration}
                  </Text>
                </HStack>
              </>
            ) : null}
          </HStack>
        )}

        {/* Hero Image */}
        <Box className="w-full h-52 rounded-3xl overflow-hidden mb-4 bg-muted border border-border">
          <Image
            source={{ uri: image }}
            alt={title}
            className="w-full h-full"
            resizeMode="cover"
          />
        </Box>

        {/* Article Body Content */}
        <VStack space="md">
          <Text
            size="sm"
            className="text-foreground leading-relaxed font-medium"
          >
            {remoteArticle.content || remoteArticle.summary}
          </Text>
          {remoteArticle.author ? (
            <Text size="xs" className="text-muted-foreground">
              Penulis: {remoteArticle.author}
            </Text>
          ) : null}
          {remoteArticle.reviewedBy ? (
            <Text size="xs" className="text-muted-foreground">
              Ditinjau oleh: {remoteArticle.reviewedBy}
            </Text>
          ) : null}
        </VStack>

        <HStack
          space="md"
          className="items-center justify-between pt-4 mt-2 border-t border-border"
        >
          <Text size="xs" className="text-muted-foreground">
            {remoteArticle.readsCount ||
              "Jumlah baca belum tersedia dari server"}
          </Text>
          {remoteArticle.publishedAt ? (
            <Text size="xs" className="text-muted-foreground text-[11px]">
              Dipublikasikan {remoteArticle.publishedAt}
            </Text>
          ) : null}
        </HStack>
      </ScrollView>

      {/* Sticky Bottom CTA to consult */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-4">
        <HStack space="md" className="items-center justify-between">
          <VStack space="xs" className="flex-1">
            <Text size="xs" bold className="text-foreground">
              Butuh panduan profesional?
            </Text>
            <Text size="xs" className="text-muted-foreground text-[10px]">
              Bicara privat bersama psikolog siaga
            </Text>
          </VStack>

          <Button
            size="sm"
            onPress={() => {
              haptics.medium();
              router.push(ROUTES.PATIENT.DOCTORS);
            }}
            className="bg-primary px-4 py-2.5 rounded-xl h-auto flex-row items-center gap-1"
          >
            <ButtonText className="text-xs font-bold text-primary-foreground">
              Cari Psikolog
            </ButtonText>
            <ArrowRight size={14} className="text-primary-foreground" />
          </Button>
        </HStack>
      </Box>

      {/* Pop-up Modal: Bagikan Artikel */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        size="md"
      >
        <ModalBackdrop
          className="bg-black/40 backdrop-blur-md"
          style={
            {
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            } as any
          }
        />
        <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[380px]">
          <ModalHeader className="pb-3 border-b border-border/50">
            <HStack space="xs" className="items-center justify-between w-full">
              <HStack space="xs" className="items-center">
                <Share2 size={18} className="text-secondary" />
                <Heading level={2} size="sm" bold className="text-foreground">
                  Bagikan Artikel
                </Heading>
              </HStack>
              <Pressable
                onPress={() => setShowShareModal(false)}
                className="p-1 rounded-full"
              >
                <X size={18} className="text-muted-foreground" />
              </Pressable>
            </HStack>
          </ModalHeader>

          <ModalBody className="pt-3 pb-1">
            <VStack space="sm">
              <Text size="xs" className="text-muted-foreground leading-relaxed">
                Bagikan artikel "{title}" kepada teman atau kerabat yang mungkin
                membutuhkan informasi ini.
              </Text>

              <UnavailableState
                label="Share artikel belum tersedia"
                description="Clipboard dan kanal share native belum memiliki kontrak server yang terverifikasi."
              />

              <Button
                size="default"
                onPress={() => setShowShareModal(false)}
                className="w-full bg-secondary h-11 rounded-xl mt-2"
              >
                <ButtonText className="text-xs font-bold text-secondary-foreground">
                  Tutup
                </ButtonText>
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
