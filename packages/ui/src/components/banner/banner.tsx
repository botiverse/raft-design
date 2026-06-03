import type { ComponentPropsWithRef } from "react";
import { useRender } from "@base-ui/react/use-render";
import { tv, type VariantProps } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Inline banner / callout / alert, composed from a status-driven root and slot
// parts (`BannerIcon`, `BannerBody`, `BannerTitle`, `BannerActions`). All parts
// share one `tv()` slots config so theme / status / size styling lives in a
// single place — ready for the elegant family to add per-slot overrides under
// `theme`. Each part resolves its own slot with the active theme, so they stay
// independently composable.
//
// `status` drives the root surface color; `size` drives root padding / gap and
// is published to descendants via the `group/banner` marker plus a `data-size`
// attribute, so `BannerBody` flips its text size with
// `group-data-[size=sm]/banner:*` — no context.
const banner = tv({
  slots: {
    root: ["group/banner flex items-start border-2"],
    icon: ["mt-0.5 shrink-0 text-black", "[&_svg]:size-[18px]"],
    body: ["min-w-0 flex-1 text-sm text-black", "group-data-[size=sm]/banner:text-xs"],
    title: ["mb-0.5 font-bold"],
    actions: ["shrink-0"],
  },
  variants: {
    theme: {
      brutal: { root: ["border-black"] },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    status: {
      destructive: { root: "bg-brutal-red/20" },
      warning: { root: "bg-brutal-orange/20" },
      info: { root: "bg-brutal-yellow/30" },
      success: { root: "bg-brutal-lime/20" },
    },
    size: {
      sm: { root: "gap-2 p-2" },
      md: { root: "gap-3 p-3" },
      // shadow-brutal-sm maps to the brutal --shadow token (2px offset).
      lg: { root: "gap-3 p-4 shadow-[var(--shadow)]" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type BannerStatus = NonNullable<VariantProps<typeof banner>["status"]>;

export type BannerProps = ComponentPropsWithRef<"div"> &
  Omit<VariantProps<typeof banner>, "theme"> & {
    status: BannerStatus;
  };

// Root: surface color from `status`, padding / gap from `size`. Composes
// `BannerIcon` / `BannerBody` / `BannerTitle` / `BannerActions` as children.
export function Banner({ status, size = "md", className, ...props }: BannerProps) {
  const theme = useTheme();
  const { root } = banner({ theme, status, size });
  return <div data-slot="banner" data-size={size} className={root({ className })} {...props} />;
}

export type BannerIconProps = useRender.ComponentProps<"span">;

// Leading icon slot, top-aligned with the first line of the body. Wraps a
// caller-supplied icon node and normalizes its size / color. Pass `render` to
// override the wrapper element.
export function BannerIcon({ render, className, ref, ...props }: BannerIconProps) {
  const theme = useTheme();
  const { icon } = banner({ theme });
  return useRender({
    render: render ?? <span />,
    ref,
    props: {
      "data-slot": "banner-icon",
      className: icon({ className }),
      ...props,
    },
  });
}

export type BannerBodyProps = useRender.ComponentProps<"div">;

// Flexible text column: holds the optional `BannerTitle` and the message, and
// reserves the flexible width so trailing `BannerActions` stay pinned right.
// Picks up its text size from the root's `group/banner` marker. Pass `render`
// to override the element.
export function BannerBody({ render, className, ref, ...props }: BannerBodyProps) {
  const theme = useTheme();
  const { body } = banner({ theme });
  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "banner-body",
      className: body({ className }),
      ...props,
    },
  });
}

export type BannerTitleProps = useRender.ComponentProps<"div">;

// Optional bold heading rendered above the body message. Pass `render` to
// override the element (e.g. a real heading for landmark semantics).
export function BannerTitle({ render, className, ref, ...props }: BannerTitleProps) {
  const theme = useTheme();
  const { title } = banner({ theme });
  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "banner-title",
      className: title({ className }),
      ...props,
    },
  });
}

export type BannerActionsProps = useRender.ComponentProps<"div">;

// Trailing slot for the banner's actions (buttons, dismiss control). Sits as a
// sibling of `BannerBody`, which holds the flexible width and pins this right.
// Pass `render` to override the element.
export function BannerActions({ render, className, ref, ...props }: BannerActionsProps) {
  const theme = useTheme();
  const { actions } = banner({ theme });
  return useRender({
    render: render ?? <div />,
    ref,
    props: {
      "data-slot": "banner-actions",
      className: actions({ className }),
      ...props,
    },
  });
}
