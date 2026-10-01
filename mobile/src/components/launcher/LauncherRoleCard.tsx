import React from "react";
import { Badge, BadgeText, Box, Card, HStack, Heading, Text, VStack } from "@/components/ui";
import { CatalogRoleGroup } from "@/data/catalog";
import { LauncherScreenItem } from "./LauncherScreenItem";
import { Platform } from "react-native";

interface LauncherRoleCardProps {
  group: CatalogRoleGroup;
}

export function LauncherRoleCard({ group }: LauncherRoleCardProps) {
  const totalScreens = group.subGroups.reduce(
    (acc, sg) => acc + sg.screens.length,
    0,
  );

  return (
    <Card className="bg-card rounded-3xl p-4 border border-border">
      {/* Role Header */}
      <HStack
        space="md"
        className="items-center justify-between pb-3 border-b border-border/50"
      >
        <HStack space="sm" className="items-center flex-1 mr-2">
          <Box className="w-9 h-9 rounded-2xl bg-muted items-center justify-center">
            {group.icon}
          </Box>
          <VStack className="flex-1">
            <Heading size="sm" bold className="text-card-foreground">
              {group.title}
            </Heading>
            <Text
              size="xs"
              className="text-muted-foreground text-[11px]"
              isTruncated
              numberOfLines={Platform.OS === "web" ? undefined : 1}
            >
              {group.subtitle}
            </Text>
          </VStack>
        </HStack>
        <Badge
          variant="outline"
          className="border-border bg-muted/60 px-2 py-0.5 rounded-full shrink-0"
        >
          <BadgeText className="text-[10px] font-bold text-muted-foreground">
            {totalScreens} Layar
          </BadgeText>
        </Badge>
      </HStack>

      {/* Subgroups with clean categorized layouts */}
      <VStack space="md" className="pt-3">
        {group.subGroups.map((subGroup, sIdx) => (
          <VStack key={sIdx} space="xs">
            {/* Subgroup Heading */}
            <Text
              size="xs"
              className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider pl-1 mb-1"
            >
              {subGroup.subTitle}
            </Text>

            {/* Screen Items */}
            <VStack space="xs">
              {subGroup.screens.map((screen) => (
                <LauncherScreenItem key={screen.id} screen={screen} />
              ))}
            </VStack>
          </VStack>
        ))}
      </VStack>
    </Card>
  );
}
