import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gov-navy": "#1a3a6b",
        "gov-navy-dark": "#122a52",
        "gov-blue": "#2c5f9e",
        "gov-orange": "#f7941d",
        "gov-orange-dark": "#d97a0a",
        "gov-light": "#f5f7fa",
        "gov-border": "#c8d0dc",
        "gov-text": "#1a1a2e",
        "gov-link": "#1a56a0",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica Neue", "Helvetica", "sans-serif"],
      },
      animation: {
        ticker: "ticker 30s linear infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
