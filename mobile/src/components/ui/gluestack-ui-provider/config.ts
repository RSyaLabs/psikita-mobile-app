import { vars } from "nativewind";

// Raw color values - update these and they sync everywhere
export const colors = {
  light: {
    "--primary": "74 59 107", // #4a3b6b (Sera Calibrated Brand Purple - Deep, Calm, High Contrast)
    "--primary-foreground": "255 255 255",
    "--card": "255 255 255",
    "--secondary": "74 59 107", // Harmonized Brand Purple (zero clashing green)
    "--secondary-foreground": "255 255 255",
    "--background": "248 247 238", // #f8f7ee (Sera Cream)
    "--popover": "255 255 255",
    "--popover-foreground": "38 33 48", // #262130 (Sera Deep Ink - Contrast 14.2:1)
    "--muted": "234 228 242", // #eae4f2 (Soft Lavender Tint)
    "--muted-foreground": "75 70 86", // #4b4656 (Dark Charcoal Text - WCAG AAA 7.5:1)
    "--destructive": "207 36 36",
    "--foreground": "38 33 48", // #262130 (Sera Deep Ink - Contrast 14.2:1)
    "--border": "207 200 216", // #cfc8d8 (Crisp Line)
    "--input": "207 200 216",
    "--ring": "74 59 107",
    "--accent": "216 201 240", // #d8c9f0
    "--accent-foreground": "38 33 48",
    "--warning": "165 90 5",
    "--warning-foreground": "255 255 255",
  },
  dark: {
    "--primary-foreground": "255 255 255",
    "--primary": "130 114 170",
    "--card": "35 31 46",
    "--secondary": "94 129 89",
    "--secondary-foreground": "255 255 255",
    "--background": "25 22 33",
    "--popover": "35 31 46",
    "--popover-foreground": "248 247 238",
    "--muted": "47 42 61",
    "--muted-foreground": "180 175 195",
    "--destructive": "255 100 103",
    "--foreground": "248 247 238",
    "--border": "58 52 75",
    "--input": "58 52 75",
    "--accent": "47 42 61",
    "--accent-foreground": "248 247 238",
    "--warning": "245 158 11",
    "--warning-foreground": "23 23 23",
    "--ring": "130 114 170",
  },
};

// Config for nativewind vars() - used by provider
export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
