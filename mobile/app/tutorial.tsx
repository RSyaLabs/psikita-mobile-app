import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, ChevronRight, HeartHandshake, LockKeyhole, Stethoscope, ClipboardCheck } from "lucide-react-native";
import { Box, Text, Heading, VStack, HStack, Pressable, Button, ButtonText } from "@/components/ui";
import { ROUTES } from "@/constants/routes";
import { completeFirstLaunchTutorial } from "@/utils/tutorial";

const steps = [
  {
    title: "Selamat datang di SeraPhany",
    description: "Kenali alur layanan dengan langkah sederhana. Anda selalu dapat membuka kembali panduan ini dari halaman profil.",
    icon: HeartHandshake,
  },
  {
    title: "Triage untuk mulai konsultasi",
    description: "Setelah identitas diverifikasi, isi skrining awal. Triage membantu menentukan jalur layanan dan masuk ke proses matching atau War Room.",
    icon: Stethoscope,
  },
  {
    title: "Asesmen mandiri itu terpisah",
    description: "Kuesioner mandiri dapat diisi lebih dari sekali sebagai catatan pendukung. Hasilnya tidak otomatis membuat konsultasi atau mengulang triage.",
    icon: ClipboardCheck,
  },
  {
    title: "Order dan pembayaran aman",
    description: "Setelah mendapat praktisi, periksa harga dari server, pilih metode, lalu bayar. Ruang konsultasi terbuka hanya setelah pembayaran dikonfirmasi server.",
    icon: LockKeyhole,
  },
  {
    title: "Konsultasi hingga tindak lanjut",
    description: "Praktisi dapat mengirim Co-Assessment saat sesi aktif. Setelah sesi, Anda menerima hasil dan rencana perawatan; follow-up hanya jika diperlukan.",
    icon: CheckCircle2,
  },
] as const;

export default function FirstLaunchTutorial() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const current = steps[step]!;
  const Icon = current.icon;

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    await completeFirstLaunchTutorial();
    router.replace(ROUTES.INDEX as never);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <VStack space="lg" className="flex-1 px-6 py-7 w-full max-w-[520px] self-center">
        <HStack className="items-center justify-between">
          <Text size="sm" className="text-muted-foreground">Panduan awal · {step + 1} dari {steps.length}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Lewati tutorial" onPress={() => void finish()} disabled={finishing}>
            <Text size="sm" bold className="text-primary">Lewati</Text>
          </Pressable>
        </HStack>
        <HStack space="xs" className="items-center">
          {steps.map((item, i) => (
            <Box key={item.title} className={`flex-1 h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </HStack>
        <VStack space="xl" className="flex-1 items-center justify-center">
          <Box className="w-24 h-24 rounded-3xl bg-primary/10 items-center justify-center">
            <Icon size={48} color="#4A3B6B" />
          </Box>
          <VStack space="md" className="items-center">
            <Heading level={1} size="2xl" className="text-center text-foreground">{current.title}</Heading>
            <Text className="text-center text-muted-foreground leading-relaxed">{current.description}</Text>
          </VStack>
        </VStack>
        <VStack space="sm">
          <Button
            size="lg"
            isDisabled={finishing}
            onPress={() => {
              if (step < steps.length - 1) setStep((value) => value + 1);
              else void finish();
            }}
            className="w-full h-12 rounded-xl bg-primary"
          >
            <ButtonText className="text-primary-foreground font-semibold">
              {step === steps.length - 1 ? "Mulai menggunakan SeraPhany" : "Lanjut"}
            </ButtonText>
            <ChevronRight size={18} color="#FFFFFF" />
          </Button>
          {step > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke langkah sebelumnya" onPress={() => setStep((value) => value - 1)} disabled={finishing} className="items-center py-3">
              <Text size="sm" className="text-muted-foreground">Sebelumnya</Text>
            </Pressable>
          ) : null}
        </VStack>
      </VStack>
    </SafeAreaView>
  );
}
