import { searchHit } from "../../lib/search-hit";
import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

export const searchMessage = tv({
  slots: {
    message: [
      "w-full text-left",
      "block rounded-none border-0 text-foreground",
      // With a mouse 8px above and below at every width, as an Activity item
      // (stdrc, 2026-11-04); a narrow window with a mouse had 12px only by a
      // breakpoint's accident (#proj-raft-ui:#293).
      "py-3 pointer-fine:py-2",
      listCell,
      listCellStates,
      "disabled:cursor-default",
      "data-[selected=true]:before:bg-brand-soft",
      listCellFocus,
    ],
    messageHeader: [
      "flex items-center",
      "min-w-0 flex-nowrap gap-1.5",
      "font-mono text-mono-meta text-foreground-hint",
    ],
    messageBody: ["min-w-0 line-clamp-2", "mt-0.5 font-sans text-callout text-foreground-muted"],
    messageMeta: ["min-w-0 shrink-1000 truncate"],
    messageThreadMeta: ["inline-flex items-center gap-1", "shrink-0 [&_svg]:size-3"],
    messageSender: [
      "inline-flex items-center",
      "order-first shrink-0 gap-1.5 whitespace-nowrap",
      "font-sans text-callout font-bold text-foreground",
    ],
    messageTimestamp: ["ml-auto min-w-0 truncate"],
    messageMatch: searchHit,
  },
});
