import React from "react";
import { Users, Clock, Star } from "lucide-react-native";
import { HStack, Card, Heading, Text } from "@/components/ui";
import { resolveServerValue } from "@/utils/server-value";

interface PractitionerStatsRowProps {
  queueCount?: number;
  todaySessionsCount?: number;
  rating?: number;
}

export function PractitionerStatsRow({
  queueCount,
  todaySessionsCount,
  rating,
}: PractitionerStatsRowProps) {
  // No invented figures. Until the server sends the number, the tile shows an
  // honest placeholder instead of a plausible-looking count.
  const queueLabel = resolveServerValue(
    queueCount,
    (value) => String(value),
    "-",
  );
  const todaySessionsLabel = resolveServerValue(
    todaySessionsCount,
    (value) => String(value),
    "-",
  );
  const ratingLabel = resolveServerValue(
    rating,
    (value) => value.toFixed(1),
    "-",
  );

  return (
    <HStack space="sm" className="items-center mb-4">
      <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
        <Users size={18} className="mb-1 text-secondary" />
        <Heading size="lg" className="font-bold text-foreground">
          {queueLabel}
        </Heading>
        <Text
          size="xs"
          className="text-muted-foreground font-medium text-[10px]"
        >
          Antrian
        </Text>
      </Card>
      <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
        <Clock size={18} className="mb-1 text-secondary" />
        <Heading size="lg" className="font-bold text-foreground">
          {todaySessionsLabel}
        </Heading>
        <Text
          size="xs"
          className="text-muted-foreground font-medium text-[10px]"
        >
          Sesi hari ini
        </Text>
      </Card>
      <Card className="flex-1 bg-card rounded-2xl p-3 border border-border">
        <Star size={18} className="mb-1 text-warning fill-warning" />
        <Heading size="lg" className="font-bold text-foreground">
          {ratingLabel}
        </Heading>
        <Text
          size="xs"
          className="text-muted-foreground font-medium text-[10px]"
        >
          Rating
        </Text>
      </Card>
    </HStack>
  );
}
