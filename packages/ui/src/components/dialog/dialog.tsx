import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";

const dialog = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50",
      "transition-opacity duration-100",
      "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
    ],
    content: [
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
      "outline-none transition-[opacity,transform] duration-100",
      "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
      "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
    ],
    header: ["flex min-w-0 flex-col gap-1"],
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
        title: ["font-heading text-lg leading-none font-bold uppercase"],
        description: ["font-sans text-sm leading-5 text-foreground/60"],
      },
      elegant: {
        overlay: ["bg-black/20"],
        content: ["gap-5 rounded-lg bg-layer-popover p-5 shadow-xl"],
        title: ["font-sans text-base leading-5 font-medium tracking-[-0.005em]"],
        description: [
          "font-sans text-sm leading-5 text-[oklch(0.48_0_0)] dark:text-[oklch(0.76_0_0)]",
        ],
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
  return <BaseDialog.Portal data-slot="dialog-portal" {...props} />;
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

export type DialogCloseProps = BaseDialog.Close.Props;

export function DialogClose(props: DialogCloseProps) {
  return <BaseDialog.Close data-slot="dialog-close" {...props} />;
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
