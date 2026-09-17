import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";
import { useZIndex, ZIndexScope } from "../../lib/z-index/z-index";

const dialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-modal",
      "transition-opacity duration-150 ease-out",
      "data-starting-style:opacity-0 data-ending-style:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-modal flex w-[calc(100%-2rem)] -translate-1/2 flex-col",
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
    },
    layer: {
      0: { overlay: [], content: [] },
      1: {
        overlay: ["z-[calc(var(--r-z-modal)+100)]"],
        content: ["z-[calc(var(--r-z-modal)+100)]"],
      },
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
    },
  },
  defaultVariants: {
    size: "md",
  },
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

export function DialogOverlay({ className, layer, style, ...props }: DialogOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = dialog({ theme, layer });
  const { style: zIndexStyle } = useZIndex({
    tier: "modal",
    offset: layer === 1 ? 100 : 0,
  });
  return (
    <BaseDialog.Backdrop
      data-slot="dialog-overlay"
      className={overlay({ className })}
      style={{ ...zIndexStyle, ...style }}
      {...props}
    />
  );
}

export type DialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: DialogPortalProps;
  overlay?: false | DialogOverlayProps;
  size?: "sm" | "md" | "lg";
  layer?: 0 | 1;
};

export function DialogContent({
  className,
  children,
  portalProps,
  overlay,
  size,
  layer,
  style,
  ...props
}: DialogContentProps) {
  const theme = useThemeFamily();
  const { content } = dialog({ theme, size, layer });
  const { style: zIndexStyle } = useZIndex({
    tier: "modal",
    offset: layer === 1 ? 100 : 0,
  });

  const overlayProps = typeof overlay === "object" ? overlay : {};

  return (
    <DialogPortal {...portalProps}>
      {overlay === false ? null : (
        <DialogOverlay layer={layer} style={zIndexStyle} {...overlayProps} />
      )}
      <ZIndexScope tier="modal" offset={layer === 1 ? 100 : 0}>
        <BaseDialog.Popup
          data-slot="dialog-content"
          className={content({ className })}
          style={{ ...zIndexStyle, ...style }}
          {...props}
        >
          {children}
        </BaseDialog.Popup>
      </ZIndexScope>
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
          size={size ?? (isBrutal ? "icon-md" : "icon-sm")}
          aria-label={ariaLabel ?? "Close"}
          className={
            isBrutal
              ? className
              : cn(
                  "p-0 text-foreground-placeholder hover:border-transparent hover:bg-transparent hover:text-foreground-strong",
                  className,
                )
          }
        />
      }
      {...props}
    >
      {children ?? <X className={isBrutal ? "size-5" : "size-4"} />}
    </BaseDialog.Close>
  );
}

export type DialogHeaderProps = ComponentPropsWithRef<"div">;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  const theme = useThemeFamily();
  const { header } = dialog({ theme });
  return <div data-slot="dialog-header" className={header({ className })} {...props} />;
}

export type DialogBodyProps = ComponentPropsWithRef<"div">;

export function DialogBody({ className, ...props }: DialogBodyProps) {
  const theme = useThemeFamily();
  const { body } = dialog({ theme });
  return <div data-slot="dialog-body" className={body({ className })} {...props} />;
}

export type DialogFooterProps = ComponentPropsWithRef<"div">;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  const theme = useThemeFamily();
  const { footer } = dialog({ theme });
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
