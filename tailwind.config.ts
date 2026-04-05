import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ["var(--font-cairo)", "Cairo", "sans-serif"],
        sans: ["var(--font-cairo)", "Cairo", "sans-serif"],
      },
      colors: {
        "warm-bg": "var(--bg)",
        walnut: "var(--bg-2)",
        gold: "var(--accent)",
        ink: "var(--text)",
        plum: "var(--text-cta)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          foreground: "var(--surface-foreground)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
        lg: "calc(var(--radius) + 4px)",
        xl: "calc(var(--radius) + 8px)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
      },
    },
  },
  plugins: [],
};

export default config;
