import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Camera, CheckCircle2 } from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  HStack,
  Pressable,
  Button,
  ButtonText,
  ButtonSpinner,
  ScrollView,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from "@/components/ui";
import { ChangePhotoModal } from "@/components/modals";
import {
  PersonalIdentitySection,
  MedicalHistorySection,
  EmergencyContactSection,
  BpjsIntegrationSection,
} from "@/components/patient/edit-profile";
import {
  usePatientProfile,
  useUpdatePatientProfile,
} from "@/hooks/useApiQueries";
import { getInitials } from "@/utils/format";
import { haptics } from "@/utils/haptics";
import { ROUTES } from "@/constants";
import { safeNavigateBack } from "@/utils/navigation";

export default function EditProfileScreen() {
  const router = useRouter();
  const toast = useToast();
  const { data: profile } = usePatientProfile();
  const updateProfileMutation = useUpdatePatientProfile();
  const isLoading = updateProfileMutation.isPending;

  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [phone, setPhone] = useState(profile?.phoneNumber || "");
  const [nik, setNik] = useState(profile?.nik || "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate || "");
  const [gender, setGender] = useState<"FEMALE" | "MALE">(
    profile?.gender === "MALE" ? "MALE" : "FEMALE",
  );
  const [bloodType, setBloodType] = useState("B");
  const [allergies, setAllergies] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [bpjsNumber, setBpjsNumber] = useState(profile?.bpjsNumber || "");
  const [faskes1, setFaskes1] = useState(profile?.faskes1 || "");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // The post-save navigation used to run on a bare setTimeout with no cleanup, so
  // a user who tapped back inside the delay was popped a second screen later by
  // an orphaned timer. The timer is now owned and cleared on unmount.
  const navigateBackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The profile query refetches on reconnect and after every save. Tracking which
  // fields the user actually edited lets the sync effect below leave those alone.
  const dirtyFields = useRef<Set<string>>(new Set());

  // Wraps a field setter so using it records that the field is dirty.
  const track =
    <T,>(field: string, setter: (value: T) => void) =>
    (value: T) => {
      dirtyFields.current.add(field);
      setter(value);
    };

  useEffect(() => {
    if (!profile) return;
    // Only fill a field the user has not touched. The profile query refetches on
    // reconnect and after every save, and filling unconditionally discarded edits
    // that had not been saved yet.
    const isDirty = (field: string) => dirtyFields.current.has(field);

    if (profile.fullName && !isDirty("fullName")) setFullName(profile.fullName);
    if (profile.phoneNumber && !isDirty("phone")) setPhone(profile.phoneNumber);
    if (profile.nik && !isDirty("nik")) setNik(profile.nik);
    if (profile.birthDate && !isDirty("birthDate"))
      setBirthDate(profile.birthDate);
    if (profile.gender && !isDirty("gender"))
      setGender(profile.gender === "MALE" ? "MALE" : "FEMALE");
    if (profile.bpjsNumber && !isDirty("bpjsNumber"))
      setBpjsNumber(profile.bpjsNumber);
    if (profile.faskes1 && !isDirty("faskes1")) setFaskes1(profile.faskes1);
  }, [profile]);

  useEffect(() => {
    return () => {
      if (navigateBackTimer.current) {
        clearTimeout(navigateBackTimer.current);
        navigateBackTimer.current = null;
      }
    };
  }, []);

  const handleSave = () => {
    haptics.medium();
    updateProfileMutation.mutate(
      {
        // Never fall back to a placeholder id. Writing to a hardcoded patient
        // would edit the wrong record while looking successful, so an unresolved
        // profile is sent as empty and rejected before a request is built.
        patientId: profile?.id ?? "",
        dto: {
          fullName,
          phoneNumber: phone,
          nik,
          bpjsNumber,
          birthDate,
          gender,
          // `address` is deliberately absent. This screen has no address input,
          // and the old payload wrote a hardcoded "Jakarta Selatan" on every save,
          // so a patient who had never entered an address still ended up with one
          // stored on the server. Omitting the key leaves the server value alone.
        },
      },
      {
        onSuccess: () => {
          setSavedSuccess(true);
          haptics.success();
          // The save succeeded, so the server is now authoritative again.
          dirtyFields.current.clear();
          toast.show({
            placement: "top",
            render: ({ id }) => (
              <Toast nativeID={id} action="success">
                <ToastTitle>Profil Berhasil Disimpan</ToastTitle>
                <ToastDescription>
                  Data pribadi dan riwayat medis Anda telah diperbarui.
                </ToastDescription>
              </Toast>
            ),
          });
          // The timer is owned and cleared on unmount. A bare setTimeout used to
          // survive the screen being left, popping a second screen afterwards.
          navigateBackTimer.current = setTimeout(() => {
            navigateBackTimer.current = null;
            safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
          }, 800);
        },
        onError: () => {
          haptics.error();
          safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <HStack
        space="sm"
        className="items-center justify-between px-5 pt-3.5 pb-2"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={() => {
            haptics.light();
            safeNavigateBack(router, ROUTES.PATIENT.PROFILE);
          }}
          className="w-10 h-10 rounded-full bg-card border border-border items-center justify-center active:bg-muted"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </Pressable>
        <Heading size="sm" bold className="text-foreground">
          Ubah Profil Medis
        </Heading>
        <Box className="w-10" />
      </HStack>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 10,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar with Camera Icon */}
        <Box className="items-center my-3">
          <Box className="relative">
            <Avatar size="2xl" className="border-2 border-border shadow-sm">
              <AvatarImage
                source={{
                  uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
                }}
              />
              {/* getInitials falls back to the generic "PK", not a borrowed
                  person's name, so an empty field never greets the patient as
                  someone they are not. */}
              <AvatarFallbackText>{getInitials(fullName)}</AvatarFallbackText>
            </Avatar>
            <Pressable
              onPress={() => {
                haptics.light();
                setShowPhotoModal(true);
              }}
              accessibilityRole="button"
              accessibilityLabel="Ubah foto profil"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary items-center justify-center border-2 border-card shadow-sm active:bg-secondary/90"
            >
              <Camera size={14} className="text-secondary-foreground" />
            </Pressable>
          </Box>
          <Text size="xs" className="text-muted-foreground mt-2 font-medium">
            Ketuk ikon kamera untuk mengubah foto profil
          </Text>
        </Box>

        {/* Success Alert Banner */}
        {savedSuccess && (
          <Box className="bg-secondary/10 border border-secondary/20 rounded-2xl p-3.5 mb-4 flex-row items-center gap-2">
            <CheckCircle2 size={18} className="text-secondary" />
            <Text size="xs" bold className="text-secondary flex-1">
              Data profil dan kontak darurat berhasil diperbarui!
            </Text>
          </Box>
        )}

        {/* Section 1: Data Identitas & Satu Sehat */}
        <PersonalIdentitySection
          fullName={fullName}
          onChangeFullName={track("fullName", setFullName)}
          nik={nik}
          onChangeNik={track("nik", setNik)}
          birthDate={birthDate}
          onChangeBirthDate={track("birthDate", setBirthDate)}
          gender={gender}
          onChangeGender={track("gender", setGender)}
          phone={phone}
          onChangePhone={track("phone", setPhone)}
        />

        {/* Section 2: Data Medis */}
        <MedicalHistorySection
          bloodType={bloodType}
          onChangeBloodType={setBloodType}
          allergies={allergies}
          onChangeAllergies={setAllergies}
        />

        {/* Section 3: Kontak Darurat */}
        <EmergencyContactSection
          emergencyContactName={emergencyContactName}
          onChangeEmergencyContactName={setEmergencyContactName}
          emergencyPhone={emergencyPhone}
          onChangeEmergencyPhone={setEmergencyPhone}
        />

        {/* Section 4: BPJS Kesehatan */}
        <BpjsIntegrationSection
          bpjsNumber={bpjsNumber}
          onChangeBpjsNumber={track("bpjsNumber", setBpjsNumber)}
          faskes1={faskes1}
          onChangeFaskes1={track("faskes1", setFaskes1)}
        />
      </ScrollView>

      {/* Sticky Bottom Save Bar */}
      <Box className="absolute bottom-0 left-0 right-0 bg-card border-t border-border px-5 py-4">
        <Button
          size="lg"
          isDisabled={isLoading}
          onPress={handleSave}
          className="w-full bg-primary h-12 rounded-2xl"
        >
          {isLoading ? (
            <ButtonSpinner className="text-primary-foreground" />
          ) : (
            <ButtonText className="text-sm font-bold text-primary-foreground">
              Simpan Perubahan Profil
            </ButtonText>
          )}
        </Button>
      </Box>

      {/* Pop-up Modal: Ganti Foto Profil */}
      <ChangePhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
      />
    </SafeAreaView>
  );
}
