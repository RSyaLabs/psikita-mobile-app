import React from "react";
import { Clock, ChevronRight } from "lucide-react-native";
import { VStack, Card, HStack, Box, Text, Pressable } from "@/components/ui";
import { resolveServerValue } from "@/utils/server-value";

interface PractitionerNextSessionCardProps {
  hasSession?: boolean;
  patientName?: string;
  time?: string;
  topic?: string;
  onPressSession?: () => void;
}

export function PractitionerNextSessionCard({
  hasSession = false,
  patientName,
  time,
  topic,
  onPressSession,
}: PractitionerNextSessionCardProps) {
  // No invented patient, clock time or diagnosis topic. A caller that has no
  // session from the server sees the empty state, not a fabricated appointment
  // a practitioner could act on.
  const sessionPatient = resolveServerValue(
    patientName,
    (value) => value,
    "Pasien belum tersedia",
  );
  const sessionTime = resolveServerValue(
    time,
    (value) => value,
    "Jam belum tersedia",
  );
  const sessionTopic = resolveServerValue(
    topic,
    (value) => value,
    "Topik belum tersedia",
  );

  return (
    <VStack space="xs" className="mb-4">
      <Text size="sm" className="font-bold text-foreground mb-1">
        Sesi berikutnya
      </Text>
      <Card className="bg-card rounded-2xl p-3 border border-border">
        {hasSession ? (
          <Pressable
            onPress={onPressSession}
            accessibilityRole="button"
            accessibilityLabel={`Buka sesi dengan ${sessionPatient}`}
            className="flex-row items-center justify-between active:opacity-80"
          >
            <HStack space="md" className="items-center flex-1 mr-2">
              <Box className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Clock size={18} className="text-primary" />
              </Box>
              <VStack space="xs" className="flex-1">
                <HStack space="xs" className="items-center">
                  <Text size="xs" className="font-bold text-foreground">
                    {sessionPatient}
                  </Text>
                  <Box className="w-1.5 h-1.5 rounded-full bg-secondary" />
                  <Text
                    size="xs"
                    className="text-secondary font-semibold text-[10px]"
                  >
                    Hari ini
                  </Text>
                </HStack>
                <Text size="xs" className="text-muted-foreground text-[11px]">
                  {sessionTime} • {sessionTopic}
                </Text>
              </VStack>
            </HStack>
            <ChevronRight size={16} className="text-muted-foreground" />
          </Pressable>
        ) : (
          <Box className="py-2 items-center">
            <Text size="xs" className="text-muted-foreground">
              Tidak ada sesi terjadwal saat ini.
            </Text>
          </Box>
        )}
      </Card>
    </VStack>
  );
}
