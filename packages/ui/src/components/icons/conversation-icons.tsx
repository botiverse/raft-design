/**
 * Conversation icons — Message / Chat / DM / Thread / Comment / Feedback.
 *
 * Package-owned source of truth: the docs site renders these same exports
 * (see /components/icons), never a local copy.
 */
import type { SVGProps } from "react";

export type ConversationIconProps = SVGProps<SVGSVGElement>;

export function MessageIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L9.5 13.25H14.25C15.35 13.25 16.25 12.35 16.25 11.25V4.25C16.25 3.15 15.35 2.25 14.25 2.25Z" />
    </svg>
  );
}

export function ChatIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L9.5 13.25H14.25C15.35 13.25 16.25 12.35 16.25 11.25V4.25C16.25 3.15 15.35 2.25 14.25 2.25Z" />
      <circle cx={6.5} cy={7.75} r={0.75} fill="currentColor" stroke="none" />
      <circle cx={9} cy={7.75} r={0.75} fill="currentColor" stroke="none" />
      <circle cx={11.5} cy={7.75} r={0.75} fill="currentColor" stroke="none" />
    </svg>
  );
}

export function DirectMessageIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M16.25 5V4.25C16.25 3.15 15.35 2.25 14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L7.5 14.85" />
      <circle cx={14.25} cy={8} r={1.75} />
      <path d="M11 16.25C11.3 13.65 12.5 12 14.25 12S17.2 13.65 17.5 16.25" />
    </svg>
  );
}

export function ThreadIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      {/* The back bubble ends 2.75 short of the front one's outline on both sides,
          so a stroke-wide gap shows between them, as in Lucide's messages-square. */}
      <path d="M3.5 11.5L1.75 13.25V4.25A2 2 0 0 1 3.75 2.25H11.25" />
      <path d="M8.25 5H14.5C15.6 5 16.5 5.9 16.5 7V11.75C16.5 12.85 15.6 13.75 14.5 13.75H13V16.25L9.75 13.75H8.25C7.15 13.75 6.25 12.85 6.25 11.75V7C6.25 5.9 7.15 5 8.25 5Z" />
    </svg>
  );
}

/** A comment, said about a passage: MessageIcon's bubble with quote marks. */
export function CommentIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L9.5 13.25H14.25C15.35 13.25 16.25 12.35 16.25 11.25V4.25C16.25 3.15 15.35 2.25 14.25 2.25Z" />
      <path d="M6.375 9.75a1.5 1.5 0 0 0 1.5-1.5V5.25h-1.5" />
      <path d="M10.125 9.75a1.5 1.5 0 0 0 1.5-1.5V5.25h-1.5" />
    </svg>
  );
}

/** Feedback, sent to the people who make Raft: MessageIcon's bubble with an exclamation mark. */
export function FeedbackIcon(props: ConversationIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={18}
      height={18}
      viewBox="0 0 18 18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      {...props}
    >
      <path d="M14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L9.5 13.25H14.25C15.35 13.25 16.25 12.35 16.25 11.25V4.25C16.25 3.15 15.35 2.25 14.25 2.25Z" />
      <path d="M9 4.75v3" />
      <path d="M9 10.5h.01" />
    </svg>
  );
}
