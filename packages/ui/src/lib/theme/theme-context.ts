import { createContext } from "react";

/** Visual style family. Mode (light/dark/system) is a separate axis. */
export type Theme = "brutal" | "elegant";
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = Exclude<ThemeMode, "system">;
export type SetThemeOptions = {
  mode?: ThemeMode;
};
export type SetTheme = {
  (theme: "brutal"): void;
  (theme: "elegant", options?: SetThemeOptions): void;
};

export type ThemeState = {
  theme: Theme;
  setTheme: SetTheme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
};

export const ThemeContext = createContext<Theme>("brutal");
export const ThemeStateContext = createContext<ThemeState>({
  theme: "brutal",
  setTheme: () => undefined,
  mode: "light",
  resolvedMode: "light",
});
