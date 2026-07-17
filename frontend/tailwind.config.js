import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: "#22d3ee",
          "cyan-dark": "#06b6d4",
          "cyan-deep": "#0891b2",
        },
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        primary_text: "var(--primary-text)",
        secondary_text: "var(--secondary-text)",
        line: "var(--line)",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light"],
  },
};
