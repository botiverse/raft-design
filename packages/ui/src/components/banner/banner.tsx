import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";

const banner = tv({
  slots: {
    root: [
      "group/banner @container grid gap-y-0",
      "[&>svg]:col-start-1 [&>svg]:shrink-0",
      "*:data-[slot=status]:col-start-1 *:data-[slot=status]:row-start-1",
      "w-full grid-cols-[minmax(0,1fr)] items-start gap-x-2.5 rounded-container border-0",
      "font-sans text-callout text-foreground ring-1 ring-line-hairline ring-inset",
      "has-[>svg]:grid-cols-[20px_minmax(0,1fr)]",
      "has-[>[data-slot=status]]:grid-cols-[20px_minmax(0,1fr)]",
      "[&>svg]:row-start-1 [&>svg]:size-5 [&>svg]:text-foreground",
      "[&>svg]:mt-[calc((1lh-20px)/2)]",
      "*:data-[slot=status]:lead-dot *:data-[slot=status]:self-start *:data-[slot=status]:justify-self-center",
      "has-[>svg]:[--banner-text-col:2]",
      "has-[>[data-slot=status]]:[--banner-text-col:2]",
      "has-[>[data-slot=banner-title]]:[--banner-desc-row:2]",
      "has-[>[data-slot=banner-description]]:[--banner-last-row:var(--banner-desc-row,1)]",
      "has-[>[data-banner-close]]:[--banner-action-end:span_2]",
    ],
    title: [
      "min-w-0 wrap-break-word text-foreground",
      "row-start-1 font-bold",
      "col-start-(--banner-text-col,1)",
      "@min-[452px]:has-[~[data-slot=banner-description]~[data-slot=banner-action]:not([data-wrap])]:col-end-[span_2]",
    ],
    description: [
      "min-w-0 wrap-break-word font-normal",
      "text-foreground",
      "col-start-(--banner-text-col,1)",
      "row-start-(--banner-desc-row,1)",
    ],
    action: [
      "mt-2 flex shrink-0 flex-wrap items-center justify-end gap-2 self-start",
      "col-start-(--banner-text-col,1) col-end-(--banner-action-end,-1)",
      "@min-[452px]:not-data-wrap:col-start-[calc(var(--banner-text-col,1)+1)] @min-[452px]:not-data-wrap:col-end-auto",
      "@min-[452px]:not-data-wrap:row-start-(--banner-last-row,1)",
      "@min-[452px]:not-data-wrap:mt-0 @min-[452px]:not-data-wrap:h-lh @min-[452px]:not-data-wrap:flex-nowrap @min-[452px]:not-data-wrap:self-end",
    ],
    close: [
      "col-start-[calc(var(--banner-text-col,1)+1)] row-start-1 self-start",
      "-my-[calc((--spacing(8)-1lh)/2)] -me-icon-inset",
    ],
  },
  variants: {
    status: {
      default: { root: ["bg-fill-muted"] },
      destructive: { root: ["bg-danger-soft"] },
      warning: { root: ["bg-warning-soft"] },
      info: { root: ["bg-info-soft"] },
      success: { root: ["bg-success-soft"] },
    },
    size: {
      sm: {
        root: [
          "gap-x-2 px-3 py-2 text-footnote",
          "has-[>svg]:grid-cols-[16px_minmax(0,1fr)] has-[>[data-slot=status]]:grid-cols-[16px_minmax(0,1fr)]",
          "[&>svg]:mt-[calc((1lh-16px)/2)] [&>svg]:size-4",
        ],
      },
      md: { root: ["px-3.5 py-3"] },
      lg: { root: ["px-4 py-3.5"] },
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    {
      size: "sm",
      class: {
        root: "has-[>[data-slot=banner-action]]:py-[calc((--spacing(8)-1lh)/2+--spacing(1))]",
      },
    },
  ],
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof banner>, "align"> & {
    status: BannerStatus;
  };

/**
 * A short notice people read before they act, on a soft tint that says its
 * intent. Compose it from a leading icon, `BannerTitle`, `BannerDescription`,
 * and either `BannerAction` (its button) or `BannerClose` (a × when there is no
 * button).
 */
export function Banner({ status, size = "md", className, render, ...props }: BannerProps) {
  const { root } = banner({ status, size });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
    // Only a destructive banner interrupts; the rest are announced politely.
    role: status === "destructive" ? "alert" : "status",
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner",
      size,
      status,
    },
  });
}

