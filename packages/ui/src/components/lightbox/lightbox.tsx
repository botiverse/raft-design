import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/button";

const lightbox = tv({
  slots: {
    backdrop: ["fixed inset-0 z-70 bg-layer-backdrop data-closed:hidden"],
    content: [
      "pointer-events-none fixed inset-0 z-71 flex flex-col data-closed:hidden",
      // Image shell: Close as a direct Content child pins top-right.
      // Use data-lightbox-close — Button overwrites data-slot to "button".
      "*:data-lightbox-close:pointer-events-auto *:data-lightbox-close:absolute *:data-lightbox-close:z-20",
      "*:data-lightbox-close:top-[calc(16px+env(safe-area-inset-top,0px))] *:data-lightbox-close:right-[calc(16px+env(safe-area-inset-right,0px))]",
    ],
    // In-flow chrome (e.g. playground): title + actions row.
    header: [
      "pointer-events-auto shrink-0",
      "flex items-center gap-3 pb-3",
      "pt-[calc(env(safe-area-inset-top,0px)+--spacing(3))]",
      "pl-[calc(env(safe-area-inset-left,0px)+--spacing(4))]",
      "pr-[calc(env(safe-area-inset-right,0px)+--spacing(4))]",
    ],
    // Attachment header: left Meta, right Actions. Close stays in-flow here.
    toolbar: [
      "pointer-events-auto shrink-0 flex items-center gap-3",
      "h-[calc(56px+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)]",
      "pl-[calc(16px+env(safe-area-inset-left,0px))] pr-[calc(16px+env(safe-area-inset-right,0px))]",
      "**:data-lightbox-close:static **:data-lightbox-close:inset-auto",
      "**:data-lightbox-close:top-auto **:data-lightbox-close:right-auto",
    ],
    headerMeta: ["flex min-w-0 flex-1 items-center gap-1.5"],
    headerLabel: [
      "inline-flex shrink-0 items-center px-1.5 py-0.5",
      "text-[10px] leading-none font-bold uppercase tracking-wide",
    ],
    title: ["min-w-0 flex-1 truncate text-sm leading-6 pt-0.5 pb-1"],
    actions: ["flex shrink-0 items-center gap-1.5"],
    stage: [
      "pointer-events-none relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
    ],
    media: ["pointer-events-auto max-h-[80vh] max-w-[86vw] border-0 bg-transparent shadow-none"],
    navigationButton: [
      "pointer-events-auto absolute z-10 inline-flex items-center justify-center",
      "border-2 border-line-strong bg-layer-panel text-foreground shadow-raft-sm",
      "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
      "outline outline-[1px] outline-offset-2 outline-transparent",
      "focus-visible:outline-foreground",
      "data-[disabled=true]:cursor-default",
      "[&_svg]:pointer-events-none [&_svg]:size-6 [&_svg]:shrink-0",
    ],
    infoDock: ["pointer-events-none absolute right-6 bottom-20 left-6 z-10 flex justify-center"],
    infoBar: [
      "pointer-events-auto flex min-w-0 items-center",
      "bg-layer-panel text-foreground",
      "shadow-[0_12px_32px_-18px_oklch(0_0_0/0.55)]",
    ],
    infoTitle: ["min-w-0 flex-1 truncate font-heading text-sm font-bold"],
    infoActions: ["flex shrink-0 items-center gap-1.5"],
    thumbnailStrip: [
      "pointer-events-none absolute right-0 bottom-4 left-0 z-10",
      "flex items-center justify-center gap-1.5",
    ],
    thumbnail: [
      "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden",
      "transition-[border-color,opacity,box-shadow] duration-150",
      "[&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover",
    ],
    thumbnailOverlay: ["pointer-events-none absolute inset-0 block transition-colors duration-150"],
    close: ["pointer-events-auto"],
  },
  variants: {
    theme: {
      brutal: {
        header: ["bg-transparent shadow-none"],
        toolbar: ["border-b-2 border-black bg-white shadow-none"],
        headerLabel: ["border-2 border-black bg-primary font-heading text-black"],
        title: ["font-heading font-semibold text-black"],
        navigationButton: [
          "size-8 rounded-none",
          "hover:bg-layer-panel data-[disabled=true]:text-foreground-strong/35",
          "[&_svg]:size-6",
        ],
        infoBar: [
          "w-[clamp(144px,20vw,224px)] max-w-[calc(100vw-48px)] min-w-36",
          "gap-2 rounded-none border-2 border-line-strong py-0.5 pr-0.5 pl-2.5 shadow-raft-sm",
          "[&_[data-slot=button]_svg]:stroke-2",
        ],
        infoTitle: ["text-xs text-foreground-strong"],
        thumbnail: [
          "border-2 border-white/70 opacity-70 shadow-[2px_2px_0_0_black]",
          "hover:border-white hover:opacity-100 hover:shadow-[3px_3px_0_0_black]",
          "data-active:border-[3px] data-active:border-white data-active:opacity-100",
          "data-active:shadow-[4px_4px_0_0_black]",
        ],
        thumbnailOverlay: ["hidden"],
        close: ["[&_svg]:size-4"],
      },
      elegant: {
        backdrop: ["bg-[oklch(0_0_0/0.72)] backdrop-blur-[2px]"],
        // Image-shell Close chrome only (direct child of Content).
        content: [
          "*:data-lightbox-close:rounded-full [&>[data-lightbox-close]]:p-1.5",
          "[&>[data-lightbox-close]]:[&_svg]:size-3.5",
        ],
        header: ["bg-transparent shadow-none"],
        toolbar: ["border-b border-line-muted bg-layer-panel shadow-none"],
        headerLabel: [
          "rounded-full border border-line-muted bg-fill-muted font-sans text-foreground-muted",
        ],
        title: ["font-sans font-medium text-foreground"],
        actions: ["gap-2"],
        navigationButton: [
          "size-8 rounded-full border-0",
          "bg-white/75 backdrop-blur-md",
          "dark:bg-[oklch(0.45_0.006_106.42/0.85)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.16)]",
          "text-foreground-muted dark:text-[oklch(0.92_0.003_106.42)]",
          "shadow-none",
          "hover:bg-white/85 hover:text-foreground",
          "dark:hover:bg-[oklch(0.52_0.006_106.42/0.9)] dark:hover:text-[oklch(0.985_0.004_106.42)]",
          "active:scale-[0.97]",
          "data-[disabled=true]:bg-white/35 data-[disabled=true]:text-foreground-strong/30 data-[disabled=true]:shadow-none",
          "dark:data-[disabled=true]:bg-[oklch(0.45_0.006_106.42/0.35)] dark:data-[disabled=true]:text-[oklch(0.92_0.003_106.42/0.35)]",
          "data-[disabled=true]:hover:bg-white/35 data-[disabled=true]:active:scale-100",
          "dark:data-[disabled=true]:hover:bg-[oklch(0.45_0.006_106.42/0.35)]",
          "[&_svg]:size-5",
        ],
        infoBar: [
          "w-[clamp(144px,20vw,224px)] max-w-[calc(100vw-48px)] min-w-36",
          "gap-2 rounded-sm py-0.5 pr-0.5 pl-2.5",
          "bg-[oklch(0.9702_0_0/0.8)] text-foreground shadow-none backdrop-blur-[10px]",
          "dark:bg-[oklch(0.24_0.005_106.42/0.85)] dark:shadow-[0_0_0_1px_oklch(1_0_0/0.08)]",
          "**:data-[slot=button]:text-[oklch(0.439_0_0)] **:data-[slot=button]:hover:bg-ink-10 **:data-[slot=button]:hover:text-[oklch(0.269_0_0)]",
          "dark:**:data-[slot=button]:text-[oklch(0.76_0.005_106.42)] dark:**:data-[slot=button]:hover:text-[oklch(0.92_0.003_106.42)]",
        ],
        infoTitle: [
          "font-sans text-xs font-medium text-[oklch(0.269_0_0)] dark:text-[oklch(0.92_0.003_106.42)]",
        ],
        infoActions: ["gap-1"],
        thumbnail: [
          "rounded-sm border opacity-100 shadow-none",
          "border-white/25 hover:border-white/60",
          "data-active:border-white/90",
        ],
        thumbnailOverlay: [
          "bg-black/45 group-hover/lightbox-thumb:bg-black/28",
          "group-data-active/lightbox-thumb:bg-transparent",
        ],
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
  return <Dialog.Portal data-slot="lightbox-portal" {...useThemeScopeProps(props)} />;
}

export type LightboxContentProps = StyledProps<Dialog.Popup.Props>;

export function LightboxContent({
  className,
  initialFocus,
  finalFocus,
  ...props
}: LightboxContentProps) {
  const theme = useThemeFamily();
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

export type LightboxToolbarProps = useRender.ComponentProps<"div">;

export function LightboxToolbar({ render, className, ...props }: LightboxToolbarProps) {
  const theme = useThemeFamily();
  const { toolbar } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-toolbar",
    },
  });
}

export type LightboxHeaderMetaProps = useRender.ComponentProps<"div">;

export function LightboxHeaderMeta({ render, className, ...props }: LightboxHeaderMetaProps) {
  const { headerMeta } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: headerMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-header-meta",
    },
  });
}

