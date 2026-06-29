import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const alertDialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50",
      "transition-opacity duration-150 ease-out",
      "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-[408px] -translate-x-1/2 -translate-y-1/2",
      "origin-center transform-gpu outline-none transition-[opacity,transform] duration-150 ease-out",
      "data-[starting-style]:scale-[.98] data-[starting-style]:opacity-0",
      "data-[ending-style]:opacity-0",
    ],
    header: ["grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 min-w-0"],
    body: ["min-w-0"],
    footer: ["flex items-center justify-end gap-3"],
    title: ["m-0 min-w-0 text-foreground-strong"],
    description: ["m-0 text-foreground-muted"],
  },
  variants: {
    theme: {
      brutal: {
        overlay: ["bg-layer-backdrop"],
        content: ["gap-4 border-2 border-line-strong bg-layer-panel px-6 py-4 shadow-xl"],
        body: ["py-2 font-medium"],
        title: ["font-heading text-lg leading-none font-bold uppercase"],
        description: ["font-sans text-sm leading-5 text-foreground/60"],
      },
      elegant: {
        overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
        content: ["overflow-clip rounded-lg bg-layer-popover shadow-xl"],
        header: ["border-b border-line-subtle bg-black/[0.02] px-5 py-3"],
        body: ["px-6 py-5"],
        footer: ["border-t border-line-subtle bg-black/[0.015] px-5 py-3"],
        title: ["font-sans text-sm leading-5 font-medium tracking-[-0.005em]"],
        description: [
          "font-sans text-sm leading-5 text-[oklch(0.48_0_0)] dark:text-[oklch(0.76_0_0)]",
        ],
      },
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
  return <BaseDialog.Portal data-slot="alert-dialog-portal" {...props} />;
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
  ...props
}: AlertDialogCloseProps) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  return (
    <BaseDialog.Close
      data-slot="alert-dialog-close"
      render={
        <Button
          variant={variant ?? (isBrutal ? "outline" : "ghost")}
          size={size ?? (isBrutal ? "icon-md" : "icon-sm")}
          aria-label="Close"
          className={
            isBrutal
              ? className
              : cn(
                  "p-0 text-foreground-placeholder hover:border-transparent hover:bg-transparent hover:text-foreground",
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

export type AlertDialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props>;

export function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = alertDialog({ theme });

  return (
    <BaseDialog.Backdrop
      data-slot="alert-dialog-overlay"
      data-theme={theme}
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
  const theme = useThemeFamily();
  const { content } = alertDialog({ theme });

  return (
    <AlertDialogPortal {...portalProps}>
      {overlay === false ? null : <AlertDialogOverlay {...overlay} />}
      <BaseDialog.Popup
        data-slot="alert-dialog-content"
        className={content({ className })}
        {...props}
        role="alertdialog"
      >
        {children}
      </BaseDialog.Popup>
    </AlertDialogPortal>
  );
}

export type AlertDialogHeaderProps = ComponentPropsWithRef<"div">;

export function AlertDialogHeader({ className, ...props }: AlertDialogHeaderProps) {
  const theme = useThemeFamily();
  const { header } = alertDialog({ theme });

  return <div data-slot="alert-dialog-header" className={header({ className })} {...props} />;
}

export type AlertDialogBodyProps = ComponentPropsWithRef<"div">;

export function AlertDialogBody({ className, ...props }: AlertDialogBodyProps) {
  const theme = useThemeFamily();
  const { body } = alertDialog({ theme });

  return <div data-slot="alert-dialog-body" className={body({ className })} {...props} />;
}

export type AlertDialogFooterProps = ComponentPropsWithRef<"div">;

export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  const theme = useThemeFamily();
  const { footer } = alertDialog({ theme });

  return <div data-slot="alert-dialog-footer" className={footer({ className })} {...props} />;
}

export type AlertDialogTitleProps = StyledProps<BaseDialog.Title.Props>;

export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  const theme = useThemeFamily();
  const { title } = alertDialog({ theme });

  return (
    <BaseDialog.Title data-slot="alert-dialog-title" className={title({ className })} {...props} />
  );
}

export type AlertDialogDescriptionProps = StyledProps<BaseDialog.Description.Props>;

export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = alertDialog({ theme });

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

export function AlertDialogCancel({
  className,
  variant = "outline",
  size = "sm",
  ...props
}: AlertDialogCancelProps) {
  return (
    <BaseDialog.Close
      data-slot="alert-dialog-cancel"
      render={<Button className={className} variant={variant} size={size} />}
      {...props}
    />
  );
}
