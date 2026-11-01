import { vars } from "nativewind";

// Raw color values - update these and they sync everywhere
export const colors = {
  light: {
    "--primary": "107 91 149", // #6b5b95 (Sera Purple)
    "--primary-foreground": "255 255 255",
    "--card": "255 255 255",
    "--secondary": "94 129 89", // #5e8159 (Sera Sage Deep)
    "--secondary-foreground": "255 255 255",
    "--background": "248 247 238", // #f8f7ee (Sera Cream)
    "--popover": "255 255 255",
    "--popover-foreground": "47 42 61", // #2f2a3d (Sera Ink)
    "--muted": "241 235 250", // #f1ebfa (Sera Lavender Mist)
    "--muted-foreground": "98 94 110", // #625e6e (Sera Muted)
    "--destructive": "207 36 36",
    "--foreground": "47 42 61", // #2f2a3d (Sera Ink)
    "--border": "221 216 231", // #ddd8e7 (Sera Line)
    "--input": "221 216 231",
    "--ring": "107 91 149",
    "--accent": "216 201 240",
    "--accent-foreground": "47 42 61",
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
