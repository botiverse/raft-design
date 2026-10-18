export const VARIANTS = [
  "default",
  "primary",
  "outline",
  "information",
  "muted",
  "accent",
  "warning",
  "success",
  "danger",
  "danger-secondary",
  "danger-outline",
  "ghost",
  "on-frame",
  "link",
] as const;

// `xs` / `sm` render as `md`, and `icon-xs` / `icon-sm` as `icon-md`: they are
// old names kept for callers, so the docs list only the sizes that differ.
export const ICON_SIZES = ["icon-md", "icon-lg"] as const;

export const SIZES = ["md", "lg", ...ICON_SIZES] as const;
