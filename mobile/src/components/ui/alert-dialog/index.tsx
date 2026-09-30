"use client";
import React from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { createAlertDialog } from "@gluestack-ui/core/alert-dialog/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "ALERT_DIALOG";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

cssInterop(AnimatedPressable, { className: "style" });
cssInterop(AnimatedView, { className: "style" });

const UIAlertDialog = createAlertDialog({
  Root: withStyleContext(View, SCOPE),
  Backdrop: AnimatedPressable,
  Content: AnimatedView,
  CloseButton: Pressable,
  Header: View,
  Footer: View,
  Body: ScrollView,
});

const alertDialogStyle = tva({
  base: "w-full h-full justify-center items-center web:pointer-events-none p-4",
});

const alertDialogBackdropStyle = tva({
  base: "absolute left-0 top-0 right-0 bottom-0 bg-black/40 backdrop-blur-md web:cursor-default",
});

const alertDialogContentStyle = tva({
  base: "bg-card rounded-2xl overflow-hidden border border-border p-6 w-full max-w-[360px] mx-auto",
  variants: {
    size: {
      sm: "max-w-[320px]",
      md: "max-w-[360px]",
      lg: "max-w-[420px]",
    },
  },
});

const alertDialogHeaderStyle = tva({
  base: "justify-between items-center flex-row mb-3",
});

const alertDialogBodyStyle = tva({
  base: "mb-6",
});

const alertDialogFooterStyle = tva({
  base: "flex-row justify-end items-center gap-3",
});

const alertDialogCloseButtonStyle = tva({
  base: "z-10 rounded-md p-1 data-[hover=true]:bg-muted",
});

type IAlertDialogProps = React.ComponentPropsWithoutRef<typeof UIAlertDialog> &
  VariantProps<typeof alertDialogStyle> & { className?: string };

const AlertDialog = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog>,
  IAlertDialogProps
>(({ className, ...props }, ref) => {
  return (
    <UIAlertDialog
      ref={ref}
      {...props}
      pointerEvents="box-none"
      className={alertDialogStyle({ class: className })}
    />
  );
});

type IAlertDialogBackdropProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.Backdrop
> &
  VariantProps<typeof alertDialogBackdropStyle> & {
    className?: string;
    dataSet?: Record<string, any>;
  };

const AlertDialogBackdrop = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.Backdrop>,
  IAlertDialogBackdropProps
>(({ className, style, children, dataSet, ...props }, ref) => {
  return (
    <UIAlertDialog.Backdrop
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
      className={alertDialogBackdropStyle({ class: className })}
    >
      <BlurView
        intensity={60}
        tint="dark"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children as any}
    </UIAlertDialog.Backdrop>
  );
});

type IAlertDialogContentProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.Content
> &
  VariantProps<typeof alertDialogContentStyle> & { className?: string };

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.Content>,
  IAlertDialogContentProps
>(({ className, size = "md", ...props }, ref) => {
  return (
    <UIAlertDialog.Content
      ref={ref}
      entering={ZoomIn.duration(200).withInitialValues({
        transform: [{ scale: 0.92 }],
        opacity: 0,
      })}
      exiting={FadeOut.duration(150)}
      {...props}
      pointerEvents="auto"
      className={alertDialogContentStyle({ size, class: className })}
    />
  );
});

type IAlertDialogHeaderProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.Header
> &
  VariantProps<typeof alertDialogHeaderStyle> & { className?: string };

const AlertDialogHeader = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.Header>,
  IAlertDialogHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <UIAlertDialog.Header
      ref={ref}
      {...props}
      className={alertDialogHeaderStyle({ class: className })}
    />
  );
});

type IAlertDialogBodyProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.Body
> &
  VariantProps<typeof alertDialogBodyStyle> & { className?: string };

const AlertDialogBody = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.Body>,
  IAlertDialogBodyProps
>(({ className, ...props }, ref) => {
  return (
    <UIAlertDialog.Body
      ref={ref}
      scrollEnabled={false}
      {...props}
      className={alertDialogBodyStyle({ class: className })}
    />
  );
});

type IAlertDialogFooterProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.Footer
> &
  VariantProps<typeof alertDialogFooterStyle> & { className?: string };

const AlertDialogFooter = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.Footer>,
  IAlertDialogFooterProps
>(({ className, ...props }, ref) => {
  return (
    <UIAlertDialog.Footer
      ref={ref}
      {...props}
      className={alertDialogFooterStyle({ class: className })}
    />
  );
});

type IAlertDialogCloseButtonProps = React.ComponentPropsWithoutRef<
  typeof UIAlertDialog.CloseButton
> &
  VariantProps<typeof alertDialogCloseButtonStyle> & { className?: string };

const AlertDialogCloseButton = React.forwardRef<
  React.ElementRef<typeof UIAlertDialog.CloseButton>,
  IAlertDialogCloseButtonProps
>(({ className, ...props }, ref) => {
  return (
    <UIAlertDialog.CloseButton
      ref={ref}
      {...props}
      className={alertDialogCloseButtonStyle({ class: className })}
    />
  );
});

AlertDialog.displayName = "AlertDialog";
AlertDialogBackdrop.displayName = "AlertDialogBackdrop";
AlertDialogContent.displayName = "AlertDialogContent";
AlertDialogHeader.displayName = "AlertDialogHeader";
AlertDialogBody.displayName = "AlertDialogBody";
AlertDialogFooter.displayName = "AlertDialogFooter";
AlertDialogCloseButton.displayName = "AlertDialogCloseButton";

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogCloseButton,
};
