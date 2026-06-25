import { use } from "react";
import { ThemeContext, ThemeStateContext, type Theme, type ThemeState } from "./theme-context";

/** Read the active style family for theme-aware component recipes. */
export function useThemeFamily(): Theme {
  return use(ThemeContext);
}

/** Read and update the application-level RUI theme selection. */
export function useTheme(): ThemeState {
  return use(ThemeStateContext);
}
