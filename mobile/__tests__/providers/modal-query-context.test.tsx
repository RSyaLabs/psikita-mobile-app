import fs from "node:fs";
import path from "node:path";
import React from "react";
import { render, screen } from "@testing-library/react-native";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  GluestackUIProvider,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
} from "@/components/ui";
import { AuthProvider } from "@/providers/AuthProvider";
import { AuthLoginModal } from "@/components/modals";
import { authService } from "@/api/auth.service";

jest.mock("@/api/auth.service", () => ({
  authService: {
    loginWithPassword: jest.fn(),
    loginWithGoogle: jest.fn(),
    registerWithPassword: jest.fn(),
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
    logout: jest.fn(),
    createProfile: jest.fn(),
  },
}));

const mobileRoot = path.resolve(__dirname, "../..");
const readRootLayout = () =>
  fs.readFileSync(path.join(mobileRoot, "app", "_layout.tsx"), "utf8");
const readTestUtils = () =>
  fs.readFileSync(
    path.join(mobileRoot, "__tests__", "utils", "test-utils.tsx"),
    "utf8",
  );

/**
 * Blanks out comments while preserving every character offset, so a tag can be
 * located by position without a comment being able to answer for it.
 *
 * This matters more than it looks: app/_layout.tsx carries a long comment
 * explaining this exact bug. With a bare indexOf, one future maintainer writing
 * "<QueryProvider" in that prose would silently satisfy the structural
 * assertions while the JSX underneath regressed back to the broken order.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, " "))
    .replace(/\/\/[^\n]*/g, (line) => line.replace(/./g, " "));
}

/**
 * Returns the given tags in the order their opening tags appear, outermost
 * first. Compares names, never character offsets: an offset is a position inside
 * one file and means nothing across two different files.
 */
function providerOrder(rawSource: string, tags: string[]): string[] {
  const source = stripComments(rawSource);
  const found = tags
    .map((tag) => ({ tag, at: source.indexOf(tag) }))
    .filter(({ at }) => at >= 0)
    .sort((a, b) => a.at - b.at)
    .map(({ tag }) => tag);
  expect(found).toHaveLength(tags.length);
  return found;
}

/**
 * Isolates the body of a single `export function` in a source file. Provider
 * nesting only means anything within one component, so comparing a whole file
 * would compare unrelated helper functions against each other.
 */
function functionBody(rawSource: string, name: string): string {
  const source = stripComments(rawSource);
  const start = source.indexOf(`export function ${name}`);
  expect(start).toBeGreaterThanOrEqual(0);
  const next = source.indexOf("\nexport function ", start + 1);
  return next === -1 ? source.slice(start) : source.slice(start, next);
}

const freshClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });

/**
 * The shipped crash.
 *
 * `ForgotPasswordView` renders from inside `ModalBody` and calls `useRequestOtp`,
 * which is `useMutation`. Gluestack's `OverlayProvider` lives inside
 * `GluestackUIProvider` and its portal mounts Modal content as siblings of
 * `props.children`, so with `QueryProvider` nested below `GluestackUIProvider`
 * the query context is simply absent inside the Modal. `useMutation` then threw
 * "No QueryClient set, use QueryClientProvider to set one", and because
 * `AppErrorBoundary` wraps the entire app, the login screen was replaced by a
 * full-screen failure instead of the password-reset form.
 *
 * It reproduced 3 out of 3 in a real browser while the whole jest suite stayed
 * green: `__tests__/utils/test-utils.tsx` nested the query client BELOW
 * Gluestack, so the suite was asserting a provider tree the app never runs. The
 * tests below pin the order, prove the portal behaviour, and prove the reported
 * flow renders.
 */
