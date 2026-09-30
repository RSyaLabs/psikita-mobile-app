import React, { useState, useMemo } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
} from "@/components/ui";
import { DoctorFilterModal } from "@/components/modals";
import { PatientTabBar } from "@/components/navigation/PatientTabBar";
import { DoctorDirectoryCard, DoctorDirectoryItem } from "@/components/patient";
import {
  DoctorSearchHeader,
  DoctorFilterChips,
} from "@/components/patient/doctors";
import { usePractitioners, useDebounce, usePrefetchData } from "@/hooks";
import { haptics, safeNavigateBack } from "@/utils";
import { resolveServerValue } from "@/utils/server-value";
import { ROUTES } from "@/constants";

const practitionerListOptions = {
  select: (res: { data?: Array<Record<string, any>> }) =>
    (res.data || []).map((p) => ({
      id: p.id,
      // No invented practitioner identity. Each of these used to fall back to a
      // real looking name, role, title or specialty, so an unanswered query was
      // indistinguishable from an answered one. resolveServerValue reports the
      // absence instead. Note it treats "" as absent and 0 as a real answer, so
      // truthiness is deliberately not used here.
      name: resolveServerValue(
        p.fullName,
        (v) => v,
        "Data praktisi tidak tersedia",
      ),
      role: resolveServerValue(
        p.type,
        (v) => v,
        "Jenis praktisi belum tersedia",
      ),
      title: resolveServerValue(p.title, (v) => v, "Gelar belum tersedia"),
      specialty: resolveServerValue(
        p.specialization,
        (v) => v,
        "Spesialisasi belum tersedia",
      ),
      // The server's answer, or nothing. These four used to carry invented
      // values (4.9, 50, 5, Rp 150.000) because a plain number cannot express
      // "not answered". Note `0` is a real answer and is preserved: the old
      // `||` turned a legitimate zero rating into 4.9.
      rating: p.rating ?? null,
      reviewsCount: p.totalSessions ?? null,
      experienceYears: p.experienceYears ?? null,
      fee: p.consultationFee ?? null,
      isOnline: p.availabilityStatus === "AVAILABLE",
      // The stock portrait was a real stranger's face shown as this
      // practitioner. With no server image the avatar falls back to initials.
      avatar: resolveServerValue(p.avatar, (v) => v, ""),
      // Whatever the server sent, nothing more. `?? true` claimed BPJS
      // acceptance the server never stated, and a missing value now simply
      // shows no BPJS badge instead of a false one.
      supportsBpjs: p.supportsBpjs,
    })),
};

const FILTERS = [
  "Semua",
  "Psikolog Klinis",
  "Psikiater (Sp.KJ)",
  "Konseling Remaja",
  "BPJS",
];

