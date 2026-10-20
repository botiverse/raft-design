import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { ThemeProvider, useTheme } from "@botiverse/raft-ui";
import type { ThemeMode } from "@botiverse/raft-ui";

import {
  readPreviewThemeCookieFromDocument,
  writePreviewThemeCookie,
} from "#/lib/preview-theme-storage.ts";
import type { StoredPreviewTheme } from "#/lib/preview-theme-storage.ts";

export type PreviewMode = ThemeMode;

type PreviewThemeValue = {
  /** The stored mode — may be `system`. */
  mode: PreviewMode;
  /** `system` resolved against the OS preference, refreshed when it changes. */
  resolvedMode: "light" | "dark";
  setMode: (mode: PreviewMode) => void;
};

const DEFAULT_STORED: StoredPreviewTheme = { mode: "system" };

const DEFAULT_PREVIEW_THEME_VALUE: PreviewThemeValue = {
  mode: DEFAULT_STORED.mode,
  resolvedMode: "light",
  setMode: () => undefined,
};

const PreviewThemeContext = createContext<PreviewThemeValue | null>(null);

function subscribeToSystemMode(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return () => {};
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => {
    query.removeEventListener("change", onChange);
  };
}

function getSystemMode(): "light" | "dark" {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreviewThemeProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: StoredPreviewTheme | null;
}) {
  const [selected, setSelected] = useState<StoredPreviewTheme>(() => initial ?? DEFAULT_STORED);
  const systemMode = useSyncExternalStore(
    subscribeToSystemMode,
    getSystemMode,
    () => "light" as const,
  );
  const resolvedMode = selected.mode === "system" ? systemMode : selected.mode;

  const setMode = useCallback((mode: PreviewMode) => {
    const next = { mode };
    writePreviewThemeCookie(next);
    setSelected(next);
  }, []);

  /*
   * Read the cookie on the client, once.
   *
   * `initial` comes from the root loader, but doc routes are prerendered AND
   * served from cache — the shipped payload is literally
   * `storedPreviewTheme: null` and responses come back `cf-cache-status: HIT`,
   * so the server never sees the visitor's cookie. Without this, a stored
   * choice cannot survive a reload.
   *
   * An effect rather than a lazy useState initializer, so SSR never touches
   * `document` and there is no hydration mismatch.
   */
  useEffect(() => {
    const stored = readPreviewThemeCookieFromDocument();
    if (!stored) return;
    setSelected((current) => (current.mode === stored.mode ? current : stored));
  }, []);

  const value = useMemo<PreviewThemeValue>(
    () => ({ mode: selected.mode, resolvedMode, setMode }),
    [selected.mode, resolvedMode, setMode],
  );

  return <PreviewThemeContext.Provider value={value}>{children}</PreviewThemeContext.Provider>;
}

export function usePreviewTheme() {
  const context = useContext(PreviewThemeContext);

  if (!context) {
    return DEFAULT_PREVIEW_THEME_VALUE;
  }

  return context;
}

/**
 * The mode actually applied to the page: a `system` selection resolves against
 * the OS preference. Anything that needs the concrete light or dark value (an
 * example canvas that follows the page) must go through this — the raw
 * `system` value matches neither.
 */
export function useResolvedPreviewMode(): "light" | "dark" {
  return usePreviewTheme().resolvedMode;
}

/**
 * A nested preview island: its own mode scope that never touches `<html>`.
 * The root carries the mode class so tokens resolve from it outward.
 */
export function PreviewThemeScope({
  children,
  mode: modeOverride,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  mode?: PreviewMode;
}) {
  const preview = usePreviewTheme();
  const mode = modeOverride ?? preview.resolvedMode;

  return (
    <ThemeProvider mode={mode} syncDom={false}>
      <PreviewThemeScopeContent {...props}>{children}</PreviewThemeScopeContent>
    </ThemeProvider>
  );
}

function PreviewThemeScopeContent({
  children,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
}) {
  const { resolvedMode } = useTheme();
  const scopeClassName = [resolvedMode, className].filter(Boolean).join(" ");

  return (
    <div className={scopeClassName} style={{ colorScheme: resolvedMode, ...style }} {...props}>
      {children}
    </div>
  );
}
