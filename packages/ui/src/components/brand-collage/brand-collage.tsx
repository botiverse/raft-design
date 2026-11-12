import { Children, isValidElement } from "react";
import type { ComponentPropsWithRef } from "react";
import { BrandIllustration } from "../brand-illustration/brand-illustration";
import type { BrandIllustrationName } from "../brand-illustration/brand-illustration";
import { tv } from "../../lib/tv";

// The collage of the brand pane where a page creates nothing visible yet
// (design/products/raft-chat/onboarding.md): one illustration flat in the
// middle at 8px a cell, and up to five agent faces around it, each tilted on
// its own with the hard sticker shadow. A fixed 576 x 480 box: its centre and
// every illustration's half-size are whole pixels, so the drawing's cells
// land on the pixel grid. The places stay clear of the largest illustration
// (312 x 232) for faces up to the lg avatar (51px).
const brandCollage = tv({
  slots: {
    root: ["relative h-[480px] w-[576px] shrink-0"],
    illustration: ["absolute top-1/2 left-1/2 -translate-1/2"],
    face: ["absolute flex", "rounded-sticker shadow-sticker"],
  },
});

const PLACES = [
  "top-10 left-8 -rotate-3",
  "top-6 right-14 rotate-2",
  "right-8 bottom-14 -rotate-2",
  "bottom-8 left-12 rotate-3",
  "bottom-2 left-[200px] -rotate-1",
] as const;

export interface BrandCollageProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  /** The drawing in the middle. */
  illustration: BrandIllustrationName;
  /**
   * Agent faces: four or five `Avatar type="agent"`, lg or md. They take the
   * five places in order (top left, top right, bottom right, bottom left,
   * bottom); a sixth and later are not drawn.
   */
  children?: ComponentPropsWithRef<"div">["children"];
}

/**
 * The brand pane's collage: a BrandIllustration and agent faces laid around
 * it like stickers. It says nothing in particular and doesn't change with
 * what the person types. Decorative: hidden from assistive technology.
 */
export function BrandCollage({ illustration, className, children, ...props }: BrandCollageProps) {
  const slots = brandCollage();
  return (
    <div
      aria-hidden="true"
      data-slot="brand-collage"
      {...props}
      className={slots.root({ className })}
    >
      <BrandIllustration name={illustration} cell={8} className={slots.illustration()} />
      {Children.toArray(children)
        .slice(0, PLACES.length)
        .map((face, index) => (
          <div
            key={isValidElement(face) && face.key !== null ? face.key : index}
            data-slot="brand-collage-face"
            className={slots.face({ className: PLACES[index] })}
          >
            {face}
          </div>
        ))}
    </div>
  );
}
