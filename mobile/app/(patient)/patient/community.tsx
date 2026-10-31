import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  MessageSquare,
  Heart,
  Share2,
  Plus,
  Shield,
  User,
  Send,
  X,
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
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import { useCommunityPosts, useCreatePost } from "@/hooks/useApiQueries";
import { safeNavigateBack } from "@/utils/navigation";
import { ROUTES } from "@/constants/routes";
import { haptics } from "@/utils/haptics";

const CATEGORIES = ["Semua", "Pemulihan", "Cerita Harian", "Tanya Psikolog", "Tips Koping"];

export default function CommunityFeedScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { data: posts, isLoading, isError } = useCommunityPosts(selectedCategory);
  const createPostMutation = useCreatePost();

  const handleCreatePost = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      haptics.error();
      return;
    }
    haptics.medium();
    createPostMutation.mutate(
      {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: selectedCategory === "Semua" ? "Cerita Harian" : selectedCategory,
        isAnonymous,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewContent("");
          setShowCreateModal(false);
        },
      },
    );
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
            safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <VStack space="xs" className="items-center">
          <Heading size="sm" bold className="text-foreground">
            Ruang Cerita & Komunitas
          </Heading>
          <HStack space="xs" className="items-center">
            <Shield size={11} className="text-secondary" />
            <Text size="xs" className="text-[10px] text-secondary font-bold">
              Ruang Aman & Terjaga
            </Text>
          </HStack>
        </VStack>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Buat Cerita Baru"
          onPress={() => {
            haptics.medium();
            setShowCreateModal(true);
          }}
          className="w-10 h-10 rounded-full bg-secondary items-center justify-center active:opacity-80"
        >
          <Plus size={20} className="text-white" />
        </Pressable>
      </HStack>

      {/* Category Filter Chips */}
      <Box className="bg-card border-b border-border/50 px-4 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <HStack space="xs">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    haptics.selection();
                    setSelectedCategory(cat);
                  }}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected ? "bg-secondary border-secondary" : "bg-card border-border"
                  }`}
                >
                  <Text
                    size="xs"
                    className={`font-semibold text-[11px] ${
                      isSelected ? "text-secondary-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </ScrollView>
      </Box>

      {/* Main Feed Content */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Box className="py-20 items-center justify-center">
            <Spinner size="large" />
            <Text size="xs" className="text-muted-foreground mt-3">
              Memuat kiriman komunitas...
            </Text>
          </Box>
        ) : isError ? (
          <Card className="p-6 items-center bg-card rounded-2xl border border-border">
            <Text size="sm" bold className="text-foreground text-center">
              Gagal memuat kiriman
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Periksa jaringan Anda atau coba kembali beberapa saat lagi.
            </Text>
          </Card>
        ) : (posts ?? []).length === 0 ? (
          <Card className="p-8 items-center bg-card rounded-2xl border border-border">
            <MessageSquare size={36} className="text-muted-foreground/60 mb-2" />
            <Text size="sm" bold className="text-foreground text-center">
              Belum ada cerita di kategori ini
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Jadilah yang pertama berbagi cerita hangat atau pengalaman koping Anda.
            </Text>
            <Button
              size="sm"
              onPress={() => setShowCreateModal(true)}
              className="mt-4 bg-secondary rounded-xl"
            >
              <ButtonText className="text-xs font-bold text-white">Mulai Berbagi</ButtonText>
            </Button>
          </Card>
        ) : (
          <VStack space="md">
            {(posts ?? []).map((post) => (
              <Pressable
                key={post.id}
                onPress={() => {
                  haptics.light();
                  router.push({
                    pathname: ROUTES.PATIENT.COMMUNITY_DETAIL,
                    params: { id: post.id },
                  } as any);
                }}
                className="bg-card rounded-2xl p-4 border border-border active:bg-muted"
              >
                <HStack space="xs" className="items-center justify-between mb-2">
                  <HStack space="xs" className="items-center">
                    <Box className="w-7 h-7 rounded-full bg-muted items-center justify-center">
                      <User size={14} className="text-muted-foreground" />
                    </Box>
                    <Text size="xs" bold className="text-foreground text-[11px]">
                      {post.isAnonymous ? "Sahabat SeraPhany" : post.authorName ?? "Pengguna"}
                    </Text>
                  </HStack>
                  {post.category && (
                    <Badge variant="outline" action="muted" className="rounded-md px-2 py-0.5">
                      <BadgeText className="text-[10px] font-semibold text-secondary">
                        {post.category}
                      </BadgeText>
                    </Badge>
                  )}
                </HStack>

                <Heading size="xs" bold className="text-foreground mb-1">
                  {post.title}
                </Heading>
                <Text size="xs" className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.content}
                </Text>

                <HStack space="lg" className="items-center mt-3 pt-2.5 border-t border-border/50">
                  <HStack space="xs" className="items-center">
                    <Heart size={14} className="text-muted-foreground" />
                    <Text size="xs" className="text-[11px] text-muted-foreground font-medium">
                      {post.likesCount ?? 0} Dukungan
                    </Text>
                  </HStack>
                  <HStack space="xs" className="items-center">
                    <MessageSquare size={14} className="text-muted-foreground" />
                    <Text size="xs" className="text-[11px] text-muted-foreground font-medium">
                      {post.repliesCount ?? 0} Balasan
                    </Text>
                  </HStack>
                </HStack>
              </Pressable>
            ))}
          </VStack>
        )}
      </ScrollView>

      {/* Modal Buat Kiriman Baru */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="md">
        <ModalBackdrop />
        <ModalContent className="bg-card rounded-3xl border border-border p-5 w-[92%] max-w-[420px]">
          <ModalHeader className="pb-3 border-b border-border/50">
            <HStack space="xs" className="items-center justify-between w-full">
              <Heading size="sm" bold className="text-foreground">
                Bagikan Cerita Anda
              </Heading>
              <Pressable onPress={() => setShowCreateModal(false)} className="p-1">
                <X size={18} className="text-muted-foreground" />
              </Pressable>
            </HStack>
          </ModalHeader>
          <ModalBody className="pt-3 pb-2 gap-3">
            <VStack space="xs">
              <Text size="xs" bold className="text-foreground text-[11px]">
                Judul Cerita
              </Text>
              <Input className="h-10 bg-muted rounded-xl border-border px-3">
                <InputField
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="Misal: Caraku menghadapi panic attack hari ini"
                  className="text-xs text-foreground"
                />
              </Input>
            </VStack>

            <VStack space="xs">
              <Text size="xs" bold className="text-foreground text-[11px]">
                Isi Cerita / Pengalaman
              </Text>
              <Input className="h-24 bg-muted rounded-xl border-border px-3 py-2 items-start">
                <InputField
                  value={newContent}
                  onChangeText={setNewContent}
                  multiline
                  placeholder="Tuliskan pengalaman atau pertanyaanmu dengan nyaman..."
                  className="text-xs text-foreground h-full text-top"
                />
              </Input>
            </VStack>

            <Pressable
              onPress={() => setIsAnonymous(!isAnonymous)}
              className="flex-row items-center gap-2 pt-1"
            >
              <Box className={`w-4 h-4 rounded border ${isAnonymous ? "bg-secondary border-secondary" : "border-border"}`} />
              <Text size="xs" className="text-muted-foreground text-[11px]">
                Posting sebagai anonim ("Sahabat SeraPhany")
              </Text>
            </Pressable>
          </ModalBody>
          <ModalFooter className="pt-2">
            <Button
              size="sm"
              isDisabled={createPostMutation.isPending}
              onPress={handleCreatePost}
              className="w-full bg-secondary rounded-xl h-11"
            >
              <HStack space="xs" className="items-center justify-center">
                <Send size={14} className="text-white" />
                <ButtonText className="text-xs font-bold text-white">
                  {createPostMutation.isPending ? "Mengirimkan Cerita..." : "Terbitkan Cerita"}
                </ButtonText>
              </HStack>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SafeAreaView>
  );
}
