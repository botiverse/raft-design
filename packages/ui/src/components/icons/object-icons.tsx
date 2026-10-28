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

/** An Artifact, a page someone made: a page with no dog-ear, a header block and two lines of text. */
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
      <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <path d="M9 6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" />
      <path d="M8 14h8" />
      <path d="M8 18h4" />
    </svg>
  );
}
