import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const alertDialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50",
      "transition-opacity duration-100",
      "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
      "outline-none transition-[opacity,transform] duration-100",
      "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
    ],
    header: ["grid min-w-0 gap-1"],
    media: ["flex size-10 shrink-0 items-center justify-center"],
    body: ["min-w-0"],
    footer: ["flex items-center justify-end gap-3"],
    title: ["m-0 min-w-0 text-foreground-strong"],
    description: ["m-0 text-foreground-muted"],
  },
  variants: {
    theme: {
      brutal: {
        overlay: ["bg-black/60"],
        content: ["gap-4 border-2 border-line-strong bg-layer-panel p-6 shadow-xl"],
        media: ["border-2 border-line-strong bg-warning-base text-foreground-inverse"],
        title: ["font-heading text-lg leading-none font-bold uppercase"],
        description: ["font-sans text-sm leading-5 text-foreground/60"],
      },
      elegant: {
        overlay: ["bg-black/20"],
        content: [
          "gap-5 rounded-lg bg-layer-popover p-5",
          "shadow-[0_24px_48px_-24px_oklch(0.21_0.006_285_/_0.30),0_0_0_1px_oklch(0.21_0.006_285_/_0.08),0_1px_2px_oklch(0.21_0.006_285_/_0.08)]",
        ],
        media: ["rounded-md bg-danger-lighter text-danger-base"],
        title: ["font-sans text-base leading-5 font-medium tracking-[-0.005em]"],
        description: [
          "font-sans text-sm leading-5 text-[oklch(0.48_0_0)] dark:text-[oklch(0.76_0_0)]",
        ],
      },
    },
    size: {
      sm: {
        content: ["max-w-sm"],
      },
      md: {
        content: ["max-w-md"],
      },
    },
  },
  defaultVariants: {
    size: "sm",
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

export type AlertDialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props>;

export function AlertDialogOverlay({ className, ...props }: AlertDialogOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = alertDialog({ theme });

  return (
    <BaseDialog.Backdrop
      data-slot="alert-dialog-overlay"
      className={overlay({ className })}
      {...props}
    />
  );
}

export type AlertDialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: AlertDialogPortalProps;
  overlay?: false | AlertDialogOverlayProps;
  size?: "sm" | "md";
};

export function AlertDialogContent({
  className,
  children,
  portalProps,
  overlay,
  size,
  ...props
}: AlertDialogContentProps) {
  const theme = useThemeFamily();
  const { content } = alertDialog({ theme, size });

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

export type AlertDialogMediaProps = ComponentPropsWithRef<"div">;

export function AlertDialogMedia({ className, ...props }: AlertDialogMediaProps) {
  const theme = useThemeFamily();
  const { media } = alertDialog({ theme });

  return <div data-slot="alert-dialog-media" className={media({ className })} {...props} />;
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
