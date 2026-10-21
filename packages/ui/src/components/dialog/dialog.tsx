import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { decisionWidth } from "../../lib/decision-width";
import { headEdgePull } from "../../lib/head-edges";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useParentOverlayKind, withOverlayLayer } from "../../lib/overlay-depth";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

const dialog = tv({
  slots: {
    // A centred modal appears and goes without motion (Raft DS: only sheets
    // slide; a dialog is simply there).
    overlay: ["fixed inset-0 z-50 bg-layer-backdrop"],
    content: [
      "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-1/2 flex-col",
      "max-h-[calc(100dvh-2rem)] outline-none",
      "overflow-clip rounded-dialog bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: [
      "grid shrink-0 grid-cols-[minmax(0,1fr)_max-content] items-center min-w-0",
      "gap-2 px-5 pt-5",
      headEdgePull,
    ],
    body: [
      "min-w-0 flex-1 overflow-y-auto",
      "px-5 pt-1.5 pb-5 first:pt-5",
      "font-sans text-subhead text-foreground-muted",
    ],
    footer: [
      "flex shrink-0 items-center justify-end",
      "gap-2 px-5 pb-5 first:pt-5 [[data-slot=dialog-header]+&]:pt-5",
    ],
    title: ["m-0 min-w-0 text-foreground", "font-sans text-headline font-bold"],
    description: ["m-0", "font-sans text-subhead text-foreground-muted"],
  },
  variants: {
    size: {
      // Chosen by content (dialog.md#variants): sm a decision, at the width of
      // AlertDialog; md a small task; lg content that needs width.
      sm: { content: [decisionWidth] },
      md: { content: ["max-w-md"] },
      lg: { content: ["max-w-160"] },
      // A bigger form edited in one go: a fixed-height frame whose head and
      // commit row stay put while its body scrolls (use the `bar` parts).
      wide: { content: ["max-w-4xl h-[min(760px,calc(100dvh-2rem))]"] },
    },
    // Pinned bars for a scrolling dialog: the head a 56px row with a seam
    // under it, the footer a commit row with a seam over it, the body flush
    // so the content lays out its own columns and scrolls inside.
    bar: {
      false: {},
      true: {
        header: [
          "flex h-14 shrink-0 items-center gap-2 border-b px-5 py-0",
          "border-line-seam pt-0 [&>[data-slot=dialog-close]]:my-0",
        ],
        body: [
          "flex min-h-0 flex-1 overflow-hidden p-0",
          "px-0 pt-0 pb-0 first:pt-0 text-foreground",
        ],
        footer: [
          "shrink-0 border-t px-5 py-3",
          "border-line-seam pt-3 pb-3 first:pt-3 [[data-slot=dialog-header]+&]:pt-3",
        ],
      },
    },
    layer: {
      0: { overlay: [], content: [] },
      1: { overlay: ["z-60"], content: ["z-60"] },
    },
    // Opened from another modal surface (a sheet or a dialog): a lighter scrim
    // of its own, so what is below steps back without going black.
    nested: {
      false: {},
      true: { overlay: ["bg-layer-backdrop-nested"] },
    },
  },
  defaultVariants: {
    size: "md",
    bar: false,
  },
});

export type DialogProps = BaseDialog.Root.Props;

export function Dialog({ children, ...props }: DialogProps) {
  return (
    <BaseDialog.Root data-slot="dialog" {...props}>
      {withOverlayLayer("dialog", props.modal !== false, children)}
    </BaseDialog.Root>
  );
}

export type DialogTriggerProps = BaseDialog.Trigger.Props;

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

export type DialogPortalProps = BaseDialog.Portal.Props;

export function DialogPortal(props: DialogPortalProps) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...useThemeScopeProps(props)} />;
}

export type DialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props> & {
  layer?: 0 | 1;
};

export function DialogOverlay({ className, layer, ...props }: DialogOverlayProps) {
  // Always rendered: Base UI skips the backdrop of a nested dialog, and a
  // top-level one renders it anyway. Nested, it takes the lighter scrim.
  const nested = useParentOverlayKind() != null;
  const { overlay } = dialog({ layer, nested });
  return (
    <BaseDialog.Backdrop
      data-slot="dialog-overlay"
      data-nested={nested ? "" : undefined}
      forceRender
      className={overlay({ className })}
      {...props}
    />
  );
}

