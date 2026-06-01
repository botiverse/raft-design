import type { ReactNode } from "react";
import { ThemeContext, type Theme } from "./theme-context.ts";

interface ThemeProviderProps {
  theme?: Theme;
  children: ReactNode;
}

/*
 * Supplies the active style family to component recipes via context. It does NOT
 * touch the DOM: the consuming app sets `data-theme` on a root element (e.g.
 * <html>) so the CSS token layer — and base-ui portals — resolve from the same
 * source. Light/dark is a separate, CSS-driven axis (e.g. a `.dark` class).
 */
export function ThemeProvider({ theme = "brutal", children }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
