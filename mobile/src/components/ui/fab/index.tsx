"use client";
import React from "react";
import { Pressable, Text } from "react-native";
import { createFab } from "@gluestack-ui/core/fab/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "FAB";

const UIFab = createFab({
  Root: withStyleContext(Pressable, SCOPE),
  Label: Text,
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

const fabStyle = tva({
  base: "bg-primary rounded-full z-20 flex-row items-center justify-center absolute data-[hover=true]:bg-primary/90 data-[active=true]:bg-primary/80 gap-2 cursor-pointer web:cursor-pointer",
  variants: {
    size: {
      sm: "px-3 py-2.5",
      md: "px-4 py-3.5",
      lg: "px-5 py-4",
    },
    placement: {
      "top right": "top-4 right-4",
      "top left": "top-4 left-4",
      "bottom right": "bottom-24 right-4",
      "bottom left": "bottom-24 left-4",
      "bottom center": "bottom-24 left-1/2 -translate-x-1/2",
      "top-right": "top-4 right-4",
      "top-left": "top-4 left-4",
      "bottom-right": "bottom-24 right-4",
      "bottom-left": "bottom-24 left-4",
      "bottom-center": "bottom-24 left-1/2 -translate-x-1/2",
    },
  },
});

const fabLabelStyle = tva({
  base: "text-primary-foreground font-semibold font-sans text-sm tracking-wide pointer-events-none web:pointer-events-none",
});

const fabIconStyle = tva({
  base: "h-4 w-4 text-primary-foreground fill-none stroke-current shrink-0",
});

type IFabProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIFab>,
  "placement"
> &
  VariantProps<typeof fabStyle> & {
    className?: string;
    placement?:
      | "top right"
      | "top left"
      | "bottom right"
      | "bottom left"
      | "bottom center"
      | "top-right"
      | "top-left"
      | "bottom-right"
      | "bottom-left"
      | "bottom-center";
  };

const Fab = React.forwardRef<React.ElementRef<typeof UIFab>, IFabProps>(
  ({ className, size = "md", placement = "bottom right", ...props }, ref) => {
    return (
      <UIFab
        ref={ref}
        {...props}
        className={fabStyle({
          size,
          placement: placement as any,
          class: className,
        })}
        context={{ size, placement }}
      />
    );
  },
);

type IFabLabelProps = React.ComponentPropsWithoutRef<typeof UIFab.Label> &
  VariantProps<typeof fabLabelStyle> & { className?: string };

const FabLabel = React.forwardRef<
  React.ElementRef<typeof UIFab.Label>,
  IFabLabelProps
>(({ className, ...props }, ref) => {
  return (
    <UIFab.Label
      ref={ref}
      {...props}
      className={fabLabelStyle({ class: className })}
    />
  );
});

type IFabIconProps = React.ComponentPropsWithoutRef<typeof UIFab.Icon> &
  VariantProps<typeof fabIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
  };

const FabIcon = React.forwardRef<
  React.ElementRef<typeof UIFab.Icon>,
  IFabIconProps
>(({ className, size, ...props }, ref) => {
  return (
    <UIFab.Icon
      ref={ref}
      size={size}
      {...props}
      className={fabIconStyle({ class: className })}
    />
  );
});

Fab.displayName = "Fab";
FabLabel.displayName = "FabLabel";
FabIcon.displayName = "FabIcon";

export { Fab, FabLabel, FabIcon };
