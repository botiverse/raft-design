import { createContext, use, useState, useSyncExternalStore, type ReactNode } from "react";
import { ThemeProvider, type Theme } from "@slock/ui";

export type PreviewMode = "light" | "dark" | "system";

type PreviewThemeContextValue = {
  family: Theme;
  setFamily: (family: Theme) => void;
  mode: PreviewMode;
  setMode: (mode: PreviewMode) => void;
};

const DEFAULT_PREVIEW_THEME: PreviewThemeContextValue = {
  family: "elegant",
  setFamily: () => undefined,
  mode: "light",
  setMode: () => undefined,
};

const PreviewThemeContext = createContext<PreviewThemeContextValue>(DEFAULT_PREVIEW_THEME);

export function PreviewThemeProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<Theme>("elegant");
  const [mode, setMode] = useState<PreviewMode>("light");

  return (
    <PreviewThemeContext.Provider value={{ family, setFamily, mode, setMode }}>
      {children}
    </PreviewThemeContext.Provider>
  );
}

export function usePreviewTheme(): PreviewThemeContextValue {
  return use(PreviewThemeContext);
}

function subscribeSystemMode(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSystemMode() {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
  const { family: selectedFamily, mode: selectedMode } = usePreviewTheme();
  const family = familyOverride ?? selectedFamily;
  const mode = modeOverride ?? selectedMode;
  const systemMode = useSyncExternalStore(subscribeSystemMode, getSystemMode, () => "light");
  const resolvedMode = mode === "system" ? systemMode : mode;
  const scopeClassName = [resolvedMode === "dark" ? "dark" : null, className]
    .filter(Boolean)
    .join(" ");

  return (
    <ThemeProvider theme={family}>
      <div
        data-preview-theme-scope
        data-theme={family}
        className={scopeClassName}
        style={{ colorScheme: resolvedMode }}
      >
        {children}
      </div>
    </ThemeProvider>
  );
}
