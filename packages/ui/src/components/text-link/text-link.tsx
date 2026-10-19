import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

// Raft Design System › TextLink: the bottom step of the emphasis ladder, under
// a frameless button. Underlined text that takes the size of the text around
// it; colour and weight carry its emphasis, never pink (pink is the one
// primary button on the screen). Prose links inside rendered content are the
// link blue and are not this component.
export const textLinkVariants = tv({
  base: [
    "rounded-[2px]",
    "underline decoration-[1.5px] underline-offset-[3px]",
    "outline-none focus-visible:shadow-focus",
    "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:no-underline",
  ],
  variants: {
    variant: {
      muted: ["font-medium text-foreground-muted", "hover:text-foreground"],
      strong: ["font-semibold text-foreground", "hover:decoration-attention"],
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
