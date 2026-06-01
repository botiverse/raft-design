import { createContext } from "react";

/** Visual style family. Mode (light/dark) is a separate, CSS-driven axis. */
export type Theme = "brutal" | "elegant";

export const ThemeContext = createContext<Theme>("brutal");
