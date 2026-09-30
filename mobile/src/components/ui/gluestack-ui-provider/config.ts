import { vars } from "nativewind";

// Raw color values - update these and they sync everywhere
export const colors = {
  light: {
    "--primary": "30 51 34", // #1E3322 (Forest Green)
    "--primary-foreground": "255 255 255",
    "--card": "255 255 255",
    "--secondary": "228 239 229", // #E4EFE5 (Emerald Light)
    "--secondary-foreground": "45 107 63", // #2D6B3F (Emerald)
    "--background": "237 242 237", // #EDF2ED (Sage Background)
    "--popover": "255 255 255",
    "--popover-foreground": "30 51 34",
    "--muted": "241 244 241",
    "--muted-foreground": "107 123 107",
    "--destructive": "220 38 38",
    "--foreground": "30 51 34",
    "--border": "198 214 202", // #C6D6CA
    "--input": "198 214 202",
    "--ring": "45 107 63",
    "--accent": "228 239 229",
    "--accent-foreground": "30 51 34",
    "--warning": "217 119 6",
    "--warning-foreground": "255 255 255",
  },
  dark: {
    "--primary-foreground": "23 23 23",
    "--primary": "255 245 245",
    "--card": "23 23 23",
    "--secondary": "38 38 38",
    "--secondary-foreground": "250 250 250",
    "--background": "10 10 10",
    "--popover": "23 23 23",
    "--popover-foreground": "250 250 250",
    "--muted": "38 38 38",
    "--muted-foreground": "161 161 161",
    "--destructive": "255 100 103",
    "--foreground": "250 250 250",
    "--border": "46 46 46",
    "--input": "46 46 46",
    "--accent": "38 38 38",
    "--accent-foreground": "250 250 250",
    "--warning": "245 158 11",
    "--warning-foreground": "23 23 23",
    "--ring": "115 115 115",
  },
};

// Config for nativewind vars() - used by provider
export const config = {
  light: vars(colors.light),
  dark: vars(colors.dark),
};
