import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Download, FileText } from "lucide-react-native";
import {
  Box,
  Button,
  ButtonText,
  Card,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from "@/components/ui";
import { BackendIntegrationBanner } from "@/components/common";
import { ROUTES } from "@/constants";
import {
  useActiveConsultation,
  useConsultationNotes,
} from "@/hooks/useApiQueries";
import { resolveServerValue } from "@/utils/server-value";
import { haptics } from "@/utils/haptics";
import { safeNavigateBack } from "@/utils/navigation";

const SOAP_FIELDS = [
  { key: "assessment", label: "Assessment" },
  { key: "subjective", label: "Subjective" },
  { key: "objective", label: "Objective" },
  { key: "plan", label: "Plan" },
] as const;

export default function SessionSummaryScreen() {
  const router = useRouter();
  const { consultationId: routeConsultationId } = useLocalSearchParams<{
    consultationId?: string;
  }>();
  // Route value only, and the notes lookup only ever uses a server-issued id
  // or an empty string. Both hooks are disabled on an empty value, so a missing
  // route id produces no request and the card below says exactly that.
  const consultationId = Array.isArray(routeConsultationId)
    ? routeConsultationId[0]
    : routeConsultationId;
  const consultation = useActiveConsultation(consultationId);
  const context = consultation.context;
  const targetConsultationId = context?.consultationId || consultationId || "";
  const notesQuery = useConsultationNotes(targetConsultationId);
  const note = notesQuery.data?.[0];
  const soap = note?.soap ?? note?.soapData;

  // A SOAP section is only rendered when the server actually sent that section.
  // resolveServerValue drops an absent or blank field, so the previous screen
  // that printed a full clinical narrative for a session with no note is gone.
  const receivedSections = soap
    ? SOAP_FIELDS.map((field) => ({
        key: field.key,
        label: field.label,
        value: resolveServerValue(soap[field.key], (v) => v, ""),
      })).filter((section) => section.value !== "")
    : [];

  const hasOfficialNote = receivedSections.length > 0;

  const downloadDisabledButton = (
// Gluestack renders isDisabled as opacity 0.4 on the whole button, so the label
// fades toward whatever is behind it whichever foreground is chosen: measured
// at 1.32:1 with the muted foreground and still 1.51:1 with the light one.
// Dimming the surface rather than the label keeps the notice readable.
    <Button
      isDisabled
      onPress={() => haptics.error()}
      className="rounded-xl mt-2 bg-muted border border-border !opacity-100"
    >
      <FileText size={16} className="text-muted-foreground" />
      <ButtonText className="text-muted-foreground">
        Unduh PDF belum tersedia
      </ButtonText>
    </Button>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="bg-card px-4 py-3 border-b border-border">
        <HStack space="sm" className="items-center justify-between">
          <Pressable
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.HISTORY)}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="p-1 -ml-1"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </Pressable>
          <Heading size="sm" bold className="text-foreground">
            Ringkasan SOAP
          </Heading>
          <Pressable
            disabled
            onPress={() => haptics.error()}
            accessibilityRole="button"
            accessibilityLabel="Unduh PDF belum tersedia"
            className="p-1 opacity-50"
          >
            <Download size={18} className="text-foreground" />
          </Pressable>
        </HStack>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {!hasOfficialNote ? (
          <VStack space="sm">
            <BackendIntegrationBanner
              endpoint="GET /notes/consultation/:id"
              title="Catatan SOAP resmi belum tersedia"
              description="Server belum mengirim catatan SOAP untuk sesi ini. Yang tampil di bawah adalah status sebenarnya, bukan contoh isi rekam medis."
            />

            <Card className="bg-card rounded-3xl p-4 border border-border gap-2">
              <Text size="xs" bold className="text-secondary">
                RINGKASAN SESI
              </Text>
              <Heading size="sm" bold className="text-foreground">
                Belum ada catatan sesi
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                {context
                  ? `Status server: ${context.status}. Practical has not released a SOAP note for this session yet.`
                  : consultationId
                    ? "Belum ada jawaban server untuk sesi ini."
                    : "Layar ini butuh consultationId dari navigasi. Tanpa ID itu tidak ada permintaan ke server."}
              </Text>
              <Text size="xs" className="text-muted-foreground">
                Ask your practical when the session note is available. Until
                then there is no assessment, subjective, objective or plan to
                display.
              </Text>
            </Card>

            {downloadDisabledButton}
          </VStack>
        ) : (
          <VStack space="sm">
            <Card className="bg-card rounded-3xl p-4 border border-border gap-2">
              <Text size="xs" bold className="text-secondary">
                RINGKASAN SESI
              </Text>
              <Heading size="sm" bold className="text-foreground">
                Konsultasi
              </Heading>
              <Text size="xs" className="text-muted-foreground">
                Status server: {context?.status ?? "Tersedia"}
              </Text>
            </Card>
            {receivedSections.map((section) => (
              <Card
                key={section.key}
                className="bg-card rounded-2xl p-4 border border-border gap-2"
              >
                <Text size="xs" bold className="text-muted-foreground">
                  {section.label}
                </Text>
                <Text size="sm" className="text-foreground">
                  {section.value}
                </Text>
              </Card>
            ))}
            {downloadDisabledButton}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
