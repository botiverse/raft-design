import { createContext } from "react";

/** Colour mode. Raft is the only visual family; "system" follows the OS. */
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = Exclude<ThemeMode, "system">;

export type ThemeState = {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeStateContext = createContext<ThemeState>({
  mode: "light",
  resolvedMode: "light",
  setMode: () => undefined,
});
