import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { OverlayDepthProvider, useOverlayDepth } from "../../lib/overlay-depth";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

const alertDialog = tv({
  slots: {
    // A centred modal appears and goes without motion (Raft DS: only sheets
    // slide; a dialog is simply there).
    overlay: ["fixed inset-0 z-50 bg-layer-backdrop"],
    content: [
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-[400px] -translate-1/2 outline-none",
      "overflow-clip rounded-dialog bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: ["grid grid-cols-[minmax(0,1fr)_max-content] items-center min-w-0", "gap-2 px-5 pt-5"],
    body: [
      "min-w-0",
      "px-5 pt-1.5 pb-5 first:pt-5",
      "font-sans text-subhead text-foreground-muted",
    ],
    footer: [
      "flex items-center justify-end",
      "gap-2 px-5 pb-5 first:pt-5 [[data-slot=alert-dialog-header]+&]:pt-5",
    ],
    title: ["m-0 min-w-0 text-foreground", "font-sans text-headline font-bold"],
    description: ["m-0", "font-sans text-subhead text-foreground-muted"],
  },
  variants: {
    // Opened from another modal surface: a lighter scrim of its own.
    nested: {
      false: {},
      true: { overlay: ["bg-layer-backdrop-nested"] },
    },
  },
});

export type AlertDialogProps = BaseDialog.Root.Props;

export function AlertDialog(props: AlertDialogProps) {
  return <BaseDialog.Root data-slot="alert-dialog" {...props} />;
}

export type AlertDialogTriggerProps = BaseDialog.Trigger.Props;

export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

export type AlertDialogPortalProps = BaseDialog.Portal.Props;

export function AlertDialogPortal(props: AlertDialogPortalProps) {
  return <BaseDialog.Portal data-slot="alert-dialog-portal" {...useThemeScopeProps(props)} />;
}

export type AlertDialogCloseProps = Omit<BaseDialog.Close.Props, "render"> &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
    children?: ReactNode;
  };

export function AlertDialogClose({
  className,
  variant,
  size,
  children,
  "aria-label": ariaLabel,
  ...props
}: AlertDialogCloseProps) {
  return (
    <BaseDialog.Close
      data-slot="alert-dialog-close"
      render={
        <Button
          variant={variant ?? "ghost"}
          size={size ?? "icon-md"}
          aria-label={ariaLabel ?? "Close"}
          className={cn("-my-1.5 -mr-1.5", className)}
        />
      }
      {...props}
    >
      {children ?? <X className="size-4.5" />}
    </BaseDialog.Close>
  );
}

export type AlertDialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props>;

export function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  const nested = useOverlayDepth() > 0;
  const { overlay } = alertDialog({ nested });

  return (
    <BaseDialog.Backdrop
      data-slot="alert-dialog-overlay"
      data-nested={nested ? "" : undefined}
      forceRender={nested}
      className={overlay({ className })}
      {...props}
    />
  );
}

export type AlertDialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: AlertDialogPortalProps;
  overlay?: false | AlertDialogOverlayProps;
};

export function AlertDialogContent({
  className,
  children,
  portalProps,
  overlay,
  ...props
}: AlertDialogContentProps) {
  const { content } = alertDialog();

  return (
    <AlertDialogPortal {...portalProps}>
      {overlay === false ? null : <AlertDialogOverlay {...overlay} />}
      <BaseDialog.Popup
        data-slot="alert-dialog-content"
        className={content({ className })}
        {...props}
        role="alertdialog"
      >
        <OverlayDepthProvider>{children}</OverlayDepthProvider>
      </BaseDialog.Popup>
    </AlertDialogPortal>
  );
}

export type AlertDialogHeaderProps = ComponentPropsWithRef<"div">;

export function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  const { header } = alertDialog();

  return <div data-slot="alert-dialog-header" className={header({ className })} {...props} />;
}

export type AlertDialogBodyProps = ComponentPropsWithRef<"div">;

export function AlertDialogBody({ className, ...props }: AlertDialogBodyProps) {
  const { body } = alertDialog();

  return <div data-slot="alert-dialog-body" className={body({ className })} {...props} />;
}

export type AlertDialogFooterProps = ComponentPropsWithRef<"div">;

export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  const { footer } = alertDialog();

  return <div data-slot="alert-dialog-footer" className={footer({ className })} {...props} />;
}

export type AlertDialogTitleProps = StyledProps<BaseDialog.Title.Props>;

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  const { title } = alertDialog();

  return (
    <BaseDialog.Title data-slot="alert-dialog-title" className={title({ className })} {...props} />
  );
}

export type AlertDialogDescriptionProps = StyledProps<BaseDialog.Description.Props>;

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  const { description } = alertDialog();

  return (
    <BaseDialog.Description
      data-slot="alert-dialog-description"
      className={description({ className })}
      {...props}
    />
  );
}

export type AlertDialogActionProps = ButtonProps;

export function AlertDialogAction(props: AlertDialogActionProps) {
  return <Button data-slot="alert-dialog-action" {...props} />;
}

export type AlertDialogCancelProps = Omit<BaseDialog.Close.Props, "render"> &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
  };

export function AlertDialogCancel({ className, variant, size, ...props }: AlertDialogCancelProps) {
  return (
    <BaseDialog.Close
      data-slot="alert-dialog-cancel"
      render={<Button className={className} variant={variant ?? "ghost"} size={size ?? "md"} />}
      {...props}
    />
  );
}
