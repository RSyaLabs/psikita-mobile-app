import React, { useState } from "react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react-native";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Pressable,
  Button,
  ButtonText,
  ScrollView,
  Switch,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface CarePlanTask {
  id: string;
  title: string;
  frequency: string;
  completed?: boolean;
}

export interface CarePlanDetailViewProps {
  practitionerName?: string;
  validUntil?: string;
  tasks?: CarePlanTask[];
  reminderActive?: boolean;
  reminderSchedule?: string;
  onSelectSchedule: () => void;
  onBackToResults: () => void;
  onOpenCrisisHelp: () => void;
}

export function CarePlanDetailView({
  practitionerName = "Psikolog Pendamping",
  validUntil = "-",
  tasks: initialTasks,
  reminderActive: initialReminder = true,
  reminderSchedule = "Setiap hari · 08.00 & 20.00 WIB",
  onSelectSchedule,
  onBackToResults,
  onOpenCrisisHelp,
}: CarePlanDetailViewProps) {
  const defaultTasks: CarePlanTask[] = [
    {
      id: "task-1",
      title: "Latihan pernapasan diafragma 4-7-8",
      frequency: "10 menit setiap pagi dan malam",
      completed: true,
    },
    {
      id: "task-2",
      title: "Jurnal harian pemicu cemas & pola tidur",
      frequency: "Catat setiap malam sebelum tidur",
      completed: false,
    },
    {
      id: "task-3",
      title: "Jalan kaki santai tanpa gawai",
      frequency: "20 menit saat sore hari",
      completed: false,
    },
  ];

  const [taskList, setTaskList] = useState<CarePlanTask[]>(
    initialTasks && initialTasks.length > 0 ? initialTasks : defaultTasks,
  );
  const [isReminderOn, setIsReminderOn] = useState(initialReminder);

  const toggleTask = (taskId: string) => {
    haptics.selection();
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    );
  };

  const handleReminderToggle = (val: boolean) => {
    haptics.selection();
    setIsReminderOn(val);
  };

  return (
    <Box className="flex-1 bg-background">
      {/* Screen 48 Header: Back to Results & Title */}
      <Box className="bg-card px-4 py-3 border-b border-border">
        <HStack space="sm" className="items-center">
          <Pressable
            onPress={() => {
              haptics.light();
              onBackToResults();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke hasil"
            className="w-11 h-11 items-center justify-center -ml-2 rounded-xl active:bg-muted"
          >
            <ArrowLeft size={24} color="#262130" />
          </Pressable>
          <Heading size="sm" bold className="text-foreground text-lg">
            Rencana perawatan
          </Heading>
        </HStack>
      </Box>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 18, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Subheader: Practitioner & Validity */}
        <Text className="text-sm text-muted-foreground font-medium">
          Dari {practitionerName} · berlaku sampai {validUntil}
        </Text>

        {/* Section 1: TUGAS MINGGU INI */}
        <VStack space="xs">
          <Heading
            size="sm"
            bold
            className="text-sm uppercase tracking-wider text-muted-foreground font-bold mb-1"
          >
            TUGAS MINGGU INI
          </Heading>

          <Box className="border border-border bg-card rounded-2xl overflow-hidden shadow-xs">
            {taskList.map((task, index) => {
              const isChecked = Boolean(task.completed);
              return (
                <React.Fragment key={task.id}>
                  {index > 0 && (
                    <Box className="border-t border-dashed border-border mx-4" />
                  )}
                  <Pressable
                    onPress={() => toggleTask(task.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    accessibilityLabel={`${task.title}, ${task.frequency}`}
                    className="flex-row items-center gap-3 p-4 active:bg-muted"
                  >
                    {/* Custom Checkbox Pill */}
                    <Box
                      className={`w-6 h-6 rounded-md items-center justify-center border ${
                        isChecked
                          ? "bg-primary border-primary"
                          : "border-[#75618E] bg-card"
                      }`}
                    >
                      {isChecked && <Check size={16} color="#FFFFFF" />}
                    </Box>

                    {/* Task Title & Frequency Subtitle */}
                    <VStack className="flex-1">
                      <Text
                        className={`text-base font-semibold leading-tight ${
                          isChecked
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        }`}
                      >
                        {task.title}
                      </Text>
                      <Text className="text-sm text-muted-foreground mt-0.5">
                        {task.frequency}
                      </Text>
                    </VStack>
                  </Pressable>
                </React.Fragment>
              );
            })}
          </Box>
        </VStack>

        {/* Section 2: PENGINGAT */}
        <VStack space="xs">
          <Heading
            size="sm"
            bold
            className="text-sm uppercase tracking-wider text-muted-foreground font-bold mb-1"
          >
            PENGINGAT
          </Heading>

          <Box className="border border-border bg-card rounded-2xl p-4 shadow-xs">
            <HStack className="items-center justify-between">
              <VStack className="flex-1 pr-3">
                <Text className="text-base font-semibold text-foreground">
                  Ingatkan aku
                </Text>
                <Text className="text-sm text-muted-foreground mt-0.5">
                  {reminderSchedule}
                </Text>
              </VStack>
              <Switch
                value={isReminderOn}
                onValueChange={handleReminderToggle}
                accessibilityLabel="Aktifkan pengingat rencana perawatan"
              />
            </HStack>
          </Box>
        </VStack>

        {/* Section 3: Clinical Boundary Note & Crisis Emergency Link */}
        <Box className="border border-dashed border-[#75618E] bg-[#FAF8F5] rounded-2xl p-4">
          <Text className="text-sm text-foreground leading-relaxed">
            Rencana ini panduan dari psikolog, bukan pengganti sesi. Merasa memburuk?{" "}
            <Text
              onPress={() => {
                haptics.selection();
                onOpenCrisisHelp();
              }}
              className="text-sm text-primary font-bold underline"
            >
              Lihat bantuan segera
            </Text>
            .
          </Text>
        </Box>

        {/* Bottom Actions */}
        <VStack space="xs" className="mt-4 pb-6">
          <Button
            onPress={() => {
              haptics.selection();
              onSelectSchedule();
            }}
            accessibilityRole="button"
            accessibilityLabel="Pilih Jadwal Lanjutan"
            className="h-12 rounded-xl bg-primary active:opacity-90"
          >
            <ButtonText className="text-base font-bold text-primary-foreground">
              Pilih Jadwal Lanjutan
            </ButtonText>
          </Button>

          <Pressable
            onPress={() => {
              haptics.light();
              onBackToResults();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali ke hasil"
            className="min-h-[44px] items-center justify-center active:opacity-70 mt-1"
          >
            <Text className="text-sm font-semibold text-foreground">
              Kembali ke hasil
            </Text>
          </Pressable>
        </VStack>
      </ScrollView>
    </Box>
  );
}
