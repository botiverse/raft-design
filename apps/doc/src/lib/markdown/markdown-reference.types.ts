/** Reference kinds the shared remark transform can mark inside Markdown text. */
export type MarkdownReference =
  | { kind: "channel"; name: string; shortId?: string }
  | { kind: "mention"; name: string }
  | { kind: "task"; number: string };
