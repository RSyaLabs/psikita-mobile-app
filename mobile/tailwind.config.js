/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(255 255 255 / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        emerald: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          hover: "#255934",
          light: "rgb(var(--muted) / <alpha-value>)"
        },
        sage: {
          DEFAULT: "rgb(var(--background) / <alpha-value>)",
          50: "#F6F8F6",
          100: "rgb(var(--background) / <alpha-value>)",
          200: "rgb(var(--muted) / <alpha-value>)",
          300: "#CBD5CB",
          400: "#A9BFAE",
          500: "rgb(var(--muted-foreground) / <alpha-value>)",
          600: "#505E50"
        },
        divider: "rgb(var(--border) / <alpha-value>)",
        chip: "rgb(var(--muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["System", "Inter", "sans-serif"],
        display: ["Funnel Sans", "System", "sans-serif"]
      },
      boxShadow: {
        none: "none",
        xs: "none",
        sm: "none",
        DEFAULT: "none",
        md: "none",
        lg: "none",
        xl: "none",
        "2xl": "none",
        "hard-1": "none",
        "hard-2": "none",
        "hard-3": "none",
        "hard-4": "none",
        "hard-5": "none",
        "soft-1": "none",
        "soft-2": "none",
        "soft-3": "none",
        "soft-4": "none",
      }
    },
  },
  plugins: [],
};
