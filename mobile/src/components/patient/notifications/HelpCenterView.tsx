import React, { useState, useMemo } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Linking } from "react-native";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Search, MessageSquare, Mail } from "lucide-react-native";
import { haptics } from "@/utils/haptics";
import { AppIcon } from "@/components/common/AppIcon";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Bagaimana cara kerja pencocokan psikolog?",
    answer: "Sistem mencocokkan keluhan klinis, preferensi bahasa, dan jadwal Anda dengan psikolog klinis berizin resmi (SIPPK). Anda akan menerima notifikasi segera setelah praktisi yang sesuai ditugaskan.",
  },
  {
    id: "faq-2",
    question: "Pembayaranku belum terkonfirmasi",
    answer: "Pembayaran instan via Virtual Account dan QRIS diverifikasi otomatis dalam 1–5 menit. Jika status belum berubah setelah 10 menit, gunakan tombol Cek Status atau hubungi tim bantuan kami dengan bukti bayar.",
  },
  {
    id: "faq-3",
    question: "Kenapa verifikasi identitasku ditolak?",
    answer: "Penolakan verifikasi umumnya terjadi jika foto KTP buram, terdapat pantulan cahaya yang menutupi NIK/nama, atau dokumen terpotong. Pastikan identitas terbaca jelas dengan pencahayaan memadai.",
  },
  {
    id: "faq-4",
    question: "Bagaimana datamu dijaga?",
    answer: "Data rekam medis Anda dilindungi enkripsi end-to-end berstandar UU Perlindungan Data Pribadi (UU PDP). Isi konsultasi dan asesmen bersifat rahasia dan hanya dapat diakses oleh Anda dan tenaga profesional yang bertugas.",
  },
];

interface HelpCenterViewProps {
  onBack?: () => void;
  onEmergencyCrisis?: () => void;
  onContactSupport?: () => void;
  onSendEmail?: () => void;
  faqs?: FaqItem[];
  supportEmail?: string;
}

export function HelpCenterView({
  onBack,
  onEmergencyCrisis,
  onContactSupport,
  onSendEmail,
  faqs = DEFAULT_FAQS,
  supportEmail = "bantuan@seraphany.id",
}: HelpCenterViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaqIds, setExpandedFaqIds] = useState<Set<string>>(new Set());

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const query = searchQuery.toLowerCase().trim();
    return faqs.filter((f) => f.question.toLowerCase().includes(query) || f.answer.toLowerCase().includes(query));
  }, [faqs, searchQuery]);

  const toggleFaq = (id: string) => {
    haptics.selection();
    setExpandedFaqIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const contactChannels = [
    {
      id: "support",
      icon: MessageSquare,
      title: "Hubungi Tim Support",
      subtitle: "Balasan di dalam aplikasi",
      testID: "btn-contact-support",
      onPress: () => {
        haptics.selection();
        onContactSupport ? onContactSupport() : Linking.openURL("https://wa.me/6281119255772").catch(() => {});
      },
    },
    {
      id: "email",
      icon: Mail,
      title: "Kirim email",
      subtitle: supportEmail,
      testID: "btn-contact-email",
      onPress: () => {
        haptics.selection();
        onSendEmail ? onSendEmail() : Linking.openURL(`mailto:${supportEmail}`).catch(() => {});
      },
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-[#FAF8F5]"
      contentContainerStyle={{ padding: 24, gap: 18 }}
      showsVerticalScrollIndicator={false}
      testID="help-center-scroll"
    >
      <View className="flex-row items-center gap-1 -ml-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          testID="btn-help-back"
          onPress={() => { haptics.light(); onBack?.(); }}
          className="w-11 h-11 items-center justify-center rounded-full active:bg-stone-200/50"
        >
          <AppIcon icon={ChevronLeft} size={24} tone="foreground" />
        </Pressable>
        <Text className="text-[17px] font-bold text-[#222222]">Pusat bantuan</Text>
      </View>

      <View className="flex-row items-center h-[52px] border-[1.5px] border-[#333333] rounded-[24px] px-4 bg-white">
        <AppIcon icon={Search} size={20} tone="muted" />
        <TextInput
          placeholder="Cari pertanyaan"
          placeholderTextColor="#777777"
          value={searchQuery}
          onChangeText={setSearchQuery}
          testID="input-search-faq"
          accessibilityLabel="Cari pertanyaan"
          className="flex-1 ml-2.5 text-[15px] text-[#222222] p-0"
        />
      </View>

      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">PERTANYAAN UMUM</Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {filteredFaqs.length === 0 ? (
            <View className="p-4 items-center justify-center min-h-[80px]">
              <Text className="text-sm text-[#555555]">Tidak ada pertanyaan yang cocok dengan pencarian.</Text>
            </View>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedFaqIds.has(faq.id);
              return (
                <View key={faq.id} className={idx > 0 ? "border-t border-dashed border-[#999999]" : ""}>
                  <Pressable
                    testID={`faq-item-toggle-${faq.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={faq.question}
                    onPress={() => toggleFaq(faq.id)}
                    className="flex-row items-center justify-between min-h-[56px] px-4 py-3 active:bg-stone-50"
                  >
                    <Text className="flex-1 mr-2.5 text-[15px] font-semibold text-[#222222]">{faq.question}</Text>
                    <AppIcon icon={isExpanded ? ChevronUp : ChevronDown} size={18} tone="muted" />
                  </Pressable>
                  {isExpanded && (
                    <View testID={`faq-item-answer-${faq.id}`} className="px-4 pb-3.5 pt-0">
                      <Text className="text-sm leading-relaxed text-[#555555]">{faq.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </View>

      <View className="gap-2.5">
        <Text className="text-sm font-bold tracking-wider text-[#555555]">MASIH BUTUH BANTUAN?</Text>
        <View className="border-[1.5px] border-[#333333] rounded-xl bg-white overflow-hidden">
          {contactChannels.map((channel, idx) => (
            <View key={channel.id}>
              {idx > 0 && <View className="border-t border-dashed border-[#999999]" />}
              <Pressable
                testID={channel.testID}
                accessibilityRole="button"
                accessibilityLabel={channel.title}
                onPress={channel.onPress}
                className="flex-row items-center justify-between min-h-[60px] px-4 py-2.5 active:bg-stone-50"
              >
                <View className="flex-row items-center flex-1 mr-2.5">
                  <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <AppIcon icon={channel.icon} size={16} tone="primary" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-bold text-[#222222]">{channel.title}</Text>
                    <Text className="text-sm text-[#555555] mt-0.5">{channel.subtitle}</Text>
                  </View>
                </View>
                <AppIcon icon={ChevronRight} size={18} tone="muted" />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        testID="btn-emergency-crisis"
        accessibilityRole="button"
        accessibilityLabel="Butuh bantuan segera? Lihat kontak darurat"
        onPress={() => { haptics.medium(); onEmergencyCrisis?.(); }}
        className="min-h-[52px] border-[2.5px] border-[#222222] rounded-xl items-center justify-center px-4 py-2 active:bg-stone-100 mt-2"
      >
        <Text className="text-[15px] font-bold text-[#222222] text-center">
          Butuh bantuan segera? Lihat kontak darurat
        </Text>
      </Pressable>
    </ScrollView>
  );
}
