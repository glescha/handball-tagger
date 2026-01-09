// FILE: src/components/Layout/ThemeProvider.tsx
import React, { useMemo } from "react";
import { THEME } from "../../styles/theme";
import { cssVarsStyle, themeToCssVars } from "../../styles/cssVars";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const vars = useMemo(() => themeToCssVars(THEME), []);
  return <div style={cssVarsStyle(vars)}>{children}</div>;
}
