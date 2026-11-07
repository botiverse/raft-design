/**
 * Object icons — the things in Raft that Lucide has no icon for: an Artifact.
 *
 * Drawn on Lucide's grid (24 viewBox, stroke 2, round caps and joins), like the action icons.
 *
 * Package-owned source of truth: the docs site renders these same exports
 * (see /components/icons), never a local copy.
 */
import type { SVGProps } from "react";

export type ObjectIconProps = SVGProps<SVGSVGElement>;

/**
 * An Artifact, a page someone made: two stacked pages with no dog-ear, the front one carrying
 * Lucide file-code's `< >`, the mark an Artifact chip shows in a message.
 */
export function ArtifactIcon(props: ObjectIconProps) {
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
      <path d="M9 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2" />
      <rect x={3} y={7} width={14} height={14} rx={2} />
      <path d="M8 11.5 6 14l2 2.5" />
      <path d="m12 11.5 2 2.5-2 2.5" />
    </svg>
  );
}
