import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // القيم الافتراضية — تُستبدل ديناميكياً بألوان كل مدرسة عبر CSS variables (راجع SchoolSettings)
        brand: {
          DEFAULT: "var(--brand-color, #1d4ed8)",
          fg: "var(--brand-fg, #ffffff)",
        },
      },
      fontFamily: {
        arabic: ["var(--font-cairo)", "sans-serif"],
        latin: ["var(--font-inter)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
