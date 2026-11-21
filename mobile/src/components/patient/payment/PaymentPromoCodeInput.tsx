import React, { useState } from "react";
import { TextInput } from "react-native";
import { Box, Text, HStack, Pressable } from "@/components/ui";
import { Tag, Check } from "lucide-react-native";
import { haptics } from "@/utils/haptics";

export interface PaymentPromoCodeInputProps {
  appliedCode?: string;
  discountAmount?: number;
  onApplyPromo: (code: string) => void;
  onRemovePromo?: () => void;
  disabled?: boolean;
}

export function PaymentPromoCodeInput({
  appliedCode,
  discountAmount = 0,
  onApplyPromo,
  onRemovePromo,
  disabled = false,
}: PaymentPromoCodeInputProps) {
  const [promoText, setPromoText] = useState("");
  const isApplied = Boolean(appliedCode);

  const handleApply = () => {
    if (!promoText.trim() || disabled) return;
    haptics.selection();
    onApplyPromo(promoText.trim());
  };

  const handleRemove = () => {
    setPromoText("");
    onRemovePromo?.();
    haptics.selection();
  };

  return (
    <Box className="gap-2">
      <HStack space="xs" className="items-center">
        <TextInput
          value={isApplied ? appliedCode : promoText}
          onChangeText={setPromoText}
          editable={!isApplied && !disabled}
          placeholder="Punya kode promo?"
          placeholderTextColor="#75618E"
          autoCapitalize="characters"
          className="flex-1 h-[52px] border border-border rounded-xl px-4 text-sm text-foreground bg-card font-medium"
        />
        {isApplied ? (
          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel="Hapus kode promo"
            className="h-[52px] px-4 border border-border rounded-xl bg-card items-center justify-center active:opacity-80"
          >
            <Text size="sm" bold className="text-destructive font-semibold">
              Hapus
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleApply}
            disabled={!promoText.trim() || disabled}
            accessibilityRole="button"
            accessibilityLabel="Gunakan kode promo"
            className={`h-[52px] px-5 border border-border rounded-xl bg-card items-center justify-center active:opacity-80 ${
              !promoText.trim() || disabled ? "opacity-50" : ""
            }`}
          >
            <Text size="sm" bold className="text-foreground font-semibold">
              Pakai
            </Text>
          </Pressable>
        )}
      </HStack>

      {isApplied && (
        <HStack space="xs" className="items-center ml-1">
          <Check size={16} color="#4A3B6B" />
          <Text size="sm" className="text-primary font-medium">
            Kode promo {appliedCode} aktif{" "}
            {discountAmount > 0
              ? `(Hemat Rp ${discountAmount.toLocaleString("id-ID")})`
              : ""}
          </Text>
        </HStack>
      )}
    </Box>
  );
}
