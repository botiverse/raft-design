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
  nested: boolean;
  showSwipeHandle: boolean;
  swipeAxis: "x" | "y";
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
      "transition-opacity duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
      "data-starting-style:opacity-0 data-ending-style:pointer-events-none data-ending-style:opacity-0 data-ending-style:duration-150",
      "data-swiping:duration-0 motion-reduce:transition-none supports-[-webkit-touch-callout:none]:absolute",
    ],
    viewport: ["pointer-events-none fixed inset-0 z-50 select-none"],
    popup: [
      "group/drawer-popup pointer-events-auto fixed z-50 flex h-(--drawer-content-height) flex-col outline-none select-none",
      "[--drawer-blur:2px] [--drawer-ease:cubic-bezier(0.32,0.72,0,1)]",
      "[--closed-transform:translate3d(var(--drawer-exit-x,0px),var(--drawer-exit-y,0px),0)]",
      "[--drawer-stack-peek:1rem] [--drawer-stack-step:0.05]",
      "[--drawer-stack-progress:clamp(0,var(--drawer-swipe-progress),1)]",
      "[--drawer-stack-offset:max(0px,calc((var(--nested-drawers)-var(--drawer-stack-progress))*var(--drawer-stack-peek)))]",
      "[--drawer-stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--drawer-stack-step))))]",
      "[--drawer-stack-scale:clamp(0,calc(var(--drawer-stack-scale-base)+(var(--drawer-stack-step)*var(--drawer-stack-progress))),1)]",
      "[--drawer-stack-shrink:calc(1-var(--drawer-stack-scale))]",
      "[--drawer-stack-shrink-offset:calc(var(--drawer-stack-shrink)*var(--drawer-stack-size))]",
      "[transform-origin:var(--drawer-transform-origin)]",
      "transform-[translate3d(calc(var(--drawer-swipe-x,0px)+var(--drawer-stack-x,0px)),calc(var(--drawer-swipe-y,0px)+var(--drawer-stack-y,0px)),0)_scale(var(--drawer-stack-scale))]",
      "opacity-100 blur-0",
      "transition-[transform,height,opacity,filter] duration-240 ease-(--drawer-ease) will-change-[transform,height,opacity,filter]",
      "data-ending-style:duration-[calc(var(--drawer-swipe-strength,1)*180ms)]",
      "data-starting-style:transform-(--closed-transform) data-starting-style:opacity-0 data-starting-style:blur-(--drawer-blur)",
      "data-ending-style:transform-(--closed-transform) data-ending-style:opacity-0 data-ending-style:blur-(--drawer-blur)",
      "data-swiping:duration-0 data-nested-drawer-swiping:duration-0 motion-reduce:transition-none",
      "after:pointer-events-none after:absolute after:bg-[inherit] after:opacity-0",
      "data-swiping:after:opacity-100",
      "[--drawer-content-height:var(--drawer-height,auto)]",
      "data-nested-drawer-open:overflow-hidden",
    ],
    content: [
      "flex min-h-0 flex-1 flex-col rounded-[inherit] select-text",
      "group-data-swiping/drawer-popup:select-none",
      "transition-opacity duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
      "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100",
    ],
    swipeHandle: [
      "relative z-10 shrink-0 cursor-grab rounded-full bg-ink-20",
      "transition-opacity duration-150 active:cursor-grabbing motion-reduce:transition-none",
      "group-data-nested-drawer-open/drawer-popup:opacity-0 group-data-nested-drawer-swiping/drawer-popup:opacity-100",
    ],
    header: ["flex flex-col items-center px-6 pt-8 pb-2 text-center"],
    body: ["flex flex-1 flex-col items-center px-6 pt-4 pb-6 text-center"],
    footer: ["mt-auto px-6 py-5 md:pb-5"],
    actions: [
      "mx-auto flex w-full max-w-none flex-col items-stretch gap-2.5",
      "[&_[data-slot=button]]:w-full",
    ],
    title: ["max-w-sm text-pretty text-center text-2xl leading-8 text-foreground-strong"],
    description: ["max-w-sm text-pretty text-center text-sm leading-5 text-foreground/60"],
  },
  variants: {
    theme: {
      brutal: {
        overlay: ["bg-layer-backdrop"],
        title: ["font-bold"],
        popup: ["border-2 border-line-strong bg-layer-panel text-foreground shadow-brutal-lg"],
      },
      elegant: {
        overlay: ["bg-layer-backdrop backdrop-blur-[2px]"],
        popup: [
          "overflow-clip rounded-lg bg-layer-popover text-foreground shadow-xl md:rounded-xl",
        ],
        header: ["bg-layer-panel px-8 pt-9 pb-2"],
        body: ["bg-layer-panel px-8 pt-4 pb-7"],
        footer: ["mt-0 px-8 py-5"],
        title: ["font-sans text-2xl leading-8 font-semibold text-[oklch(0.22_0_0)]"],
        description: ["font-sans text-sm leading-5 text-[oklch(0.48_0_0)]"],
      },
    },
    side: {
      down: {
        popup: [
          "after:top-full",
          "[--drawer-inset:max(0.75rem,env(safe-area-inset-bottom,0px))] [--drawer-exit-y:calc(100%+var(--drawer-inset)+2px)]",
          "[--drawer-stack-y:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))] [--drawer-transform-origin:50%_100%]",
          "bottom-(--drawer-inset) mt-24 min-h-64 max-h-[82vh]",
        ],
        swipeHandle: ["mt-3"],
      },
      up: {
        popup: [
          "after:bottom-full",
          "[--drawer-inset:max(0.75rem,env(safe-area-inset-top,0px))] [--drawer-exit-y:calc(-100%-var(--drawer-inset)-2px)]",
          "[--drawer-stack-y:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))] [--drawer-transform-origin:50%_0%]",
          "top-(--drawer-inset) mb-24 max-h-[80vh]",
        ],
        swipeHandle: ["order-last mb-3"],
      },
      left: {
        popup: [
          "after:right-full",
          "[--drawer-inset:0.75rem] [--drawer-exit-x:calc(-100%-var(--drawer-inset)-2px)]",
          "[--drawer-stack-x:calc(var(--drawer-stack-offset)+var(--drawer-stack-shrink-offset))] [--drawer-transform-origin:0%_50%]",
          "left-3",
        ],
        swipeHandle: ["order-last mr-3"],
      },
      right: {
        popup: [
          "after:left-full",
          "[--drawer-inset:0.75rem] [--drawer-exit-x:calc(100%+var(--drawer-inset)+2px)]",
          "[--drawer-stack-x:calc(0px-var(--drawer-stack-offset)-var(--drawer-stack-shrink-offset))] [--drawer-transform-origin:100%_50%]",
          "right-3",
        ],
        swipeHandle: ["ml-3"],
      },
    },
    axis: {
      x: {
        popup: [
          "after:inset-y-0 after:w-12",
          "[--drawer-stack-size:100%] [--drawer-swipe-x:var(--drawer-swipe-movement-x)]",
          "flex-row",
          "w-3/4 max-w-sm",
        ],
        swipeHandle: ["my-auto h-12 w-1.5"],
        header: ["flex-row justify-between gap-3 pt-6 text-left"],
        body: ["items-stretch text-left"],
        footer: ["py-4"],
        title: ["min-w-0 max-w-none flex-1 text-left"],
        description: ["max-w-none text-left"],
      },
      y: {
        popup: [
          "after:inset-x-0 after:h-12",
          "[--drawer-stack-size:max(0px,var(--drawer-frontmost-height,var(--drawer-height)))]",
          "[--drawer-swipe-y:calc(var(--drawer-snap-point-offset,0px)+var(--drawer-swipe-movement-y))]",
          "data-nested-drawer-open:h-(--drawer-frontmost-height)",
          "right-3 left-3 mx-auto md:max-w-md",
        ],
        swipeHandle: ["mx-auto h-1.5 w-12"],
      },
    },
    snapPoints: {
      true: {
        overlay: ["[--drawer-overlay-min-opacity:0.5]"],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      axis: "x",
      class: {
        popup: ["inset-y-3 [--drawer-content-height:calc(100dvh-1.5rem)]"],
      },
    },
    {
      theme: "brutal",
      side: "right",
      class: {
        popup: ["right-5 [--drawer-inset:1.25rem]"],
      },
    },
    {
      theme: "brutal",
      side: "down",
      class: {
        popup: ["[--drawer-inset:max(1.25rem,env(safe-area-inset-bottom,0px))]"],
      },
    },
    {
      theme: "elegant",
      axis: "x",
      class: {
        popup: ["inset-y-3 md:max-w-md"],
        header: ["pt-6"],
      },
    },
    {
      axis: "y",
      snapPoints: true,
      class: {
        popup: ["[--drawer-content-height:100dvh]"],
      },
    },
  ],
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
  const parentDrawer = useContext(DrawerContext);
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const nested = parentDrawer != null;
  const swipeAxis: "x" | "y" = swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";
  const contextValue = useMemo(
    () => ({ hasSnapPoints, modal, nested, showSwipeHandle, swipeAxis, swipeDirection }),
    [hasSnapPoints, modal, nested, showSwipeHandle, swipeAxis, swipeDirection],
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
  const { hasSnapPoints } = useDrawer();
  const theme = useThemeFamily();
  const { resolvedMode } = useTheme();
  const { overlay } = drawer({ theme, snapPoints: hasSnapPoints });

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
  const { swipeAxis, swipeDirection } = useDrawer();
  const theme = useThemeFamily();
  const { swipeHandle } = drawer({ theme, side: swipeDirection, axis: swipeAxis });

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
  const { hasSnapPoints, modal, nested, showSwipeHandle, swipeAxis, swipeDirection } = useDrawer();
  const theme = useThemeFamily();
  const { resolvedMode } = useTheme();
  const { content, popup, viewport } = drawer({
    theme,
    side: swipeDirection,
    axis: swipeAxis,
    snapPoints: hasSnapPoints,
  });

  return (
    <DrawerPortal {...portalProps}>
      {!nested && modal === true ? (
        <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} />
      ) : null}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        data-modal={modal}
        className={cn(viewport(), modal === true && "pointer-events-auto")}
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
  const { swipeAxis } = useDrawer();
  const theme = useThemeFamily();
  const { header } = drawer({ theme, axis: swipeAxis });
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
  const { swipeAxis } = useDrawer();
  const theme = useThemeFamily();
  const { footer } = drawer({ theme, axis: swipeAxis });
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
  const { swipeAxis } = useDrawer();
  const theme = useThemeFamily();
  const { body } = drawer({ theme, axis: swipeAxis });
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
  const { swipeAxis } = useDrawer();
  const theme = useThemeFamily();
  const { title } = drawer({ theme, axis: swipeAxis });

  return (
    <DrawerPrimitive.Title data-slot="drawer-title" className={title({ className })} {...props} />
  );
}

export type DrawerDescriptionProps = StyledProps<DrawerPrimitive.Description.Props>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  const { swipeAxis } = useDrawer();
  const theme = useThemeFamily();
  const { description } = drawer({ theme, axis: swipeAxis });

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={description({ className })}
      {...props}
    />
  );
}