export type BannerTitleProps = useRender.ComponentProps<"div">;

export function BannerTitle({ render, className, ...props }: BannerTitleProps) {
  const { title } = banner();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-title",
    },
  });
}

export type BannerDescriptionProps = useRender.ComponentProps<"div">;

export function BannerDescription({ render, className, ...props }: BannerDescriptionProps) {
  const { description } = banner();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-description",
    },
  });
}

// A text action is a TextLink inside BannerDescription, not here.
export type BannerActionProps = Omit<useRender.ComponentProps<"div">, "align">;

function lineCount(element: Element) {
  const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight);
  if (!(lineHeight > 0)) return 1;
  return Math.round(element.getBoundingClientRect().height / lineHeight);
}

function contentWidth(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().width;
}

/*
 * The actions sit at the end of the last line of text only while that text
 * still fits on one line beside them. CSS places them there from 452px of
 * content (a 480px banner at `md`); this watches the text and, when it would
 * wrap, sets `data-wrap` so the actions take a line of their own. Leaving that
 * line is decided from the one-line width of the text, so the two placements
 * never flip back and forth. A banner with a BannerClose shouldn't have
 * actions; if it does, they always take a line of their own, so they never
 * share the end column with the ×.
 */
function useWrapsBesideText(action: Element | null) {
  const [wraps, setWraps] = useState(false);

  useLayoutEffect(() => {
    const root = action?.parentElement;
    if (!action || !root || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const text =
        root.querySelector(":scope > [data-slot=banner-description]") ??
        root.querySelector(":scope > [data-slot=banner-title]");
      if (!text) {
        setWraps(false);
        return;
      }
      if (root.querySelector(":scope > [data-banner-close]")) {
        setWraps(true);
        return;
      }
      const lines = lineCount(text);
      if (!action.hasAttribute("data-wrap")) {
        if (lines > 1) setWraps(true);
        return;
      }
      if (lines > 1) return;
      const gap = Number.parseFloat(getComputedStyle(root).columnGap) || 0;
      if (
        contentWidth(text) + contentWidth(action) + gap + 1 <=
        text.getBoundingClientRect().width
      ) {
        setWraps(false);
      }
    };

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    for (const child of root.children) resize.observe(child);
    const mutation = new MutationObserver(schedule);
    mutation.observe(root, { childList: true, characterData: true, subtree: true });
    // A web font that arrives after the first measure changes the text's width.
    const fonts = typeof document.fonts === "undefined" ? undefined : document.fonts;
    let live = true;
    void fonts?.ready.then(() => {
      if (live) schedule();
    });
    fonts?.addEventListener("loadingdone", schedule);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      fonts?.removeEventListener("loadingdone", schedule);
    };
  }, [action]);

  useLayoutEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (action?.parentElement?.querySelector(":scope > [data-banner-close]")) {
      console.warn(
        "raft-ui: a Banner has both BannerAction and BannerClose. Use BannerClose only on a banner with no button; close one that has a button with a ghost Dismiss button in BannerAction.",
      );
    }
  }, [action]);

  return wraps;
}

/**
 * The banner's buttons: at the end of the last line of text, centered on it,
 * while the text fits beside them on one line; on a line of their own under the
 * text, aligned to the end, when it doesn't or the banner is narrower than
 * 480px.
 */
export function BannerAction({ render, className, ref, ...props }: BannerActionProps) {
  const { action } = banner();
  const [element, setElement] = useState<Element | null>(null);
  const wraps = useWrapsBesideText(element);
  const defaultProps: useRender.ElementProps<"div"> = {
    className: action({ className }),
    ...(wraps ? { "data-wrap": "" } : {}),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref: ref ? [ref, setElement] : setElement,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-action",
    },
  });
}

export type BannerCloseProps = Omit<ButtonProps, "variant" | "size">;

/**
 * The × of a banner that has no button: a frameless icon button at the end of
 * the first line, centered on it, its icon box ending on the banner's padding.
 * Never put it in `BannerAction`.
 */
export function BannerClose({
  className,
  children,
  "aria-label": ariaLabel = "Dismiss",
  ...props
}: BannerCloseProps) {
  const { close } = banner();

  return (
    <Button
      {...props}
      variant="ghost"
      size="icon-sm"
      aria-label={ariaLabel}
      data-banner-close=""
      className={close({ className })}
    >
      {children ?? <X />}
    </Button>
  );
}
