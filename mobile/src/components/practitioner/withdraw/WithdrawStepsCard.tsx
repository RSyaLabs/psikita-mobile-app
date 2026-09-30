import React from "react";
import { ArrowDownCircle, CreditCard, ChevronRight } from "lucide-react-native";
import {
  Card,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  ButtonText,
  ButtonIcon,
  Pressable,
  Input,
  InputField,
  FormControl,
} from "@/components/ui";

interface WithdrawStepsCardProps {
  withdrawAmt: string;
  onChangeWithdrawAmt: (val: string) => void;
  onSetMax: () => void;
  onManageBank: () => void;
  onConfirmWithdraw: () => void;
  isSubmitting: boolean;
  isAvailable: boolean;
}

export function WithdrawStepsCard({
  withdrawAmt,
  onChangeWithdrawAmt,
  onSetMax,
  onManageBank,
  onConfirmWithdraw,
  isSubmitting,
  isAvailable,
}: WithdrawStepsCardProps) {
  return (
    <Card className="bg-card rounded-2xl p-3.5 border border-border mb-4">
      <VStack space="md">
        <Text size="sm" className="font-bold text-foreground">
          Penarikan dana
        </Text>

        {/* Stepper Indicator */}
        <HStack space="xs" className="items-center justify-between px-3">
          <VStack space="xs" className="items-center">
            <Box className="w-5 h-5 rounded-full bg-primary items-center justify-center">
              <Text
                size="xs"
                className="text-primary-foreground text-[10px] font-bold"
              >
                1
              </Text>
            </Box>
            <Text
              size="xs"
              className="text-[9px] font-bold text-foreground"
            >
              Nominal
            </Text>
          </VStack>
          <Box className="flex-1 h-0.5 bg-border mx-2 -mt-3" />
          <VStack space="xs" className="items-center">
            <Box className="w-5 h-5 rounded-full bg-muted items-center justify-center">
              <Text
                size="xs"
                className="text-muted-foreground text-[10px] font-bold"
              >
                2
              </Text>
            </Box>
            <Text
              size="xs"
              className="text-[9px] font-medium text-muted-foreground"
            >
              Rekening
            </Text>
          </VStack>
          <Box className="flex-1 h-0.5 bg-border mx-2 -mt-3" />
          <VStack space="xs" className="items-center">
            <Box className="w-5 h-5 rounded-full bg-muted items-center justify-center">
              <Text
                size="xs"
                className="text-muted-foreground text-[10px] font-bold"
              >
                3
              </Text>
            </Box>
            <Text
              size="xs"
              className="text-[9px] font-medium text-muted-foreground"
            >
              Selesai
            </Text>
          </VStack>
        </HStack>

        {/* Amount Field */}
        <FormControl>
          <Box className="bg-muted rounded-xl px-3 py-1 flex-row items-center justify-between">
            <Text
              size="xs"
              className="font-bold text-muted-foreground mr-2"
            >
              Rp
            </Text>
            <Input className="flex-1 border-0 h-9 bg-transparent px-0">
              <InputField
                value={withdrawAmt}
                onChangeText={onChangeWithdrawAmt}
                className="text-base font-bold text-foreground p-0"
              />
            </Input>
            <Pressable
              onPress={onSetMax}
              accessibilityRole="button"
              accessibilityLabel="Set nominal maksimal"
              className="active:opacity-70"
            >
              <Text size="xs" className="font-bold text-primary">
                Maks
              </Text>
            </Pressable>
          </Box>
        </FormControl>

        {/* Bank Row */}
        <Pressable
          onPress={onManageBank}
          className="bg-muted rounded-xl p-2.5 flex-row items-center justify-between active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Atur atau ubah rekening bank"
        >
          <HStack space="sm" className="items-center">
            <CreditCard size={16} className="text-secondary" />
            <VStack>
              <Text size="xs" className="font-semibold text-foreground">
                Rekening Pencairan (BCA ••••• 8920)
              </Text>
              <Text
                size="xs"
                className="text-[10px] text-primary font-medium"
              >
                Ketuk untuk kelola rekening bank
              </Text>
            </VStack>
          </HStack>
          <HStack space="xs" className="items-center">
            <ChevronRight
              size={14}
              className="text-muted-foreground ml-1"
            />
          </HStack>
        </Pressable>

        {/* Withdraw CTA */}
        <Button
          isDisabled={isSubmitting || !isAvailable}
          onPress={onConfirmWithdraw}
          accessibilityRole="button"
          accessibilityLabel={`Tarik Rp${withdrawAmt} sekarang`}
          className="w-full h-[48px] bg-primary rounded-xl flex-row items-center justify-center gap-2 active:opacity-90"
        >
          <ButtonIcon
            as={ArrowDownCircle}
            className="text-primary-foreground"
          />
          <ButtonText className="text-primary-foreground font-bold text-xs">
            Tarik Rp{withdrawAmt} sekarang
          </ButtonText>
        </Button>
      </VStack>
    </Card>
  );
}
