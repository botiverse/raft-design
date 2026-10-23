import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// Raft Design System › TextLink: the bottom step of the emphasis ladder, under
// a frameless button. Text that takes the size of the text around it; colour
// and weight carry its emphasis at rest, never pink (pink is the one primary
// button on the screen), and it underlines in its own colour on hover, like
// all clickable text (design/foundations/states.md#clickable-text). Prose
// links inside rendered content are the link blue and are not this component.
export const textLinkVariants = tv({
  base: [
    "rounded-[2px]",
    "decoration-[1.5px] underline-offset-[3px] not-disabled:hover:underline",
    "outline-none focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:text-foreground-disabled",
  ],
  variants: {
    variant: {
      muted: ["font-medium text-foreground-muted", "hover:text-foreground"],
      strong: ["font-semibold text-foreground"],
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

export type TextLinkProps = useRender.ComponentProps<"button"> &
  VariantProps<typeof textLinkVariants>;

export function TextLink({ variant, className, render, ...props }: TextLinkProps) {
  const defaultProps: useRender.ElementProps<"button"> = {
    className: textLinkVariants({ variant, className }),
    ...(render ? {} : { type: "button" }),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
    state: {
      slot: "text-link",
    },
  });
}

export type TextLinkExternalIconProps = {
  /** Read by a screen reader after the link text, such as "(opens in a new tab)". Product copy, so the caller passes it. */
  label?: string;
  className?: string;
};

/**
 * The ↗ after a link that leaves Raft (design/patterns/navigation.md#links-that-leave-raft):
 * 0.857em (12px at 14px text, as the icons in a reference chip), 2px after the
 * text, centred on the letters' cap height at every text size (0.7em/2 above
 * the baseline; design/foundations/alignment.md#a-mark-that-leads-text). It
 * sits in an inline-flex box, so the link's underline stops at the text and
 * never runs under the arrow.
 */
export function TextLinkExternalIcon({ label, className }: TextLinkExternalIconProps) {
  return (
    <span
      data-slot="text-link-external-icon"
      className={cn("ml-0.5 inline-flex align-[calc(0.7em/2-0.857em/2)]", className)}
    >
      <ArrowUpRight
        aria-hidden="true"
        focusable="false"
        className="size-[0.857em]"
        strokeWidth={2}
      />
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