export type DialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: DialogPortalProps;
  overlay?: false | DialogOverlayProps;
  size?: "sm" | "md" | "lg" | "wide";
  layer?: 0 | 1;
};

export function DialogContent({
  className,
  children,
  portalProps,
  overlay,
  size,
  layer,
  ...props
}: DialogContentProps) {
  const { content } = dialog({ size, layer });

  const overlayProps = typeof overlay === "object" ? overlay : {};

  return (
    <DialogPortal {...portalProps}>
      {overlay === false ? null : <DialogOverlay layer={layer} {...overlayProps} />}
      <BaseDialog.Popup data-slot="dialog-content" className={content({ className })} {...props}>
        {children}
      </BaseDialog.Popup>
    </DialogPortal>
  );
}

export type DialogCloseProps = BaseDialog.Close.Props &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
    children?: ReactNode;
  };

export function DialogClose({
  className,
  variant,
  size,
  children,
  render,
  "aria-label": ariaLabel,
  ...props
}: DialogCloseProps) {
  if (render) {
    return (
      <BaseDialog.Close data-slot="dialog-close" render={render} aria-label={ariaLabel} {...props}>
        {children}
      </BaseDialog.Close>
    );
  }

  return (
    <BaseDialog.Close
      data-slot="dialog-close"
      render={
        <Button
          variant={variant ?? "ghost"}
          size={size ?? "icon-md"}
          aria-label={ariaLabel ?? "Close"}
          className={cn("-my-1.5", className)}
        />
      }
      {...props}
    >
      {children ?? <X className="size-4.5" />}
    </BaseDialog.Close>
  );
}

export type DialogHeaderProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogHeader({ className, bar = false, ...props }: DialogHeaderProps) {
  const { header } = dialog({ bar });
  return <div data-slot="dialog-header" className={header({ className })} {...props} />;
}

export type DialogBodyProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogBody({ className, bar = false, ...props }: DialogBodyProps) {
  const { body } = dialog({ bar });
  return <div data-slot="dialog-body" className={body({ className })} {...props} />;
}

export type DialogFooterProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogFooter({ className, bar = false, ...props }: DialogFooterProps) {
  const { footer } = dialog({ bar });
  return <div data-slot="dialog-footer" className={footer({ className })} {...props} />;
}

export type DialogTitleProps = StyledProps<BaseDialog.Title.Props>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const { title } = dialog();
  return <BaseDialog.Title data-slot="dialog-title" className={title({ className })} {...props} />;
}

export type DialogDescriptionProps = StyledProps<BaseDialog.Description.Props>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  const { description } = dialog();
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={description({ className })}
      {...props}
    />
  );
}

const dialogSurface = tv({
  slots: {
    root: [
      "flex min-w-0 flex-col outline-none",
      "overflow-clip rounded-dialog bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
  },
});

export type DialogSurfaceProps = useRender.ComponentProps<"div">;

/**
 * The dialog's frame — the popover layer, the dialog radius, the seam ring
 * and the float shadow — for a centred modal whose lifecycle the app owns
 * (its own backdrop, Escape and focus handling). It neither positions nor
 * animates itself: the host centres it, and a centred modal has no motion.
 * DialogContent draws the same frame for a Base UI dialog.
 */
export function DialogSurface({ className, render, ...props }: DialogSurfaceProps) {
  const { root } = dialogSurface();
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { "data-slot": "dialog-surface", className: root({ className }) } as never,
      props,
    ),
  });
}

const dialogNav = tv({
  slots: {
    root: [
      "flex shrink-0 flex-col overflow-y-auto", // A wide dialog's section list: a 208px column of sidebar rows beside
      // the scrolling body, a seam between them; a phone has no room for it.
      "w-52 gap-0.5 border-r border-line-seam p-2 max-md:hidden",
    ],
  },
});

export type DialogNavProps = useRender.ComponentProps<"nav">;

/** The section list of a wide (`size="wide"`) dialog, inside a `bar` body. */
export function DialogNav({ className, render, ...props }: DialogNavProps) {
  const { root } = dialogNav();
  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(
      { "data-slot": "dialog-nav", className: root({ className }) } as never,
      props,
    ),
  });
}
