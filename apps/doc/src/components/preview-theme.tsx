import {
  useCallback,
  createContext,
  useContext,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
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
  const setTheme = useCallback<PreviewThemeValue["setTheme"]>((theme, options) => {
    const mode = options?.mode ?? "light";
    setSelected((current) =>
      current.theme === theme && current.mode === mode ? current : { theme, mode },
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
  const { mode, resolvedMode } = useTheme();
  const modeClassName = family === "elegant" && mode !== "system" ? mode : null;
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
