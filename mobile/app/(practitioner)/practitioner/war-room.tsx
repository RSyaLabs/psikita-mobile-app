import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Alert } from "react-native";
import {
  NewCaseListView,
  CaseSummaryView,
  CaseAcceptedView,
  OfferExpiredView,
  CaseTakenView,
  MyCasesListView,
  MatchingOfferItem,
} from "@/components/practitioner/war-room";
import { PractitionerTabBar } from "@/components/navigation";
import { useMatchingOffers, useClaimMatching } from "@/hooks/useApiQueries";
import { ROUTES } from "@/constants/routes";
import { safeNavigateBack } from "@/utils/navigation";
import { haptics } from "@/utils/haptics";

export type WarRoomView =
  | "offers"
  | "summary"
  | "accepted"
  | "expired"
  | "taken"
  | "my-cases";

export default function WarRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ view?: WarRoomView; offerId?: string; caseId?: string; guest?: string }>();
  const isGuest = params.guest === "true";
  const [view, setView] = useState<WarRoomView>(params.view || "offers");
  const [selectedOffer, setSelectedOffer] = useState<MatchingOfferItem | null>(null);
  const [acceptedConsultationId, setAcceptedConsultationId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (params.view) {
      setView(params.view);
    }
  }, [params.view]);

  const offersQuery = useMatchingOffers();
  const claimMutation = useClaimMatching();

  // Map server offers to MatchingOfferItem if available
  const mappedOffers: MatchingOfferItem[] | undefined =
    offersQuery.data && offersQuery.data.length > 0
      ? offersQuery.data.map((item, idx) => {
          const acuity = item.brief?.acuity?.toLowerCase() || "mild";
          const isUrgent = acuity === "critical" || acuity === "severe";
          const isModerate = acuity === "moderate";
          return {
            id: item.matchingRequestId || `srv-${idx}`,
            urgency: (isUrgent ? "Mendesak" : isModerate ? "Sedang" : "Terjadwal") as "Mendesak" | "Sedang" | "Terjadwal",
            remainingTime: item.deadlineAt
              ? new Date(item.deadlineAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
              : "02:10",
            chiefComplaint: item.brief?.chiefComplaint || "Konsultasi Klinis",
            functionalImpact: item.brief?.summaryText || "Membutuhkan asesmen dan pendampingan psikologis.",
            waitingMinutes: 5,
          };
        })
      : isGuest
        ? undefined
        : [];

  const handleSelectOffer = (offer: MatchingOfferItem) => {
    setSelectedOffer(offer);
    setView("summary");
  };

  const handleAcceptCase = () => {
    haptics.medium();
    if (isGuest) {
      setView("accepted");
      return;
    }

    if (!selectedOffer?.id || selectedOffer.id.startsWith("off-")) {
      haptics.error();
      Alert.alert("Kasus Tidak Valid", "Pilih penawaran kasus aktif dari antrean server.");
      setView("offers");
      return;
    }

    claimMutation.mutate(selectedOffer.id, {
      onSuccess: (res) => {
        haptics.success();
        setAcceptedConsultationId(res?.consultationId || res?.activeConsultation?.consultationId);
        setView("accepted");
      },
      onError: (err: any) => {
        haptics.error();
        if (err?.message?.toLowerCase().includes("expired")) {
          setView("expired");
        } else {
          setView("taken");
        }
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FAF8F5]" edges={["top", "bottom"]}>
      {view === "offers" && (
        <NewCaseListView
          offers={mappedOffers}
          onBack={() => safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)}
          onSelectOffer={handleSelectOffer}
        />
      )}

      {view === "summary" && (
        <CaseSummaryView
          caseData={selectedOffer || undefined}
          onBack={() => setView("offers")}
          onAcceptCase={handleAcceptCase}
        />
      )}

      {view === "accepted" && (
        <CaseAcceptedView
          patientName={isGuest ? "Anindya Putri" : "Pasien Terdaftar"}
          isPaid={Boolean(acceptedConsultationId)}
          onViewPatientContext={() => {
            router.push({
              pathname: ROUTES.PRACTITIONER.CHAT,
              params: {
                view: "context",
                ...(acceptedConsultationId ? { consultationId: acceptedConsultationId } : {}),
              },
            } as any);
          }}
          onEnterSession={() =>
            router.push({
              pathname: ROUTES.PRACTITIONER.CHAT,
              params: acceptedConsultationId ? { consultationId: acceptedConsultationId } : {},
            } as any)
          }
          onBackToCases={() => setView("my-cases")}
        />
      )}

      {view === "expired" && (
        <OfferExpiredView
          onViewOtherOffers={() => setView("offers")}
          onBackToDashboard={() => safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)}
        />
      )}

      {view === "taken" && (
        <CaseTakenView
          onViewOtherOffers={() => setView("offers")}
          onBackToDashboard={() => safeNavigateBack(router, ROUTES.PRACTITIONER.DASHBOARD)}
        />
      )}

      {view === "my-cases" && (
        <>
          <MyCasesListView
            onOpenSession={() => router.push(ROUTES.PRACTITIONER.CHAT as any)}
            onOpenDiagnosis={() => router.push(ROUTES.PRACTITIONER.DIAGNOSIS as any)}
            onGoToNewOffers={() => setView("offers")}
          />
          <PractitionerTabBar activeTab="kasus" />
        </>
      )}
    </SafeAreaView>
  );
}
