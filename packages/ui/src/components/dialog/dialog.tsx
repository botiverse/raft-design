import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const dialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50",
      "transition-opacity duration-150 ease-out",
      "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
      "origin-center transform-gpu outline-none transition-[opacity,transform] duration-150 ease-out",
      "data-[starting-style]:scale-[.98] data-[starting-style]:opacity-0",
      "data-[ending-style]:opacity-0",
    ],
    header: ["grid grid-cols-[minmax(0,1fr)_max-content] items-center gap-3 min-w-0"],
    body: ["min-w-0"],
    footer: ["flex items-center justify-end gap-3"],
    title: ["m-0 min-w-0 text-foreground"],
    description: ["m-0 text-foreground-muted"],
  },
  variants: {
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
        header: [
          "border-b border-line-muted/75 bg-layer-inset px-6 py-3",
          "dark:border-transparent dark:bg-transparent",
        ],
        body: ["px-6 py-5"],
        footer: [
          "border-t border-line-muted/75 bg-layer-inset px-6 py-3",
          "dark:border-transparent dark:bg-transparent",
        ],
        title: ["font-sans text-sm leading-5 font-medium tracking-[-0.005em]"],
        description: ["font-sans text-sm leading-5 text-foreground-hint"],
      },
    },
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

export type DialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props>;

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = dialog({ theme });
  return (
    <BaseDialog.Backdrop data-slot="dialog-overlay" className={overlay({ className })} {...props} />
  );
}

export type DialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: DialogPortalProps;
  overlay?: false | DialogOverlayProps;
};

export function DialogContent({
  className,
  children,
  portalProps,
  overlay,
  ...props
}: DialogContentProps) {
  const theme = useThemeFamily();
  const { content } = dialog({ theme });

  return (
    <DialogPortal {...portalProps}>
      {overlay === false ? null : <DialogOverlay {...overlay} />}
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
  ...props
}: DialogCloseProps) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  if (render) {
    return (
      <BaseDialog.Close data-slot="dialog-close" render={render} {...props}>
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
          aria-label="Close"
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
