"use client";
import React from "react";
import { createInput } from "@gluestack-ui/core/input/creator";
import { View, Pressable, TextInput } from "react-native";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import { withStyleContext } from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIIcon } from "@gluestack-ui/core/icon/creator";

const SCOPE = "INPUT";

const UIInput = createInput({
  Root: withStyleContext(View, SCOPE),
  Icon: UIIcon,
  Slot: Pressable,
  Input: TextInput,
});

cssInterop(UIIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: "classNameColor",
      stroke: true,
    } as any,
  },
});

const inputStyle = tva({
  base: "h-9 w-full flex-row items-center rounded-md border border-border dark:bg-input/30 bg-transparent transition-[color,box-] overflow-hidden data-[focus=true]:outline-none data-[focus=true]:border-ring dark:data-[focus=true]:border-ring data-[focus=true]:web:ring-[3px] data-[focus=true]:web:ring-ring/50 data-[invalid=true]:border-destructive/40 dark:data-[invalid=true]:border-destructive/40 data-[invalid=true]:web:ring-destructive/20 dark:data-[invalid=true]:web:ring-destructive/40 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 px-3 gap-2",
});

const inputIconStyle = tva({
  base: "justify-center items-center text-muted-foreground fill-none h-4 w-4",
});

const inputSlotStyle = tva({
  base: "justify-center items-center web:disabled:cursor-not-allowed",
});

const inputFieldStyle = tva({
  base: "flex-1 text-foreground text-sm md:text-sm py-1 h-full placeholder:text-muted-foreground  web:outline-none ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed",
});

type IInputProps = React.ComponentProps<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string };
const Input = React.forwardRef<React.ComponentRef<typeof UIInput>, IInputProps>(
  function Input({ className, ...props }, ref) {
    return (
      <UIInput
        ref={ref}
        {...props}
        className={inputStyle({ class: className })}
        context={{}}
      />
    );
  },
);

type IInputIconProps = React.ComponentProps<typeof UIInput.Icon> &
  VariantProps<typeof inputIconStyle> & {
    className?: string;
    height?: number;
    width?: number;
  };

const InputIcon = React.forwardRef<
  React.ComponentRef<typeof UIInput.Icon>,
  IInputIconProps
>(function InputIcon({ className, ...props }, ref) {
  return (
    <UIInput.Icon
      ref={ref}
      {...props}
      className={inputIconStyle({ class: className })}
    />
  );
});

type IInputSlotProps = React.ComponentProps<typeof UIInput.Slot> &
  VariantProps<typeof inputSlotStyle> & { className?: string };

const InputSlot = React.forwardRef<
  React.ComponentRef<typeof UIInput.Slot>,
  IInputSlotProps
>(function InputSlot({ className, ...props }, ref) {
  return (
    <UIInput.Slot
      ref={ref}
      {...props}
      className={inputSlotStyle({
        class: className,
      })}
    />
  );
});

type IInputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & {
    className?: string;
    name?: string;
  };

const InputField = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  IInputFieldProps
>(function InputField({ className, accessibilityLabel, ...props }, ref) {
  return (
    <UIInput.Input
      ref={ref}
      {...props}
      // Gluestack destructures `aria-label` with a default of "Input Field" and
      // re-applies it to the underlying TextInput. On native, TextInput does not
      // consume `aria-label` at all (only `aria-labelledby`), so the caller label
      // passes through untouched. On web it is the `aria-label` that is announced,
      // so the fallback could win over the real field name. Forwarding the
      // explicit accessibilityLabel into `aria-label` makes the announced name
      // identical on both platforms. Verified against
      // react-native/Libraries/Components/TextInput/TextInput.js:1608-1645 and
      // View.js:43,103.
      {...(accessibilityLabel === undefined
        ? {}
        : { "aria-label": accessibilityLabel })}
      accessibilityLabel={accessibilityLabel}
      className={inputFieldStyle({
        class: className,
      })}
    />
  );
});

Input.displayName = "Input";
InputIcon.displayName = "InputIcon";
InputSlot.displayName = "InputSlot";
InputField.displayName = "InputField";

export { Input, InputField, InputIcon, InputSlot };
