// The item an app link shows, in the words the app sends: the id line, the
// title, the row of state and details, and the buttons. The hover card
// (PreviewCard, size="item") and the block card in a message (AppLinkCard)
// show the same answer, so they share these classes: a reader who knows one
// reads the other.
export const ITEM_CARD_EYEBROW = ["m-0 truncate", "font-mono text-mono-meta text-foreground-muted"];

export const ITEM_CARD_META = [
  "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
  "m-0 font-sans text-callout text-foreground-muted",
];

export const ITEM_CARD_ACTIONS = [
  "flex flex-wrap items-center justify-end gap-2",
  "px-4 pb-3 last:pb-4",
];
