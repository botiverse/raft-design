/**
 * Action icons — follow / unfollow a thread or an Artifact; join / leave a public, private or
 * joint channel; add a comment; create a task; reopen a task.
 *
 * Drawn on Lucide's grid (24 viewBox, stroke 2, round caps and joins) so they sit beside the
 * Lucide icons in a menu at the same weight. Each pair shares one base drawing and swaps only
 * the mark: a plus to add, create, follow or join, a minus to unfollow or leave.
 *
 * Package-owned source of truth: the docs site renders these same exports
 * (see /components/icons), never a local copy.
 */
import type { SVGProps } from "react";

export type ActionIconProps = SVGProps<SVGSVGElement>;

/** Follow a thread: a plus inside ThreadIcon's front bubble. */
export function FollowThreadIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M4.667 15.333 2.333 17.667V5.667A2.667 2.667 0 0 1 5 3h10" />
      <path d="M11 6.667h8.333A2.667 2.667 0 0 1 22 9.333v6.334a2.667 2.667 0 0 1-2.667 2.666h-2v3.334L13 18.333h-2a2.667 2.667 0 0 1-2.667-2.666V9.333A2.667 2.667 0 0 1 11 6.667Z" />
      <path d="M15.167 10v5" />
      <path d="M12.667 12.5h5" />
    </svg>
  );
}

/** Unfollow a thread: a minus inside ThreadIcon's front bubble. */
export function UnfollowThreadIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M4.667 15.333 2.333 17.667V5.667A2.667 2.667 0 0 1 5 3h10" />
      <path d="M11 6.667h8.333A2.667 2.667 0 0 1 22 9.333v6.334a2.667 2.667 0 0 1-2.667 2.666h-2v3.334L13 18.333h-2a2.667 2.667 0 0 1-2.667-2.666V9.333A2.667 2.667 0 0 1 11 6.667Z" />
      <path d="M12.667 12.5h5" />
    </svg>
  );
}

/** Join a public channel: Lucide's hash, cut short of a plus in the bottom-right corner. */
export function JoinChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <line x1={4} y1={9} x2={20} y2={9} />
      <line x1={4} y1={15} x2={15.5} y2={15} />
      <line x1={10} y1={3} x2={8} y2={21} />
      <line x1={16} y1={3} x2={14.5} y2={16.5} />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Leave a public channel: the same cut hash, with a minus. */
export function LeaveChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <line x1={4} y1={9} x2={20} y2={9} />
      <line x1={4} y1={15} x2={15.5} y2={15} />
      <line x1={10} y1={3} x2={8} y2={21} />
      <line x1={16} y1={3} x2={14.5} y2={16.5} />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Join a private channel: Lucide's lock, its body cut short of a plus in the bottom-right corner. */
export function JoinPrivateChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M21 13a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Leave a private channel: the same cut lock, with a minus. */
export function LeavePrivateChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M21 13a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h9" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Join a joint channel: Lucide's git-branch, with a plus in its empty bottom-right corner. */
export function JoinJointChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M15 6a9 9 0 0 0-9 9V3" />
      <circle cx={18} cy={6} r={3} />
      <circle cx={6} cy={18} r={3} />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Leave a joint channel: Lucide's git-branch, with a minus. */
export function LeaveJointChannelIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M15 6a9 9 0 0 0-9 9V3" />
      <circle cx={18} cy={6} r={3} />
      <circle cx={6} cy={18} r={3} />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Follow an Artifact: a plus inside ArtifactIcon's page, where its two lines of text were. */
export function FollowArtifactIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <path d="M9 6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M12 13.5v5" />
      <path d="M9.5 16h5" />
    </svg>
  );
}

/** Unfollow an Artifact: a minus inside ArtifactIcon's page. */
export function UnfollowArtifactIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <path d="M9 6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M9.5 16h5" />
    </svg>
  );
}

/** Add a comment: CommentIcon at 24, its bubble cut short of a plus in the bottom-right corner. */
export function AddCommentIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M21.667 13.55V5.667A2.667 2.667 0 0 0 19 3H5a2.667 2.667 0 0 0-2.667 2.667V15A2.667 2.667 0 0 0 5 17.667h2.667v4l5-4" />
      <path d="M8.5 13a2 2 0 0 0 2-2V7h-2" />
      <path d="M13.5 13a2 2 0 0 0 2-2V7h-2" />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Create a task: Lucide's list-todo, a plus in place of its last line. */
export function CreateTaskIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <rect x={3} y={4} width={6} height={6} rx={1} />
      <path d="M13 5h8" />
      <path d="M13 12h8" />
      <path d="m3 17 2 2 4-4" />
      <path d="M19 16v6" />
      <path d="M16 19h6" />
    </svg>
  );
}

/** Reopen a task: a ticked box, broken open at the top by a counter-clockwise arrow (Lucide's rotate-ccw-square with a check). */
export function ReopenTaskIcon(props: ActionIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      {...props}
    >
      <path d="M20 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
      <path d="M20 9V7a2 2 0 0 0-2-2h-6" />
      <path d="m15 2-3 3 3 3" />
      <path d="m9 12.5 2 2 4-4" />
    </svg>
  );
}
