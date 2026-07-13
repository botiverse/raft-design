import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import { createContext, type ComponentProps, useContext, useMemo } from "react";
import { cn } from "../../lib/cn";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useTheme, useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";

type DrawerContextValue = {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
  showSwipeHandle: boolean;
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawer() {
  const context = useContext(DrawerContext);

  if (!context) {
    throw new Error("Drawer parts must be used within Drawer.");
  }

  return context;
}

const drawer = tv({
  slots: {
    overlay: [
      "fixed inset-0 z-50 min-h-dvh select-none",
      "opacity-[max(var(--drawer-overlay-min-opacity,0),calc(1-var(--drawer-swipe-progress)))]",
      "transition-opacity duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
      "data-starting-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-350",
      "data-snap-points:[--drawer-overlay-min-opacity:0.5]",
      "data-swiping:duration-0 motion-reduce:transition-none supports-[-webkit-touch-callout:none]:absolute",
    ],
    viewport: [
      "pointer-events-none fixed inset-0 z-50 select-none",
      "data-[modal=true]:pointer-events-auto",
    ],
    popup: [
      "group/drawer-popup pointer-events-auto fixed z-50 flex h-(--drawer-content-height) flex-col outline-none select-none",
      "[--drawer-blur:2px] [--drawer-ease:cubic-bezier(0.22,1,0.36,1)]",
      "transform-[translate3d(var(--translate-x,0px),var(--translate-y,0px),0)_scale(var(--stack-scale,1))]",
      "opacity-100 blur-0",
      "transition-[transform,opacity,filter] duration-400 ease-(--drawer-ease) will-change-[transform,opacity,filter]",
      "data-ending-style:duration-350",
      "data-starting-style:transform-(--closed-transform) data-starting-style:opacity-0 data-starting-style:blur-(--drawer-blur)",
      "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-0 data-ending-style:blur-(--drawer-blur)",
      "data-swiping:duration-0 motion-reduce:transition-none",
      "after:pointer-events-none after:absolute after:bg-[inherit] after:opacity-0",
      "data-swiping:after:opacity-100",
      "data-[swipe-axis=x]:after:inset-y-0 data-[swipe-axis=x]:after:w-12",
      "data-[swipe-axis=y]:after:inset-x-0 data-[swipe-axis=y]:after:h-12",
      "data-[swipe-direction=down]:after:top-full data-[swipe-direction=left]:after:right-full",
      "data-[swipe-direction=right]:after:left-full data-[swipe-direction=up]:after:bottom-full",
      "[--drawer-content-height:var(--drawer-height,auto)] data-[swipe-axis=y]:data-snap-points:[--drawer-content-height:100dvh]",
      "data-[swipe-direction=down]:right-3 data-[swipe-direction=down]:bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] data-[swipe-direction=down]:left-3",
      "data-[swipe-direction=down]:mx-auto data-[swipe-direction=down]:mt-24 data-[swipe-direction=down]:min-h-64 data-[swipe-direction=down]:max-h-[82vh] data-[swipe-direction=down]:max-w-lg md:data-[swipe-direction=down]:max-w-md",
      "data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+max(0.75rem,env(safe-area-inset-bottom,0px))+2px),0)]",
      "data-[swipe-direction=down]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y))]",
      "data-[swipe-direction=up]:top-[max(0.75rem,env(safe-area-inset-top,0px))] data-[swipe-direction=up]:right-3 data-[swipe-direction=up]:left-3",
      "data-[swipe-direction=up]:mx-auto data-[swipe-direction=up]:mb-24 data-[swipe-direction=up]:max-h-[80vh] data-[swipe-direction=up]:max-w-md",
      "data-[swipe-direction=up]:[--closed-transform:translate3d(0,calc(-100%-max(0.75rem,env(safe-area-inset-top,0px))-2px),0)]",
      "data-[swipe-direction=up]:[--translate-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y))]",
      "data-[swipe-direction=left]:left-3 data-[swipe-direction=left]:w-3/4 data-[swipe-direction=left]:max-w-sm",
      "data-[swipe-direction=left]:[--closed-transform:translate3d(calc(-100%-0.75rem-2px),0,0)]",
      "data-[swipe-direction=left]:[--translate-x:var(--drawer-swipe-movement-x)]",
      "data-[swipe-direction=right]:right-3 data-[swipe-direction=right]:w-3/4 data-[swipe-direction=right]:max-w-sm",
      "data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+0.75rem+2px),0,0)]",
      "data-[swipe-direction=right]:[--translate-x:var(--drawer-swipe-movement-x)]",
      "data-[swipe-axis=x]:flex-row",
      "data-nested-drawer-open:overflow-hidden data-nested-drawer-open:brightness-95",
    ],
    content: [
      "flex min-h-0 flex-1 flex-col rounded-[inherit] select-text",
      "group-data-swiping/drawer-popup:select-none",
    ],
    swipeHandle: [
      "relative z-10 shrink-0 cursor-grab rounded-full bg-ink-20",
      "group-data-[swipe-direction=down]/drawer-popup:mx-auto group-data-[swipe-direction=down]/drawer-popup:mt-3 group-data-[swipe-direction=down]/drawer-popup:h-1.5 group-data-[swipe-direction=down]/drawer-popup:w-12",
      "group-data-[swipe-direction=up]/drawer-popup:order-last group-data-[swipe-direction=up]/drawer-popup:mx-auto group-data-[swipe-direction=up]/drawer-popup:mb-3 group-data-[swipe-direction=up]/drawer-popup:h-1.5 group-data-[swipe-direction=up]/drawer-popup:w-12",
      "group-data-[swipe-direction=left]/drawer-popup:order-last group-data-[swipe-direction=left]/drawer-popup:my-auto group-data-[swipe-direction=left]/drawer-popup:mr-3 group-data-[swipe-direction=left]/drawer-popup:h-12 group-data-[swipe-direction=left]/drawer-popup:w-1.5",
      "group-data-[swipe-direction=right]/drawer-popup:my-auto group-data-[swipe-direction=right]/drawer-popup:ml-3 group-data-[swipe-direction=right]/drawer-popup:h-12 group-data-[swipe-direction=right]/drawer-popup:w-1.5",
      "transition-opacity duration-200 active:cursor-grabbing",
      "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100",
    ],
    header: [
      "flex flex-col items-center px-6 pt-8 pb-2 text-center",
      "group-data-[swipe-axis=x]/drawer-popup:flex-row group-data-[swipe-axis=x]/drawer-popup:items-center group-data-[swipe-axis=x]/drawer-popup:justify-between group-data-[swipe-axis=x]/drawer-popup:gap-3 group-data-[swipe-axis=x]/drawer-popup:pt-6 group-data-[swipe-axis=x]/drawer-popup:text-left",
    ],
    body: [
      "flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center",
      "group-data-[swipe-axis=x]/drawer-popup:items-stretch group-data-[swipe-axis=x]/drawer-popup:text-left",
    ],
    footer: ["mt-auto px-6 py-5 md:pb-5", "group-data-[swipe-axis=x]/drawer-popup:py-4"],
    actions: [
      "mx-auto flex w-full max-w-none flex-col items-stretch gap-2.5",
      "[&_[data-slot=button]]:w-full",
    ],
    title: [
      "max-w-sm text-pretty text-center text-2xl leading-8 text-foreground-strong",
      "group-data-[swipe-axis=x]/drawer-popup:min-w-0 group-data-[swipe-axis=x]/drawer-popup:max-w-none group-data-[swipe-axis=x]/drawer-popup:flex-1 group-data-[swipe-axis=x]/drawer-popup:text-left",
    ],
    description: [
      "max-w-sm text-pretty text-center text-sm leading-5 text-foreground/60",
      "group-data-[swipe-axis=x]/drawer-popup:max-w-none group-data-[swipe-axis=x]/drawer-popup:text-left",
    ],
  },
  variants: {
    theme: {
      brutal: {
        overlay: ["bg-layer-backdrop"],
        title: ["font-bold"],
        popup: [
          "border-2 border-line-strong bg-layer-panel text-foreground shadow-brutal-lg",
          "data-[swipe-direction=left]:inset-y-3 data-[swipe-direction=left]:left-3",
          "data-[swipe-direction=left]:[--drawer-content-height:calc(100dvh-1.5rem)]",
          "data-[swipe-direction=right]:inset-y-3 data-[swipe-direction=right]:right-5",
          "data-[swipe-direction=right]:[--drawer-content-height:calc(100dvh-1.5rem)]",
          "data-[swipe-direction=right]:[--closed-transform:translate3d(calc(100%+1.25rem+2px),0,0)]",
          "data-[swipe-direction=down]:bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))]",
          "data-[swipe-direction=down]:[--closed-transform:translate3d(0,calc(100%+max(1.25rem,env(safe-area-inset-bottom,0px))+2px),0)]",
        ],
      },
      elegant: {
        overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
        popup: [
          "overflow-clip rounded-lg bg-layer-popover text-foreground shadow-xl md:rounded-xl",
          "data-[swipe-direction=left]:inset-y-3",
          "data-[swipe-direction=right]:inset-y-3",
          "md:data-[swipe-direction=down]:max-w-md",
          "md:data-[swipe-direction=up]:max-w-md",
          "md:data-[swipe-direction=left]:max-w-md",
          "md:data-[swipe-direction=right]:max-w-md",
        ],
        header: ["bg-layer-panel px-8 pt-9 pb-2", "group-data-[swipe-axis=x]/drawer-popup:pt-6"],
        body: ["bg-layer-panel px-8 pt-4 pb-7"],
        footer: ["mt-0 px-8 py-5"],
        actions: ["w-full flex-col", "[&_[data-slot=button]]:w-full"],
        title: ["font-sans text-2xl leading-8 font-semibold text-[oklch(0.22_0_0)]"],
        description: ["font-sans text-sm leading-5 text-[oklch(0.48_0_0)]"],
      },
    },
  },
});

export type DrawerProps = DrawerPrimitive.Root.Props & {
  showSwipeHandle?: boolean;
};

export function Drawer({
  modal = true,
  showSwipeHandle = false,
  snapPoints,
  swipeDirection = "down",
  ...props
}: DrawerProps) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = useMemo(
    () => ({ hasSnapPoints, modal, showSwipeHandle, swipeDirection }),
    [hasSnapPoints, modal, showSwipeHandle, swipeDirection],
  );

  return (
    <DrawerContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props;

export function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export type DrawerPortalProps = DrawerPrimitive.Portal.Props;

export function DrawerPortal(props: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

export type DrawerOverlayProps = StyledProps<DrawerPrimitive.Backdrop.Props>;

export function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  const theme = useThemeFamily();
  const { resolvedMode } = useTheme();
  const { overlay } = drawer({ theme });

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      data-theme={theme}
      className={cn(overlay({ className }), resolvedMode === "dark" && "dark")}
      {...props}
    />
  );
}

export type DrawerSwipeHandleProps = ComponentProps<"div">;

export function DrawerSwipeHandle({ className, ...props }: DrawerSwipeHandleProps) {
  const theme = useThemeFamily();
  const { swipeHandle } = drawer({ theme });

  return (
    <div
      data-slot="drawer-swipe-handle"
      aria-hidden="true"
      className={swipeHandle({ className })}
      {...props}
    />
  );
}

export type DrawerContentProps = StyledProps<DrawerPrimitive.Popup.Props> & {
  portalProps?: DrawerPortalProps;
};

export function DrawerContent({ className, children, portalProps, ...props }: DrawerContentProps) {
  const { hasSnapPoints, modal, showSwipeHandle, swipeDirection } = useDrawer();
  const theme = useThemeFamily();
  const { resolvedMode } = useTheme();
  const { content, popup, viewport } = drawer({ theme });
  const swipeAxis = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";

  return (
    <DrawerPortal {...portalProps}>
      {modal === true ? <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} /> : null}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={modal}
        className={viewport()}
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-theme={theme}
          data-swipe-axis={swipeAxis}
          data-snap-points={hasSnapPoints ? "" : undefined}
          className={cn(popup({ className }), resolvedMode === "dark" && "dark")}
          {...props}
        >
          {showSwipeHandle ? <DrawerSwipeHandle /> : null}
          <DrawerPrimitive.Content data-slot="drawer-content" className={content()}>
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

export type DrawerCloseProps = StyledProps<DrawerPrimitive.Close.Props> &
  Pick<ButtonProps, "variant" | "size">;

export function DrawerClose({
  className,
  variant,
  size,
  children,
  render,
  ...props
}: DrawerCloseProps) {
  const theme = useThemeFamily();
  const isBrutal = theme === "brutal";

  if (render) {
    return (
      <DrawerPrimitive.Close
        data-slot="drawer-close"
        className={className}
        render={render}
        {...props}
      >
        {children}
      </DrawerPrimitive.Close>
    );
  }

  return (
    <DrawerPrimitive.Close
      data-slot="drawer-close"
      render={
        <Button
          variant={variant ?? (isBrutal ? "outline" : "ghost")}
          size={size ?? (isBrutal ? "icon-md" : "icon-sm")}
          aria-label="Close"
        />
      }
      className={cn(
        "shrink-0",
        isBrutal
          ? "bg-layer-panel"
          : "p-0 text-foreground-placeholder hover:bg-transparent hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <X className={isBrutal ? "size-5" : "size-4"} />}
    </DrawerPrimitive.Close>
  );
}

export type DrawerHeaderProps = useRender.ComponentProps<"div">;

export function DrawerHeader({ className, render, ...props }: DrawerHeaderProps) {
  const theme = useThemeFamily();
  const { header } = drawer({ theme });
  const defaultProps: useRender.ElementProps<"div"> = { className: header({ className }) };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "drawer-header" },
  });
}

export type DrawerFooterProps = useRender.ComponentProps<"div">;

export function DrawerFooter({ className, render, ...props }: DrawerFooterProps) {
  const theme = useThemeFamily();
  const { footer } = drawer({ theme });
  const defaultProps: useRender.ElementProps<"div"> = { className: footer({ className }) };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "drawer-footer" },
  });
}

export type DrawerBodyProps = useRender.ComponentProps<"div">;

export function DrawerBody({ className, render, ...props }: DrawerBodyProps) {
  const theme = useThemeFamily();
  const { body } = drawer({ theme });
  const defaultProps: useRender.ElementProps<"div"> = { className: body({ className }) };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "drawer-body" },
  });
}

export type DrawerActionsProps = useRender.ComponentProps<"div">;

export function DrawerActions({ className, render, children, ...props }: DrawerActionsProps) {
  const theme = useThemeFamily();
  const { actions } = drawer({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
    children,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: { slot: "drawer-actions" },
  });
}

export type DrawerTitleProps = StyledProps<DrawerPrimitive.Title.Props>;

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  const theme = useThemeFamily();
  const { title } = drawer({ theme });

  return (
    <DrawerPrimitive.Title data-slot="drawer-title" className={title({ className })} {...props} />
  );
}

export type DrawerDescriptionProps = StyledProps<DrawerPrimitive.Description.Props>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  const theme = useThemeFamily();
  const { description } = drawer({ theme });

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={description({ className })}
      {...props}
    />
  );
}
