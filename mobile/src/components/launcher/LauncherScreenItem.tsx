import React from "react";
import { useRouter } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { Box, HStack, Pressable, Text, VStack } from "@/components/ui";
import { CatalogScreen } from "@/data/catalog";
import { haptics } from "@/utils/haptics";
import { Platform } from "react-native";

interface LauncherScreenItemProps {
  screen: CatalogScreen;
}

export function LauncherScreenItem({ screen }: LauncherScreenItemProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        router.push(screen.route);
      }}
      accessibilityRole="button"
      accessibilityLabel={`Buka layar ${screen.id} ${screen.name}`}
      className="p-3 rounded-2xl bg-muted/60 border border-border/40 flex-row items-center justify-between active:bg-muted active:scale-[0.99] transition-all"
    >
      <HStack space="sm" className="items-center flex-1 mr-2">
        {/* Screen ID badge */}
        <Box className="bg-primary/10 border border-primary/20 px-2 py-1 rounded-lg min-w-[50px] items-center justify-center">
          <Text size="xs" className="font-bold text-primary text-[11px]">
            {screen.id}
          </Text>
        </Box>

        {/* Screen Name & Desc */}
        <VStack className="flex-1">
          <HStack space="xs" className="items-center">
            <Text
              size="sm"
              className="font-bold text-foreground"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              {screen.name}
            </Text>
            {screen.tag && (
              <Box className="bg-background/80 px-1.5 py-0.5 rounded border border-border">
                <Text
                  size="xs"
                  className="text-[9px] font-semibold text-muted-foreground"
                >
                  {screen.tag}
                </Text>
              </Box>
            )}
          </HStack>
          <Text
            size="xs"
            className="text-muted-foreground text-[11px] mt-0.5"
            isTruncated
            numberOfLines={Platform.OS === "web" ? undefined : 1}
          >
            {screen.desc}
          </Text>
        </VStack>
      </HStack>

      <ChevronRight size={16} className="text-muted-foreground" />
    </Pressable>
  );
}
