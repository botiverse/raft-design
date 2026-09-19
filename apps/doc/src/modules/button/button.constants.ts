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
  "link",
] as const;

export const ICON_SIZES = ["icon-xs", "icon-sm", "icon-md", "icon-lg"] as const;

export const SIZES = ["xs", "sm", "md", "lg", ...ICON_SIZES] as const;
