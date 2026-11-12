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
 * An Artifact: Lucide's file-code with its page drawn 2 wider (x 3 to 21, not 4 to 20), a
 * page with a folded corner and a `< >`. Lucide's portrait page is 16 wide where the icons
 * beside it (a monitor, people, a speech bubble) are 20, so beside them it read a size smaller;
 * at 18 wide and the same height it reads as their size. An HTML Artifact's chip in a message
 * shows this icon too, so every place shows one page for an Artifact.
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
      <path d="M5 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 21 8v12a2 2 0 0 1-2 2z" />
      <path d="M15 2v5a1 1 0 0 0 1 1h5" />
      <path d="M10 12.5 8 15l2 2.5" />
      <path d="m14 12.5 2 2.5-2 2.5" />
    </svg>
  );
}
