"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { ThemeStateContext } from "./theme-context";
import type { ResolvedThemeMode, ThemeMode, ThemeState } from "./theme-context";

export interface ThemeProviderProps {
  /** Controlled colour mode. */
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  /** Persist an uncontrolled mode under this localStorage key. */
  storageKey?: string;
  /**
   * Put the resolved mode on `document.documentElement` (`.light` / `.dark`
   * and `color-scheme`). Defaults to true for the app-level provider; set it to
   * false for nested previews and islands that must not touch the page root.
   */
  syncDom?: boolean;
  children: ReactNode;
}

function readStoredMode(storageKey: string | undefined, fallback: ThemeMode): ThemeMode {
  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
}

function subscribeSystemMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  mode,
  defaultMode = "light",
  onModeChange,
  storageKey,
  syncDom = true,
  children,
}: ThemeProviderProps) {
  const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(() =>
    readStoredMode(storageKey, defaultMode),
  );
  const activeMode = mode ?? uncontrolledMode;
  const systemMode = useSyncExternalStore(
    subscribeSystemMode,
    getSystemMode,
    () => "light" as ResolvedThemeMode,
  );
  const resolvedMode: ResolvedThemeMode = activeMode === "system" ? systemMode : activeMode;

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      if (mode === undefined) {
        setUncontrolledMode(nextMode);
        if (typeof window !== "undefined" && storageKey) {
          window.localStorage.setItem(storageKey, nextMode);
        }
      }
      onModeChange?.(nextMode);
    },
    [mode, onModeChange, storageKey],
  );

  const themeState = useMemo<ThemeState>(
    () => ({ mode: activeMode, resolvedMode, setMode }),
    [activeMode, resolvedMode, setMode],
  );

  useEffect(() => {
    if (!syncDom) {
      return;
    }

    const root = document.documentElement;
    root.classList.toggle("light", resolvedMode === "light");
    root.classList.toggle("dark", resolvedMode === "dark");
    root.style.colorScheme = resolvedMode;
  }, [resolvedMode, syncDom]);

  return <ThemeStateContext.Provider value={themeState}>{children}</ThemeStateContext.Provider>;
}
