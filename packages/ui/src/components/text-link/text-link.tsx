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
 * 14px, 2px after the text. It sits in an inline-flex box, so the link's
 * underline stops at the text and never runs under the arrow.
 */
export function TextLinkExternalIcon({ label, className }: TextLinkExternalIconProps) {
  return (
    <span
      data-slot="text-link-external-icon"
      className={cn("ml-0.5 inline-flex align-[-2px]", className)}
    >
      <ArrowUpRight aria-hidden="true" focusable="false" className="size-3.5" strokeWidth={2} />
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
