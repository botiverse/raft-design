import type { ReactNode } from "react";
import { ThemeProvider, useTheme, type Theme, type ThemeMode } from "raft-ui";

export type PreviewMode = ThemeMode;

export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider defaultTheme="elegant" defaultMode="light" syncDom={false}>
      {children}
    </ThemeProvider>
  );
}

export function usePreviewTheme() {
  return useTheme();
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
      data-theme={family}
      className={scopeClassName}
      style={{ colorScheme: resolvedMode }}
    >
      {children}
    </div>
  );
}
