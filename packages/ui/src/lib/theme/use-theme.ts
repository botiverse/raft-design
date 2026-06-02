import { use } from "react";
import { ThemeContext, type Theme } from "./theme-context.ts";

/** Read the active style family for theme-aware component recipes. */
export function useTheme(): Theme {
  return use(ThemeContext);
}
