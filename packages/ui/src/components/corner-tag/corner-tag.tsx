import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";

// What the person on a card is here (Owner, Admin, Guest, You), as a grey tag
// stuck to the card's top-right corner: its two outer edges are the card's
// own, so only the corner facing into the card is rounded, and the card's
// corner clips the other. It lies over the card and takes no row of its own.
// Grey, never a colour: blue already says "from another server", and red,
// green and yellow say a status.
//
// The tag is absolutely placed, so the card must be its nearest positioned
// box and clip its corners (`relative`, and the card's own `overflow-hidden`
// and radius). `CornerTagSpacer`, an invisible copy of the same words at the
// end of the name line, keeps a long name from running under the tag: the
// name truncates before it.
const cornerTag = tv({
  slots: {
    tag: [
      "absolute inset-e-0 top-0 flex h-6 items-center whitespace-nowrap",
      "rounded-es-container ps-2.5 pe-3",
      "bg-fill-medium",
      "font-sans text-caption font-medium text-foreground",
    ],
    spacer: [
      "invisible h-0 shrink-0 overflow-hidden whitespace-nowrap ps-2.5",
      "font-sans text-caption font-medium",
    ],
  },
});

export type CornerTagProps = useRender.ComponentProps<"span">;

/** The tag on the card's top-right corner. A span, so it may sit inside a
 *  button (a card that opens a profile). */
export function CornerTag({ className, render, ...props }: CornerTagProps) {
  const { tag } = cornerTag();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "corner-tag",
    className: tag({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type CornerTagSpacerProps = useRender.ComponentProps<"span">;

/** The room the tag needs, at the end of the card's name line: give it the
 *  tag's words. Invisible, no height and hidden from assistive technology. */
export function CornerTagSpacer({ className, render, ...props }: CornerTagSpacerProps) {
  const { spacer } = cornerTag();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "corner-tag-spacer",
    "aria-hidden": true,
    className: spacer({ className }),
  };
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}
