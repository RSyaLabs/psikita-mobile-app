import React from "react";
import { FileText } from "lucide-react-native";
import {
  Card,
  VStack,
  HStack,
  Box,
  Text,
  Pressable,
} from "@/components/ui";

export interface WithdrawTxRow {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
}

interface WithdrawTxHistoryCardProps {
  txItems: WithdrawTxRow[];
  onViewAll: () => void;
}

export function WithdrawTxHistoryCard({
  txItems,
  onViewAll,
}: WithdrawTxHistoryCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3.5 border border-border mb-3">
      <VStack space="sm">
        <HStack space="md" className="items-center justify-between">
          <Text size="sm" className="font-bold text-foreground">
            Riwayat transaksi
          </Text>
          <Pressable onPress={onViewAll} className="active:opacity-70">
            <Text size="xs" className="font-bold text-primary">
              Lihat semua
            </Text>
          </Pressable>
        </HStack>

        {txItems.length === 0 ? (
          <Box className="py-4 items-center justify-center">
            <Text
              size="xs"
              className="text-muted-foreground italic text-center"
            >
              Belum ada riwayat transaksi
            </Text>
          </Box>
        ) : (
          txItems.map((item, idx) => (
            <HStack
              key={item.id}
              space="md"
              className={`items-center justify-between py-1 ${
                idx < txItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <HStack space="sm" className="items-center">
                <Box className="w-8 h-8 rounded-full bg-muted items-center justify-center">
                  <FileText size={14} className="text-foreground" />
                </Box>
                <VStack space="xs">
                  <Text size="xs" className="font-bold text-foreground">
                    {item.title}
                  </Text>
                  <Text
                    size="xs"
                    className="text-[10px] text-muted-foreground"
                  >
                    {item.subtitle}
                  </Text>
                </VStack>
              </HStack>
              <Text size="xs" className="font-bold text-foreground">
                {item.amount}
              </Text>
            </HStack>
          ))
        )}
      </VStack>
    </Card>
  );
}
