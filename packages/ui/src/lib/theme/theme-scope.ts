import { cn } from "../cn";
import type { Theme, ThemeState } from "./theme-context";
import { useTheme } from "./use-theme";

type ThemeScopeProps = {
  className?: unknown;
  "data-theme"?: string;
};

type ThemeScopeState = Pick<ThemeState, "theme" | "resolvedMode">;

type ClassNameCallback<ClassName> = Extract<
  NonNullable<ClassName>,
  (state: never) => string | undefined
>;

type ClassNameState<Props extends ThemeScopeProps> = Parameters<
  ClassNameCallback<Props["className"]>
>[0];

export function resolveThemeScopeProps<Props extends ThemeScopeProps>(
  { className, "data-theme": _dataTheme, ...props }: Props,
  { theme, resolvedMode }: ThemeScopeState,
): Omit<Props, "className" | "data-theme"> & {
  className?: Props["className"];
  "data-theme": Theme;
} {
  const modeClassName = theme === "brutal" ? undefined : resolvedMode;
  const resolvedClassName =
    typeof className === "function" && modeClassName
      ? (state: ClassNameState<Props>) =>
          cn((className as ClassNameCallback<Props["className"]>)(state), modeClassName)
      : typeof className === "string" && modeClassName
        ? cn(className, modeClassName)
        : (className ?? modeClassName);

  return {
    ...props,
    "data-theme": theme,
    className: resolvedClassName as Props["className"],
  };
}

export function useThemeScopeProps<Props extends ThemeScopeProps>(props: Props) {
  const themeState = useTheme();
  return resolveThemeScopeProps(props, themeState);
}
