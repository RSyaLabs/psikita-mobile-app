import React, { useState } from "react";
import {
  Avatar,
  AvatarFallbackText,
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Input,
  InputField,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft, Send, Video } from "lucide-react-native";

export interface PractitionerLiveRoomViewProps {
  patientName?: string;
  remainingTime?: string;
  onBack: () => void;
  onOpenContext: () => void;
  onOpenRequestAssessment: () => void;
  onOpenNotes: () => void;
  onViewAssessmentAnswers: () => void;
  onEndSession: () => void;
  onStartVideoCall?: () => void;
}

export function PractitionerLiveRoomView({
  patientName = "Siti Rahma",
  remainingTime = "32:10",
  onBack,
  onOpenContext,
  onOpenRequestAssessment,
  onOpenNotes,
  onViewAssessmentAnswers,
  onEndSession,
  onStartVideoCall,
}: PractitionerLiveRoomViewProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<
    Array<{ id: string; sender: "practitioner" | "patient"; text: string }>
  >([
    {
      id: "m1",
      sender: "practitioner",
      text: "Halo, terima kasih sudah datang. Boleh ceritakan apa yang paling mengganggumu belakangan ini?",
    },
    {
      id: "m2",
      sender: "patient",
      text: "Akhir-akhir ini saya susah tidur karena cemas.",
    },
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "practitioner", text: inputText.trim() },
    ]);
    setInputText("");
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Top Bar Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>

        <Avatar size="sm" className="w-10 h-10 border border-dashed border-muted-foreground bg-muted">
          <AvatarFallbackText className="text-foreground text-sm font-bold">
            {patientName.slice(0, 2).toUpperCase()}
          </AvatarFallbackText>
        </Avatar>

        <VStack space="xs" className="flex-1 min-w-0">
          <Heading size="sm" bold className="text-foreground truncate">
            {patientName}
          </Heading>
          <Text size="sm" className="text-muted-foreground truncate">
            Sesi berlangsung · sisa {remainingTime}
          </Text>
        </VStack>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Panggilan video"
          onPress={onStartVideoCall}
          className="w-11 h-11 border border-border rounded-xl items-center justify-center active:bg-muted"
        >
          <Video size={20} color="#262130" />
        </Pressable>
      </HStack>

      {/* Quick Action Chips */}
      <HStack className="px-4 py-2.5 gap-2 bg-card border-b border-border/50">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Konteks pasien"
          onPress={onOpenContext}
          className="min-h-[40px] px-3.5 border border-border rounded-full items-center justify-center bg-card active:bg-muted"
        >
          <Text size="sm" bold className="text-foreground">
            Konteks pasien
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Minta asesmen"
          onPress={onOpenRequestAssessment}
          className="min-h-[40px] px-3.5 border border-border rounded-full items-center justify-center bg-card active:bg-muted"
        >
          <Text size="sm" bold className="text-foreground">
            Minta asesmen
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Catatan"
          onPress={onOpenNotes}
          className="min-h-[40px] px-3.5 border border-border rounded-full items-center justify-center bg-card active:bg-muted"
        >
          <Text size="sm" bold className="text-foreground">
            Catatan
          </Text>
        </Pressable>
      </HStack>

      {/* Messages Scroll View */}
      <ScrollView
        className="flex-1 px-4 py-3"
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" className="text-muted-foreground text-center self-center py-1">
          Sesi dimulai. Percakapan ini privat.
        </Text>

        {messages.map((item) => (
          <Box
            key={item.id}
            className={`max-w-[80%] p-3.5 rounded-2xl border ${
              item.sender === "practitioner"
                ? "self-end bg-muted border-border rounded-br-sm"
                : "self-start bg-card border-border rounded-bl-sm"
            }`}
          >
            <Text size="sm" className="text-foreground leading-relaxed">
              {item.text}
            </Text>
          </Box>
        ))}

        {/* Assessment Status Chip */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lihat jawaban asesmen"
          onPress={onViewAssessmentAnswers}
          className="self-center border border-dashed border-foreground/60 rounded-full px-4 py-2 my-2 active:bg-muted/60"
        >
          <Text size="sm" bold className="text-foreground text-center">
            Asesmen dikirim ke pasien · lihat jawaban ›
          </Text>
        </Pressable>
      </ScrollView>

      {/* Input Bar & End Session Button */}
      <VStack className="p-4 border-t border-border bg-card gap-2.5">
        <HStack className="items-center gap-2">
          <Input className="flex-1 h-[52px] rounded-full border border-border bg-background px-4">
            <InputField
              placeholder="Tulis pesan..."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
              className="text-foreground text-sm"
            />
          </Input>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kirim pesan"
            onPress={handleSendMessage}
            className="w-12 h-12 rounded-full bg-foreground items-center justify-center active:opacity-80"
          >
            <Send size={18} color="#ffffff" />
          </Pressable>
        </HStack>

        <Button
          variant="outline"
          className="h-11 border border-border rounded-xl"
          onPress={onEndSession}
        >
          <ButtonText className="text-foreground font-semibold">
            Akhiri Sesi
          </ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
