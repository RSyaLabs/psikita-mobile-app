"use client";
import React from "react";
import { View, Text } from "react-native";
import { createAlert } from "@gluestack-ui/core/alert/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "ALERT";

const UIAlert = createAlert({
  Root: withStyleContext(View, SCOPE),
  Text: Text,
  Icon: UIIcon,
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

const alertStyle = tva({
  base: "w-full p-3.5 rounded-lg flex-row items-center gap-3 border",
  variants: {
    action: {
      error: "bg-destructive/10 border-destructive/30",
      warning: "bg-amber-500/10 border-amber-500/30",
      success: "bg-secondary/15 border-secondary/30",
      info: "bg-secondary/10 border-secondary/25",
      muted: "bg-muted border-border",
    },
  },
});

const alertTextStyle = tva({
  base: "text-sm flex-1 font-normal leading-relaxed",
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

const alertIconStyle = tva({
  base: "h-4 w-4 shrink-0 fill-none",
  parentVariants: {
    action: {
      error: "text-destructive",
      warning: "text-amber-700",
      success: "text-secondary",
      info: "text-secondary",
      muted: "text-muted-foreground",
    },
  },
});

type IAlertProps = React.ComponentPropsWithoutRef<typeof UIAlert> &
  VariantProps<typeof alertStyle> & { className?: string };

const Alert = React.forwardRef<React.ElementRef<typeof UIAlert>, IAlertProps>(
  ({ className, action = "info", ...props }, ref) => {
    return (
      <UIAlert
        ref={ref}
        {...props}
        className={alertStyle({ action, class: className })}
        context={{ action }}
      />
    );
  },
);

type IAlertTextProps = React.ComponentPropsWithoutRef<typeof UIAlert.Text> &
  VariantProps<typeof alertTextStyle> & { className?: string };

const AlertText = React.forwardRef<
  React.ElementRef<typeof UIAlert.Text>,
  IAlertTextProps
>(({ className, ...props }, ref) => {
  const { action: parentAction } = useStyleContext(SCOPE);
  return (
    <UIAlert.Text
      ref={ref}
      {...props}
      className={alertTextStyle({
        parentVariants: { action: parentAction },
        class: className,
      })}
    />
  );
});

type IAlertIconProps = React.ComponentPropsWithoutRef<typeof UIAlert.Icon> &
  VariantProps<typeof alertIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
    height?: number;
    width?: number;
  };

const AlertIcon = React.forwardRef<
  React.ElementRef<typeof UIAlert.Icon>,
  IAlertIconProps
>(({ className, size, ...props }, ref) => {
  const { action: parentAction } = useStyleContext(SCOPE);
  return (
    <UIAlert.Icon
      ref={ref}
      size={size}
      {...props}
      className={alertIconStyle({
        parentVariants: { action: parentAction },
        class: className,
      })}
    />
  );
});

Alert.displayName = "Alert";
AlertText.displayName = "AlertText";
AlertIcon.displayName = "AlertIcon";

export { Alert, AlertText, AlertIcon };
