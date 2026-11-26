import React from "react";
import {
  Box,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react-native";
import { EmptyState } from "@/components/common";

export interface PayoutHistoryItem {
  id: string;
  period: string;
  amount: string;
  statusText: string;
  badgeText: string;
  status: "PAID" | "PROCESSING" | "FAILED";
}

export interface PayoutHistoryListViewProps {
  items?: PayoutHistoryItem[];
  onSelectPayout: (item: PayoutHistoryItem) => void;
  onOpenBankSettings?: () => void;
  onOpenHelp?: () => void;
  onBack: () => void;
}

export function PayoutHistoryListView({
  items = [],
  onSelectPayout,
  onOpenBankSettings,
  onOpenHelp,
  onBack,
}: PayoutHistoryListViewProps) {
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <HStack className="items-center px-4 py-3 border-b border-border bg-card gap-2">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          className="w-11 h-11 items-center justify-center -ml-2"
        >
          <ArrowLeft size={22} color="#262130" />
        </Pressable>
        <Heading size="md" bold className="text-foreground">
          Riwayat pencairan
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Payout History List */}
        {items.length === 0 ? (
          <EmptyState
            label="Belum ada riwayat pencairan"
            description="Pencairan akan muncul di sini setelah diproses oleh sistem keuangan."
          />
        ) : (
          <Box className="border border-border rounded-2xl bg-card overflow-hidden">
            {items.map((item, idx) => (
              <React.Fragment key={item.id}>
                {idx > 0 && <Box className="border-t border-dashed border-border" />}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Pencairan periode ${item.period}`}
                  onPress={() => onSelectPayout(item)}
                  className="flex-row items-center justify-between p-4 min-h-[72px] active:bg-muted/50"
                >
                  <VStack space="xs" className="flex-1 pr-3">
                    <Text size="sm" bold className="text-foreground">
                      {item.period}
                    </Text>
                    <Text size="sm" className="text-muted-foreground">
                      {item.statusText}
                    </Text>
                  </VStack>

                  <Text
                    size="sm"
                    bold
                    className={
                      item.status === "FAILED" ? "text-destructive" : "text-foreground"
                    }
                  >
                    {item.badgeText}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Info Box 1 */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-foreground leading-relaxed">
            Pencairan berjalan otomatis sesuai jadwal. Jika gagal, perbarui{" "}
            <Text
              size="sm"
              bold
              className="text-foreground underline"
              onPress={onOpenBankSettings}
            >
              rekening bank
            </Text>{" "}
            dan sistem mencoba lagi.
          </Text>
        </Box>

        {/* Info Box 2 */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Status dan jadwal pencairan dari sistem keuangan. Tidak ada tombol cairkan.
          </Text>
        </Box>

        {/* Help Link */}
        {onOpenHelp && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pertanyaan soal pencairan"
            onPress={onOpenHelp}
            className="min-h-[44px] items-center justify-center mt-auto"
          >
            <Text size="sm" bold className="text-foreground">
              Pertanyaan soal pencairan?
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </Box>
  );
}
