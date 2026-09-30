"use client";
import React from "react";
import { View, Text } from "react-native";
import {
  createToast,
  createToastHook,
  ToastProvider,
} from "@gluestack-ui/core/toast/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";

const SCOPE = "TOAST";

const UIToast = createToast({
  Root: withStyleContext(View, SCOPE),
  Title: Text,
  Description: Text,
});

const useToast = createToastHook(View);

const toastStyle = tva({
  base: "p-4 rounded-xl border border-border bg-card gap-1 flex-col m-2 min-w-[300px] max-w-[380px]",
  variants: {
    action: {
      error: "border-destructive/30",
      warning: "border-amber-500/30",
      success: "border-secondary/30",
      info: "border-secondary/30",
      muted: "border-border",
    },
  },
});

const toastTitleStyle = tva({
  base: "text-sm font-semibold font-sans",
  parentVariants: {
    action: {
      error: "text-destructive",
      warning: "text-amber-800",
      success: "text-secondary",
      info: "text-secondary",
      muted: "text-foreground",
    },
  },
});

const toastDescriptionStyle = tva({
  base: "text-xs text-muted-foreground font-sans leading-relaxed",
});

type IToastProps = React.ComponentPropsWithoutRef<typeof UIToast> &
  VariantProps<typeof toastStyle> & { className?: string };

const Toast = React.forwardRef<React.ElementRef<typeof UIToast>, IToastProps>(
  ({ className, action = "info", ...props }, ref) => {
    return (
      <UIToast
        ref={ref}
        {...props}
        className={toastStyle({ action, class: className })}
        context={{ action }}
      />
    );
  },
);

type IToastTitleProps = React.ComponentPropsWithoutRef<typeof UIToast.Title> &
  VariantProps<typeof toastTitleStyle> & { className?: string };

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof UIToast.Title>,
  IToastTitleProps
>(({ className, ...props }, ref) => {
  const { action: parentAction } = useStyleContext(SCOPE);
  return (
    <UIToast.Title
      ref={ref}
      {...props}
      className={toastTitleStyle({
        parentVariants: { action: parentAction },
        class: className,
      })}
    />
  );
});

type IToastDescriptionProps = React.ComponentPropsWithoutRef<
  typeof UIToast.Description
> &
  VariantProps<typeof toastDescriptionStyle> & { className?: string };

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof UIToast.Description>,
  IToastDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <UIToast.Description
      ref={ref}
      {...props}
      className={toastDescriptionStyle({ class: className })}
    />
  );
});

Toast.displayName = "Toast";
ToastTitle.displayName = "ToastTitle";
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastTitle, ToastDescription, useToast, ToastProvider };
