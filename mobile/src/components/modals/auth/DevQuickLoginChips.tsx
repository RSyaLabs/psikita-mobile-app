import React from "react";
import { Box, HStack, Pressable, Text } from "@/components/ui";
import { DEV_FIXTURE_ACCOUNTS, devFixturesEnabled } from "@/config/devFixtures";
import { haptics } from "@/utils/haptics";

interface DevQuickLoginChipsProps {
  onSelectAccount: (username: string) => void;
}

export function DevQuickLoginChips({ onSelectAccount }: DevQuickLoginChipsProps) {
  if (!devFixturesEnabled()) return null;

  return (
    <Box className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 mb-1">
      <Text size="xs" bold className="text-primary mb-1.5">
        Pilih Akun Contoh (1-Click Test):
      </Text>
      <HStack space="xs" className="flex-wrap gap-1.5">
        <Pressable
          onPress={() => {
            haptics.light();
            onSelectAccount(DEV_FIXTURE_ACCOUNTS.patient.username);
          }}
          className="px-2 py-1 rounded-lg bg-card border border-border active:opacity-70"
        >
          <Text size="xs" bold className="text-foreground">
            Pasien (Siti)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            haptics.light();
            onSelectAccount(DEV_FIXTURE_ACCOUNTS.psychologist.username);
          }}
          className="px-2 py-1 rounded-lg bg-card border border-border active:opacity-70"
        >
          <Text size="xs" bold className="text-foreground">
            Psikolog (Rina)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            haptics.light();
            onSelectAccount(DEV_FIXTURE_ACCOUNTS.psychiatrist.username);
          }}
          className="px-2 py-1 rounded-lg bg-card border border-border active:opacity-70"
        >
          <Text size="xs" bold className="text-foreground">
            Psikiater (Andi)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            haptics.light();
            onSelectAccount(DEV_FIXTURE_ACCOUNTS.admin.username);
          }}
          className="px-2 py-1 rounded-lg bg-card border border-border active:opacity-70"
        >
          <Text size="xs" bold className="text-foreground">
            Admin
          </Text>
        </Pressable>
      </HStack>
    </Box>
  );
}
