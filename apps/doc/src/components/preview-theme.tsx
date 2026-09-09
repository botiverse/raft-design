import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { ThemeProvider, useTheme, type Theme, type ThemeMode } from "raft-ui";

import {
  readPreviewThemeCookieFromDocument,
  writePreviewThemeCookie,
  type StoredPreviewTheme,
} from "#/lib/preview-theme-storage.ts";

export type PreviewMode = ThemeMode;

type PreviewThemeValue = {
  theme: Theme;
  mode: PreviewMode;
  setTheme: (theme: Theme, options?: { mode?: PreviewMode }) => void;
};

const PreviewThemeContext = createContext<PreviewThemeValue | null>(null);

// Brutal, matching `ThemeProvider`'s own `defaultTheme`. The docs site used to
// hardcode elegant here and in the initial state below, so it contradicted the
// library it documents (@xxchan measured it; call made 2026-09-09).
const DEFAULT_PREVIEW_THEME_VALUE: PreviewThemeValue = {
  theme: "brutal",
  mode: "light",
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
    () => initial ?? { theme: "brutal", mode: "light" },
  );
  const setTheme = useCallback<PreviewThemeValue["setTheme"]>((theme, options) => {
    const mode = options?.mode ?? "light";
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
