import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

const dialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50",
      "transition-opacity duration-150 ease-out",
      "data-starting-style:opacity-0 data-ending-style:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-1/2 flex-col",
      "max-h-[calc(100dvh-2rem)]",
      "origin-center transform-gpu outline-none transition-[opacity,transform] duration-150 ease-out",
      "data-starting-style:scale-[.98] data-starting-style:opacity-0",
      "data-ending-style:opacity-0",
    ],
    header: ["grid shrink-0 grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 min-w-0"],
    body: ["min-w-0 flex-1 overflow-y-auto"],
    footer: ["flex shrink-0 items-center justify-end gap-3"],
    title: ["m-0 min-w-0 text-foreground"],
    description: ["m-0 text-foreground-muted"],
  },
  variants: {
    size: {
      sm: { content: ["max-w-sm"] },
      md: { content: ["max-w-md"] },
      lg: { content: ["max-w-lg"] },
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
        header: ["flex h-14 shrink-0 items-center gap-3 border-b px-5 py-0"],
        body: ["flex min-h-0 flex-1 overflow-hidden p-0"],
        footer: ["shrink-0 border-t px-5 py-3"],
      },
    },
    layer: {
      0: { overlay: [], content: [] },
      1: { overlay: ["z-60"], content: ["z-60"] },
    },
    theme: {
      brutal: {
        overlay: ["bg-layer-backdrop"],
        content: ["gap-4 border-2 border-line-strong bg-layer-panel px-6 py-4 shadow-raft-xl"],
        body: ["py-2 font-medium"],
        title: ["font-heading text-lg leading-none font-bold uppercase"],
        description: ["font-sans text-sm leading-5 text-foreground-strong/60"],
      },
      elegant: {
        overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
        content: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl"],
        header: ["px-6 py-3"],
        body: ["px-6 py-5 dark:pt-2.5"],
        footer: ["px-6 py-3"],
        title: ["font-sans text-base leading-6 font-bold uppercase tracking-[0.025em]"],
        description: ["font-sans text-sm leading-5 text-foreground-hint"],
      },
      raft: {
        // A centred modal appears and goes without motion (Raft DS: only
        // sheets slide; a dialog is simply there).
        overlay: [
          "bg-layer-backdrop",
          "transition-none data-starting-style:opacity-100 data-ending-style:opacity-100",
        ],
        content: [
          "overflow-clip rounded-dialog bg-layer-popover text-foreground",
          "shadow-raft-float ring-1 ring-line-seam",
          "transition-none data-starting-style:scale-100 data-starting-style:opacity-100 data-ending-style:opacity-100",
        ],
        header: ["gap-2 px-5 pt-5"],
        body: ["px-5 pt-1.5 pb-5 first:pt-5", "font-sans text-subhead text-foreground-muted"],
        footer: ["gap-2 px-5 pb-5 first:pt-5 [[data-slot=dialog-header]+&]:pt-5"],
        title: ["font-sans text-headline font-bold"],
        description: ["font-sans text-subhead text-foreground-muted"],
      },
    },
  },
  defaultVariants: {
    size: "md",
    bar: false,
  },
  compoundVariants: [
    {
      theme: "raft",
      bar: true,
      class: {
        header: ["border-line-seam pt-0 [&>[data-slot=dialog-close]]:my-0"],
        body: ["px-0 pt-0 pb-0 first:pt-0 text-foreground"],
        footer: ["border-line-seam pt-3 pb-3 first:pt-3 [[data-slot=dialog-header]+&]:pt-3"],
      },
    },
  ],
});

export type DialogProps = BaseDialog.Root.Props;

export function Dialog(props: DialogProps) {
  return <BaseDialog.Root data-slot="dialog" {...props} />;
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
  const theme = useThemeFamily();
  const { overlay } = dialog({ theme, layer });
  return (
    <BaseDialog.Backdrop data-slot="dialog-overlay" className={overlay({ className })} {...props} />
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
  const theme = useThemeFamily();
  const { content } = dialog({ theme, size, layer });

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
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";
  const isRaft = theme === "raft";

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
          variant={variant ?? (isBrutal ? "outline" : "ghost")}
          size={size ?? (isBrutal || isRaft ? "icon-md" : "icon-sm")}
          aria-label={ariaLabel ?? "Close"}
          className={
            isBrutal
              ? className
              : isRaft
                ? cn("-my-1.5 -mr-1.5", className)
                : cn(
                    "p-0 text-foreground-placeholder hover:border-transparent hover:bg-transparent hover:text-foreground-strong",
                    className,
                  )
          }
        />
      }
      {...props}
    >
      {children ?? <X className={isBrutal ? "size-5" : isRaft ? "size-4.5" : "size-4"} />}
    </BaseDialog.Close>
  );
}

export type DialogHeaderProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogHeader({ className, bar = false, ...props }: DialogHeaderProps) {
  const theme = useThemeFamily();
  const { header } = dialog({ theme, bar });
  return <div data-slot="dialog-header" className={header({ className })} {...props} />;
}

export type DialogBodyProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogBody({ className, bar = false, ...props }: DialogBodyProps) {
  const theme = useThemeFamily();
  const { body } = dialog({ theme, bar });
  return <div data-slot="dialog-body" className={body({ className })} {...props} />;
}

export type DialogFooterProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogFooter({ className, bar = false, ...props }: DialogFooterProps) {
  const theme = useThemeFamily();
  const { footer } = dialog({ theme, bar });
  return <div data-slot="dialog-footer" className={footer({ className })} {...props} />;
}

export type DialogTitleProps = StyledProps<BaseDialog.Title.Props>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const theme = useThemeFamily();
  const { title } = dialog({ theme });
  return <BaseDialog.Title data-slot="dialog-title" className={title({ className })} {...props} />;
}

export type DialogDescriptionProps = StyledProps<BaseDialog.Description.Props>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = dialog({ theme });
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={description({ className })}
      {...props}
    />
  );
}

const dialogSurface = tv({
  slots: { root: ["flex min-w-0 flex-col outline-none"] },
  variants: {
    theme: {
      brutal: { root: ["border-2 border-line-strong bg-layer-panel shadow-raft-xl"] },
      elegant: { root: ["overflow-clip rounded-lg bg-layer-popover shadow-raft-xl"] },
      raft: {
        root: [
          "overflow-clip rounded-dialog bg-layer-popover text-foreground",
          "shadow-raft-float ring-1 ring-line-seam",
        ],
      },
    },
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
  const theme = useThemeFamily();
  const { root } = dialogSurface({ theme });
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
  slots: { root: ["flex shrink-0 flex-col overflow-y-auto"] },
  variants: {
    theme: {
      brutal: { root: ["w-52 gap-1 border-r-2 border-black p-2"] },
      elegant: { root: ["w-52 gap-0.5 border-r border-line-muted p-2"] },
      // A wide dialog's section list: a 208px column of sidebar rows beside
      // the scrolling body, a seam between them; a phone has no room for it.
      raft: { root: ["w-52 gap-0.5 border-r border-line-seam p-2 max-md:hidden"] },
    },
  },
});

export type DialogNavProps = useRender.ComponentProps<"nav">;

/** The section list of a wide (`size="wide"`) dialog, inside a `bar` body. */
export function DialogNav({ className, render, ...props }: DialogNavProps) {
  const theme = useThemeFamily();
  const { root } = dialogNav({ theme });
  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(
      { "data-slot": "dialog-nav", className: root({ className }) } as never,
      props,
    ),
  });
}
