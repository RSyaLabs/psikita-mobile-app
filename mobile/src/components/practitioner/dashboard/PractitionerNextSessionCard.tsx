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
                <Clock size={18} color="#4A3B6B" />
              </Box>
              <VStack space="xs" className="flex-1">
                <HStack space="xs" className="items-center">
                  <Text size="sm" className="font-bold text-foreground">
                    {sessionPatient}
                  </Text>
                  <Box className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <Text
                    size="sm"
                    className="text-primary font-semibold text-sm"
                  >
                    Hari ini
                  </Text>
                </HStack>
                <Text size="sm" className="text-muted-foreground font-medium">
                  {sessionTime} • {sessionTopic}
                </Text>
              </VStack>
            </HStack>
            <ChevronRight size={18} color="#4B4656" />
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
