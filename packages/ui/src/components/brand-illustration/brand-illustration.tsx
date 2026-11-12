import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { BRAND_ILLUSTRATION_ART } from "./brand-illustration-art";

export type BrandIllustrationName = keyof typeof BRAND_ILLUSTRATION_ART;

/** The ten drawings, in the order of their names. */
export const BRAND_ILLUSTRATION_NAMES = Object.keys(
  BRAND_ILLUSTRATION_ART,
) as BrandIllustrationName[];

/**
 * CSS pixels per cell of the drawing. A multiple of 4 is a whole number of
 * device pixels at every common pixel ratio (1, 1.25, 1.5, 1.75, 2, 3), so
 * every pixel of the drawing comes out the same size.
 */
export type BrandIllustrationCell = 4 | 8;

// Ink and paper read their colours from variables, with the brand pane's own
// tokens as the fallback: the frame colour is the only surface the
// illustrations sit on (design/foundations/brand.md). The fallbacks are raw
// tokens, resolved on the element itself, so a `.dark` or `.light` island
// around the pane gets its own colours.
const brandIllustration = tv({
  slots: {
    root: ["block shrink-0"],
    paper: ["fill-(--illustration-paper,var(--layer-frame))"],
    ink: ["fill-(--illustration-ink,var(--foreground-on-frame))"],
  },
});

export interface BrandIllustrationProps extends Omit<
  ComponentPropsWithRef<"svg">,
  "children" | "name" | "width" | "height" | "viewBox"
> {
  /** Which of the ten drawings. */
  name: BrandIllustrationName;
  /**
   * CSS pixels per cell: 8 (the default) on the brand pane, 4 where the
   * drawing has to be small. The size is the drawing's grid times this;
   * don't resize it with CSS, or its pixels come out uneven.
   */
  cell?: BrandIllustrationCell;
}

/**
 * One of Raft's two-colour pixel illustrations, drawn in ink and paper tokens.
 * For brand surfaces only: the brand pane of sign-up and of the pages that
 * create an account or a server. Decorative: hidden from assistive technology
 * unless the caller passes `aria-hidden={false}` with a name.
 */
export function BrandIllustration({ name, cell = 8, className, ...props }: BrandIllustrationProps) {
  const art = BRAND_ILLUSTRATION_ART[name];
  const { root, paper, ink } = brandIllustration();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${art.width} ${art.height}`}
      width={art.width * cell}
      height={art.height * cell}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      data-slot="brand-illustration"
      data-name={name}
      {...props}
      className={root({ className })}
    >
      {art.paper ? <path className={paper()} d={art.paper} /> : null}
      <path className={ink()} d={art.ink} />
    </svg>
  );
}
