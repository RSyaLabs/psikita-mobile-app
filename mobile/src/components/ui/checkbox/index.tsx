"use client";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { createCheckbox } from "@gluestack-ui/core/checkbox/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "CHECKBOX";

const UICheckbox = createCheckbox({
  Root: withStyleContext(Pressable, SCOPE),
  Group: View,
  Indicator: View,
  Icon: UIIcon,
  Label: Text,
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

const checkboxStyle = tva({
  base: "group/checkbox flex-row items-center justify-start web:cursor-pointer data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40",
});

const checkboxGroupStyle = tva({
  base: "gap-2.5",
});

const checkboxIndicatorStyle = tva({
  base: "justify-center items-center rounded-md border-2 border-border bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary h-5 w-5",
});

const checkboxIconStyle = tva({
  base: "h-3.5 w-3.5 text-primary-foreground fill-none stroke-current pointer-events-none",
});

const checkboxLabelStyle = tva({
  base: "text-foreground font-sans text-sm ml-2.5 flex-1",
});

type ICheckboxGroupProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Group
> &
  VariantProps<typeof checkboxGroupStyle> & { className?: string };

const CheckboxGroup = React.forwardRef<
  React.ElementRef<typeof UICheckbox.Group>,
  ICheckboxGroupProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox.Group
      ref={ref}
      {...props}
      className={checkboxGroupStyle({ class: className })}
    />
  );
});

type ICheckboxProps = React.ComponentPropsWithoutRef<typeof UICheckbox> &
  VariantProps<typeof checkboxStyle> & { className?: string };

const Checkbox = React.forwardRef<
  React.ElementRef<typeof UICheckbox>,
  ICheckboxProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox
      ref={ref}
      {...props}
      className={checkboxStyle({ class: className })}
    />
  );
});

type ICheckboxIndicatorProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Indicator
> &
  VariantProps<typeof checkboxIndicatorStyle> & { className?: string };

const CheckboxIndicator = React.forwardRef<
  React.ElementRef<typeof UICheckbox.Indicator>,
  ICheckboxIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox.Indicator
      ref={ref}
      {...props}
      className={checkboxIndicatorStyle({ class: className })}
    />
  );
});

type ICheckboxLabelProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Label
> &
  VariantProps<typeof checkboxLabelStyle> & { className?: string };

const CheckboxLabel = React.forwardRef<
  React.ElementRef<typeof UICheckbox.Label>,
  ICheckboxLabelProps
>(({ className, ...props }, ref) => {
  return (
    <UICheckbox.Label
      ref={ref}
      {...props}
      className={checkboxLabelStyle({ class: className })}
    />
  );
});

type ICheckboxIconProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Icon
> &
  VariantProps<typeof checkboxIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
  };

const CheckboxIcon = React.forwardRef<
  React.ElementRef<typeof UICheckbox.Icon>,
  ICheckboxIconProps
>(({ className, size, ...props }, ref) => {
  return (
    <UICheckbox.Icon
      ref={ref}
      size={size}
      {...props}
      className={checkboxIconStyle({ class: className })}
    />
  );
});

Checkbox.displayName = "Checkbox";
CheckboxGroup.displayName = "CheckboxGroup";
CheckboxIndicator.displayName = "CheckboxIndicator";
CheckboxLabel.displayName = "CheckboxLabel";
CheckboxIcon.displayName = "CheckboxIcon";

export {
  Checkbox,
  CheckboxGroup,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxIcon,
};
