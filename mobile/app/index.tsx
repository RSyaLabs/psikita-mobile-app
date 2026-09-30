import React, { useState, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Layers,
  Search,
  X,
  Filter,
} from "lucide-react-native";
import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Pressable,
  Badge,
  BadgeText,
  ScrollView,
  Input,
  InputField,
} from "@/components/ui";
import { haptics } from "@/utils/haptics";
import { CATALOG_DATA } from "@/data/catalog";
import {
  LauncherQuickRoles,
  LauncherRoleFilter,
  LauncherRoleCard,
  RoleFilterKey,
} from "@/components/launcher";

export default function LauncherScreen() {
  const [selectedRole, setSelectedRole] = useState<RoleFilterKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate total counts
  const totalScreensCount = useMemo(() => {
    return CATALOG_DATA.reduce((acc, group) => {
      const groupCount = group.subGroups.reduce(
        (subAcc, sub) => subAcc + sub.screens.length,
        0,
      );
      return acc + groupCount;
    }, 0);
  }, []);

  // Calculate dynamic per-role screen counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: totalScreensCount,
      patient: 0,
      practitioner: 0,
      admin: 0,
      auth: 0,
    };
    CATALOG_DATA.forEach((g) => {
      const gCount = g.subGroups.reduce(
        (acc, sub) => acc + sub.screens.length,
        0,
      );
      counts[g.roleId] = (counts[g.roleId] || 0) + gCount;
    });
    return counts;
  }, [totalScreensCount]);

  // Filter groups and screens according to role & search query
  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return CATALOG_DATA.filter((group) => {
      if (selectedRole !== "all" && group.roleId !== selectedRole) {
        return false;
      }
      return true;
    })
      .map((group) => {
        const filteredSubGroups = group.subGroups
          .map((subGroup) => {
            const matchingScreens = subGroup.screens.filter((screen) => {
              if (!q) return true;
              return (
                screen.id.toLowerCase().includes(q) ||
                screen.name.toLowerCase().includes(q) ||
                screen.desc.toLowerCase().includes(q) ||
                (screen.tag && screen.tag.toLowerCase().includes(q))
              );
            });
            return {
              ...subGroup,
              screens: matchingScreens,
            };
          })
          .filter((subGroup) => subGroup.screens.length > 0);

        return {
          ...group,
          subGroups: filteredSubGroups,
        };
      })
      .filter((group) => group.subGroups.length > 0);
  }, [selectedRole, searchQuery]);

  const displayedCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => {
      return (
        acc + g.subGroups.reduce((subAcc, s) => subAcc + s.screens.length, 0)
      );
    }, 0);
  }, [filteredGroups]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Hero */}
        <VStack space="xs" className="mb-4">
          <HStack space="xs" className="items-center justify-between">
            <HStack space="xs" className="items-center">
              <Box className="w-8 h-8 rounded-xl bg-primary items-center justify-center">
                <Layers size={18} className="text-primary-foreground" />
              </Box>
              <Heading
                size="xl"
                bold
                className="text-foreground tracking-tight"
              >
                Katalog Layar PsiKita
              </Heading>
            </HStack>
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/5 px-2.5 py-1 rounded-full"
            >
              <BadgeText className="text-[11px] font-bold text-primary">
                {displayedCount} dari {totalScreensCount} Layar
              </BadgeText>
            </Badge>
          </HStack>
          <Text size="xs" className="text-muted-foreground leading-relaxed">
            Arsitektur navigasi lengkap mobile telehealth kesehatan mental
            berstandar SATUSEHAT Kemenkes RI.
          </Text>
        </VStack>

        {/* Quick Launch Role Bar */}
        <LauncherQuickRoles />

        {/* Interactive Search Bar */}
        <VStack space="xs" className="mb-3">
          <Box className="relative">
            <Input className="bg-card rounded-2xl px-3.5 h-12 border-border flex-row items-center">
              <Search size={18} className="text-muted-foreground mr-2" />
              <InputField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Cari ID (P-06), nama layar, BPJS, SATUSEHAT..."
                className="text-sm text-foreground placeholder:text-muted-foreground flex-1"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setSearchQuery("");
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 rounded-full active:bg-muted"
                >
                  <X size={16} className="text-muted-foreground" />
                </Pressable>
              )}
            </Input>
          </Box>
        </VStack>

        {/* Filter Role Chips */}
        <LauncherRoleFilter
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          roleCounts={roleCounts}
        />

        {/* Screen Groups */}
        {filteredGroups.length === 0 ? (
          <Box className="p-8 rounded-3xl bg-card border border-border items-center justify-center my-6">
            <Filter size={32} className="text-muted-foreground mb-2" />
            <Text size="sm" className="font-bold text-foreground text-center">
              Layar Tidak Ditemukan
            </Text>
            <Text size="xs" className="text-muted-foreground text-center mt-1">
              Tidak ada layar yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
            </Text>
          </Box>
        ) : (
          <VStack space="lg">
            {filteredGroups.map((group) => (
              <LauncherRoleCard key={group.roleId} group={group} />
            ))}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
