import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import { cn } from "../../lib/cn";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button, type ButtonProps } from "../button/index";
import { drawer } from "./drawer.recipe";

type DrawerContentConfig = {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
};

const DrawerContentConfigContext = createContext<DrawerContentConfig | null>(null);

function useDrawerContentConfig() {
  const context = useContext(DrawerContentConfigContext);

  if (!context) {
    throw new Error("DrawerContent must be used within Drawer.");
  }

  return context;
}

export type DrawerProps = DrawerPrimitive.Root.Props;

export function Drawer({
  modal = true,
  snapPoints,
  swipeDirection = "down",
  ...props
}: DrawerProps) {
  const hasSnapPoints = snapPoints != null && snapPoints.length > 0;
  const contextValue = useMemo(() => ({ hasSnapPoints, modal }), [hasSnapPoints, modal]);

  return (
    <DrawerContentConfigContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerContentConfigContext.Provider>
  );
}

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props;

export function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

export type DrawerPortalProps = DrawerPrimitive.Portal.Props;

export function DrawerPortal(props: DrawerPortalProps) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...useThemeScopeProps(props)} />;
}

export type DrawerOverlayProps = StyledProps<DrawerPrimitive.Backdrop.Props>;

export function DrawerOverlay({ className, ...props }: DrawerOverlayProps) {
  const theme = useThemeFamily();
  const { overlay } = drawer({ theme });

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={overlay({ className })}
      {...props}
    />
  );
}

function DrawerSwipeHandle() {
  const theme = useThemeFamily();
  const { swipeHandle } = drawer({ theme });

  return <div data-slot="drawer-swipe-handle" aria-hidden="true" className={swipeHandle()} />;
}

export type DrawerContentProps = StyledProps<DrawerPrimitive.Popup.Props> & {
  portalProps?: DrawerPortalProps;
};

export function DrawerContent({ className, children, portalProps, ...props }: DrawerContentProps) {
  const { hasSnapPoints, modal } = useDrawerContentConfig();
  const theme = useThemeFamily();
  const { content, popup, viewport } = drawer({ theme });

  return (
    <DrawerPortal {...portalProps}>
      {modal === true ? <DrawerOverlay data-snap-points={hasSnapPoints ? "" : undefined} /> : null}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className={cn(viewport(), modal === true && "pointer-events-auto")}
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-popup"
          data-snap-points={hasSnapPoints ? "" : undefined}
          className={popup({ className })}
          {...props}
        >
          <DrawerSwipeHandle />
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
