import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { X } from "lucide-react";
import { createContext, useContext, useMemo } from "react";
import { cn } from "../../lib/cn";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Button } from "../button/index";
import { DialogSheetReset } from "../dialog/dialog-sheet-context";
import type { ButtonProps } from "../button/index";
import { drawer } from "./drawer.recipe";
import { useParentOverlayKind, withOverlayLayer } from "../../lib/overlay-depth";

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
  children,
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
      >
        {withOverlayLayer("drawer", modal === true, children)}
      </DrawerPrimitive.Root>
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
  // A sheet opened from a dialog draws its own, lighter scrim over the dialog.
  // A sheet opened from a sheet keeps Base UI's nesting instead: no scrim of
  // its own, and the sheet below steps back (Elevation › Stacked overlays).
  const nested = useParentOverlayKind() === "dialog";
  const { overlay } = drawer({ snapPoints: hasSnapPoints, nested });

  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      data-nested={nested ? "" : undefined}
      forceRender={nested}
      className={overlay({ className })}
      {...props}
    />
  );
}

function DrawerSwipeHandle() {
  const { swipeAxis, swipeDirection } = useDrawerConfig();
  const { swipeHandle } = drawer({ side: swipeDirection, axis: swipeAxis });

  return <div data-slot="drawer-swipe-handle" aria-hidden="true" className={swipeHandle()} />;
}

export type DrawerContentProps = StyledProps<DrawerPrimitive.Popup.Props> & {
  portalProps?: DrawerPortalProps;
};

export function DrawerContent({ className, children, portalProps, ...props }: DrawerContentProps) {
  const { hasSnapPoints, modal, swipeAxis, swipeDirection } = useDrawerConfig();
  const { content, popup, viewport } = drawer({
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
            <DialogSheetReset>{children}</DialogSheetReset>
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
  "aria-label": ariaLabel,
  ...props
}: DrawerCloseProps) {
  const { close, closeIcon } = drawer();

  if (render) {
    return (
      <DrawerPrimitive.Close
        data-slot="drawer-close"
        className={className}
        render={render}
        aria-label={ariaLabel}
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
          variant={variant ?? "ghost"}
          size={size ?? "icon-lg"}
          aria-label={ariaLabel ?? "Close"}
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
  const { header } = drawer({
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
  const { footer } = drawer({ axis: swipeAxis });
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
  const { body } = drawer({ axis: swipeAxis });
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
  const swipeAxis = useContext(DrawerConfigContext)?.swipeAxis;
  const { actions } = drawer({ axis: swipeAxis });
  // Stacked full width unless the drawer comes from a side: `data-stacked`
  // gives a ghost Cancel its frame there, as in a stacked dialog footer.
  const defaultProps: useRender.ElementProps<"div"> & { "data-stacked"?: "" } = {
    className: actions({ className }),
    "data-stacked": swipeAxis === "x" ? undefined : "",
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
  const { title } = drawer({ axis: swipeAxis });

  return (
    <DrawerPrimitive.Title data-slot="drawer-title" className={title({ className })} {...props} />
  );
}

export type DrawerDescriptionProps = StyledProps<DrawerPrimitive.Description.Props>;

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  const { swipeAxis } = useDrawerConfig();
  const { description } = drawer({ axis: swipeAxis });

  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={description({ className })}
      {...props}
    />
  );
}
