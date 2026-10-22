import { tv } from "../../lib/tv";

// Raft Design System › InboxItem, loading: a placeholder row built from the
// real InboxItem parts, so its padding, its divider and the line height of
// every text line are the loaded row's. Each bar is an inline box inside the
// real text slot: the slot's own line height sets the line, and the bar only
// fills part of it. Bar widths vary over a run of three rows, so a list of
// them doesn't read as a striped block.
export const inboxItemSkeleton = tv({
  slots: {
    list: ["flex min-w-0 flex-col"],
    row: [
      "[--inbox-item-skeleton-context:5rem] [--inbox-item-skeleton-title:60%] [--inbox-item-skeleton-body:80%]",
      "nth-[3n+2]:[--inbox-item-skeleton-context:4rem] nth-[3n+2]:[--inbox-item-skeleton-title:45%] nth-[3n+2]:[--inbox-item-skeleton-body:70%]",
      "nth-[3n]:[--inbox-item-skeleton-context:6rem] nth-[3n]:[--inbox-item-skeleton-title:55%] nth-[3n]:[--inbox-item-skeleton-body:75%]",
    ],
    leading: ["size-[35px]"],
    line: ["min-w-0 flex-1"],
    title: ["pl-0"],
    bar: ["inline-block h-[0.75em] max-w-full align-middle"],
    contextBar: ["w-(--inbox-item-skeleton-context)"],
    titleBar: ["w-(--inbox-item-skeleton-title)"],
    bodyBar: ["w-(--inbox-item-skeleton-body)"],
    timestampBar: ["w-9"],
  },
});
