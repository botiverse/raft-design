import { createContext } from "react";

/** Visual style family. Mode (light/dark/system) is a separate axis. */
export type Theme = "brutal" | "elegant";
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

export type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  resolvedMode: ResolvedThemeMode;
  setBrutal: () => void;
  setElegant: (mode?: ThemeMode) => void;
  setElegantLight: () => void;
  setElegantDark: () => void;
  setElegantSystem: () => void;
};

export const ThemeContext = createContext<Theme>("brutal");
export const ThemeStateContext = createContext<ThemeState>({
  theme: "brutal",
  setTheme: () => undefined,
  mode: "light",
  setMode: () => undefined,
  resolvedMode: "light",
  setBrutal: () => undefined,
  setElegant: () => undefined,
  setElegantLight: () => undefined,
  setElegantDark: () => undefined,
  setElegantSystem: () => undefined,
});
