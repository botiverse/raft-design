import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

const banner = tv({
  slots: {
    root: [
      "group/banner grid grid-cols-[0_minmax(0,1fr)] items-start border-2",
      "has-[>[data-slot=banner-action]]:grid-cols-[0_minmax(0,1fr)_auto]",
      "has-[>svg]:grid-cols-[18px_minmax(0,1fr)]",
      "[&:has(>svg):has(>[data-slot=banner-action])]:grid-cols-[18px_minmax(0,1fr)_auto]",
      "[&>svg]:col-start-1 [&>svg]:row-span-2 [&>svg]:mt-0.5",
      "[&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-black",
    ],
    title: [
      "col-start-2 mb-0.5 text-sm font-bold text-black",
      "group-data-[size=sm]/banner:text-xs",
    ],
    description: ["col-start-2 min-w-0 text-sm text-black", "group-data-[size=sm]/banner:text-xs"],
    action: ["col-start-3 row-span-2 row-start-1 shrink-0"],
  },
  variants: {
    theme: {
      brutal: { root: ["border-black"] },
      elegant: {},
    },
    status: {
      destructive: { root: "bg-brutal-red/20" },
      warning: { root: "bg-brutal-orange/20" },
      info: { root: "bg-brutal-yellow/30" },
      success: { root: "bg-brutal-lime/20" },
    },
    size: {
      sm: {
        root: "gap-y-0 p-2 has-[>svg]:gap-x-2 has-[>[data-slot=banner-action]]:gap-x-2",
      },
      md: {
        root: "gap-y-0 p-3 has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3",
      },
      lg: {
        root: "gap-y-0 p-4 shadow-[var(--shadow)] has-[>svg]:gap-x-3 has-[>[data-slot=banner-action]]:gap-x-3",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = useRender.ComponentProps<"div"> &
  Omit<VariantProps<typeof banner>, "theme"> & {
    status: BannerStatus;
  };

export function Banner({ status, size = "md", className, render, ref, ...props }: BannerProps) {
  const theme = useTheme();
  const { root } = banner({ theme, status, size });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: root({ className }),
    role: "alert",
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner",
      size,
      status,
    },
  });
}

export type BannerTitleProps = useRender.ComponentProps<"div">;

export function BannerTitle({ render, className, ref, ...props }: BannerTitleProps) {
  const theme = useTheme();
  const { title } = banner({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-title",
    },
  });
}

export type BannerDescriptionProps = useRender.ComponentProps<"div">;

export function BannerDescription({ render, className, ref, ...props }: BannerDescriptionProps) {
  const theme = useTheme();
  const { description } = banner({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: description({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-description",
    },
  });
}

export type BannerActionProps = useRender.ComponentProps<"div">;

export function BannerAction({ render, className, ref, ...props }: BannerActionProps) {
  const theme = useTheme();
  const { action } = banner({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: action({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    ref,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "banner-action",
    },
  });
}
