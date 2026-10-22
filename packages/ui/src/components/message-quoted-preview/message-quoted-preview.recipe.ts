import { tv } from "../../lib/tv";

export const messageQuotedPreview = tv({
  slots: {
    root: [
      "w-full",
      "rounded-none border-0 border-l-2 border-line-seam bg-transparent pl-2.5",
      "text-foreground-muted",
    ],
    content: ["min-w-0", "p-0"],
    // With "(sent by …)" the line wraps rather than cut it: the place and the
    // time move to a second line when the author and the label fill the first.
    header: [
      "flex min-w-0 items-center",
      "has-data-[slot=message-quoted-preview-author-delegated-by]:flex-wrap",
      "gap-1.5 p-0 pb-0.5",
    ],
    // The icon sits on the first line of the name when a long name wraps
    // (alignment.md#a-mark-that-leads-text), not in the middle of both lines.
    channel: [
      "inline-flex items-start",
      "gap-1 text-footnote font-semibold text-foreground-hint [&_svg]:size-3.5 [&_svg]:lead-icon",
    ],
    thread: [
      "inline-flex items-start",
      "gap-1 text-footnote font-semibold text-foreground-hint [&_svg]:size-3.5 [&_svg]:lead-icon",
    ],
    author: ["inline-flex min-w-0 items-center", "gap-1.5"],
    authorName: ["truncate", "text-footnote font-bold text-foreground-muted"],
    authorMeta: ["truncate", "text-caption text-foreground-hint"],
    authorDelegatedBy: ["shrink-0 whitespace-nowrap", "text-footnote text-foreground-muted"],
    timestamp: ["ml-auto shrink-0", "font-mono text-mono-meta tabular-nums text-foreground-hint"],
    text: ["line-clamp-2", "text-callout text-foreground-muted"],
    attachments: ["flex flex-wrap gap-1.5", "mt-1.5"],
    attachment: [
      "inline-flex items-center",
      "h-[22px] gap-1 rounded-chip bg-fill-muted px-1.5",
      "font-mono text-mono-meta text-foreground-muted [&_svg]:size-3.5",
    ],
    loading: [
      "w-full animate-pulse",
      "rounded-none border-0 border-l-2 border-line-seam bg-transparent pl-2.5",
    ],
    unavailable: [
      "block w-full text-left",
      "border-l-2 border-line-seam pl-2.5",
      "text-callout text-foreground-hint",
      "outline-none focus-visible:shadow-focus",
    ],
  },
});
