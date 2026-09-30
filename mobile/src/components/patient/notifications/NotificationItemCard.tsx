import React from "react";
import {
  Video,
  Pill,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Clock,
} from "lucide-react-native";
import {
  Card,
  HStack,
  VStack,
  Box,
  Text,
  Pressable,
} from "@/components/ui";
import { NotificationDto } from "@/api/notification.service";

interface NotificationItemCardProps {
  item: NotificationDto;
  onPress: (item: NotificationDto) => void;
}

export function NotificationItemCard({
  item,
  onPress,
}: NotificationItemCardProps) {
  const renderIcon = (type: NotificationDto["iconType"]) => {
    switch (type) {
      case "video":
        return <Video size={18} className="text-secondary" />;
      case "pill":
        return <Pill size={18} className="text-secondary" />;
      case "assessment":
        return <FileText size={18} className="text-secondary" />;
      case "satusehat":
        return <ShieldCheck size={18} className="text-secondary" />;
      default:
        return <Sparkles size={18} className="text-secondary" />;
    }
  };

  return (
    <Card
      className={`rounded-2xl p-4 border transition-all ${
        item.isUnread
          ? "bg-card border-secondary/40 shadow-sm"
          : "bg-card/60 border-border"
      }`}
    >
      <Pressable
        onPress={() => onPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}, ${item.description}`}
        className="active:opacity-80"
      >
        <HStack space="md" className="items-start">
          <Box className="w-10 h-10 rounded-2xl bg-secondary/15 items-center justify-center mt-0.5">
            {renderIcon(item.iconType)}
          </Box>
          <VStack space="xs" className="flex-1">
            <HStack space="xs" className="items-center justify-between">
              <Text
                size="xs"
                className="text-secondary font-bold text-[10px] uppercase tracking-wider"
              >
                {item.category}
              </Text>
              <HStack space="xs" className="items-center">
                <Clock size={10} className="text-muted-foreground" />
                <Text size="xs" className="text-muted-foreground text-[10px]">
                  {item.timestamp}
                </Text>
              </HStack>
            </HStack>

            <Text size="sm" bold className="text-foreground leading-snug">
              {item.title}
            </Text>

            <Text
              size="xs"
              className="text-muted-foreground leading-relaxed text-[12px]"
            >
              {item.description}
            </Text>

            <HStack space="xs" className="items-center pt-2 mt-1">
              <Text size="xs" bold className="text-secondary text-[11px]">
                {item.actionText}
              </Text>
              <ChevronRight size={12} className="text-secondary" />
            </HStack>
          </VStack>
        </HStack>
      </Pressable>
    </Card>
  );
}
