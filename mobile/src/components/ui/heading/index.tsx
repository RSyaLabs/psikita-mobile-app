import React, { forwardRef, memo } from "react";
import { H1, H2, H3, H4, H5, H6 } from "@expo/html-elements";
import { headingStyle } from "./styles";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";

type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<typeof H1> & {
    as?: React.ElementType;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  };

cssInterop(H1, { className: "style" });
cssInterop(H2, { className: "style" });
cssInterop(H3, { className: "style" });
cssInterop(H4, { className: "style" });
cssInterop(H5, { className: "style" });
cssInterop(H6, { className: "style" });

const MappedHeading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(
    function MappedHeading(
      {
        size,
        level,
        className,
        isTruncated,
        bold,
        underline,
        strikeThrough,
        sub,
        italic,
        highlight,
        ...props
      },
      ref,
    ) {
      const resolvedLevel = level ?? 2;
      switch (resolvedLevel) {
        case 1:
          return (
            <H1
              accessibilityLevel={1}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        case 2:
          return (
            <H2
              accessibilityLevel={2}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        case 3:
          return (
            <H3
              accessibilityLevel={3}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        case 4:
          return (
            <H4
              accessibilityLevel={4}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        case 5:
          return (
            <H5
              accessibilityLevel={5}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        case 6:
          return (
            <H6
              accessibilityLevel={6}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
        default:
          return (
            <H4
              accessibilityLevel={4}
              className={headingStyle({
                size,
                isTruncated: isTruncated as boolean,
                bold: bold as boolean,
                underline: underline as boolean,
                strikeThrough: strikeThrough as boolean,
                sub: sub as boolean,
                italic: italic as boolean,
                highlight: highlight as boolean,
                class: className,
              })}
              {...props}
              // @ts-expect-error : type issue
              ref={ref}
            />
          );
      }
    },
  ),
);

const Heading = memo(
  forwardRef<React.ComponentRef<typeof H1>, IHeadingProps>(function Heading(
    { className, size = "lg", level, as: AsComp, ...props },
    ref,
  ) {
    const {
      isTruncated,
      bold,
      underline,
      strikeThrough,
      sub,
      italic,
      highlight,
    } = props;

    if (AsComp) {
      return (
        <AsComp
          role="heading"
          aria-level={level ?? 2}
          className={headingStyle({
            size,
            isTruncated: isTruncated as boolean,
            bold: bold as boolean,
            underline: underline as boolean,
            strikeThrough: strikeThrough as boolean,
            sub: sub as boolean,
            italic: italic as boolean,
            highlight: highlight as boolean,
            class: className,
          })}
          {...props}
        />
      );
    }

    return (
      <MappedHeading
        className={className}
        size={size}
        level={level}
        ref={ref}
        {...props}
      />
    );
  }),
);

Heading.displayName = "Heading";

export { Heading };
