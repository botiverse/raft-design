"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  ThemeContext,
  ThemeStateContext,
  type ResolvedThemeMode,
  type Theme,
  type ThemeState,
  type ThemeMode,
} from "./theme-context.ts";

export interface ThemeProviderProps {
  /**
   * Controlled visual style family. Keep using this for isolated previews and
   * component matrix surfaces that should not own global DOM state.
   */
  theme?: Theme;
  defaultTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  /** Controlled light/dark behavior for the elegant family. */
  mode?: ThemeMode;
  defaultMode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  /**
   * Persist uncontrolled family and mode selections. The mode key appends
   * "-mode" unless `modeStorageKey` is provided.
   */
  storageKey?: string;
  modeStorageKey?: string;
  /**
   * Sync the active family/mode onto `document.documentElement`.
   * Defaults to false so nested docs/previews do not mutate the app root.
   */
  syncDom?: boolean;
  children: ReactNode;
}

function readStoredTheme(storageKey: string | undefined, fallback: Theme): Theme {
  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === "brutal" || stored === "elegant" ? stored : fallback;
}

function readStoredMode(storageKey: string | undefined, fallback: ThemeMode): ThemeMode {
  if (typeof window === "undefined" || !storageKey) {
    return fallback;
  }

  const stored = window.localStorage.getItem(storageKey);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : fallback;
}

function writeStorage(key: string | undefined, value: string) {
  if (typeof window !== "undefined" && key) {
    window.localStorage.setItem(key, value);
  }
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
  theme,
  defaultTheme = "brutal",
  onThemeChange,
  mode,
  defaultMode = "light",
  onModeChange,
  storageKey,
  modeStorageKey = storageKey ? `${storageKey}-mode` : undefined,
  syncDom = false,
  children,
}: ThemeProviderProps) {
  const [uncontrolledTheme, setUncontrolledTheme] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme),
  );
  const [uncontrolledMode, setUncontrolledMode] = useState<ThemeMode>(() =>
    readStoredMode(modeStorageKey, defaultMode),
  );
  const activeTheme = theme ?? uncontrolledTheme;
  const activeMode = mode ?? uncontrolledMode;
  const systemMode = useSyncExternalStore(
    subscribeSystemMode,
    getSystemMode,
    () => "light" as ResolvedThemeMode,
  );
  const resolvedMode: ResolvedThemeMode = activeMode === "system" ? systemMode : activeMode;

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      if (theme === undefined) {
        setUncontrolledTheme(nextTheme);
        writeStorage(storageKey, nextTheme);
      }
      onThemeChange?.(nextTheme);
    },
    [onThemeChange, storageKey, theme],
  );

  const setMode = useCallback(
    (nextMode: ThemeMode) => {
      if (mode === undefined) {
        setUncontrolledMode(nextMode);
        writeStorage(modeStorageKey, nextMode);
      }
      onModeChange?.(nextMode);
    },
    [mode, modeStorageKey, onModeChange],
  );

  const setBrutal = useCallback(() => {
    setTheme("brutal");
    setMode("light");
  }, [setMode, setTheme]);

  const setElegant = useCallback(
    (nextMode: ThemeMode = "system") => {
      setTheme("elegant");
      setMode(nextMode);
    },
    [setMode, setTheme],
  );

  const themeState = useMemo<ThemeState>(
    () => ({
      theme: activeTheme,
      setTheme,
      mode: activeMode,
      setMode,
      resolvedMode,
      setBrutal,
      setElegant,
      setElegantLight: () => setElegant("light"),
      setElegantDark: () => setElegant("dark"),
      setElegantSystem: () => setElegant("system"),
    }),
    [activeMode, activeTheme, resolvedMode, setBrutal, setElegant, setMode, setTheme],
  );

  useEffect(() => {
    if (!syncDom) {
      return;
    }

    const root = document.documentElement;
    root.dataset.theme = activeTheme;
    root.classList.toggle("light", activeTheme === "elegant" && activeMode === "light");
    root.classList.toggle("dark", activeTheme === "elegant" && activeMode === "dark");
    root.style.colorScheme = activeTheme === "elegant" ? resolvedMode : "light";
  }, [activeMode, activeTheme, resolvedMode, syncDom]);

  return (
    <ThemeStateContext.Provider value={themeState}>
      <ThemeContext.Provider value={activeTheme}>{children}</ThemeContext.Provider>
    </ThemeStateContext.Provider>
  );
}
