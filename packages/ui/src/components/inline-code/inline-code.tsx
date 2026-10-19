import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";

const inlineCode = tv({
  slots: {
    root: [
      "rounded-sticker px-1 py-px",
      "font-mono text-[0.875em] font-normal text-foreground wrap-anywhere",
      "bg-fill-muted",
    ],
  },
  variants: {
    // `message` is the in-message treatment: no border, 0.875em so a run of
    // code does not crowd the sentence, sitting on the text baseline, and
    // allowed to break inside long unbroken tokens (paths, hashes) instead of
    // overflowing the message.
    appearance: {
      default: {},
      message: {
        root: [
          "inline border-0 px-1 align-baseline",
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:0.875em] leading-[1.3em] font-normal",
          "wrap-anywhere",
          // The fill is the font's content area plus 1px. Space Mono's cap
          // centre sits (1.120 - 0.361) / 2 - 0.704 / 2 = 0.0275em below that
          // area's centre (ascent, descent, cap height), so move the fill down
          // by as much and the letters look centred in it.
          "rounded-sticker bg-fill-muted pt-[calc(1px-0.0275em)] pb-[calc(1px+0.0275em)] text-foreground",
        ],
      },
    },
  },
  defaultVariants: {
    appearance: "default",
  },
});

export type InlineCodeProps = ComponentPropsWithRef<"code"> & {
  /** `message` renders the borderless, baseline-aligned in-message treatment. */
  appearance?: "default" | "message";
};

export function InlineCode({ className, appearance, ...props }: InlineCodeProps) {
  const { root } = inlineCode({ appearance });

  return <code data-slot="inline-code" className={root({ className })} {...props} />;
}