export default function DoctorsDirectoryScreen() {
  const router = useRouter();
  const { prefetchPractitioner } = usePrefetchData();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedFilter, setSelectedFilter] = useState("Semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterBpjsOnly, setFilterBpjsOnly] = useState(false);
  const [filterOnlineOnly, setFilterOnlineOnly] = useState(false);
  const [filterPriceRange, setFilterPriceRange] = useState("Semua");

  const { data: sourceDoctors = [] } = usePractitioners(
    undefined,
    practitionerListOptions,
  );

  const filteredDoctors = useMemo(() => {
    return sourceDoctors.filter((doc) => {
      const matchSearch =
        doc.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.role.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.title.toLowerCase().includes(debouncedSearch.toLowerCase());

      if (!matchSearch) return false;
      if (filterBpjsOnly && !doc.supportsBpjs) return false;
      if (filterOnlineOnly && !doc.isOnline) return false;

      if (filterPriceRange === "< 150rb" && doc.fee >= 150000) return false;
      if (
        filterPriceRange === "150rb - 250rb" &&
        (doc.fee < 150000 || doc.fee > 250000)
      )
        return false;
      if (filterPriceRange === "> 250rb" && doc.fee <= 250000) return false;

      if (selectedFilter === "Semua") return true;
      if (selectedFilter === "Psikolog Klinis") {
        const r = doc.role.toUpperCase();
        return r.includes("PSYCHOLOGIST") || r.includes("PSIKOLOG");
      }
      if (selectedFilter === "Psikiater (Sp.KJ)") {
        const r = doc.role.toUpperCase();
        return r.includes("PSYCHIATRIST") || r.includes("PSIKIATER");
      }
      if (selectedFilter === "Konseling Remaja") {
        const text = `${doc.specialty} ${doc.title} ${doc.name}`.toLowerCase();
        return text.includes("remaja");
      }
      if (selectedFilter === "BPJS") return Boolean(doc.supportsBpjs);
      return true;
    });
  }, [
    sourceDoctors,
    debouncedSearch,
    filterBpjsOnly,
    filterOnlineOnly,
    filterPriceRange,
    selectedFilter,
  ]);

  const handleSelectDoctor = (doctor: DoctorDirectoryItem) => {
    haptics.medium();
    router.push({
      pathname: ROUTES.PATIENT.DOCTOR_DETAIL,
      params: {
        id: doctor.id,
        name: doctor.name,
        role: doctor.role,
        title: doctor.title,
        specialty: doctor.specialty,
        rating: doctor.rating?.toString() ?? "",
        reviewsCount: doctor.reviewsCount?.toString() ?? "",
        experienceYears: doctor.experienceYears?.toString() ?? "",
        fee: doctor.fee?.toString() ?? "",
        avatar: doctor.avatar,
      },
    });
  };

  const hasActiveFilters =
    filterBpjsOnly ||
    filterOnlineOnly ||
    filterPriceRange !== "Semua" ||
    selectedFilter !== "Semua";

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Top Header */}
      <HStack
        space="sm"
        className="items-center justify-between px-5 pt-3.5 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali ke Dashboard Pasien"
          onPress={() => safeNavigateBack(router, ROUTES.PATIENT.DASHBOARD)}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Pilih Praktisi
        </Heading>
        <Box className="w-10" />
      </HStack>

      <DoctorSearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenFilter={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <DoctorFilterChips
        filters={FILTERS}
        selectedFilter={selectedFilter}
        onSelectFilter={setSelectedFilter}
      />

      {/* Doctor List */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filteredDoctors.length === 0 ? (
          <Box className="py-12 items-center justify-center">
            <Text size="sm" className="font-bold text-foreground">
              Tidak ada praktisi ditemukan
            </Text>
            <Text
              size="xs"
              className="text-muted-foreground text-center mt-1 max-w-[280px]"
            >
              Coba ganti filter spesialisasi atau ubah kata kunci pencarian
              Anda.
            </Text>
            <Button
              size="sm"
              variant="outline"
              onPress={() => {
                haptics.light();
                setSearchQuery("");
                setSelectedFilter("Semua");
                setFilterBpjsOnly(false);
                setFilterOnlineOnly(false);
                setFilterPriceRange("Semua");
              }}
              className="mt-4 border-border rounded-xl bg-muted"
            >
              <ButtonText className="text-xs text-foreground font-semibold">
                Reset Filter & Pencarian
              </ButtonText>
            </Button>
          </Box>
        ) : (
          <VStack space="md">
            {filteredDoctors.map((doc) => (
              <DoctorDirectoryCard
                key={doc.id}
                doctor={doc}
                onSelect={handleSelectDoctor}
                onPrefetch={prefetchPractitioner}
              />
            ))}
          </VStack>
        )}
      </ScrollView>

      <PatientTabBar activeTab="sesi" />

      <DoctorFilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
        filterOnlineOnly={filterOnlineOnly}
        setFilterOnlineOnly={setFilterOnlineOnly}
        filterBpjsOnly={filterBpjsOnly}
        setFilterBpjsOnly={setFilterBpjsOnly}
        filterPriceRange={filterPriceRange}
        setFilterPriceRange={setFilterPriceRange}
        onApply={() => setShowFilterModal(false)}
        onReset={() => {
          setSelectedFilter("Semua");
          setFilterBpjsOnly(false);
          setFilterOnlineOnly(false);
          setFilterPriceRange("Semua");
          setShowFilterModal(false);
        }}
      />
    </SafeAreaView>
  );
}
