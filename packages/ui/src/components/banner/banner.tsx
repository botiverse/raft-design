import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "../../lib/tv";
import type { VariantProps } from "../../lib/tv";

const banner = tv({
  slots: {
    root: [
      "group/banner @container grid gap-y-0",
      "[&>svg]:col-start-1 [&>svg]:shrink-0",
      "*:data-[slot=status]:col-start-1 *:data-[slot=status]:row-start-1",
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
    title: ["min-w-0 text-foreground", "row-start-1 font-bold", "col-start-(--banner-text-col,1)"],
    description: [
      "min-w-0 font-normal",
      "text-foreground",
      "col-start-(--banner-text-col,1)",
      "row-start-(--banner-desc-row,1)",
    ],
    action: [
      "shrink-0 self-start",
      "mt-2 flex flex-wrap items-center gap-2",
      "col-start-(--banner-text-col,1)",
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
          "[&>svg]:mt-px [&>svg]:size-4 *:data-[slot=status]:mt-[4.5px]",
        ],
      },
      md: { root: ["px-3.5 py-3"] },
      lg: { root: ["px-4 py-3.5"] },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof banner>, "align"> & {
    status: BannerStatus;
  };

export function Banner({ status, size = "md", className, render, ...props }: BannerProps) {
  const { root } = banner({ status, size });
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

// Text actions use Button size="inline" inside BannerDescription, not here.
export type BannerActionProps = Omit<useRender.ComponentProps<"div">, "align">;

export function BannerAction({ render, className, ...props }: BannerActionProps) {
  const { action } = banner();
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
