import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react-native";
import {
  VStack,
  Card,
  HStack,
  Box,
  Text,
  Pressable,
} from "@/components/ui";

interface PractitionerQueueSectionProps {
  queueMessage: string;
  onOpenWarRoom: () => void;
}

export function PractitionerQueueSection({
  queueMessage,
  onOpenWarRoom,
}: PractitionerQueueSectionProps) {
  return (
    <VStack space="xs" className="mb-4">
      <Text size="sm" className="font-bold text-foreground mb-1">
        Antrian aktif
      </Text>
      <Card className="bg-card rounded-2xl p-4 border border-border">
        <HStack space="md" className="items-center justify-between">
          <HStack space="sm" className="items-center flex-1 mr-2">
            <Box className="w-9 h-9 rounded-xl bg-warning/15 items-center justify-center">
              <AlertTriangle size={18} color="#D97706" />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text size="sm" bold className="text-foreground">
                Status Antrian Triase
              </Text>
              <Text
                size="sm"
                className="text-muted-foreground font-medium"
              >
                {queueMessage}
              </Text>
            </VStack>
          </HStack>
          <Pressable
            onPress={onOpenWarRoom}
            className="px-3 py-1.5 rounded-xl bg-primary/15 active:opacity-80 flex-row items-center gap-1.5"
          >
            <Text size="sm" className="font-bold text-primary text-sm">
              Klaim
            </Text>
            <ArrowRight size={15} color="#4A3B6B" />
          </Pressable>
        </HStack>
      </Card>
    </VStack>
  );
}
