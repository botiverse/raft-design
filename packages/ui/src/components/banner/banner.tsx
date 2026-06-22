import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "../../lib/tv.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const banner = tv({
  slots: {
    root: [""],
    title: [""],
    description: [""],
    action: [""],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "group/banner grid grid-cols-[0_minmax(0,1fr)] items-start border-2 border-line-strong",
          "has-[>[data-slot=banner-action]]:grid-cols-[0_minmax(0,1fr)_auto]",
          "has-[>svg]:grid-cols-[18px_minmax(0,1fr)]",
          "[&:has(>svg):has(>[data-slot=banner-action])]:grid-cols-[18px_minmax(0,1fr)_auto]",
          "[&>svg]:col-start-1 [&>svg]:row-span-2 [&>svg]:mt-0.5",
          "[&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-foreground-strong",
        ],
        title: [
          "col-start-2 mb-0.5 text-sm font-bold text-foreground-strong",
          "group-data-[size=sm]/banner:text-xs",
        ],
        description: [
          "col-start-2 min-w-0 text-sm text-foreground-strong",
          "group-data-[size=sm]/banner:text-xs",
        ],
        action: ["col-start-3 row-span-2 row-start-1 shrink-0"],
      },
      elegant: {
        root: [
          "group/banner grid w-full items-center gap-x-2 gap-y-0 rounded-sm border-0",
          "text-[0.8125rem] leading-5 tracking-[-0.005em] text-foreground-strong",
          "grid-cols-[minmax(0,1fr)]",
          "has-[>svg]:grid-cols-[auto_minmax(0,1fr)]",
          "has-[>[data-slot=banner-action]]:grid-cols-[minmax(0,1fr)_auto]",
          "has-[>svg]:has-[>[data-slot=banner-action]]:grid-cols-[auto_minmax(0,1fr)_auto]",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:items-start",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:grid-rows-[auto_auto]",
          "has-[>[data-slot=banner-title]]:has-[>[data-slot=banner-description]]:gap-y-1",
          "[&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:self-center",
        ],
        title: [
          "col-start-1 row-start-1 flex h-5 min-w-0 items-center text-[0.84375rem] font-medium leading-5 text-foreground-strong",
          "group-has-[>svg]/banner:col-start-2",
          "group-data-[size=sm]/banner:h-4 group-data-[size=sm]/banner:text-[0.8125rem] group-data-[size=sm]/banner:leading-4",
          "group-data-[size=lg]/banner:h-6 group-data-[size=lg]/banner:text-[0.90625rem] group-data-[size=lg]/banner:leading-6",
          "group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)]",
        ],
        description: [
          "col-start-1 row-start-1 min-w-0 font-normal leading-4 text-foreground-muted",
          "group-has-[>svg]/banner:col-start-2",
          "group-has-[>[data-slot=banner-title]]/banner:row-start-2",
          "group-data-[size=sm]/banner:text-xs group-data-[size=sm]/banner:leading-4",
          "group-data-[size=lg]/banner:text-[0.875rem] group-data-[size=lg]/banner:leading-5",
          "group-data-[status=warning]/banner:text-[oklch(0.476_0.114_61.907)]",
        ],
        action: [
          "col-start-2 row-start-1 flex h-5 shrink-0 items-center gap-2",
          "group-has-[>svg]/banner:col-start-3",
          "group-has-[>[data-slot=banner-title]+[data-slot=banner-description]]/banner:row-span-2",
          "[&>button:has(svg):last-child]:size-5 [&>button:has(svg):last-child]:min-h-5 [&>button:has(svg):last-child]:min-w-5",
          "[&>button:has(svg):last-child]:rounded-sm",
          "[&>button:has(svg):last-child]:border-transparent [&>button:has(svg):last-child]:bg-transparent [&>button:has(svg):last-child]:shadow-none",
          "[&>button:has(svg):last-child]:text-current/45",
          "[&>button:has(svg):last-child]:transition-colors [&>button:has(svg):last-child]:duration-200",
          "[&>button:has(svg):last-child]:hover:border-transparent [&>button:has(svg):last-child]:hover:bg-foreground/5",
          "[&>button:has(svg):last-child]:hover:text-current/70",
          "[&>button:has(svg):last-child>svg]:size-4",
          "group-data-[size=sm]/banner:h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:size-4",
          "group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-h-4 group-data-[size=sm]/banner:[&>button:has(svg):last-child]:min-w-4",
          "group-data-[size=sm]/banner:[&>button:has(svg):last-child>svg]:size-3",
          "group-data-[size=lg]/banner:h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:size-6",
          "group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-h-6 group-data-[size=lg]/banner:[&>button:has(svg):last-child]:min-w-6",
        ],
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
    align: {
      top: { action: "self-start" },
      middle: { action: "self-center" },
    },
  },
  defaultVariants: {
    size: "md",
    align: "middle",
  },
  compoundVariants: [
    { theme: "brutal", status: "default", class: { root: "bg-layer-panel" } },
    { theme: "brutal", status: "destructive", class: { root: "bg-danger-base/20" } },
    { theme: "brutal", status: "warning", class: { root: "bg-warning-base/20" } },
    { theme: "brutal", status: "info", class: { root: "bg-primary-400/30" } },
    { theme: "brutal", status: "success", class: { root: "bg-success-base/20" } },
    {
      theme: "brutal",
      size: "sm",
      class: { root: "gap-y-0 p-2 has-[>svg]:gap-x-2 has-[>[data-slot=banner-action]]:gap-x-2" },
    },
    {
      theme: "brutal",
      size: "md",
      class: { root: "gap-y-0 p-3 has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3" },
    },
    {
      theme: "brutal",
      size: "lg",
      class: {
        root: "gap-y-0 p-4 shadow-sm has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3",
      },
    },
    {
      theme: "elegant",
      status: "default",
      class: {
        root: "bg-layer-muted [&>svg]:text-foreground-muted",
      },
    },
    {
      theme: "elegant",
      status: "success",
      class: {
        root: "bg-[oklch(0.94_0.035_153.079)] [&>svg]:text-success-base",
      },
    },
    {
      theme: "elegant",
      status: "warning",
      class: {
        root: "bg-[oklch(0.973_0.071_103.193)] text-[oklch(0.476_0.114_61.907)] [&>svg]:text-[oklch(0.476_0.114_61.907)]",
      },
    },
    {
      theme: "elegant",
      status: "info",
      class: {
        root: "bg-info-lighter [&>svg]:text-[oklch(0.55_0.11_220)]",
      },
    },
    {
      theme: "elegant",
      status: "destructive",
      class: {
        root: "bg-danger-lighter [&>svg]:text-danger-base",
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
        root: "gap-x-2 px-3.5 py-3 text-sm leading-5 [&>svg]:size-[18px]",
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
  const theme = useTheme();
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
  const theme = useTheme();
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
  const theme = useTheme();
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

export type BannerActionProps = Omit<useRender.ComponentProps<"div">, "align"> &
  Pick<VariantProps<typeof banner>, "align">;

export function BannerAction({ align = "middle", render, className, ...props }: BannerActionProps) {
  const theme = useTheme();
  const { action } = banner({ theme, align });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-action",
      align,
    },
  });
}