export type LightboxHeaderLabelProps = useRender.ComponentProps<"span">;

export function LightboxHeaderLabel({ render, className, ...props }: LightboxHeaderLabelProps) {
  const theme = useThemeFamily();
  const { headerLabel } = lightbox({ theme });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: headerLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "lightbox-header-label",
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

export type LightboxInfoDockProps = useRender.ComponentProps<"div">;

export function LightboxInfoDock({ render, className, ...props }: LightboxInfoDockProps) {
  const { infoDock } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoDock({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-dock",
    },
  });
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

export type LightboxThumbnailStripProps = useRender.ComponentProps<"div">;

export function LightboxThumbnailStrip({
  render,
  className,
  ...props
}: LightboxThumbnailStripProps) {
  const { thumbnailStrip } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: thumbnailStrip({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-thumbnail-strip",
    },
  });
}

export type LightboxThumbnailProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

export function LightboxThumbnail({
  active = false,
  className,
  render,
  type = "button",
  children,
  ...props
}: LightboxThumbnailProps) {
  const theme = useThemeFamily();
  const { thumbnail, thumbnailOverlay } = lightbox({ theme });

  const defaultProps: SlotElementProps<"button"> = {
    type,
    "data-slot": "lightbox-thumbnail",
    "data-active": active ? "true" : undefined,
    className: thumbnail({ className }),
    children: (
      <>
        {children}
        <span
          aria-hidden="true"
          data-slot="lightbox-thumbnail-overlay"
          className={thumbnailOverlay()}
        />
      </>
    ),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type LightboxCloseProps = StyledProps<Dialog.Close.Props>;

export function LightboxClose({ className, render, ...props }: LightboxCloseProps) {
  const theme = useThemeFamily();
  const { close } = lightbox({ theme });

  return (
    <Dialog.Close
      data-lightbox-close=""
      data-slot="lightbox-close"
      className={close({ className })}
      render={
        render ?? (
          <Button
            type="button"
            variant="outline"
            size={theme === "elegant" ? "icon-sm" : "icon-md"}
          />
        )
      }
      {...props}
    />
  );
}
