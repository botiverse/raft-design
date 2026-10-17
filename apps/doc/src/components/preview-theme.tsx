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
import { ThemeProvider, useTheme } from "raft-ui";
import type { Theme, ThemeMode } from "raft-ui";

import {
  DEFAULT_PREVIEW_DARK,
  DEFAULT_PREVIEW_LIGHT,
  readPreviewThemeCookieFromDocument,
  resolveThemeFamily,
  writePreviewThemeCookie,
} from "#/lib/preview-theme-storage.ts";
import type { StoredPreviewTheme } from "#/lib/preview-theme-storage.ts";

export type PreviewMode = ThemeMode;

/** Which of the two stored choices a family change belongs to. */
export type PreviewFamilyScope = "light" | "dark";

type PreviewThemeValue = {
  /** The family being rendered: the per-mode choice resolved through the mode. */
  theme: Theme;
  /** The stored mode — may be `system`. */
  mode: PreviewMode;
  /** `system` resolved against the OS preference, refreshed when it changes. */
  resolvedMode: "light" | "dark";
  /** The stored per-mode families. */
  light: Theme;
  dark: Theme;
  setMode: (mode: PreviewMode) => void;
  setFamily: (scope: PreviewFamilyScope, family: Theme) => void;
  /** Preset adapter: one family plus an explicit mode, as the preview switchers use. */
  setTheme: (theme: Theme, options?: { mode?: PreviewMode }) => void;
};

const DEFAULT_STORED: StoredPreviewTheme = {
  mode: "system",
  light: DEFAULT_PREVIEW_LIGHT,
  dark: DEFAULT_PREVIEW_DARK,
};

const DEFAULT_PREVIEW_THEME_VALUE: PreviewThemeValue = {
  theme: DEFAULT_PREVIEW_LIGHT,
  mode: DEFAULT_STORED.mode,
  resolvedMode: "light",
  light: DEFAULT_STORED.light,
  dark: DEFAULT_STORED.dark,
  setMode: () => undefined,
  setFamily: () => undefined,
  setTheme: () => undefined,
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
  const theme = resolveThemeFamily(selected, resolvedMode);

  const persist = useCallback((next: StoredPreviewTheme) => {
    writePreviewThemeCookie(next);
    setSelected(next);
  }, []);

  const setMode = useCallback(
    (mode: PreviewMode) => {
      persist({ ...selected, mode });
    },
    [persist, selected],
  );

  const setFamily = useCallback(
    (scope: PreviewFamilyScope, family: Theme) => {
      // Brutal has no dark form: the dark slot only ever holds elegant.
      const next = scope === "dark" && family === "brutal" ? "elegant" : family;
      persist({ ...selected, [scope]: next });
    },
    [persist, selected],
  );

  const setTheme = useCallback(
    (nextTheme: Theme, options?: { mode?: PreviewMode }) => {
      const mode = options?.mode ?? "light";
      const scope: PreviewFamilyScope = mode === "dark" ? "dark" : "light";
      const family = scope === "dark" && nextTheme === "brutal" ? "elegant" : nextTheme;
      persist({ ...selected, mode, [scope]: family });
    },
    [persist, selected],
  );

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
    setSelected((current) =>
      current.mode === stored.mode && current.light === stored.light && current.dark === stored.dark
        ? current
        : stored,
    );
  }, []);

  const value = useMemo<PreviewThemeValue>(
    () => ({
      theme,
      mode: selected.mode,
      resolvedMode,
      light: selected.light,
      dark: selected.dark,
      setMode,
      setFamily,
      setTheme,
    }),
    [theme, selected, resolvedMode, setMode, setFamily, setTheme],
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
 * the OS preference. Anything that matches the current state against the fixed
 * light/dark presets (the landing and doc-section switchers, the playground
 * picker) must go through this — reading the raw `system` value against those
 * presets was exactly the bug @Josh caught on the first visit (a brutal page
 * with "Elegant" highlighted).
 */
export function useResolvedPreviewMode(): "light" | "dark" {
  return usePreviewTheme().resolvedMode;
}

export function PreviewThemeScope({
  children,
  className,
  family: familyOverride,
  mode: modeOverride,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  family?: Theme;
  mode?: PreviewMode;
}) {
  const preview = usePreviewTheme();
  const family = familyOverride ?? preview.theme;
  const mode = modeOverride ?? preview.resolvedMode;

  return (
    <ThemeProvider theme={family} mode={mode} syncDom={false}>
      <PreviewThemeScopeContent family={family} className={className} {...props}>
        {children}
      </PreviewThemeScopeContent>
    </ThemeProvider>
  );
}

function PreviewThemeScopeContent({
  children,
  className,
  family,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  family: Theme;
}) {
  const { resolvedMode } = useTheme();
  const modeClassName = family === "brutal" ? null : resolvedMode;
  const scopeClassName = [modeClassName, className].filter(Boolean).join(" ");

  return (
    <div
      data-theme={family}
      className={scopeClassName}
      style={{ colorScheme: resolvedMode, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
