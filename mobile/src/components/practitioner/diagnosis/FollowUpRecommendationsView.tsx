import React from "react";
import {
  Badge,
  BadgeText,
  Box,
  Button,
  ButtonText,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { ArrowLeft } from "lucide-react-native";

interface FollowUpItem {
  id: string;
  patientName: string;
  statusText: string;
  badgeLabel: "Dipesan" | "Menunggu" | "Habis";
}

export interface FollowUpRecommendationsViewProps {
  items?: FollowUpItem[];
  onBack: () => void;
  onSelectFollowUp?: (id: string) => void;
}

export function FollowUpRecommendationsView({
  items = [],
  onBack,
  onSelectFollowUp,
}: FollowUpRecommendationsViewProps) {
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
          Tindak lanjut
        </Heading>
      </HStack>

      <ScrollView
        className="flex-1 px-5 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text size="sm" className="text-muted-foreground leading-relaxed">
          Sesi lanjutan yang kamu rekomendasikan. Pasien memesan sendiri; tidak ada pencocokan ulang.
        </Text>

        {/* List of Follow Ups */}
        <Box className="border border-border rounded-2xl bg-card overflow-hidden">
          {items.map((item, idx) => (
            <React.Fragment key={item.id}>
              {idx > 0 && <Box className="border-t border-dashed border-border" />}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Tindak lanjut ${item.patientName}`}
                onPress={() => onSelectFollowUp?.(item.id)}
                className="flex-row items-center justify-between p-4 min-h-[68px] active:bg-muted/50"
              >
                <VStack space="xs" className="flex-1 pr-3">
                  <Text size="sm" bold className="text-foreground">
                    {item.patientName}
                  </Text>
                  <Text size="sm" className="text-muted-foreground">
                    {item.statusText}
                  </Text>
                </VStack>

                <Badge
                  variant="outline"
                  className={`px-3 py-1 rounded-full ${
                    item.badgeLabel === "Dipesan"
                      ? "bg-foreground border-foreground"
                      : item.badgeLabel === "Menunggu"
                        ? "bg-muted border-border"
                        : "bg-destructive/10 border-destructive/30"
                  }`}
                >
                  <BadgeText
                    className={`text-sm font-semibold ${
                      item.badgeLabel === "Dipesan"
                        ? "text-background"
                        : item.badgeLabel === "Menunggu"
                          ? "text-foreground"
                          : "text-destructive"
                    }`}
                  >
                    {item.badgeLabel}
                  </BadgeText>
                </Badge>
              </Pressable>
            </React.Fragment>
          ))}
        </Box>

        {/* Status Notice */}
        <Box className="border border-dashed border-border rounded-xl p-3.5 bg-muted/30">
          <Text size="sm" className="text-muted-foreground leading-relaxed">
            Status tindak lanjut dari server.
          </Text>
        </Box>
      </ScrollView>

      {/* Footer Return Button */}
      <Box className="p-4 border-t border-border bg-card">
        <Button
          variant="outline"
          className="h-[52px] border border-foreground rounded-xl"
          onPress={onBack}
        >
          <ButtonText className="text-foreground font-semibold">
            Kembali ke Kasus
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
