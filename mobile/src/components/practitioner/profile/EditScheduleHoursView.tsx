import React, { useState } from "react";
import { Check, ChevronLeft } from "lucide-react-native";
import {
  Box,
  Text,
  VStack,
  HStack,
  Pressable,
  Button,
  ButtonText,
  Input,
  InputField,
  ScrollView,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";

export interface EditScheduleHoursViewProps {
  dayName?: string;
  initialActive?: boolean;
  initialStart?: string;
  initialEnd?: string;
  onBack: () => void;
  onCancel: () => void;
  onSaveHours: (payload: {
    dayName: string;
    isActive: boolean;
    startTime: string;
    endTime: string;
    applyToAll: boolean;
  }) => void;
}

export const EditScheduleHoursView = React.memo(
  function EditScheduleHoursView({
    dayName = "Senin",
    initialActive = true,
    initialStart = "09.00",
    initialEnd = "17.00",
    onBack,
    onCancel,
    onSaveHours,
  }: EditScheduleHoursViewProps) {
    const [isActive, setIsActive] = useState(initialActive);
    const [startTime, setStartTime] = useState(initialStart);
    const [endTime, setEndTime] = useState(initialEnd);
    const [applyToAll, setApplyToAll] = useState(false);

    const handleSave = () => {
      haptics.success();
      onSaveHours({
        dayName,
        isActive,
        startTime,
        endTime,
        applyToAll,
      });
    };

    return (
      <VStack className="flex-1 bg-background">
        {/* Header */}
        <HStack className="items-center px-4 py-3.5 border-b border-border bg-card">
          <Pressable
            onPress={() => {
              haptics.selection();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-muted"
          >
            <ChevronLeft size={24} className="text-foreground" />
          </Pressable>
          <Text size="lg" bold className="text-foreground ml-1">
            Jam praktik: {dayName}
          </Text>
        </HStack>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          <VStack space="md">
            {/* Toggle Card */}
            <Pressable
              onPress={() => {
                haptics.selection();
                setIsActive((prev) => !prev);
              }}
              accessibilityRole="switch"
              accessibilityState={{ checked: isActive }}
              accessibilityLabel="Praktik di hari ini"
              className="border border-border bg-card rounded-2xl p-4 flex-row items-center justify-between active:opacity-90"
            >
              <VStack className="flex-1 pr-3">
                <Text size="md" bold className="text-foreground">
                  Praktik di hari ini
                </Text>
                <Text size="sm" className="text-muted-foreground mt-0.5">
                  Matikan untuk libur
                </Text>
              </VStack>
              <Box
                className={`w-12 h-7 rounded-full p-0.5 justify-center ${
                  isActive ? "bg-primary items-end" : "bg-muted-foreground/30 items-start"
                }`}
              >
                <Box className="w-6 h-6 rounded-full bg-white shadow-sm" />
              </Box>
            </Pressable>

            {/* Time inputs when active */}
            {isActive && (
              <>
                <HStack space="md">
                  {/* Start time */}
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground font-semibold">
                      Mulai
                    </Text>
                    <Input className="border border-border rounded-xl h-12 bg-card">
                      <InputField
                        value={startTime}
                        onChangeText={setStartTime}
                        placeholder="09.00"
                        className="text-foreground text-base px-3"
                      />
                    </Input>
                  </VStack>

                  {/* End time */}
                  <VStack space="xs" className="flex-1">
                    <Text size="sm" bold className="text-foreground font-semibold">
                      Selesai
                    </Text>
                    <Input className="border border-border rounded-xl h-12 bg-card">
                      <InputField
                        value={endTime}
                        onChangeText={setEndTime}
                        placeholder="17.00"
                        className="text-foreground text-base px-3"
                      />
                    </Input>
                  </VStack>
                </HStack>

                {/* Apply to other days checkbox */}
                <Pressable
                  onPress={() => {
                    haptics.selection();
                    setApplyToAll((prev) => !prev);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: applyToAll }}
                  accessibilityLabel="Terapkan ke hari kerja lain"
                  className="border border-border bg-card rounded-2xl p-4 flex-row items-center space-x-3 active:opacity-80"
                >
                  <Box
                    className={`w-6 h-6 rounded-lg border items-center justify-center mr-3 ${
                      applyToAll
                        ? "bg-primary border-primary"
                        : "border-muted-foreground/40 bg-card"
                    }`}
                  >
                    {applyToAll && <Check size={16} color="#FFFFFF" />}
                  </Box>
                  <Text size="md" className="text-foreground font-medium flex-1">
                    Terapkan ke hari kerja lain
                  </Text>
                </Pressable>
              </>
            )}

            {/* Note Box */}
            <Box className="border border-dashed border-muted-foreground/40 bg-muted/30 rounded-2xl p-4">
              <Text size="sm" className="text-foreground font-medium leading-relaxed">
                Mengubah jam tidak membatalkan sesi yang sudah dijadwalkan.
              </Text>
            </Box>

            {/* Actions */}
            <VStack space="sm" className="mt-2">
              <Button
                onPress={handleSave}
                accessibilityRole="button"
                accessibilityLabel="Simpan Jam"
                className="bg-primary h-12 rounded-xl active:opacity-90"
              >
                <ButtonText className="text-white font-bold text-base">
                  Simpan Jam
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                onPress={() => {
                  haptics.selection();
                  onCancel();
                }}
                accessibilityRole="button"
                accessibilityLabel="Batal ubah jam"
                className="border-border bg-card h-12 rounded-xl active:opacity-80"
              >
                <ButtonText className="text-foreground font-semibold text-base">
                  Batal
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </ScrollView>
      </VStack>
    );
  },
);
