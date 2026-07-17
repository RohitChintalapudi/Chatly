import { create } from "zustand";

export const ACCENT_COLORS = [
  { name: "Cyan", accent: "#22d3ee", hover: "#06b6d4" },
  { name: "Pink", accent: "#ec4899", hover: "#db2777" },
  { name: "Purple", accent: "#a855f7", hover: "#9333ea" },
  { name: "Blue", accent: "#3b82f6", hover: "#2563eb" },
  { name: "Green", accent: "#22c55e", hover: "#16a34a" },
  { name: "Orange", accent: "#f97316", hover: "#ea580c" },
  { name: "Red", accent: "#ef4444", hover: "#dc2626" },
  { name: "Yellow", accent: "#eab308", hover: "#ca8a04" },
];

export const getAccentByKey = (key) =>
  ACCENT_COLORS.find((c) => c.name.toLowerCase() === key) || ACCENT_COLORS[0];

export const CHAT_FONT_WEIGHTS = [
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
];

export const useThemeStore = create((set) => ({
  isDark: localStorage.getItem("chat-dark") === "true" || false,
  accentKey: localStorage.getItem("chat-accent") || "cyan",
  chatFontWeight: localStorage.getItem("chat-font-weight") || "700",
  toggleTheme: () =>
    set((state) => {
      const next = !state.isDark;
      localStorage.setItem("chat-dark", String(next));
      return { isDark: next };
    }),
  setAccentColor: (key) => {
    localStorage.setItem("chat-accent", key);
    set({ accentKey: key });
  },
  setChatFontWeight: (weight) => {
    localStorage.setItem("chat-font-weight", weight);
    set({ chatFontWeight: weight });
  },
}));
