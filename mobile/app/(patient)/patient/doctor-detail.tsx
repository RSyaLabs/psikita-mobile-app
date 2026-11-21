import React, { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Heart } from "lucide-react-native";
import {
  Box,
  HStack,
  Heading,
  Pressable,
  ScrollView,
} from "@/components/ui";
import {
  DoctorHeroCard,
  DoctorAboutCard,
  DoctorScheduleSelector,
  DoctorBookingBar,
} from "@/components/patient/doctor-detail";
import { haptics, safeNavigateBack, formatRupiah } from "@/utils";
import { usePractitioner } from "@/hooks/useApiQueries";
import { resolveServerValue } from "@/utils/server-value";
import { ROUTES } from "@/constants";

export default function DoctorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    doctorId?: string;
    name?: string;
    role?: string;
    title?: string;
    specialty?: string;
    rating?: string;
    reviewsCount?: string;
    experienceYears?: string;
    fee?: string;
    avatar?: string;
  }>();

  // Route value only. Support both id and doctorId params.
  const doctorId = params.id || params.doctorId;
  const { data: remoteDoctor } = usePractitioner(doctorId);

  // No invented practitioner. Every one of these used to fall back to a real
  // looking doctor, a real looking 4.9 rating and a real looking Rp 150.000
  // fee, which the user had no way to tell apart from an answered query.
  // resolveServerValue only ever reports "not answered" now.
  const doctorName = resolveServerValue(
    remoteDoctor?.fullName ?? params.name,
    (v) => v,
    "Nama praktisi belum tersedia",
  );
  const doctorRole = resolveServerValue(
    remoteDoctor?.type ?? params.role,
    (v) => v,
    "Jenis praktisi belum tersedia",
  );
  const doctorTitle = resolveServerValue(
    remoteDoctor?.title ?? params.title,
    (v) => v,
    "Gelar belum tersedia",
  );
  const doctorRating = resolveServerValue(
    remoteDoctor?.rating ??
      (remoteDoctor as any)?.averageRating ??
      params.rating,
    (v) => v.toString(),
    "Belum tersedia",
  );
  const doctorReviews = resolveServerValue(
    remoteDoctor?.totalSessions ?? params.reviewsCount,
    (v) => v.toString(),
    "Belum tersedia",
  );
  const doctorExp = resolveServerValue(
    remoteDoctor?.experienceYears ?? params.experienceYears,
    (v) => `${v} Thn`,
    "Belum tersedia",
  );
  const doctorFee = resolveServerValue(
    remoteDoctor?.consultationFee ??
      (params.fee ? parseInt(params.fee, 10) : null),
    (v) => formatRupiah(v),
    "Tarif belum tersedia",
  );
  // The stock portrait was a real stranger's face presented as this
  // practitioner. With no server image the avatar falls back to initials.
  const doctorAvatar = params.avatar || remoteDoctor?.avatar || "";

  const [selectedSlot, setSelectedSlot] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  // There is no availability endpoint yet, so there is nothing to offer. The
  // previous list of three fixed times looked bookable and was never the
  // practitioner's actual schedule.
  const slots: string[] = [];

  const handleBooking = () => {
    // Without a server-issued practitioner id there is nothing to book, so no
    // checkout is opened. The previous fallback still navigated, carrying an id
    // that exists nowhere on the server.
    if (!doctorId) {
      haptics.error();
      return;
    }
    haptics.medium();
    router.push({
      pathname: ROUTES.PATIENT.CHECKOUT,
      params: {
        doctorId,
        doctorName,
        doctorRole,
        doctorTitle,
        doctorAvatar,
        slot: selectedSlot,
        fee: doctorFee.toString(),
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Box className="w-full max-w-[640px] md:max-w-[720px] self-center flex-1">
        {/* Top Bar */}
        <HStack
          space="sm"
          className="items-center justify-between px-5 pt-3.5 pb-2"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali ke Daftar Praktisi"
            onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DOCTORS)}
            className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={20} color="#262130" strokeWidth={2} />
          </Pressable>
          <Heading size="sm" bold className="text-foreground">
            Profil Praktisi
          </Heading>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Favorit"
            onPress={() => {
              haptics.light();
              setIsFavorite(!isFavorite);
            }}
            className="w-10 h-10 rounded-xl bg-card border border-border/80 items-center justify-center active:bg-muted"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart
              size={18}
              color={isFavorite ? "#DC2626" : "#75618E"}
              fill={isFavorite ? "#DC2626" : "none"}
            />
          </Pressable>
        </HStack>

        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <DoctorHeroCard
            doctorName={doctorName}
            doctorTitle={doctorTitle}
            doctorAvatar={doctorAvatar}
            doctorExp={doctorExp}
            doctorReviews={doctorReviews}
            doctorRating={doctorRating}
            sipNumber={
              remoteDoctor?.strNumber
                ? `STR: ${remoteDoctor.strNumber} • Kemenkes`
                : remoteDoctor?.sippNumber
                  ? `SIP: ${remoteDoctor.sippNumber} • Kemenkes`
                  : "Praktisi Terverifikasi • SIP Kemenkes"
            }
          />

          <DoctorAboutCard />

          <DoctorScheduleSelector
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </ScrollView>
      </Box>

      <DoctorBookingBar feeLabel={doctorFee} onBooking={handleBooking} />
    </SafeAreaView>
  );
}
