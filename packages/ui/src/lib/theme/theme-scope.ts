import { cn } from "../cn";
import type { ThemeState } from "./theme-context";
import { useTheme } from "./use-theme";

type ThemeScopeProps = {
  className?: unknown;
};

type ClassNameCallback<ClassName> = Extract<
  NonNullable<ClassName>,
  (state: never) => string | undefined
>;

type ClassNameState<Props extends ThemeScopeProps> = Parameters<
  ClassNameCallback<Props["className"]>
>[0];

/**
 * Carry the provider's resolved mode (`light` / `dark`) onto content that
 * renders outside its subtree (a portal), so a dark island's popup stays dark.
 */
export function resolveThemeScopeProps<Props extends ThemeScopeProps>(
  { className, ...props }: Props,
  { resolvedMode }: Pick<ThemeState, "resolvedMode">,
): Omit<Props, "className"> & { className?: Props["className"] } {
  const resolvedClassName =
    typeof className === "function"
      ? (state: ClassNameState<Props>) =>
          cn((className as ClassNameCallback<Props["className"]>)(state), resolvedMode)
      : typeof className === "string"
        ? cn(className, resolvedMode)
        : (className ?? resolvedMode);

  return {
    ...props,
    className: resolvedClassName as Props["className"],
  };
}

export function useThemeScopeProps<Props extends ThemeScopeProps>(props: Props) {
  const themeState = useTheme();
  return resolveThemeScopeProps(props, themeState);
}
