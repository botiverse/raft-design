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
  readPreviewThemeCookieFromDocument,
  writePreviewThemeCookie,
} from "#/lib/preview-theme-storage.ts";
import type { StoredPreviewTheme } from "#/lib/preview-theme-storage.ts";

export type PreviewMode = ThemeMode;

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

/**
 * The mode actually applied to the page: a `system` selection resolves against
 * the OS preference. A store rather than a direct `matchMedia` read so the
 * server snapshot and hydration agree (the prerendered markup cannot know the
 * visitor's preference), mirroring rui's own theme provider.
 *
 * Anything that matches the current state against the fixed light/dark presets
 * (the landing switcher, the doc-section switcher, the playground picker) must
 * go through this: matching the raw `system` value against those presets was
 * exactly the bug @Josh reported on the first visit (brutal page, "Elegant"
 * highlighted).
 */
export function useResolvedPreviewMode(): "light" | "dark" {
  const { mode } = usePreviewTheme();
  const systemMode = useSyncExternalStore(
    subscribeToSystemMode,
    getSystemMode,
    () => "light" as const,
  );
  return mode === "system" ? systemMode : mode;
}

type PreviewThemeValue = {
  theme: Theme;
  mode: PreviewMode;
  setTheme: (theme: Theme, options?: { mode?: PreviewMode }) => void;
};

const PreviewThemeContext = createContext<PreviewThemeValue | null>(null);

// Brutal, matching `ThemeProvider`'s own `defaultTheme`. The docs site used to
// hardcode elegant here and in the initial state below, so it contradicted the
// library it documents (@xxchan measured it; call made 2026-09-09). The default
// MODE is `system`: the site respects the local preference until a visitor
// chooses explicitly (brutal only has a light form, so it resolves to light).
const DEFAULT_PREVIEW_THEME_VALUE: PreviewThemeValue = {
  theme: "brutal",
  mode: "system",
  setTheme: () => undefined,
};

export function PreviewThemeProvider({
  children,
  initial,
}: {
  children: ReactNode;
  initial?: StoredPreviewTheme | null;
}) {
  const [selected, setSelected] = useState<StoredPreviewTheme>(
    () => initial ?? { theme: "brutal", mode: "system" },
  );
  const setTheme = useCallback<PreviewThemeValue["setTheme"]>((theme, options) => {
    // Mirrors `ThemeProvider.setTheme`: brutal only has its light form, so a
    // dark/system choice is meaningless there and is stored as light.
    const mode = theme === "brutal" ? "light" : (options?.mode ?? "light");
    writePreviewThemeCookie({ theme, mode });
    setSelected((current) =>
      current.theme === theme && current.mode === mode ? current : { theme, mode },
    );
  }, []);
  /*
   * Read the cookie on the client, once.
   *
   * `initial` comes from the root loader, but doc routes are prerendered AND
   * served from cache — the shipped payload is literally
   * `storedPreviewTheme: null` and responses come back `cf-cache-status: HIT`,
   * so the server never sees the visitor's cookie. Without this, `selected`
   * always falls back to the default and a stored choice cannot survive a
   * reload.
   *
   * An effect rather than a lazy useState initializer, so SSR never touches
   * `document` and there is no hydration mismatch.
   */
  useEffect(() => {
    const stored = readPreviewThemeCookieFromDocument();
    if (!stored) return;
    setSelected((current) =>
      current.theme === stored.theme && current.mode === stored.mode ? current : stored,
    );
  }, []);

  const value = useMemo<PreviewThemeValue>(
    () => ({
      ...selected,
      setTheme,
    }),
    [selected, setTheme],
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
  const { theme: selectedFamily, mode: selectedMode } = usePreviewTheme();
  const family = familyOverride ?? selectedFamily;
  const mode = modeOverride ?? selectedMode;

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
  const modeClassName = family === "elegant" ? resolvedMode : null;
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
