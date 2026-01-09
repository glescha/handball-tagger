// FILE: src/styles/courtVars.ts
import type React from "react";

// Keep it string-only so it can be spread into style={{...}}
export type CssVarMap = Record<string, string>;

export function getCourtCssVars(theme: any): CssVarMap {
  // Adjust these paths to match your theme.ts structure.
  const courtBg = theme?.colors?.courtBg ?? "#6aa7d8";
  const goalAreaBg = theme?.colors?.goalAreaBg ?? "#1f4e7a";
  const line = theme?.colors?.courtLine ?? "rgba(255,255,255,0.95)";

  const sel6 = theme?.colors?.courtSelect6m ?? "rgba(255,255,255,0.16)";
  const sel9 = theme?.colors?.courtSelect9m ?? "rgba(0,0,0,0.18)";

  const wedge = theme?.colors?.courtWedge ?? "rgba(255,255,255,0.06)";
  const wedgeSel = theme?.colors?.courtWedgeSelected ?? "rgba(255,255,255,0.18)";

  const toggleBg = theme?.colors?.toggleBg ?? "rgba(255,255,255,0.06)";
  const toggleBgSel = theme?.colors?.toggleBgSelected ?? "rgba(255,255,255,0.16)";
  const toggleBorder = theme?.colors?.toggleBorder ?? "rgba(255,255,255,0.18)";
  const toggleBorderSel = theme?.colors?.toggleBorderSelected ?? "rgba(255,255,255,0.35)";
  const toggleText = theme?.colors?.toggleText ?? "rgba(255,255,255,0.92)";

  return {
    "--court-bg": String(courtBg),
    "--goal-area-bg": String(goalAreaBg),
    "--court-line": String(line),
    "--court-sel-6m": String(sel6),
    "--court-sel-9m": String(sel9),
    "--court-wedge": String(wedge),
    "--court-wedge-sel": String(wedgeSel),

    "--toggle-bg": String(toggleBg),
    "--toggle-bg-sel": String(toggleBgSel),
    "--toggle-border": String(toggleBorder),
    "--toggle-border-sel": String(toggleBorderSel),
    "--toggle-text": String(toggleText),
  };
}

// Helper typing
export function cssVarsStyle(vars: CssVarMap): React.CSSProperties {
  return vars as unknown as React.CSSProperties;
}
