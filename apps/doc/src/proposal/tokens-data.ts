// Proposal mock (B3). The implementation reads these groups from
// tokens/tokens.json (design/authoring/migration.md, step 2). Names are the
// English docs' names from the migration map; `cssVar` is the variable that
// holds the value today, so the swatches render live in both modes.

export type TokenRow = {
  name: string;
  cssVar: string;
  usage: string;
};

export const TOKEN_GROUPS: Record<string, readonly TokenRow[]> = {
  layer: [
    {
      name: "layer-frame",
      cssVar: "--color-layer-frame",
      usage: "The frame: phone top bars, the desktop rail and web top bar.",
    },
    { name: "layer-sidebar", cssVar: "--color-layer-sidebar", usage: "The desktop sidebar." },
    {
      name: "layer-canvas",
      cssVar: "--color-layer-canvas",
      usage: "Paper: the main area and every phone screen.",
    },
    {
      name: "layer-card",
      cssVar: "--color-layer-card",
      usage: "Cards, inputs, inset groups, the composer.",
    },
    {
      name: "layer-popover",
      cssVar: "--color-layer-popover",
      usage: "Menus, drawers, dialogs, profile cards.",
    },
    {
      name: "fill-muted",
      cssVar: "--color-fill-muted",
      usage: "Sunken fills: tracks, inline code, skeletons.",
    },
    { name: "layer-hud", cssVar: "--color-layer-hud", usage: "Toasts and tooltips." },
  ],
  foreground: [
    {
      name: "foreground",
      cssVar: "--color-foreground",
      usage: "Body text, titles, control edges.",
    },
    {
      name: "foreground-muted",
      cssVar: "--color-foreground-muted",
      usage: "Secondary text: previews, descriptions, labels.",
    },
    {
      name: "foreground-hint",
      cssVar: "--color-foreground-hint",
      usage: "Times, IDs, group titles, placeholders.",
    },
    {
      name: "foreground-disabled",
      cssVar: "--color-foreground-disabled",
      usage: "Disabled text and icons.",
    },
    { name: "foreground-link", cssVar: "--color-foreground-link", usage: "Links in running text." },
  ],
  line: [
    {
      name: "line-hairline",
      cssVar: "--color-line-hairline",
      usage: "Inside content: list separators, card outlines.",
    },
    {
      name: "line-seam",
      cssVar: "--color-line-seam",
      usage: "Between regions; the edge of menus and dialogs.",
    },
    {
      name: "line-strong",
      cssVar: "--color-line-strong",
      usage: "The 1.5px ink line on controls.",
    },
  ],
  signal: [
    {
      name: "brand",
      cssVar: "--color-brand",
      usage: "You: the frame, selection in navigation, mentions.",
    },
    {
      name: "attention",
      cssVar: "--color-attention",
      usage: "To do: the primary action, unread counts.",
    },
    { name: "info", cssVar: "--color-info", usage: "This item, information, in progress." },
    { name: "warning", cssVar: "--color-warning", usage: "Interrupts: stop, leave, warnings." },
    { name: "danger", cssVar: "--color-danger", usage: "Cannot be undone: delete." },
    { name: "success", cssVar: "--color-success", usage: "Done, online, success." },
  ],
};