describe("modal children keep the react-query context", () => {
  describe("provider order in the root layout", () => {
    it("nests query and auth ABOVE Gluestack, and closes it innermost", () => {
      // Reading the layout as text is deliberate: what matters is where each
      // provider sits, and a behavioural render of the whole navigator cannot
      // show that. The portal behaviour is pinned separately below.
      const layout = readRootLayout();

      // AuthProvider calls useQueryClient(), so it must stay under QueryProvider.
      // It renders no Gluestack component itself, so it is free to sit above the
      // provider that owns the portal.
      expect(
        providerOrder(layout, [
          "<QueryProvider",
          "<AuthProvider",
          "<GluestackUIProvider",
        ]),
      ).toEqual(["<QueryProvider", "<AuthProvider", "<GluestackUIProvider"]);

      // Asserted separately because opening tags alone would still pass if a
      // closer had been left behind, producing an unbalanced tree.
      expect(
        providerOrder(layout, [
          "</QueryProvider",
          "</AuthProvider",
          "</GluestackUIProvider",
        ]),
      ).toEqual(["</GluestackUIProvider", "</AuthProvider", "</QueryProvider"]);
    });
  });

  describe("the test harness matches the root layout", () => {
    it("renderWithAuth wraps in the same order as the app", () => {
      // This is the divergence that hid the crash: the harness put the client
      // below Gluestack while the app put it above, so no modal test could ever
      // reproduce it. If this fails, the suite is once again lying about the
      // shape of the real tree.
      const body = functionBody(readTestUtils(), "renderWithAuth");

      expect(
        providerOrder(body, [
          "<QueryClientProvider",
          "<AuthProvider",
          "<GluestackUIProvider",
        ]),
      ).toEqual([
        "<QueryClientProvider",
        "<AuthProvider",
        "<GluestackUIProvider",
      ]);
    });

    it("renderWithClient keeps the query client above Gluestack", () => {
      const body = functionBody(readTestUtils(), "renderWithClient");

      expect(
        providerOrder(body, ["<QueryClientProvider", "<GluestackUIProvider"]),
      ).toEqual(["<QueryClientProvider", "<GluestackUIProvider"]);
    });
  });

  describe("portal behaviour", () => {
    function QueryConsumer({ onReady }: { onReady: () => void }) {
      const client = useQueryClient();
      const mutation = useMutation({ mutationFn: async () => "ok" });
      if (client && mutation) {
        onReady();
      }
      return null;
    }

    function ModalHost({ onReady }: { onReady: () => void }) {
      return (
        <Modal isOpen onClose={() => {}} size="md">
          <ModalBackdrop>
            <ModalContent>
              <ModalBody>
                <QueryConsumer onReady={onReady} />
              </ModalBody>
            </ModalContent>
          </ModalBackdrop>
        </Modal>
      );
    }

    it("resolves the query client for a component rendered inside a Modal", () => {
      // The production order, exercised through the real Modal. This is the
      // direct behavioural counterpart to the layout assertions above.
      let ready = false;
      render(
        <QueryClientProvider client={freshClient()}>
          <AuthProvider>
            <GluestackUIProvider mode="light">
              <ModalHost onReady={() => (ready = true)} />
            </GluestackUIProvider>
          </AuthProvider>
        </QueryClientProvider>,
      );
      expect(ready).toBe(true);
    });

    it("still fails when the client is moved back below Gluestack", () => {
      // The control. Without this, the test above could be passing for a reason
      // unrelated to provider order, and a future regression would go unnoticed.
      // It documents that the portal really does lose context below Gluestack,
      // which is the whole mechanism this file exists to pin.
      expect(() =>
        render(
          <GluestackUIProvider mode="light">
            <QueryClientProvider client={freshClient()}>
              <AuthProvider>
                <ModalHost onReady={() => {}} />
              </AuthProvider>
            </QueryClientProvider>
          </GluestackUIProvider>,
        ),
      ).toThrow(/No QueryClient set/);
    });
  });

  describe("the reported forgot-password flow", () => {
    it("renders the reset form instead of crashing the screen", () => {
      const requestOtp = authService.requestOtp as jest.MockedFunction<
        typeof authService.requestOtp
      >;
      requestOtp.mockResolvedValue({ message: "Kode OTP berhasil dikirim" });

      // isOpen with initialTab "forgot_request" is the state the user reaches by
      // pressing "Lupa kata sandi" in the login modal. Before the fix this threw
      // inside useRequestOtp and the error boundary swallowed the screen.
      render(
        <QueryClientProvider client={freshClient()}>
          <AuthProvider>
            <GluestackUIProvider mode="light">
              <AuthLoginModal
                isOpen
                onClose={() => {}}
                initialTab="forgot_request"
              />
            </GluestackUIProvider>
          </AuthProvider>
        </QueryClientProvider>,
      );

      expect(screen.getByText("Lupa Kata Sandi")).toBeTruthy();
      expect(screen.getByPlaceholderText("email terdaftar")).toBeTruthy();
      expect(screen.getByText("Kirim Kode Verifikasi")).toBeTruthy();
    });

    it("does not reach the network just by opening the reset form", () => {
      const requestOtp = authService.requestOtp as jest.MockedFunction<
        typeof authService.requestOtp
      >;
      requestOtp.mockClear();

      render(
        <QueryClientProvider client={freshClient()}>
          <AuthProvider>
            <GluestackUIProvider mode="light">
              <AuthLoginModal
                isOpen
                onClose={() => {}}
                initialTab="forgot_request"
              />
            </GluestackUIProvider>
          </AuthProvider>
        </QueryClientProvider>,
      );

      // Rendering the form must not fire a request on its own; the user has to
      // press the button. A crash-driven retry loop would show up here.
      expect(requestOtp).not.toHaveBeenCalled();
    });
  });
});
