export type ActivityCompositionKind = "channel" | "dm" | "thread" | "mention_action";
export type ActivityCompositionChannelKind = "channel" | "dm";
export type ActivityTaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

export type ActivityCompositionItem = {
  id: string;
  kind: ActivityCompositionKind;
  channelKind: ActivityCompositionChannelKind;
  title: string;
  channelId: string;
  channelLabel: string;
  sender: string;
  preview: string;
  timestamp: string;
  sortAt: string;
  unreadCount: number;
  hasMention?: boolean;
  replyCount?: number;
  task?: {
    number: number;
    claimedBy?: string;
    status: ActivityTaskStatus;
  };
  draft?: boolean;
  following?: boolean;
  saved?: boolean;
  done?: boolean;
};

export const ACTIVITY_COMPOSITION_ITEMS = [
  {
    id: "thread:design-review",
    kind: "thread",
    channelKind: "channel",
    title: "The activity card spacing is ready for a source-parity pass.",
    channelId: "design",
    channelLabel: "#design",
    sender: "Mira",
    preview: "I kept the original border, spacing, and selected treatment.",
    timestamp: "2 minutes ago",
    sortAt: "2026-07-31T10:42:00+08:00",
    unreadCount: 3,
    hasMention: true,
    replyCount: 8,
    task: { number: 21, claimedBy: "Atlas", status: "todo" },
  },
  {
    id: "dm:samira",
    kind: "dm",
    channelKind: "dm",
    title: "Samira Khan",
    channelId: "dm-samira",
    channelLabel: "Samira Khan",
    sender: "Samira",
    preview: "The permissions review is complete. Please check the final note.",
    timestamp: "18 minutes ago",
    sortAt: "2026-07-31T10:26:00+08:00",
    unreadCount: 1,
    saved: true,
  },
  {
    id: "mention:general",
    kind: "mention_action",
    channelKind: "channel",
    title: "general",
    channelId: "general",
    channelLabel: "#general",
    sender: "Avery",
    preview: "@Robin can you confirm the release checklist before we merge?",
    timestamp: "31 minutes ago",
    sortAt: "2026-07-31T10:13:00+08:00",
    unreadCount: 1,
    hasMention: true,
  },
  {
    id: "thread:roadmap",
    kind: "thread",
    channelKind: "channel",
    title: "Document the Activity composition boundary before implementation.",
    channelId: "shared-roadmap",
    channelLabel: "#shared-roadmap",
    sender: "Spec Writer",
    preview: "The UI package owns parts; Playground owns inbox workflow state.",
    timestamp: "1 hour ago",
    sortAt: "2026-07-31T09:44:00+08:00",
    unreadCount: 0,
    replyCount: 5,
    following: false,
    saved: true,
    draft: true,
  },
  {
    id: "channel:vendor-review",
    kind: "channel",
    channelKind: "channel",
    title: "vendor-review",
    channelId: "vendor-review",
    channelLabel: "#vendor-review",
    sender: "Atlas",
    preview: "The source implementation has been checked against staging.",
    timestamp: "2 hours ago",
    sortAt: "2026-07-31T08:44:00+08:00",
    unreadCount: 0,
  },
  {
    id: "thread:partner-ops",
    kind: "thread",
    channelKind: "channel",
    title: "Follow up on the partner launch checklist.",
    channelId: "partner-ops",
    channelLabel: "#partner-ops",
    sender: "Avery",
    preview: "Restoring this item should return it to Active.",
    timestamp: "Yesterday",
    sortAt: "2026-07-30T17:30:00+08:00",
    unreadCount: 0,
    replyCount: 3,
    done: true,
  },
] as const satisfies readonly ActivityCompositionItem[];
