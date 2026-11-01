import React from "react";
import { LucideIcon, LucideProps } from "lucide-react-native";

export type IconTone =
  | "primary"
  | "foreground"
  | "muted"
  | "white"
  | "destructive"
  | "secondary";

export interface AppIconProps extends Omit<LucideProps, "color"> {
  icon: LucideIcon;
  color?: string;
  tone?: IconTone;
  size?: number;
}

const TONE_COLORS: Record<IconTone, string> = {
  primary: "#4A3B6B",      // Sera Calm Purple
  foreground: "#262130",   // Sera Deep Ink
  muted: "#4B4656",        // High contrast Dark Charcoal
  white: "#FFFFFF",        // Pure White
  destructive: "#DC2626",  // Clear Danger Red
  secondary: "#4A3B6B",    // Harmonized Purple
};

/**
 * AppIcon ensures Lucide SVG icons always have an explicit stroke color
 * on native Android, preventing transparent or invisible icons caused by
 * CSS className color resolution failure on React Native SVG.
 */
export function AppIcon({
  icon: IconComponent,
  color,
  tone = "foreground",
  size = 20,
  strokeWidth = 2,
  ...rest
}: AppIconProps) {
  const resolvedColor = color ?? TONE_COLORS[tone] ?? TONE_COLORS.foreground;

  return (
    <IconComponent
      size={size}
      color={resolvedColor}
      strokeWidth={strokeWidth}
      {...rest}
    />
  );
}

export default AppIcon;
