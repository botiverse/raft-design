import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/button";

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
    navigationButton: [
      "pointer-events-auto absolute z-10 inline-flex items-center justify-center",
      "border-2 border-line-strong bg-layer-panel text-foreground-strong shadow-sm",
      "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
      "outline outline-[1px] outline-offset-2 outline-transparent",
      "focus-visible:outline-foreground-strong",
      "data-[disabled=true]:cursor-default",
      "[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
    ],
    infoBar: [
      "pointer-events-auto flex min-w-0 items-center",
      "bg-layer-panel text-foreground-strong",
      "shadow-[0_12px_32px_-18px_oklch(0_0_0_/_0.55)]",
    ],
    infoTitle: ["min-w-0 flex-1 truncate font-heading text-sm font-bold"],
    infoActions: ["flex shrink-0 items-center gap-1.5"],
    close: [],
  },
  variants: {
    theme: {
      brutal: {
        header: ["bg-transparent shadow-none"],
        title: ["text-foreground-strong"],
        media: ["border-line-strong bg-layer-panel shadow-xl"],
        navigationButton: [
          "size-8 rounded-none",
          "hover:bg-layer-panel data-[disabled=true]:text-black/35",
          "[&_svg]:size-6",
        ],
        infoBar: [
          "w-[clamp(9rem,20vw,14rem)] max-w-[calc(100vw-3rem)] min-w-[9rem]",
          "gap-2 rounded-none border-2 border-black py-0.5 pr-0.5 pl-2.5 shadow-brutal-sm",
          "[&_[data-slot=button]_svg]:stroke-2",
        ],
        infoTitle: ["text-xs text-black"],
      },
      elegant: {
        backdrop: ["bg-[oklch(0_0_0_/_0.72)] backdrop-blur-[2px]"],
        header: ["bg-transparent shadow-none"],
        title: ["font-sans font-medium text-foreground-strong"],
        actions: ["gap-2"],
        media: ["border border-line-subtle bg-layer-panel shadow-none"],
        navigationButton: [
          "size-8 rounded-full border-0",
          "bg-white/75 backdrop-blur-md",
          "text-foreground-muted",
          "shadow-none",
          "hover:bg-white/85 hover:text-foreground-strong",
          "active:scale-[0.97]",
          "data-[disabled=true]:bg-white/35 data-[disabled=true]:text-black/30 data-[disabled=true]:shadow-none",
          "data-[disabled=true]:hover:bg-white/35 data-[disabled=true]:active:scale-100",
          "[&_svg]:size-5",
        ],
        infoBar: [
          "w-[clamp(9rem,20vw,14rem)] max-w-[calc(100vw-3rem)] min-w-[9rem]",
          "gap-2 rounded py-0.5 pr-0.5 pl-2.5",
          "bg-[rgba(245,245,245,0.8)] text-neutral-900 shadow-none backdrop-blur-[10px]",
          "[&_[data-slot=button]]:text-neutral-600 [&_[data-slot=button]]:hover:bg-neutral-900/10 [&_[data-slot=button]]:hover:text-neutral-800",
        ],
        infoTitle: ["font-sans text-xs font-medium text-neutral-800"],
        infoActions: ["gap-1"],
      },
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
  const theme = useThemeFamily();
  const { backdrop, content } = lightbox({ theme });
  return (
    <LightboxPortal>
      <Dialog.Backdrop data-slot="lightbox-backdrop" data-theme={theme} className={backdrop()} />
      <Dialog.Popup
        data-slot="lightbox-content"
        data-theme={theme}
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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

export type LightboxNavigationButtonProps = Omit<
  ButtonProps,
  "disabled" | "loading" | "size" | "variant"
> & {
  direction: "next" | "previous";
  disabled?: boolean;
};

export function LightboxNavigationButton({
  className,
  direction,
  disabled,
  onClick,
  type = "button",
  ...props
}: LightboxNavigationButtonProps) {
  const theme = useThemeFamily();
  const { navigationButton } = lightbox({ theme });

  const handleClick = useCallback<NonNullable<ButtonProps["onClick"]>>(
    (event) => {
      event.stopPropagation();
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [disabled, onClick],
  );

  return (
    <Button
      aria-disabled={disabled}
      className={navigationButton({
        className: cn(direction === "previous" ? "left-8" : "right-8", className),
      })}
      data-disabled={disabled ? "true" : undefined}
      data-slot="lightbox-navigation-button"
      data-direction={direction}
      onClick={handleClick}
      size="icon-lg"
      type={type}
      variant="outline"
      {...props}
    />
  );
}

export type LightboxInfoBarProps = useRender.ComponentProps<"div">;

export function LightboxInfoBar({ render, className, ...props }: LightboxInfoBarProps) {
  const theme = useThemeFamily();
  const { infoBar } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoBar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-bar",
    },
  });
}

export type LightboxInfoTitleProps = useRender.ComponentProps<"div">;

export function LightboxInfoTitle({ render, className, ...props }: LightboxInfoTitleProps) {
  const theme = useThemeFamily();
  const { infoTitle } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-title",
    },
  });
}

export type LightboxInfoActionsProps = useRender.ComponentProps<"div">;

export function LightboxInfoActions({ render, className, ...props }: LightboxInfoActionsProps) {
  const theme = useThemeFamily();
  const { infoActions } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-actions",
    },
  });
}

export type LightboxCloseProps = StyledProps<Dialog.Close.Props>;

export function LightboxClose({ className, ...props }: LightboxCloseProps) {
  const theme = useThemeFamily();
  const { close } = lightbox({ theme });

  return <Dialog.Close data-slot="lightbox-close" className={close({ className })} {...props} />;
}
