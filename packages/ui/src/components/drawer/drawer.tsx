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

type DrawerConfig = {
  hasSnapPoints: boolean;
  modal: DrawerPrimitive.Root.Props["modal"];
  swipeAxis: "x" | "y";
  swipeDirection: NonNullable<DrawerPrimitive.Root.Props["swipeDirection"]>;
};

const DrawerConfigContext = createContext<DrawerConfig | null>(null);

function useDrawerConfig() {
  const context = useContext(DrawerConfigContext);

  if (!context) {
    throw new Error("Drawer parts must be used within Drawer.");
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
  const swipeAxis: DrawerConfig["swipeAxis"] =
    swipeDirection === "down" || swipeDirection === "up" ? "y" : "x";
  const contextValue = useMemo(
    () => ({ hasSnapPoints, modal, swipeAxis, swipeDirection }),
    [hasSnapPoints, modal, swipeAxis, swipeDirection],
  );

  return (
    <DrawerConfigContext.Provider value={contextValue}>
      <DrawerPrimitive.Root
        modal={modal}
        snapPoints={snapPoints}
        swipeDirection={swipeDirection}
        {...props}
      />
    </DrawerConfigContext.Provider>
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
  const { hasSnapPoints } = useDrawerConfig();
  const theme = useThemeFamily();
  const { overlay } = drawer({ theme, snapPoints: hasSnapPoints });

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={overlay({ className })}
      {...props}
    />
  );
}

function DrawerSwipeHandle() {
  const { swipeAxis, swipeDirection } = useDrawerConfig();
  const theme = useThemeFamily();
  const { swipeHandle } = drawer({ theme, side: swipeDirection, axis: swipeAxis });

  return <div data-slot="drawer-swipe-handle" aria-hidden="true" className={swipeHandle()} />;
}

export type DrawerContentProps = StyledProps<DrawerPrimitive.Popup.Props> & {
  portalProps?: DrawerPortalProps;
};

export function DrawerContent({ className, children, portalProps, ...props }: DrawerContentProps) {
  const { hasSnapPoints, modal, swipeAxis, swipeDirection } = useDrawerConfig();
  const theme = useThemeFamily();
  const { content, popup, viewport } = drawer({
    theme,
    side: swipeDirection,
    axis: swipeAxis,
    snapPoints: hasSnapPoints,
  });

  return (
    <DrawerPortal {...portalProps}>
      {modal === true ? <DrawerOverlay /> : null}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className={cn(viewport(), modal === true && "pointer-events-auto")}
      >
        <DrawerPrimitive.Popup data-slot="drawer-popup" className={popup({ className })} {...props}>
          {hasSnapPoints ? <DrawerSwipeHandle /> : null}
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
  const { close, closeIcon } = drawer({ theme });

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
      className={close({ className })}
      {...props}
    >
      {children ?? <X className={closeIcon()} />}
    </DrawerPrimitive.Close>
  );
}

export type DrawerHeaderProps = useRender.ComponentProps<"div">;

export function DrawerHeader({ className, render, ...props }: DrawerHeaderProps) {
  const { hasSnapPoints, swipeAxis, swipeDirection } = useDrawerConfig();
  const theme = useThemeFamily();
  const { header } = drawer({
    theme,
    side: swipeDirection,
    axis: swipeAxis,
    snapPoints: hasSnapPoints,
  });
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
  const { swipeAxis } = useDrawerConfig();
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
  const { swipeAxis } = useDrawerConfig();
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
  const { swipeAxis } = useDrawerConfig();
  const theme = useThemeFamily();
  const { title } = drawer({ theme, axis: swipeAxis });

  return (
    <DrawerPrimitive.Title data-slot="drawer-title" className={title({ className })} {...props} />
  );
}

export type DrawerDescriptionProps = StyledProps<DrawerPrimitive.Description.Props>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  const { swipeAxis } = useDrawerConfig();
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
