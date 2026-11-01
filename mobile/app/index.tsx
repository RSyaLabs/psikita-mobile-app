import React from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { Text, Heading, VStack, Box } from "@/components/ui";
import { useAuth, getHomeRouteForRole } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import { colors } from "@/theme/colors";

export default function IndexGatewayScreen() {
  const { status, user, isAuthenticated } = useAuth();

  if (status === "loading") {
    return (
      <View
        className="flex-1 items-center justify-center bg-background px-6"
        style={{ backgroundColor: colors.sera.cream }}
      >
        <VStack space="lg" className="items-center">
          <Box className="w-24 h-24 rounded-3xl overflow-hidden items-center justify-center bg-card border border-border">
            <Image
              source={require("../assets/icon.png")}
              style={{ width: 76, height: 76 }}
              resizeMode="contain"
            />
          </Box>
          <VStack space="xs" className="items-center">
            <Heading size="2xl" bold className="text-foreground tracking-tight">
              SeraPhany
            </Heading>
            <Text size="sm" className="text-muted-foreground text-center">
              Ruang aman untuk bercerita
            </Text>
          </VStack>
          <Box className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator size="small" color={colors.sera.purple} />
            <Text size="xs" className="text-muted-foreground">
              Menyiapkan ruang aman...
            </Text>
          </Box>
        </VStack>
      </View>
    );
  }

  if (isAuthenticated && user) {
    const targetRoute = getHomeRouteForRole(user.role);
    return <Redirect href={targetRoute as any} />;
  }

  return <Redirect href={ROUTES.AUTH.LOGIN as any} />;
}
