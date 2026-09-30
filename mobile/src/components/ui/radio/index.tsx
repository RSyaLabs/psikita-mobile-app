"use client";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { createRadio } from "@gluestack-ui/core/radio/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "RADIO";

const UIRadio = createRadio({
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

const radioStyle = tva({
  base: "group/radio flex-row items-center justify-start web:cursor-pointer data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40",
});

const radioGroupStyle = tva({
  base: "gap-2.5",
});

const radioIndicatorStyle = tva({
  base: "justify-center items-center rounded-full border-2 border-border bg-card data-[checked=true]:border-primary data-[checked=true]:bg-primary h-5 w-5",
});

const radioIconStyle = tva({
  base: "h-2 w-2 rounded-full bg-primary-foreground fill-primary-foreground pointer-events-none",
});

const radioLabelStyle = tva({
  base: "text-foreground font-sans text-sm ml-3 flex-1",
});

type IRadioGroupProps = React.ComponentPropsWithoutRef<typeof UIRadio.Group> &
  VariantProps<typeof radioGroupStyle> & { className?: string };

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof UIRadio.Group>,
  IRadioGroupProps
>(({ className, ...props }, ref) => {
  return (
    <UIRadio.Group
      ref={ref}
      {...props}
      className={radioGroupStyle({ class: className })}
    />
  );
});

type IRadioProps = React.ComponentPropsWithoutRef<typeof UIRadio> &
  VariantProps<typeof radioStyle> & { className?: string };

const Radio = React.forwardRef<React.ElementRef<typeof UIRadio>, IRadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <UIRadio
        ref={ref}
        {...props}
        className={radioStyle({ class: className })}
      />
    );
  },
);

type IRadioIndicatorProps = React.ComponentPropsWithoutRef<
  typeof UIRadio.Indicator
> &
  VariantProps<typeof radioIndicatorStyle> & { className?: string };

const RadioIndicator = React.forwardRef<
  React.ElementRef<typeof UIRadio.Indicator>,
  IRadioIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <UIRadio.Indicator
      ref={ref}
      {...props}
      className={radioIndicatorStyle({ class: className })}
    />
  );
});

type IRadioLabelProps = React.ComponentPropsWithoutRef<typeof UIRadio.Label> &
  VariantProps<typeof radioLabelStyle> & { className?: string };

const RadioLabel = React.forwardRef<
  React.ElementRef<typeof UIRadio.Label>,
  IRadioLabelProps
>(({ className, ...props }, ref) => {
  return (
    <UIRadio.Label
      ref={ref}
      {...props}
      className={radioLabelStyle({ class: className })}
    />
  );
});

type IRadioIconProps = React.ComponentPropsWithoutRef<typeof UIRadio.Icon> &
  VariantProps<typeof radioIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
  };

const RadioIcon = React.forwardRef<
  React.ElementRef<typeof UIRadio.Icon>,
  IRadioIconProps
>(({ className, size, ...props }, ref) => {
  return (
    <UIRadio.Icon
      ref={ref}
      size={size}
      {...props}
      className={radioIconStyle({ class: className })}
    />
  );
});

Radio.displayName = "Radio";
RadioGroup.displayName = "RadioGroup";
RadioIndicator.displayName = "RadioIndicator";
RadioLabel.displayName = "RadioLabel";
RadioIcon.displayName = "RadioIcon";

export { Radio, RadioGroup, RadioIndicator, RadioLabel, RadioIcon };
