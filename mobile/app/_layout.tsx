import "../global.css";
import "@/utils/alert";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ReduceMotion, ReducedMotionConfig } from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Box } from "@/components/ui";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";
import { DevFixtureBanner } from "@/components/common/DevFixtureBanner";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  const { width, height } = useWindowDimensions();
  const isDesktopWeb = Platform.OS === "web" && width > 480;

  // Box is a raw div on web, so `style` has to be one object, not an array.
  const outerStyle = isDesktopWeb
    ? { ...styles.outerContainer, ...styles.desktopOuterContainer }
    : styles.outerContainer;
  const mobileStyle = isDesktopWeb
    ? {
        ...styles.mobileContainer,
        ...styles.desktopMobileContainer,
        maxHeight:
          height > 500
            ? Math.min(height - 40, 920)
            : ("92%" as unknown as number),
      }
    : styles.mobileContainer;

  return (
    <AppErrorBoundary>
      {/*
       * Every modal, action sheet and alert dialog in this app animates with an
       * unconditional Reanimated entering/exiting layout, and nothing in the app
       * consumed the OS reduced-motion setting. The only reduced-motion handling
       * was a CSS media query in global.css, which affects web only. This config
       * is a single declaration, not a wrapper: it makes all Reanimated
       * animations honour the platform setting without editing each component.
       */}
      <ReducedMotionConfig mode={ReduceMotion.System} />
      <SafeAreaProvider>
        {/*
         * Provider order here is load-bearing, not a style preference.
         *
         * Gluestack's OverlayProvider lives INSIDE GluestackUIProvider, and its
         * portal renders Modal content as siblings of `props.children` rather
         * than inside them. Every provider nested below GluestackUIProvider is
         * therefore invisible to whatever a Modal renders, on web and native
         * alike, because that subtree is mounted beside the app tree rather than
         * within it.
         *
         * With QueryProvider down here, a Modal child calling useMutation or
         * useQueryClient threw "No QueryClient set, use QueryClientProvider to
         * set one" and took the whole app down behind it, because
         * AppErrorBoundary wraps everything. ForgotPasswordView did exactly
         * that: it is rendered from inside ModalBody and calls useRequestOtp.
         *
         * The jest suite never saw it. __tests__/utils/test-utils.tsx nested the
         * query client ABOVE Gluestack, so the passing LoginForm test that drives
         * the forgot-password flow was asserting a tree the app never runs.
         *
         * So query and auth go ABOVE Gluestack, never below it. The regression
         * test in __tests__/providers/modal-query-context.test.tsx pins both the
         * order and the portal behaviour.
         */}
        <QueryProvider>
          <AuthProvider>
            <GluestackUIProvider mode="light">
              <StatusBar style="dark" backgroundColor={colors.sage.DEFAULT} />
              {/* Box renders a raw <div> on web, and React DOM only accepts a
                  plain object for `style`. An array compiles on native, where
                  View flattens it, and then throws on web with
                  "Failed to set an indexed property [0] on CSSStyleDeclaration",
                  which took the whole app down before login. Compose objects. */}
              <Box style={outerStyle}>
                <Box style={mobileStyle}>
                  {/*
                   * The fixture banner sits above the navigator, framed inside the
                   * mobile container so it aligns with the phone viewport width.
                   */}
                  <DevFixtureBanner />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: colors.sage.DEFAULT },
                      animation: "fade_from_bottom",
                    }}
                  >
                    <Stack.Screen
                      name="index"
                      options={{ title: "PsiKita Navigation" }}
                    />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(patient)" />
                    <Stack.Screen name="(practitioner)" />
                    <Stack.Screen name="(admin)" />
                  </Stack>
                </Box>
              </Box>
            </GluestackUIProvider>
          </AuthProvider>
        </QueryProvider>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.sage.DEFAULT,
    ...(Platform.OS === "web"
      ? {
          height: "100vh" as any,
          overflow: "hidden",
        }
      : {}),
  },
  desktopOuterContainer: {
    backgroundColor: colors.forest.dark,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  mobileContainer: {
    width: "100%",
    maxWidth: 430,
    flex: 1,
    height: "100%",
    alignSelf: "center",
    backgroundColor: colors.sage.DEFAULT,
    position: "relative",
    overflow: "hidden",
  },
  desktopMobileContainer: {
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
});
