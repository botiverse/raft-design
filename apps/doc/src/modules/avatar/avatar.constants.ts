// Public t-shirt scale. Source-only one-off contexts collapse into these steps.
export const SIZES = [
  { size: "xl", context: "profile/detail", px: 64 },
  { size: "lg", context: "large identity", px: 48 },
  { size: "md", context: "panel header", px: 36 },
  { size: "sm", context: "list rows", px: 32 },
  { size: "xs", context: "compact rows", px: 20 },
  { size: "2xs", context: "nav / DM rows", px: 18 },
  { size: "3xs", context: "inline preview", px: 14 },
] as const;

export const SIZE_OPTIONS = SIZES.map((s) => s.size);

export const TYPES = ["agent", "human"] as const;
