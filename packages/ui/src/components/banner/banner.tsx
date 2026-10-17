import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";
import { useThemeFamily } from "../../lib/theme/use-theme";

const banner = tv({
  slots: {
    root: [
      "group/banner @container grid gap-y-0",
      "[&>svg]:col-start-1 [&>svg]:shrink-0",
      "*:data-[slot=status]:col-start-1 *:data-[slot=status]:row-start-1 *:data-[slot=status]:self-center",
    ],
    title: ["min-w-0 text-foreground"],
    description: ["min-w-0 font-normal"],
    action: ["shrink-0 self-start"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "grid-cols-[minmax(0,1fr)] items-center border-2 border-line-strong",
          "has-[>[data-slot=banner-action]]:grid-cols-[minmax(0,1fr)_auto]",
          "has-[>svg]:grid-cols-[18px_minmax(0,1fr)]",
          "has-[>[data-slot=status]]:grid-cols-[auto_minmax(0,1fr)]",
          "[&:has(>svg):has(>[data-slot=banner-action])]:grid-cols-[18px_minmax(0,1fr)_auto]",
          "[&:has(>[data-slot=status]):has(>[data-slot=banner-action])]:grid-cols-[auto_minmax(0,1fr)_auto]",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:items-start",
          // Lead-part presence drives the text/action columns and the
          // description row; mirrored into variables the parts read instead of
          // ancestor :has() rules styling descendants (#133).
          "has-[>svg]:[--banner-text-col:2] has-[>svg]:[--banner-action-col:3]",
          "has-[>[data-slot=status]]:[--banner-text-col:2] has-[>[data-slot=status]]:[--banner-action-col:3]",
          "has-[>[data-slot=banner-title]]:[--banner-desc-row:2]",
          "[&>svg]:size-4.5 [&>svg]:self-center [&>svg]:text-foreground",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:row-span-2",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:mt-0.5",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:[&>svg]:self-start",
          // Status spans the text rows unconditionally: with a single text row
          // the spanned implicit row is empty, so the render matches the old
          // conditional (flagged for the browser diff on the PR).
          "*:data-[slot=status]:row-span-2",
        ],
        title: [
          "row-start-1 mb-0.5 text-sm font-bold",
          "col-start-(--banner-text-col,1)",
          "group-data-[size=sm]/banner:text-xs",
        ],
        description: [
          "text-sm leading-5 text-foreground",
          "col-start-(--banner-text-col,1)",
          "row-start-(--banner-desc-row,1)",
          "group-data-[size=sm]/banner:text-xs group-data-[size=sm]/banner:leading-4",
        ],
        action: [
          "row-start-1 flex items-center",
          "col-start-(--banner-action-col,2)",
          // Row-spans the action across the title/description rows. Sibling
          // selectors from the composed parts replace the old ancestor `:has()`
          // that styled this descendant: Chromium recalculates the whole page
          // on unrelated mutations for that shape (#133). Both orders are kept
          // for parity with the old orderless condition; the action must be a
          // direct child after the text parts.
          "[[data-slot=banner-title]~[data-slot=banner-description]~&]:row-span-2 [[data-slot=banner-description]~[data-slot=banner-title]~&]:row-span-2",
          "@max-[24rem]:[--banner-action-col:1] @max-[24rem]:-col-end-1",
          "@max-[24rem]:row-start-auto @max-[24rem]:justify-self-end",
          "@max-[24rem]:mt-2",
        ],
      },
      elegant: {
        root: [
          "w-full grid-cols-[minmax(0,1fr)] items-center gap-x-2 rounded-sm border-0",
          "text-[13px] leading-5 tracking-[-0.005em] text-foreground",
          "has-[>svg]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=status]]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=banner-action]]:grid-cols-[minmax(0,1fr)_auto]",
          "has-[>svg]:has-[>[data-slot=banner-action]]:grid-cols-[auto_minmax(0,1fr)_auto]",
          "has-[>[data-slot=status]]:has-[>[data-slot=banner-action]]:grid-cols-[auto_minmax(0,1fr)_auto]",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:items-start",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:grid-rows-[auto_auto]",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:gap-y-1",
          "[&>svg]:row-start-1 [&>svg]:size-4 [&>svg]:self-center",
          // See the brutal block above: lead parts drive column/row placement
          // through variables the parts read (#133).
          "has-[>svg]:[--banner-text-col:2] has-[>svg]:[--banner-action-col:3]",
          "has-[>[data-slot=status]]:[--banner-text-col:2] has-[>[data-slot=status]]:[--banner-action-col:3]",
          "has-[>[data-slot=banner-title]]:[--banner-desc-row:2]",
        ],
        title: [
          "row-start-1 flex min-h-5 items-center text-[13.5px] font-medium leading-5",
          "col-start-(--banner-text-col,1)",
          "group-data-[size=sm]/banner:min-h-4 group-data-[size=sm]/banner:text-[13px] group-data-[size=sm]/banner:leading-4",
          "group-data-[size=lg]/banner:min-h-6 group-data-[size=lg]/banner:text-[14.5px] group-data-[size=lg]/banner:leading-6",
          "group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)] dark:group-data-[status=warning]/banner:text-[oklch(0.82_0.12_61.907)]",
        ],
        description: [
          "leading-4 text-foreground-muted",
          "col-start-(--banner-text-col,1)",
          "row-start-(--banner-desc-row,1)",
          "group-data-[size=sm]/banner:text-xs group-data-[size=sm]/banner:leading-4",
          "group-data-[size=lg]/banner:text-sm group-data-[size=lg]/banner:leading-5",
          "group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)] dark:group-data-[status=warning]/banner:text-[oklch(0.82_0.12_61.907)]",
          "group-data-[status=warning]/banner:[&_button]:text-current",
        ],
        action: [
          "row-start-1 flex min-h-5 items-center gap-2",
          "col-start-(--banner-action-col,2)",
          // Same row-span condition as the brutal slot's sibling selector, with
          // title/description required to be adjacent (as before).
          "[[data-slot=banner-title]+[data-slot=banner-description]~&]:row-span-2",
          "@max-[24rem]:[--banner-action-col:1] @max-[24rem]:-col-end-1",
          "@max-[24rem]:row-start-auto @max-[24rem]:row-span-1",
          "@max-[24rem]:justify-self-end @max-[24rem]:mt-1",
          "[&>button:has(svg):last-child]:size-5 [&>button:has(svg):last-child]:min-h-5 [&>button:has(svg):last-child]:min-w-5",
          "[&>button:has(svg):last-child]:rounded-sm",
          "[&>button:has(svg):last-child]:border-transparent [&>button:has(svg):last-child]:bg-transparent [&>button:has(svg):last-child]:shadow-none",
          "[&>button:has(svg):last-child]:before:bg-transparent",
          "[&>button:has(svg):last-child]:text-current/45",
          "[&>button:has(svg):last-child]:transition-colors [&>button:has(svg):last-child]:duration-200",
          "[&>button:has(svg):last-child]:hover:border-transparent [&>button:has(svg):last-child]:hover:bg-foreground-strong/5",
          "[&>button:has(svg):last-child]:hover:text-current/70",
          "[&>button:has(svg):last-child>svg]:size-4",
          "group-data-[size=sm]/banner:min-h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:size-4",
          "group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-w-4",
          "group-data-[size=sm]/banner:[&>button:has(svg):last-child>svg]:size-3",
          "group-data-[size=lg]/banner:min-h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:size-6",
          "group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-w-6",
        ],
      },
      raft: {
        root: [
          "w-full grid-cols-[minmax(0,1fr)] items-start gap-x-2.5 rounded-container border-0",
          "font-sans text-callout text-foreground ring-1 ring-line-muted ring-inset",
          "has-[>svg]:grid-cols-[20px_minmax(0,1fr)]",
          "has-[>[data-slot=status]]:grid-cols-[20px_minmax(0,1fr)]",
          "[&>svg]:row-start-1 [&>svg]:size-5 [&>svg]:text-foreground",
          "*:data-[slot=status]:mt-[5.5px] *:data-[slot=status]:self-start *:data-[slot=status]:justify-self-center",
          "has-[>svg]:[--banner-text-col:2]",
          "has-[>[data-slot=status]]:[--banner-text-col:2]",
          "has-[>[data-slot=banner-title]]:[--banner-desc-row:2]",
        ],
        title: ["row-start-1 font-bold", "col-start-(--banner-text-col,1)"],
        description: [
          "text-foreground",
          "col-start-(--banner-text-col,1)",
          "row-start-(--banner-desc-row,1)",
        ],
        action: ["mt-2 flex flex-wrap items-center gap-2", "col-start-(--banner-text-col,1)"],
      },
    },
    status: {
      default: {},
      destructive: {},
      warning: {},
      info: {},
      success: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
  compoundVariants: [
    { theme: "brutal", status: "default", class: { root: "bg-layer-panel" } },
    { theme: "brutal", status: "destructive", class: { root: "bg-danger-soft" } },
    { theme: "brutal", status: "warning", class: { root: "bg-(--color-brutal-orange-100)" } },
    { theme: "brutal", status: "info", class: { root: "bg-(--color-brutal-yellow-100)" } },
    { theme: "brutal", status: "success", class: { root: "bg-(--color-brutal-lime-100)" } },
    {
      theme: "brutal",
      size: "sm",
      class: {
        root: "p-2 has-[>svg]:gap-x-2 has-[>[data-slot=banner-action]]:gap-x-2 has-[>[data-slot=status]]:gap-x-1.5",
      },
    },
    {
      theme: "brutal",
      size: "md",
      class: {
        root: "p-3 has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3 has-[>[data-slot=status]]:gap-x-2",
      },
    },
    {
      theme: "brutal",
      size: "lg",
      class: {
        root: "p-4 shadow-raft-sm has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3 has-[>[data-slot=status]]:gap-x-2",
      },
    },
    { theme: "raft", status: "default", class: { root: "bg-fill-muted" } },
    { theme: "raft", status: "info", class: { root: "bg-info-soft" } },
    { theme: "raft", status: "warning", class: { root: "bg-warning-soft" } },
    { theme: "raft", status: "destructive", class: { root: "bg-danger-soft" } },
    { theme: "raft", status: "success", class: { root: "bg-success-soft" } },
    {
      theme: "raft",
      size: "sm",
      class: {
        root: [
          "gap-x-2 px-3 py-2 text-footnote",
          "has-[>svg]:grid-cols-[16px_minmax(0,1fr)] has-[>[data-slot=status]]:grid-cols-[16px_minmax(0,1fr)]",
          "[&>svg]:mt-px [&>svg]:size-4 *:data-[slot=status]:mt-[4.5px]",
        ],
      },
    },
    { theme: "raft", size: "md", class: { root: "px-3.5 py-3" } },
    { theme: "raft", size: "lg", class: { root: "px-4 py-3.5" } },
    {
      theme: "elegant",
      status: "default",
      class: {
        root: "bg-fill-muted [&>svg]:text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      status: "success",
      class: {
        root: "bg-[oklch(0.94_0.035_153.079)] dark:bg-[oklch(0.5_0.12_153/0.18)] [&>svg]:text-success",
      },
    },
    {
      theme: "elegant",
      status: "warning",
      class: {
        root: "bg-[oklch(0.955_0.035_50)] text-[oklch(0.476_0.114_61.907)] [&>svg]:text-[oklch(0.476_0.114_61.907)] dark:bg-[oklch(0.5_0.08_50/0.18)] dark:text-[oklch(0.82_0.12_61.907)] dark:[&>svg]:text-[oklch(0.82_0.12_61.907)]",
      },
    },
    {
      theme: "elegant",
      status: "info",
      class: {
        root: "bg-info-soft [&>svg]:text-[oklch(0.55_0.11_220)] dark:[&>svg]:text-[oklch(0.8_0.1_220)]",
      },
    },
    {
      theme: "elegant",
      status: "destructive",
      class: {
        root: "bg-danger-soft [&>svg]:text-danger",
      },
    },
    {
      theme: "elegant",
      size: "sm",
      class: {
        root: "py-2.5 pl-2.5 pr-2 text-xs leading-4 [&>svg]:size-3.5",
      },
    },
    {
      theme: "elegant",
      size: "md",
      class: {
        root: "px-3 py-3",
      },
    },
    {
      theme: "elegant",
      size: "lg",
      class: {
        root: "gap-x-2 px-3.5 py-3 text-sm leading-5 [&>svg]:size-4.5",
      },
    },
  ],
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof banner>, "theme" | "align"> & {
    status: BannerStatus;
  };

export function Banner({ status, size = "md", className, render, ...props }: BannerProps) {
  const theme = useThemeFamily();
  const { root } = banner({ theme, status, size });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
    role: "alert",
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
  const theme = useThemeFamily();
  const { title } = banner({ theme });
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
  const theme = useThemeFamily();
  const { description } = banner({ theme });
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

// Text actions use Button size="inline" inside BannerDescription, not here.
export type BannerActionProps = Omit<useRender.ComponentProps<"div">, "align">;

export function BannerAction({ render, className, ...props }: BannerActionProps) {
  const theme = useThemeFamily();
  const { action } = banner({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-action",
    },
  });
}
