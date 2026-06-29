import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

const bottomSheet = tv({
  slots: {
    portal: [],
    positioner: ["fixed inset-x-0 bottom-0 z-50", "p-3 pb-[max(12px,env(safe-area-inset-bottom))]"],
    content: ["relative mx-auto max-w-md outline-none"],
    header: ["flex flex-col gap-1 p-4"],
    footer: ["mt-auto flex flex-col gap-2 p-4"],
    title: ["text-base font-bold text-foreground-strong"],
    description: ["text-sm text-foreground/60"],
  },
  variants: {
    theme: {
      brutal: { content: ["border-2 border-black bg-white text-black shadow-[var(--shadow-lg)]"] },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type BottomSheetProps = Dialog.Root.Props;

// Composition root: a thin pass-through over Dialog.Root that owns open state.
// Renders no DOM element of its own.
export function BottomSheet(props: BottomSheetProps) {
  return <Dialog.Root {...props} />;
}

export type BottomSheetTriggerProps = Dialog.Trigger.Props;

// Opens the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetTrigger(props: BottomSheetTriggerProps) {
  return <Dialog.Trigger data-slot="bottom-sheet-trigger" {...props} />;
}

export type BottomSheetPortalProps = StyledProps<Dialog.Portal.Props>;

export function BottomSheetPortal({ className, ...props }: BottomSheetPortalProps) {
  const theme = useThemeFamily();
  const { portal } = bottomSheet({ theme });
  return (
    <Dialog.Portal data-slot="bottom-sheet-portal" className={portal({ className })} {...props} />
  );
}

export type BottomSheetPositionerProps = ComponentPropsWithRef<"div">;

export function BottomSheetPositioner({ className, ...props }: BottomSheetPositionerProps) {
  const theme = useThemeFamily();
  const { positioner } = bottomSheet({ theme });
  return (
    <div data-slot="bottom-sheet-positioner" className={positioner({ className })} {...props} />
  );
}

export type BottomSheetContentProps = StyledProps<Dialog.Popup.Props>;

export function BottomSheetContent({ className, ...props }: BottomSheetContentProps) {
  const theme = useThemeFamily();
  const { content } = bottomSheet({ theme });
  return (
    <Dialog.Popup
      data-slot="bottom-sheet-content"
      data-side="bottom"
      className={content({ className })}
      {...props}
    />
  );
}

export type BottomSheetCloseProps = Dialog.Close.Props &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
    children?: ReactNode;
  };

// Closes the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetClose({
  className,
  variant,
  size,
  children,
  render,
  ...props
}: BottomSheetCloseProps) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  if (render) {
    return (
      <Dialog.Close data-slot="bottom-sheet-close" render={render} {...props}>
        {children}
      </Dialog.Close>
    );
  }

  return (
    <Dialog.Close
      data-slot="bottom-sheet-close"
      render={
        <Button
          variant={variant ?? (isBrutal ? "outline" : "ghost")}
          size={size ?? (isBrutal ? "icon-sm" : "icon-sm")}
          aria-label="Close"
          className={cn(
            "absolute top-3 right-3",
            isBrutal ? "bg-white" : "text-foreground-placeholder hover:text-foreground",
            className,
          )}
        />
      }
      {...props}
    >
      {children ?? <X className={isBrutal ? "size-4" : "size-4"} />}
    </Dialog.Close>
  );
}

export type BottomSheetHeaderProps = useRender.ComponentProps<"div">;

// Stacks the title + description at the top of the sheet.
export function BottomSheetHeader({ className, render, ...props }: BottomSheetHeaderProps) {
  const theme = useThemeFamily();
  const { header } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-header",
    },
  });
}

export type BottomSheetFooterProps = useRender.ComponentProps<"div">;

// Trailing action area, pushed to the bottom of the sheet.
export function BottomSheetFooter({ className, render, ...props }: BottomSheetFooterProps) {
  const theme = useThemeFamily();
  const { footer } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-footer",
    },
  });
}

export type BottomSheetTitleProps = StyledProps<Dialog.Title.Props>;

// Accessible heading for the sheet (labels the dialog for screen readers).
export function BottomSheetTitle({ className, ...props }: BottomSheetTitleProps) {
  const theme = useThemeFamily();
  const { title } = bottomSheet({ theme });
  return (
    <Dialog.Title data-slot="bottom-sheet-title" className={title({ className })} {...props} />
  );
}

export type BottomSheetDescriptionProps = StyledProps<Dialog.Description.Props>;

// Secondary supporting copy under the title; also the dialog's a11y description.
export function BottomSheetDescription({ className, ...props }: BottomSheetDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = bottomSheet({ theme });
  return (
    <Dialog.Description
      data-slot="bottom-sheet-description"
      className={description({ className })}
      {...props}
    />
  );
}
