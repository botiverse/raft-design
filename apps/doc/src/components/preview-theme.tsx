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

import { writePreviewThemeCookie, type StoredPreviewTheme } from "#/lib/preview-theme-storage.ts";

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
   * Sync the document to the SELECTED theme.
   *
   * `__root` renders `data-theme` from loader data, but doc routes are
   * PRERENDERED — at build time there is no cookie, so the baked HTML always
   * carries the default. Without this effect the chrome would show that default
   * forever and ignore what the visitor actually picked, which is the same
   * class of bug as the old hardcoded `data-theme="elegant"`, just stuck on a
   * different value.
   *
   * Mirrors `ThemeProvider`'s own syncDom block; the preview scopes deliberately
   * pass `syncDom={false}`, so nothing else writes these.
   */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = selected.theme;
    root.classList.toggle("light", selected.theme === "elegant" && selected.mode === "light");
    root.classList.toggle("dark", selected.theme === "elegant" && selected.mode === "dark");
    root.style.colorScheme = selected.theme === "elegant" ? selected.mode : "light";
  }, [selected]);

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
