import type { Theme } from "./theme/theme-context";

/**
 * Gap between a field trigger and its popup. Brutal lifts the open trigger by
 * 1px and gives it a 4px hard shadow, so the popup sits far enough below for
 * the shadow to stay clear of it.
 */
export function defaultSideOffset(theme: Theme): number {
  return theme === "brutal" ? 8 : 4;
}
