import React, { forwardRef, memo } from "react";
import { headingStyle } from "./styles";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
type IHeadingProps = VariantProps<typeof headingStyle> &
  React.ComponentPropsWithoutRef<"h1"> & {
    as?: React.ElementType;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
  };

const MappedHeading = memo(
  forwardRef<HTMLHeadingElement, IHeadingProps>(function MappedHeading(
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
          <h1
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
            ref={ref}
          />
        );
      case 2:
        return (
          <h2
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
            ref={ref}
          />
        );
      case 3:
        return (
          <h3
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
            ref={ref}
          />
        );
      case 4:
        return (
          <h4
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
            ref={ref}
          />
        );
      case 5:
        return (
          <h5
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
            ref={ref}
          />
        );
      case 6:
        return (
          <h6
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
            ref={ref}
          />
        );
      default:
        return (
          <h4
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
            ref={ref}
          />
        );
    }
  }),
);

const Heading = memo(
  forwardRef<HTMLHeadingElement, IHeadingProps>(function Heading(
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
          ref={ref}
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
