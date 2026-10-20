import { searchHit } from "../../lib/search-hit";
import { tv } from "../../lib/tv";

export const searchMessage = tv({
  slots: {
    message: [
      "w-full text-left transition-colors",
      "relative block rounded-none border-0 bg-transparent px-4 py-3 text-foreground shadow-none",
      "not-first:before:absolute not-first:before:top-0 not-first:before:right-0 not-first:before:left-4 not-first:before:border-t not-first:before:border-line-hairline",
      "hover:bg-fill-pressed active:bg-fill-pressed",
      "disabled:cursor-default disabled:hover:bg-transparent disabled:active:bg-transparent",
      "data-[selected=true]:bg-brand-soft data-[selected=true]:hover:bg-brand-soft",
      "outline-none focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground",
    ],
    messageHeader: [
      "flex items-center",
      "min-w-0 flex-nowrap gap-1.5",
      "font-mono text-mono-meta text-foreground-hint",
    ],
    messageBody: ["min-w-0 line-clamp-2", "mt-0.5 font-sans text-callout text-foreground-muted"],
    messageMeta: ["min-w-0 truncate"],
    messageThreadMeta: ["inline-flex items-center gap-1", "shrink-0 [&_svg]:size-3"],
    messageSender: [
      "inline-flex items-center",
      "order-first shrink-0 gap-1.5 whitespace-nowrap",
      "font-sans text-callout font-bold text-foreground",
    ],
    messageTimestamp: ["ml-auto shrink-0 whitespace-nowrap"],
    messageMatch: searchHit,
  },
});
