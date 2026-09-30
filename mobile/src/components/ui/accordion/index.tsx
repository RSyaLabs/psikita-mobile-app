"use client";
import React from "react";
import { View, Text, Pressable } from "react-native";
import { createAccordion } from "@gluestack-ui/core/accordion/creator";
import { UIIcon } from "@gluestack-ui/core/icon/creator";
import {
  tva,
  withStyleContext,
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

const SCOPE = "ACCORDION";
const ITEM_SCOPE = "ACCORDION_ITEM";

const UIAccordion = createAccordion({
  Root: withStyleContext(View, SCOPE),
  Item: withStyleContext(View, ITEM_SCOPE),
  Header: View,
  Trigger: Pressable,
  Content: View,
  Icon: UIIcon,
  TitleText: Text,
  ContentText: Text,
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

const accordionStyle = tva({
  base: "w-full rounded-xl overflow-hidden border border-border bg-card divide-y divide-border",
});

const accordionItemStyle = tva({
  base: "w-full",
});

const accordionHeaderStyle = tva({
  base: "w-full",
});

const accordionTriggerStyle = tva({
  base: "w-full py-3.5 px-4 flex-row justify-between items-center bg-card data-[hover=true]:bg-muted/40 data-[active=true]:bg-muted/40 data-[disabled=true]:opacity-40",
});

const accordionTitleTextStyle = tva({
  base: "text-sm font-semibold text-foreground flex-1 font-sans",
});

const accordionIconStyle = tva({
  base: "h-4 w-4 text-muted-foreground shrink-0 fill-none ml-2",
});

const accordionContentStyle = tva({
  base: "px-4 pt-1 pb-4 bg-card",
});

const accordionContentTextStyle = tva({
  base: "text-xs text-muted-foreground leading-relaxed font-sans",
});

type IAccordionProps = React.ComponentPropsWithoutRef<typeof UIAccordion> &
  VariantProps<typeof accordionStyle> & { className?: string };

const Accordion = React.forwardRef<
  React.ElementRef<typeof UIAccordion>,
  IAccordionProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion
      ref={ref}
      {...props}
      className={accordionStyle({ class: className })}
    />
  );
});

type IAccordionItemProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Item
> &
  VariantProps<typeof accordionItemStyle> & { className?: string };

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Item>,
  IAccordionItemProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Item
      ref={ref}
      {...props}
      className={accordionItemStyle({ class: className })}
    />
  );
});

type IAccordionHeaderProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Header
> &
  VariantProps<typeof accordionHeaderStyle> & { className?: string };

const AccordionHeader = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Header>,
  IAccordionHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Header
      ref={ref}
      {...props}
      className={accordionHeaderStyle({ class: className })}
    />
  );
});

type IAccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Trigger
> &
  VariantProps<typeof accordionTriggerStyle> & { className?: string };

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Trigger>,
  IAccordionTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Trigger
      ref={ref}
      {...props}
      className={accordionTriggerStyle({ class: className })}
    />
  );
});

type IAccordionTitleTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.TitleText
> &
  VariantProps<typeof accordionTitleTextStyle> & { className?: string };

const AccordionTitleText = React.forwardRef<
  React.ElementRef<typeof UIAccordion.TitleText>,
  IAccordionTitleTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.TitleText
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({ class: className })}
    />
  );
});

type IAccordionIconProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Icon
> &
  VariantProps<typeof accordionIconStyle> & {
    className?: string;
    as?: React.ElementType;
    size?: number;
  };

const AccordionIcon = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Icon>,
  IAccordionIconProps
>(({ className, size, ...props }, ref) => {
  return (
    <UIAccordion.Icon
      ref={ref}
      size={size}
      {...props}
      className={accordionIconStyle({ class: className })}
    />
  );
});

type IAccordionContentProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Content
> &
  VariantProps<typeof accordionContentStyle> & { className?: string };

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Content>,
  IAccordionContentProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Content
      ref={ref}
      {...props}
      className={accordionContentStyle({ class: className })}
    />
  );
});

type IAccordionContentTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.ContentText
> &
  VariantProps<typeof accordionContentTextStyle> & { className?: string };

const AccordionContentText = React.forwardRef<
  React.ElementRef<typeof UIAccordion.ContentText>,
  IAccordionContentTextProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.ContentText
      ref={ref}
      {...props}
      className={accordionContentTextStyle({ class: className })}
    />
  );
});

Accordion.displayName = "Accordion";
AccordionItem.displayName = "AccordionItem";
AccordionHeader.displayName = "AccordionHeader";
AccordionTrigger.displayName = "AccordionTrigger";
AccordionTitleText.displayName = "AccordionTitleText";
AccordionIcon.displayName = "AccordionIcon";
AccordionContent.displayName = "AccordionContent";
AccordionContentText.displayName = "AccordionContentText";

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionIcon,
  AccordionContent,
  AccordionContentText,
};
