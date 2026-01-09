// FILE: src/styles/theme.ts
export const THEME = {
  bg: "#0b1220",
  panel: "#111a2e",
  text: "#eef2ff",
  accent: "#3b82f6",
  border: "#223155",
  divider: "rgba(255,255,255,0.08)",

  courtFloor: "#81d4fa",
  courtArea: "#0277bd",
  courtLines: "#ffffff",

  active6m: "#b3e5fc",
  active9m: "#01579b",

  goalFrame: "#d32f2f",
  goalWhite: "#ffffff",
  gridLines: "rgba(255, 255, 255, 0.15)",

  attack: "#4caf50",
  defense: "#ef5350",
  textMuted: "#8899ac",
} as const;

export type Theme = typeof THEME;
