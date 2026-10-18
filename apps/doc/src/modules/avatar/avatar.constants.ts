// Public t-shirt scale on the DS 8n + 3 steps (3xs keeps 14). Source-only
// one-off contexts collapse into these steps.
export const SIZES = [
  { size: "xl", context: "profile/detail", px: 99 },
  { size: "lg", context: "large identity", px: 51 },
  { size: "md", context: "panel header", px: 35 },
  { size: "sm", context: "list rows", px: 27 },
  { size: "xs", context: "compact rows", px: 19 },
  { size: "2xs", context: "nav / DM rows", px: 19 },
  { size: "3xs", context: "inline preview", px: 14 },
] as const;

export const SIZE_OPTIONS = SIZES.map((s) => s.size);

export const TYPES = ["agent", "human"] as const;
