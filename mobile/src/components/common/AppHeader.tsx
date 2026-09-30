import React from "react";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Box, Heading, Text, HStack, Pressable } from "@/components/ui";
import { safeNavigateBack } from "@/utils/navigation";

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  variant?: "default" | "primary";
  fallbackRoute?: string;
}

export function AppHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightAction,
  variant = "default",
  fallbackRoute = "/",
}: AppHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      safeNavigateBack(router, fallbackRoute);
    }
  };

  const isPrimary = variant === "primary";

  return (
    <Box
      className={`px-5 py-3.5 border-b ${
        isPrimary
          ? "bg-primary border-primary rounded-b-3xl"
          : "bg-card border-border"
      }`}
    >
      <HStack space="md" className="items-center justify-between">
        <HStack space="md" className="items-center flex-1 mr-2">
          {showBack && (
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Kembali ke layar sebelumnya"
              className="p-1 -ml-1 active:opacity-70"
            >
              <ArrowLeft
                size={20}
                className={
                  isPrimary ? "text-primary-foreground" : "text-foreground"
                }
              />
            </Pressable>
          )}
          <Box className="flex-1">
            <Heading
              size="sm"
              bold
              numberOfLines={1}
              className={
                isPrimary ? "text-primary-foreground" : "text-foreground"
              }
            >
              {title}
            </Heading>
            {subtitle ? (
              <Text
                size="xs"
                numberOfLines={1}
                className={
                  isPrimary
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }
              >
                {subtitle}
              </Text>
            ) : null}
          </Box>
        </HStack>

        {rightAction ? (
          <Box className="items-center justify-center">{rightAction}</Box>
        ) : null}
      </HStack>
    </Box>
  );
}
