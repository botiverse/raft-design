/**
 * Conversation icons — Message / Chat / DM / Thread.
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
      strokeWidth={1}
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
      strokeWidth={1}
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
      strokeWidth={1}
      {...props}
    >
      <path d="M16.25 5V4.25C16.25 3.15 15.35 2.25 14.25 2.25H3.75C2.65 2.25 1.75 3.15 1.75 4.25V11.25C1.75 12.35 2.65 13.25 3.75 13.25H5.75V16.25L7.5 14.85" />
      <path
        d="M8.75 5.5H15.5C16.6 5.5 17.5 6.4 17.5 7.5V12.25C17.5 13.35 16.6 14.25 15.5 14.25H14V16.75L10.75 14.25H8.75C7.65 14.25 6.75 13.35 6.75 12.25V7.5C6.75 6.4 7.65 5.5 8.75 5.5Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
