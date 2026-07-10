import type { ReactNode } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";

export type ThemeOnlyProps = {
  children?: ReactNode;
};

/** Render children only while the elegant theme family is active. */
export function ElegantOnly({ children }: ThemeOnlyProps) {
  const theme = useThemeFamily();
  return theme === "elegant" ? children : null;
}

/** Render children only while the brutal theme family is active. */
export function BrutalOnly({ children }: ThemeOnlyProps) {
  const theme = useThemeFamily();
  return theme === "brutal" ? children : null;
}
