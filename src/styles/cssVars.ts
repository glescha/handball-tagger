import type { Theme } from "./theme";

export type CssVarMap = Record<string, string>;

export function themeToCssVars(theme: Theme): CssVarMap {
  return {
    // App
    "--app-bg": theme.bg,
    "--panel-bg": theme.panel,
    "--text": theme.text,
    "--text-muted": theme.textMuted,
    "--border": theme.border,
    "--divider": theme.divider,
    "--accent": theme.accent,

    // Toggle
    "--toggle-bg": "rgba(255,255,255,0.06)",
    "--toggle-bg-sel": "rgba(255,255,255,0.16)",
    "--toggle-border": "rgba(255,255,255,0.18)",
    "--toggle-border-sel": "rgba(255,255,255,0.35)",
    "--toggle-text": theme.text,

    // Court
    "--court-bg": theme.courtFloor,
    "--goal-area-bg": theme.courtArea,
    "--court-line": theme.courtLines,
    "--court-sel-6m": theme.active6m,
    "--court-sel-9m": theme.active9m,
    "--court-wedge": "rgba(255,255,255,0.06)",
    "--court-wedge-sel": "rgba(255,255,255,0.18)",

    // Goal
    "--goal-frame": theme.goalFrame,
    "--goal-white": theme.goalWhite,
    "--grid-lines": theme.gridLines,

    // Phase
    "--phase-attack": theme.attack,
    "--phase-defense": theme.defense,
  };
}

export function cssVarsStyle(vars: CssVarMap): React.CSSProperties {
  return vars as unknown as React.CSSProperties;
}
