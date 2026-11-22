"use client";
import React from "react";
import { View, Text } from "react-native";
import { createFormControl } from "@gluestack-ui/core/form-control/creator";
import {
  tva,
  withStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import { UIIcon } from "@gluestack-ui/core/icon/creator";

const SCOPE = "FORM_CONTROL";

const UIFormControl = createFormControl({
  Root: withStyleContext(View, SCOPE),
  Error: withStyleContext(View, SCOPE),
  ErrorText: Text,
  ErrorIcon: UIIcon,
  Label: withStyleContext(View, SCOPE),
  LabelText: Text,
  LabelAstrick: Text,
  Helper: withStyleContext(View, SCOPE),
  HelperText: Text,
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

const formControlStyle = tva({
  base: "flex flex-col gap-1.5 w-full",
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const formControlLabelStyle = tva({
  base: "flex flex-row justify-start items-center gap-1",
});

const formControlLabelTextStyle = tva({
  base: "font-medium text-foreground text-sm md:text-sm",
});

const formControlHelperStyle = tva({
  base: "flex flex-row justify-start items-center gap-1 mt-1",
});

const formControlHelperTextStyle = tva({
  base: "text-muted-foreground text-sm font-normal",
});

const formControlErrorStyle = tva({
  base: "flex flex-row justify-start items-center gap-1 mt-1",
});

const formControlErrorTextStyle = tva({
  base: "text-destructive text-sm font-normal",
});

const formControlErrorIconStyle = tva({
  base: "text-destructive fill-none h-3.5 w-3.5",
});

type IFormControlProps = React.ComponentProps<typeof UIFormControl> &
  VariantProps<typeof formControlStyle> & {
    className?: string;
    id?: string;
    isRequired?: boolean;
    isInvalid?: boolean;
  };

const FormControl = React.forwardRef<
  React.ComponentRef<typeof UIFormControl>,
  IFormControlProps
>(function FormControl({ className, size = "md", ...props }, ref) {
  return (
    <UIFormControl
      ref={ref}
      {...props}
      className={formControlStyle({ size, class: className })}
      context={{ size }}
    />
  );
});

type IFormControlLabelProps = React.ComponentProps<typeof UIFormControl.Label> &
  VariantProps<typeof formControlLabelStyle> & {
    className?: string;
    htmlFor?: string;
  };

const FormControlLabel = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Label>,
  IFormControlLabelProps
>(function FormControlLabel({ className, ...props }, ref) {
  return (
    <UIFormControl.Label
      ref={ref}
      {...props}
      className={formControlLabelStyle({ class: className })}
    />
  );
});

type IFormControlLabelTextProps = React.ComponentProps<
  typeof UIFormControl.Label.Text
> &
  VariantProps<typeof formControlLabelTextStyle> & { className?: string };

const FormControlLabelText = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Label.Text>,
  IFormControlLabelTextProps
>(function FormControlLabelText({ className, ...props }, ref) {
  return (
    <UIFormControl.Label.Text
      ref={ref}
      {...props}
      className={formControlLabelTextStyle({ class: className })}
    />
  );
});

type IFormControlHelperProps = React.ComponentProps<
  typeof UIFormControl.Helper
> &
  VariantProps<typeof formControlHelperStyle> & { className?: string };

const FormControlHelper = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Helper>,
  IFormControlHelperProps
>(function FormControlHelper({ className, ...props }, ref) {
  return (
    <UIFormControl.Helper
      ref={ref}
      {...props}
      className={formControlHelperStyle({ class: className })}
    />
  );
});

type IFormControlHelperTextProps = React.ComponentProps<
  typeof UIFormControl.Helper.Text
> &
  VariantProps<typeof formControlHelperTextStyle> & { className?: string };

const FormControlHelperText = React.forwardRef<
  React.ComponentRef<typeof UIFormControl.Helper.Text>,
  IFormControlHelperTextProps
>(function FormControlHelperText({ className, ...props }, ref) {
  return (
    <UIFormControl.Helper.Text
      ref={ref}
      {...props}
      className={formControlHelperTextStyle({ class: className })}
    />
  );
});

export {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
};
