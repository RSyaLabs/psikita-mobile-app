import React, { useState } from "react";
import { Camera, ChevronLeft, Lock, Plus } from "lucide-react-native";
import { Box, Text, VStack, HStack, Pressable, Button, ButtonText, Input, InputField, Textarea, TextareaInput, Avatar, AvatarFallbackText, AvatarImage, ScrollView } from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { getInitials } from "@/utils/format";

export interface ProfessionalProfileViewProps {
  initialName?: string;
  initialBio?: string;
  initialSpecialties?: string[];
  strExpiryDate?: string;
  sipExpiryDate?: string;
  avatarUrl?: string;
  onBack: () => void;
  onCancel: () => void;
  onChangePhoto?: () => void;
  onVerifyCredentials?: () => void;
  onSave: (data: { displayName: string; bio: string; specialties: string[] }) => void;
}

export const ProfessionalProfileView = React.memo(function ProfessionalProfileView({
  initialName = "",
  initialBio = "Psikiater klinis berlisensi dengan minat khusus pada gangguan kecemasan, depresi, dan manajemen stres berbasis bukti klinis.",
  initialSpecialties = ["Kecemasan", "Tidur"],
  strExpiryDate = "15 Agu 2027",
  sipExpiryDate = "20 Okt 2026",
  avatarUrl,
  onBack,
  onCancel,
  onChangePhoto,
  onVerifyCredentials,
  onSave,
}: ProfessionalProfileViewProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [specialties, setSpecialties] = useState<string[]>(initialSpecialties);

  const handleAddSpecialty = () => {
    haptics.selection();
    const newTag = "Depresi";
    if (!specialties.includes(newTag)) setSpecialties((prev) => [...prev, newTag]);
  };

  const handleSave = () => {
    haptics.success();
    onSave({ displayName, bio, specialties });
  };

  return (
    <VStack className="flex-1 bg-background">
      <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
        <Pressable onPress={() => { haptics.selection(); onBack(); }} accessibilityRole="button" accessibilityLabel="Kembali" className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted">
          <ChevronLeft size={24} className="text-foreground" />
        </Pressable>
        <Text size="lg" bold className="text-foreground ml-1">Profil profesional</Text>
      </HStack>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <VStack space="md">
          <HStack space="md" className="items-center">
            <Avatar className="w-16 h-16 rounded-full border-2 border-primary/20 bg-primary/10 items-center justify-center">
              {avatarUrl ? (
                <AvatarImage source={{ uri: avatarUrl }} alt={displayName} />
              ) : (
                <AvatarFallbackText className="text-xl font-bold text-primary">{getInitials(displayName) || "P"}</AvatarFallbackText>
              )}
            </Avatar>
            <Pressable onPress={() => { haptics.selection(); if (onChangePhoto) onChangePhoto(); }} accessibilityRole="button" accessibilityLabel="Ganti foto profil" className="flex-row items-center space-x-1.5 py-2 px-3 rounded-xl border border-border bg-card active:bg-muted">
              <Camera size={16} color="#4A3B6B" />
              <Text size="sm" bold className="text-primary font-semibold ml-1.5">Ganti foto</Text>
            </Pressable>
          </HStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-foreground font-semibold">Nama tampilan</Text>
            <Input className="border border-border rounded-xl h-12 bg-card">
              <InputField value={displayName} onChangeText={setDisplayName} placeholder="Nama lengkap beserta gelar profesi" className="text-foreground text-base px-3" />
            </Input>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-foreground font-semibold">Bio singkat</Text>
            <Textarea className="border border-border rounded-xl bg-card min-h-[96px] p-3">
              <TextareaInput value={bio} onChangeText={setBio} placeholder="Perkenalan singkat mengenai pengalaman dan fokus layanan Anda" className="text-foreground text-sm font-normal" />
            </Textarea>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">KEAHLIAN</Text>
            <HStack space="xs" className="flex-wrap gap-2 pt-1">
              {specialties.map((spec) => (
                <Box key={spec} className="border border-primary bg-primary/10 px-3.5 py-1.5 rounded-full">
                  <Text size="sm" bold className="text-primary font-bold">{spec}</Text>
                </Box>
              ))}
              <Pressable onPress={handleAddSpecialty} accessibilityRole="button" accessibilityLabel="Tambah keahlian baru" className="border border-dashed border-muted-foreground/50 bg-card px-3.5 py-1.5 rounded-full flex-row items-center active:bg-muted">
                <Plus size={14} color="#75618E" />
                <Text size="sm" bold className="text-muted-foreground font-semibold ml-1">Tambah</Text>
              </Pressable>
            </HStack>
          </VStack>

          <VStack space="xs">
            <Text size="sm" bold className="text-muted-foreground uppercase tracking-wider px-1 font-semibold">KREDENSIAL</Text>
            <Box className="border border-border bg-card rounded-2xl overflow-hidden">
              {[
                { title: "STR", date: strExpiryDate, label: "Verifikasi ulang STR" },
                { title: "SIP", date: sipExpiryDate, label: "Verifikasi ulang SIP" },
              ].map((item, idx) => (
                <Pressable key={item.title} onPress={() => { haptics.selection(); if (onVerifyCredentials) onVerifyCredentials(); }} accessibilityRole="button" accessibilityLabel={item.label} className={`p-4 flex-row items-center justify-between active:bg-muted ${idx > 0 ? "border-t border-dashed border-border" : ""}`}>
                  <VStack className="flex-1 pr-2">
                    <Text size="md" bold className="text-foreground">{item.title}</Text>
                    <Text size="sm" className="text-muted-foreground">Berlaku sampai {item.date}</Text>
                  </VStack>
                  <HStack space="xs" className="items-center bg-muted px-2.5 py-1 rounded-lg">
                    <Lock size={12} color="#75618E" />
                    <Text size="sm" bold className="text-muted-foreground ml-1">Terkunci</Text>
                  </HStack>
                </Pressable>
              ))}
            </Box>
          </VStack>

          <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
            <Text size="sm" className="text-foreground font-medium leading-relaxed">
              Mengubah kredensial perlu ditinjau ulang oleh tim SeraPhany.
            </Text>
          </Box>

          <VStack space="sm" className="mt-2">
            <Button onPress={handleSave} accessibilityRole="button" accessibilityLabel="Simpan Profil" className="bg-primary h-12 rounded-xl active:opacity-90">
              <ButtonText className="text-white font-bold text-base">Simpan</ButtonText>
            </Button>
            <Button variant="outline" onPress={() => { haptics.selection(); onCancel(); }} accessibilityRole="button" accessibilityLabel="Batal" className="border-border bg-card h-12 rounded-xl active:opacity-80">
              <ButtonText className="text-foreground font-semibold text-base">Batal</ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
});
