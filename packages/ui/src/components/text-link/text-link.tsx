import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowUpRight, Download } from "lucide-react";
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
    inline: {
      true: [
        "box-decoration-clone",
        "aria-disabled:cursor-not-allowed aria-disabled:text-foreground-disabled aria-disabled:hover:no-underline",
      ],
    },
  },
  defaultVariants: {
    variant: "muted",
  },
});

export type TextLinkProps = useRender.ComponentProps<"button"> &
  Omit<VariantProps<typeof textLinkVariants>, "inline"> & {
    /**
     * Whether TextLink renders a native `<button>`. Set `false`
     * for a link in a sentence (it renders a `<span />` unless `render` says otherwise): a span is
     * inline text, so the link wraps across lines with the words around it,
     * where a button is one box that can't. The span then gets the button's
     * behavior: `role="button"`, the tab order, Enter and Space, and
     * `aria-disabled` when disabled.
     * @default true
     */
    nativeButton?: boolean;
  };

export function TextLink({
  variant,
  className,
  render,
  nativeButton = true,
  ...props
}: TextLinkProps) {
  if (!nativeButton) {
    return <TextLinkInline variant={variant} className={className} render={render} {...props} />;
  }
  return <TextLinkButton variant={variant} className={className} render={render} {...props} />;
}

function TextLinkButton({ variant, className, render, ...props }: TextLinkProps) {
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

// The in-sentence form: inline text that acts as a button, so it wraps with
// the sentence. Each line it wraps onto gets its own rounded corners and
// focus ring (box-decoration-clone); a span is never `:disabled`, so its
// disabled look keys off aria-disabled.
function TextLinkInline({ variant, className, render, ...props }: TextLinkProps) {
  return (
    <BaseButton
      {...props}
      nativeButton={false}
      render={(render ?? <span />) as BaseButton.Props["render"]}
      data-slot="text-link"
      className={textLinkVariants({ variant, inline: true, className })}
    />
  );
}

// The box of a mark after a link's text: 0.857em, 2px after the text, centred
// on the letters' cap height, and inline-flex so the underline stops at the text.
const markBox = "ml-0.5 inline-flex align-[calc(0.7em/2-0.857em/2)]";

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
    <span data-slot="text-link-external-icon" className={cn(markBox, className)}>
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

export type TextLinkDownloadIconProps = {
  /** Read by a screen reader after the link text, such as "(downloads a file)". Product copy, so the caller passes it. */
  label?: string;
  className?: string;
};

/**
 * The download mark after a link that downloads a file
 * (design/patterns/navigation.md): the sibling of TextLinkExternalIcon, in
 * the same box (0.857em, 2px after the text, centred on the cap height,
 * inline-flex so the underline stops at the text). A download doesn't leave
 * the page, so the link stays in the same tab and takes no ↗.
 */
export function TextLinkDownloadIcon({ label, className }: TextLinkDownloadIconProps) {
  return (
    <span data-slot="text-link-download-icon" className={cn(markBox, className)}>
      <Download aria-hidden="true" focusable="false" className="size-[0.857em]" strokeWidth={2} />
      {label ? <span className="sr-only"> {label}</span> : null}
    </span>
  );
}
