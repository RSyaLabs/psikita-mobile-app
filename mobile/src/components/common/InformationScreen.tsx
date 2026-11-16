import React from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Box, Heading, Text, VStack, Pressable, ScrollView } from "@/components/ui";

type InformationItem = { title: string; description?: string };

export function InformationScreen({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: readonly InformationItem[];
}) {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <Box className="w-full max-w-[520px] self-center">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={() => router.back()}
            className="self-start p-3 -ml-3 rounded-full active:bg-muted"
          >
            <ArrowLeft size={22} className="text-foreground" />
          </Pressable>
          <VStack space="sm" className="pt-6 pb-8">
            <Heading level={1} size="2xl" bold className="text-foreground">{title}</Heading>
            {description ? <Text className="text-muted-foreground">{description}</Text> : null}
          </VStack>
          <VStack space="sm">
            {items.map((item) => (
              <Box key={item.title} className="bg-card border border-border rounded-xl px-4 py-4">
                <Text className="text-base font-semibold text-foreground mb-2">{item.title}</Text>
                {item.description ? <Text className="text-sm text-muted-foreground">{item.description}</Text> : null}
              </Box>
            ))}
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
