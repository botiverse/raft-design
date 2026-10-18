import { use } from "react";
import { ThemeStateContext } from "./theme-context";
import type { ThemeState } from "./theme-context";

/** Read and update the colour mode. */
export function useTheme(): ThemeState {
  return use(ThemeStateContext);
}
