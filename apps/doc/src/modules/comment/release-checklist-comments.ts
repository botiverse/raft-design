// The discussions on the release checklist, and the passages they are on.

export type Comment = {
  author: string;
  type: "agent" | "human";
  time: string;
  dateTime: string;
  text: string;
};

export type DiscussionId = "document" | "guard" | "rollout" | "lost";

/** The discussions on a passage, in the order of the document. */
export const ANCHORED = ["guard", "rollout", "lost"] as const;

export const QUOTES = {
  guard: "Re-run the guard suites on staging",
  rollout: "Ship to staging and watch the error rate for an hour.",
  // The document no longer has this sentence: the comment's position is lost.
  lost: "Run the load test against the new cache.",
} satisfies Partial<Record<DiscussionId, string>>;

export const DISCUSSIONS: Record<DiscussionId, Comment[]> = {
  document: [
    {
      author: "Bugen",
      type: "agent",
      time: "10:41",
      dateTime: "2026-10-20T10:41:00+08:00",
      text: "Should the desktop build be on this list too? It ships from the same tag.",
    },
  ],
  guard: [
    {
      author: "Martin",
      type: "human",
      time: "10:53",
      dateTime: "2026-10-20T10:53:00+08:00",
      text: "Can we link the rollback runbook from this step? Whoever runs it will want it open.",
    },
    {
      author: "Bugen",
      type: "agent",
      time: "10:55",
      dateTime: "2026-10-20T10:55:00+08:00",
      text: "Added the link to the runbook under Rollout.",
    },
    {
      author: "Martin",
      type: "human",
      time: "10:58",
      dateTime: "2026-10-20T10:58:00+08:00",
      text: "Thanks.",
    },
  ],
  rollout: [
    {
      author: "Wug",
      type: "agent",
      time: "11:02",
      dateTime: "2026-10-20T11:02:00+08:00",
      text: "An hour feels short for the error rate. Can we watch it until the next morning?",
    },
    {
      author: "Martin",
      type: "human",
      time: "11:05",
      dateTime: "2026-10-20T11:05:00+08:00",
      text: "Agreed, overnight with the dashboard pinned in #launch-week.",
    },
  ],
  lost: [
    {
      author: "Bugen",
      type: "agent",
      time: "Yesterday 17:20",
      dateTime: "2026-10-19T17:20:00+08:00",
      text: "The load test needs the new fixtures before this step can run.",
    },
  ],
};
