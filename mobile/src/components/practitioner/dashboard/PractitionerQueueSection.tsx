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
              <AlertTriangle size={18} className="text-warning" />
            </Box>
            <VStack space="xs" className="flex-1">
              <Text size="xs" bold className="text-foreground">
                Status Antrian Triase
              </Text>
              <Text
                size="xs"
                className="text-muted-foreground text-[11px]"
              >
                {queueMessage}
              </Text>
            </VStack>
          </HStack>
          <Pressable
            onPress={onOpenWarRoom}
            className="p-2 rounded-xl bg-secondary/15 active:opacity-80 flex-row items-center gap-1"
          >
            <Text size="xs" className="font-bold text-secondary text-[11px]">
              Klaim
            </Text>
            <ArrowRight size={14} className="text-secondary" />
          </Pressable>
        </HStack>
      </Card>
    </VStack>
  );
}
