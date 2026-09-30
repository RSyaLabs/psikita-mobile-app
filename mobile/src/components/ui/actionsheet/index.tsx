"use client";
import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  VirtualizedList,
  FlatList,
  SectionList,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { createActionsheet } from "@gluestack-ui/core/actionsheet/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "ACTIONSHEET";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

cssInterop(AnimatedPressable, { className: "style" });
cssInterop(AnimatedView, { className: "style" });
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

const UIActionsheet = createActionsheet({
  Root: withStyleContext(View, SCOPE),
  Backdrop: AnimatedPressable,
  Content: AnimatedView,
  DragIndicator: View,
  IndicatorWrapper: View,
  Item: Pressable,
  ItemText: Text,
  Icon: UIIcon,
  ScrollView: ScrollView,
  VirtualizedList: VirtualizedList,
  FlatList: FlatList,
  SectionList: SectionList,
  SectionHeaderText: Text,
});

const actionsheetStyle = tva({
  base: "w-full h-full justify-end items-center web:pointer-events-none",
});

const actionsheetBackdropStyle = tva({
  base: "absolute left-0 top-0 right-0 bottom-0 bg-black/40 backdrop-blur-md web:cursor-default",
});

const actionsheetContentStyle = tva({
  base: "items-center rounded-t-3xl pt-3 pb-8 px-5 bg-card border-t border-border w-full max-w-[430px] mx-auto",
});

const actionsheetDragIndicatorWrapperStyle = tva({
  base: "w-full items-center justify-center py-2 mb-2",
});

const actionsheetDragIndicatorStyle = tva({
  base: "w-12 h-1.5 bg-muted-foreground/30 rounded-full",
});

const actionsheetItemStyle = tva({
  base: "w-full flex-row items-center p-3 rounded-lg data-[hover=true]:bg-muted data-[active=true]:bg-muted data-[disabled=true]:opacity-40 gap-3",
});

const actionsheetItemTextStyle = tva({
  base: "text-foreground font-sans font-medium text-sm flex-1",
});

const actionsheetIconStyle = tva({
  base: "h-4 w-4 text-muted-foreground fill-none shrink-0",
});

type IActionsheetProps = React.ComponentPropsWithoutRef<typeof UIActionsheet> &
  VariantProps<typeof actionsheetStyle> & { className?: string };

const Actionsheet = React.forwardRef<
  React.ElementRef<typeof UIActionsheet>,
  IActionsheetProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet
      ref={ref}
      {...props}
      pointerEvents="box-none"
      className={actionsheetStyle({ class: className })}
    />
  );
});

type IActionsheetBackdropProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Backdrop
> &
  VariantProps<typeof actionsheetBackdropStyle> & {
    className?: string;
    dataSet?: Record<string, any>;
  };

const ActionsheetBackdrop = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Backdrop>,
  IActionsheetBackdropProps
>(({ className, style, children, dataSet, ...props }, ref) => {
  return (
    <UIActionsheet.Backdrop
      ref={ref}
      entering={FadeIn.duration(0)}
      exiting={FadeOut.duration(50)}
      {...({ dataSet: dataSet ?? { backdrop: "true" } } as any)}
      {...props}
      style={[
        style,
        {
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          transition: "none",
        } as any,
      ]}
      className={actionsheetBackdropStyle({ class: className })}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children as any}
    </UIActionsheet.Backdrop>
  );
});

type IActionsheetContentProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Content
> &
  VariantProps<typeof actionsheetContentStyle> & { className?: string };

const ActionsheetContent = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Content>,
  IActionsheetContentProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.Content
      ref={ref}
      {...props}
      pointerEvents="auto"
      className={actionsheetContentStyle({ class: className })}
    />
  );
});

type IActionsheetDragIndicatorWrapperProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.DragIndicatorWrapper
> &
  VariantProps<typeof actionsheetDragIndicatorWrapperStyle> & {
    className?: string;
  };

const ActionsheetDragIndicatorWrapper = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.DragIndicatorWrapper>,
  IActionsheetDragIndicatorWrapperProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.DragIndicatorWrapper
      ref={ref}
      {...props}
      className={actionsheetDragIndicatorWrapperStyle({ class: className })}
    />
  );
});

type IActionsheetDragIndicatorProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.DragIndicator
> &
  VariantProps<typeof actionsheetDragIndicatorStyle> & { className?: string };

const ActionsheetDragIndicator = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.DragIndicator>,
  IActionsheetDragIndicatorProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.DragIndicator
      ref={ref}
      {...props}
      className={actionsheetDragIndicatorStyle({ class: className })}
    />
  );
});

type IActionsheetItemProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Item
> &
  VariantProps<typeof actionsheetItemStyle> & { className?: string };

const ActionsheetItem = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Item>,
  IActionsheetItemProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.Item
      ref={ref}
      {...props}
      className={actionsheetItemStyle({ class: className })}
    />
  );
});

type IActionsheetItemTextProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.ItemText
> &
  VariantProps<typeof actionsheetItemTextStyle> & { className?: string };

const ActionsheetItemText = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.ItemText>,
  IActionsheetItemTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIActionsheet.ItemText
      ref={ref}
      {...props}
      className={actionsheetItemTextStyle({ class: className })}
    />
  );
});

type IActionsheetIconProps = React.ComponentPropsWithoutRef<
  typeof UIActionsheet.Icon
> &
  VariantProps<typeof actionsheetIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
  };

const ActionsheetIcon = React.forwardRef<
  React.ElementRef<typeof UIActionsheet.Icon>,
  IActionsheetIconProps
>(({ className, size, ...props }, ref) => {
  return (
    <UIActionsheet.Icon
      ref={ref}
      size={size}
      {...props}
      className={actionsheetIconStyle({ class: className })}
    />
  );
});

Actionsheet.displayName = "Actionsheet";
ActionsheetBackdrop.displayName = "ActionsheetBackdrop";
ActionsheetContent.displayName = "ActionsheetContent";
ActionsheetDragIndicator.displayName = "ActionsheetDragIndicator";
ActionsheetDragIndicatorWrapper.displayName = "ActionsheetDragIndicatorWrapper";
ActionsheetItem.displayName = "ActionsheetItem";
ActionsheetItemText.displayName = "ActionsheetItemText";
ActionsheetIcon.displayName = "ActionsheetIcon";

export {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  ActionsheetIcon,
};
