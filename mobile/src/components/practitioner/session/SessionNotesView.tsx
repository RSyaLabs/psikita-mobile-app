import React, { useState } from "react";
import {
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Pressable,
  Text,
  Textarea,
  TextareaInput,
  VStack,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react-native";

export interface SessionNotesViewProps {
  initialNotes?: string;
  onSaveAndClose: (notes: string) => void;
}

export function SessionNotesView({
  initialNotes = "",
  onSaveAndClose,
}: SessionNotesViewProps) {
  const [notes, setNotes] = useState(
    initialNotes ||
      "S: Pasien mengeluhkan kecemasan tinggi dan sulit tidur dalam 3 minggu terakhir.\nO: Tampak cemas, afek terbatas. Skor GAD-7: 14 (Sedang).\nA: Generalized anxiety symptoms dengan insomnia sekunder.\nP: Edukasi sleep hygiene, cognitive reframing, dan rencana tindak lanjut minggu depan.",
  );

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => onSaveAndClose(notes)}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Catatan sesi
        </Heading>
      </HStack>

      <VStack className="flex-1 px-5 py-4 gap-3">
        {/* Privacy notice */}
        <Box className="border border-border rounded-xl p-3.5 bg-muted/40">
          <Text size="sm" className="text-foreground leading-relaxed">
            Catatan ini privat. Pasien tidak bisa melihatnya.
          </Text>
        </Box>

        {/* Notes Textarea */}
        <Textarea className="flex-1 rounded-xl border border-border bg-card p-3 min-h-[220px]">
          <TextareaInput
            placeholder="Tulis catatan klinis..."
            value={notes}
            onChangeText={setNotes}
            className="text-foreground text-sm leading-relaxed"
          />
        </Textarea>

        <Text size="sm" className="text-muted-foreground">
          Tersimpan otomatis · 14:15
        </Text>
      </VStack>

      {/* Selesai Button */}
      <Box className="p-4 border-t border-border bg-card">
        <Button
          className="h-[52px] bg-foreground rounded-xl"
          onPress={() => onSaveAndClose(notes)}
        >
          <ButtonText className="text-background font-semibold">
            Selesai
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
