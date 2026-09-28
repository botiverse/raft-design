import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const inlineCode = tv({
  slots: {
    root: [],
  },
  variants: {
    // `message` is the in-message treatment: no border, 0.875em so a run of
    // code does not crowd the sentence, sitting on the text baseline, and
    // allowed to break inside long unbroken tokens (paths, hashes) instead of
    // overflowing the message.
    appearance: {
      default: {},
      message: {},
    },
    theme: {
      brutal: {
        root: [
          "border border-line-strong bg-brutal-yellow/50 px-1.5",
          "font-mono text-sm font-medium text-foreground-strong wrap-anywhere",
        ],
      },
      elegant: {
        root: [
          "inline-flex items-center rounded-md px-2.5 py-[1.5px]",
          "font-mono text-sm font-medium",
          "bg-[oklch(0.955_0_0)] text-[oklch(0.44_0_0)]",
          "dark:bg-fill-muted dark:text-foreground dark:shadow-raft-xs",
        ],
      },
    },
  },
  compoundVariants: [
    {
      appearance: "message",
      class: {
        root: [
          "inline rounded-none border-0 px-1 py-0 align-baseline",
          // oxlint-disable-next-line better-tailwindcss/enforce-canonical-classes
          "[font-size:0.875em] leading-[1.3em] font-normal",
          "wrap-anywhere",
        ],
      },
    },
    { theme: "brutal", appearance: "message", class: { root: "bg-black/5 text-black" } },
    {
      theme: "elegant",
      appearance: "message",
      class: { root: "bg-fill-muted text-foreground-strong dark:shadow-none" },
    },
  ],
  defaultVariants: {
    appearance: "default",
  },
});

export type InlineCodeProps = ComponentPropsWithRef<"code"> & {
  /** `message` renders the borderless, baseline-aligned in-message treatment. */
  appearance?: "default" | "message";
};

export function InlineCode({ className, appearance, ...props }: InlineCodeProps) {
  const theme = useThemeFamily();
  const { root } = inlineCode({ theme, appearance });

  return <code data-slot="inline-code" className={root({ className })} {...props} />;
}
