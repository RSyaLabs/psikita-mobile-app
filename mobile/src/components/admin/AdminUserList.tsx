import React from "react";
import { Search, ChevronRight, User } from "lucide-react-native";
import {
  Box,
  Text,
  Card,
  VStack,
  HStack,
  Pressable,
  Input,
  InputField,
  Avatar,
  AvatarImage,
  AvatarFallbackText,
} from "@/components/ui";
import { getInitials } from "@/utils/format";
import { haptics } from "@/utils/haptics";
import { Platform } from "react-native";

export interface AdminUserListItem {
  id: string;
  name: string;
  identifier: string;
  email: string;
  role: string;
  sessions: string;
  status: string;
  satusehat: string;
  avatar: string;
}

export interface AdminUserListProps {
  activeTab: "pasien" | "praktisi";
  searchQuery: string;
  onSearchChange: (query: string) => void;
  users: AdminUserListItem[];
  onSelectUser: (user: AdminUserListItem) => void;
}

export function AdminUserList({
  activeTab,
  searchQuery,
  onSearchChange,
  users,
  onSelectUser,
}: AdminUserListProps) {
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Search Bar */}
      <Box className="px-5 pt-3 pb-1">
        <Input className="bg-card rounded-full px-4 h-12 border border-border">
          <Search size={18} className="mr-2 text-muted-foreground" />
          <InputField
            placeholder={`Cari nama, email, atau ID ${activeTab}…`}
            value={searchQuery}
            onChangeText={onSearchChange}
            className="text-sm text-foreground placeholder:text-muted-foreground"
          />
        </Input>
      </Box>

      {/* User List Items */}
      <VStack space="sm" className="px-5 pt-3">
        {filteredUsers.length === 0 ? (
          <Box className="py-12 items-center justify-center">
            <User size={36} className="text-muted-foreground/40 mb-2" />
            <Text size="sm" className="font-semibold text-foreground">
              Tidak ada data {activeTab}
            </Text>
            <Text size="xs" className="text-muted-foreground mt-1 text-center">
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : `Belum ada ${activeTab} terdaftar di sistem`}
            </Text>
          </Box>
        ) : (
          filteredUsers.map((user) => (
            <Pressable
              key={user.id}
              onPress={() => {
                haptics.selection();
                onSelectUser(user);
              }}
              className="active:opacity-80"
            >
              <Card className="bg-card p-3 rounded-2xl border border-border flex-row items-center justify-between">
                <HStack space="md" className="items-center flex-1">
                  <Avatar size="sm" className="border border-border">
                    <AvatarImage source={{ uri: user.avatar }} />
                    <AvatarFallbackText>
                      {getInitials(user.name)}
                    </AvatarFallbackText>
                  </Avatar>
                  <VStack space="xs" className="flex-1 pr-2">
                    <HStack space="xs" className="items-center">
                      <Text size="sm" className="font-semibold text-foreground">
                        {user.name}
                      </Text>
                    </HStack>
                    <Text
                      size="xs"
                      className="text-muted-foreground text-[11px]"
                      isTruncated
                      numberOfLines={Platform.OS === "web" ? undefined : 1}
                    >
                      {user.identifier}
                    </Text>
                  </VStack>
                </HStack>
                <ChevronRight size={18} className="text-muted-foreground" />
              </Card>
            </Pressable>
          ))
        )}
      </VStack>
    </>
  );
}
