import { searchHit } from "../../lib/search-hit";
import { listCell, listCellFocus, listCellStates } from "../../lib/list-cell";
import { tv } from "../../lib/tv";

export const searchMessage = tv({
  slots: {
    message: [
      "w-full text-left",
      "block rounded-none border-0 px-4 py-3 text-foreground",
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
