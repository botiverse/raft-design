import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import { tv } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const lightbox = tv({
  slots: {
    backdrop: ["fixed inset-0 z-[70] bg-layer-backdrop data-[closed]:hidden"],
    content: ["pointer-events-none fixed inset-0 z-[71] data-[closed]:hidden"],
    header: ["safe-top safe-left safe-right pointer-events-auto shrink-0"],
    title: ["min-w-0 flex-1 truncate font-heading text-sm font-bold"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    stage: [
      "pointer-events-none relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
    ],
    media: ["pointer-events-auto max-h-[80vh] max-w-[86vw] border-2"],
    close: [],
  },
  variants: {
    theme: {
      brutal: {
        header: ["border-b-2 border-line-strong bg-layer-panel"],
        title: ["text-foreground-strong"],
        media: ["border-line-strong bg-layer-panel shadow-xl"],
      },
      elegant: {},
    },
  },
});

export type LightboxProps<Payload = unknown> = Omit<
  Dialog.Root.Props<Payload>,
  "actionsRef" | "children" | "handle"
> & {
  children?: ReactNode;
  closeOnModW?: boolean;
};

export function Lightbox<Payload = unknown>({
  closeOnModW = true,
  defaultOpen = false,
  modal = true,
  onOpenChange,
  open,
  children,
  ...props
}: LightboxProps<Payload>) {
  const dialogRef = useRef<Dialog.Root.Actions>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const effectiveOpen = open ?? uncontrolledOpen;

  const handleOpenChange = useCallback<NonNullable<Dialog.Root.Props<Payload>["onOpenChange"]>>(
    (nextOpen, eventDetails) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange, open],
  );

  const modWClose =
    closeOnModW && effectiveOpen ? <LightboxModWClose dialogRef={dialogRef} /> : null;

  return (
    <Dialog.Root
      actionsRef={dialogRef}
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={handleOpenChange}
      open={open}
      {...props}
    >
      {modWClose}
      {children}
    </Dialog.Root>
  );
}

type LightboxModWCloseProps = {
  dialogRef: RefObject<Dialog.Root.Actions | null>;
};

function LightboxModWClose({ dialogRef }: LightboxModWCloseProps) {
  useHotkey(
    "Mod+W",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dialogRef.current?.close();
    },
    {
      meta: {
        name: "Close lightbox",
        description: "Close the active lightbox before the browser closes the tab.",
      },
    },
  );

  return null;
}

export type LightboxTriggerProps = Dialog.Trigger.Props;

export function LightboxTrigger(props: LightboxTriggerProps) {
  return <Dialog.Trigger data-slot="lightbox-trigger" {...props} />;
}

export type LightboxPortalProps = Dialog.Portal.Props;

export function LightboxPortal(props: LightboxPortalProps) {
  return <Dialog.Portal data-slot="lightbox-portal" {...props} />;
}

export type LightboxContentProps = StyledProps<Dialog.Popup.Props>;

export function LightboxContent({
  className,
  initialFocus = false,
  finalFocus = false,
  ...props
}: LightboxContentProps) {
  const theme = useTheme();
  const { backdrop, content } = lightbox({ theme });
  return (
    <LightboxPortal>
      <Dialog.Backdrop data-slot="lightbox-backdrop" className={backdrop()} />
      <Dialog.Popup
        data-slot="lightbox-content"
        initialFocus={initialFocus}
        finalFocus={finalFocus}
        className={content({ className })}
        {...props}
      />
    </LightboxPortal>
  );
}

export type LightboxHeaderProps = useRender.ComponentProps<"div">;

export function LightboxHeader({ render, className, ...props }: LightboxHeaderProps) {
  const theme = useTheme();
  const { header } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-header",
    },
  });
}

export type LightboxTitleProps = useRender.ComponentProps<"div">;

export function LightboxTitle({ render, className, ...props }: LightboxTitleProps) {
  const theme = useTheme();
  const { title } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-title",
    },
  });
}

export type LightboxActionsProps = useRender.ComponentProps<"div">;

export function LightboxActions({ render, className, ...props }: LightboxActionsProps) {
  const theme = useTheme();
  const { actions } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-actions",
    },
  });
}

export type LightboxStageProps = useRender.ComponentProps<"div">;

export function LightboxStage({ render, className, ...props }: LightboxStageProps) {
  const theme = useTheme();
  const { stage } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: stage({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-stage",
    },
  });
}

export type LightboxMediaProps = useRender.ComponentProps<"div">;

export function LightboxMedia({ render, className, ...props }: LightboxMediaProps) {
  const theme = useTheme();
  const { media } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: media({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-media",
    },
  });
}

export type LightboxCloseProps = StyledProps<Dialog.Close.Props>;

export function LightboxClose({ className, ...props }: LightboxCloseProps) {
  const theme = useTheme();
  const { close } = lightbox({ theme });

  return <Dialog.Close data-slot="lightbox-close" className={close({ className })} {...props} />;
}
