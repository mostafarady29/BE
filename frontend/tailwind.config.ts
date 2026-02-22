import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sync these with your actual @/constants/colors values
        navy: "var(--color-navy)",
        blue: {
          DEFAULT: "var(--color-blue)",
          light: "var(--color-blue-light)",
          faint: "var(--color-blue-faint)",
        },
        crimson: "var(--color-crimson)",
        surface: "var(--color-surface)",
        border: {
          DEFAULT: "var(--color-border)",
          light: "var(--color-border-light)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
      },
      fontFamily: {
        amiri: ["var(--font-amiri)", "serif"],
      },
      maxWidth: {
        container: "1200px",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease",
      },
    },
  },
  plugins: [],
};

export default config;
