import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, useTheme, type Theme, type ThemeMode } from "raft-ui";

export type PreviewMode = ThemeMode;

type PreviewThemeValue = {
  theme: Theme;
  mode: PreviewMode;
  setTheme: (theme: Theme, options?: { mode?: PreviewMode }) => void;
};

const PreviewThemeContext = createContext<PreviewThemeValue | null>(null);

const DEFAULT_PREVIEW_THEME_VALUE: PreviewThemeValue = {
  theme: "elegant",
  mode: "light",
  setTheme: () => undefined,
};

export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  const [selected, setSelected] = useState<{ theme: Theme; mode: PreviewMode }>({
    theme: "elegant",
    mode: "light",
  });
  const value = useMemo<PreviewThemeValue>(
    () => ({
      ...selected,
      setTheme: (theme, options) => setSelected({ theme, mode: options?.mode ?? "light" }),
    }),
    [selected],
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
}: {
  children: ReactNode;
  className?: string;
  family?: Theme;
  mode?: PreviewMode;
}) {
  const { theme: selectedFamily, mode: selectedMode } = usePreviewTheme();
  const family = familyOverride ?? selectedFamily;
  const mode = modeOverride ?? selectedMode;

  return (
    <ThemeProvider theme={family} mode={mode} syncDom={false}>
      <PreviewThemeScopeContent family={family} className={className}>
        {children}
      </PreviewThemeScopeContent>
    </ThemeProvider>
  );
}

function PreviewThemeScopeContent({
  children,
  className,
  family,
}: {
  children: ReactNode;
  className?: string;
  family: Theme;
}) {
  const { resolvedMode } = useTheme();
  const scopeClassName = [resolvedMode === "dark" ? "dark" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      data-preview-theme-scope
      data-preview-theme={family}
      data-preview-mode={resolvedMode}
      data-theme={family}
      className={scopeClassName}
      style={{ colorScheme: resolvedMode }}
    >
      {children}
    </div>
  );
}
