import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
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
          "has-[>[data-slot=banner-description]]:items-start has-[>[data-slot=banner-description]]:grid-rows-[auto_auto]",
          "has-[>[data-slot=banner-description]]:gap-y-1",
          "[&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:size-5 [&>svg]:shrink-0",
          "has-[>[data-slot=banner-description]]:[&>svg]:row-span-2 has-[>[data-slot=banner-description]]:[&>svg]:self-start",
        ],
        title: [
          "col-start-2 row-start-1 flex h-5 min-w-0 items-center text-sm font-medium leading-5 text-foreground-strong",
        ],
        description: [
          "col-start-2 row-start-2 min-w-0 font-normal leading-4 text-foreground-muted",
        ],
        action: [
          "col-start-3 row-start-1 flex h-5 shrink-0 items-center gap-2 self-start",
          "[&>button:last-child]:size-5 [&>button:last-child]:min-h-5 [&>button:last-child]:min-w-5",
          "[&>button:last-child]:border-transparent [&>button:last-child]:bg-transparent [&>button:last-child]:shadow-none",
          "[&>button:last-child]:text-foreground/40",
          "[&>button:last-child]:transition-colors [&>button:last-child]:duration-200",
          "[&>button:last-child]:hover:border-transparent [&>button:last-child]:hover:bg-transparent",
          "[&>button:last-child]:hover:text-foreground/65",
          "[&>button:last-child>svg]:size-4",
        ],
      },
    },
    status: {
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
      status: "success",
      class: {
        root: "bg-success-lighter [&>svg]:text-success-base",
      },
    },
    {
      theme: "elegant",
      status: "warning",
      class: {
        root: "bg-warning-lighter [&>svg]:text-warning-base",
      },
    },
    {
      theme: "elegant",
      status: "info",
      class: {
        root: "bg-info-lighter [&>svg]:text-info-base",
      },
    },
    {
      theme: "elegant",
      status: "destructive",
      class: {
        root: "bg-danger-lighter [&>svg]:text-danger-base",
      },
    },
    { theme: "elegant", size: "sm", class: { root: "px-2 py-1.5" } },
    { theme: "elegant", size: "md", class: { root: "px-2.5 py-2.5" } },
    { theme: "elegant", size: "lg", class: { root: "px-3 py-2.5" } },
  ],
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof banner>, "theme"> & {
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

export type BannerActionProps = useRender.ComponentProps<"div">;

export function BannerAction({ render, className, ...props }: BannerActionProps) {
  const theme = useTheme();
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
