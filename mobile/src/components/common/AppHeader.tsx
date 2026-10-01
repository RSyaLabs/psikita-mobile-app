import React from "react";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
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
            {/* Truncation is platform-specific, on both elements below. numberOfLines
                is a real react-native Text prop, so it is kept on native; on web
                Heading renders a real <h1> and Text a raw <span>, both of which
                forward the unknown prop and make React warn, so it is omitted there.
                See the longer note beside the Heading in AuthLoginModal for why
                isTruncated does not actually produce an ellipsis here. */}
            <Heading
              size="sm"
              bold
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
              className={
                isPrimary ? "text-primary-foreground" : "text-foreground"
              }
            >
              {title}
            </Heading>
            {subtitle ? (
              <Text
                size="xs"
                isTruncated
                numberOfLines={Platform.OS === "web" ? undefined : 1}
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
