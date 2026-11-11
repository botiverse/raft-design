/**
 * Object icons — the things in Raft that ricons names an icon for: an Artifact.
 *
 * On Lucide's grid (24 viewBox, stroke 2, round caps and joins), like the action icons, which
 * draw their marks on these.
 *
 * Package-owned source of truth: apps import these from @botiverse/ricons and the docs site renders them
 * (see /components/icons), never a local copy.
 */
import type { SVGProps } from "react";

export type ObjectIconProps = SVGProps<SVGSVGElement>;

/**
 * An Artifact: Lucide's file-code, drawn here unchanged, so the icon for Artifacts is the
 * one an HTML Artifact's chip shows in a message (a page with a folded corner and a `< >`).
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
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 12.5 8 15l2 2.5" />
      <path d="m14 12.5 2 2.5-2 2.5" />
    </svg>
  );
}
