import { tv } from "../../lib/tv";

// The one place for how a card in a message looks (design/patterns/cards-in-messages.md):
// its frame and widths here, and the parts every card and item popover shares
// in `messageCard`. A card takes its frame, inset, title size and widths from
// these recipes, never its own classes: card-styles.test.ts fails on a card
// that writes them itself.
export const messageEmbed = tv({
  slots: {
    root: [
      "group block min-w-0 text-left",
      "rounded-container border border-line-hairline bg-layer-card",
      "outline-none focus-visible:shadow-focus",
      "data-[interactive=true]:hover:overlay-subtle data-[interactive=true]:active:overlay-medium",
    ],
    header: ["min-w-0", "px-3 py-2"],
    content: ["min-w-0"],
    footer: ["min-w-0", "px-3 py-2"],
  },
  variants: {
    // The two widths a card in a message has. An item card (it opens one
    // thing: an app link, an Artifact, an action card) is as wide as the item
    // popover, 400px (`messageCard`'s `popover`), and takes the message's
    // width on a phone, so its buttons get the room a finger needs. A content
    // card (it shows other messages: a forwarded bundle, replies) runs with
    // the message's text, up to 560px.
    size: {
      item: { root: ["w-full max-w-[400px] max-md:max-w-none"] },
      content: { root: ["w-full max-w-[560px]"] },
    },
  },
});

// The parts of a card, the same in a card in a message and in an item
// popover (PreviewCard size="item"), which draws them in its own frame.
export const messageCard = tv({
  slots: {
    // Where the card comes from: the app's icon and name, then the host.
    // Raft draws it from what it stores for the app, never from the card's
    // content, so an app's card can't pass for a person's words.
    source: [
      "flex min-w-0 items-center gap-1.5",
      "border-b border-line-hairline px-3 py-2",
      "font-sans text-caption text-foreground-muted",
    ],
    sourceIcon: [
      "inline-flex size-4 shrink-0 items-center justify-center",
      "*:size-full *:shrink-0 [&>img]:rounded-[2px] [&>img]:object-cover",
    ],
    sourceName: ["min-w-0 truncate", "font-semibold text-foreground"],
    // The host loses its start, never its end: the end is the part that says
    // where the link goes.
    sourceHost: [
      "flex min-w-0 items-baseline",
      "before:shrink-0 before:pe-1.5 before:content-['·']",
    ],
    sourceHostText: ["min-w-0 truncate"],
    // The source as a caption under a hairline at the bottom, where a
    // popover still puts it (PreviewCardFooter).
    sourceFooter: [
      "m-0 truncate",
      "border-t border-line-hairline px-3 py-2",
      "font-sans text-caption text-foreground-muted",
    ],
    // The item: an id line, the title, a row of state and details, 12px from
    // the card's edges.
    body: ["flex min-w-0 flex-col gap-1.5", "p-3"],
    eyebrow: ["m-0 truncate", "font-mono text-mono-meta text-foreground-muted"],
    // The title opens the item: up to 2 lines, and its link keeps the
    // title's ink and is underlined on hover, like a sender's name.
    title: [
      "m-0 line-clamp-2",
      "font-sans text-subhead font-bold text-foreground",
      "[&_a]:rounded-[2px] [&_a]:decoration-[1.5px] [&_a]:underline-offset-[3px] [&_a]:hover:underline",
      "[&_a]:outline-none [&_a]:focus-visible:shadow-focus",
    ],
    // The title's type alone, for a title that is one cell of a row
    // (MessageActionCardHeader).
    heading: ["font-sans text-subhead font-bold text-foreground"],
    meta: [
      "flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1",
      "m-0 font-sans text-callout text-foreground-muted",
    ],
    // The buttons at the card's bottom end, on one row that never wraps: at
    // most two, the frameless one first and the bordered one last. A third
    // and every further action go in a More menu (⋯) to their left, which
    // the card's author supplies; the row draws none of its own.
    actions: ["flex flex-nowrap items-center justify-end gap-2", "px-3 pb-3"],
    // The same row inside a part that already sets the card's inset.
    actionRow: ["flex flex-nowrap items-center justify-end gap-2"],
    // The card's inset, for a part that lays out its own content.
    inset: ["p-3"],
    // An item popover's width: the item card's 400px.
    popover: ["w-[400px]"],
  },
});
