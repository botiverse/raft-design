import {
  FLOATING_OVERLAY_VIEWPORT_PADDING,
  getFloatingOverlayViewport,
  placeFloatingOverlay,
  type FloatingOverlayViewport,
} from "../ui/floatingOverlayPosition";

export const MESSAGE_CONTEXT_MENU_WIDTH = 200;
export const MESSAGE_CONTEXT_MENU_HEIGHT = 224;
export const MESSAGE_CONTEXT_MENU_VIEWPORT_MARGIN = FLOATING_OVERLAY_VIEWPORT_PADDING;

export interface MessageContextMenuPosition {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  source: "pointer" | "touch";
}

export function placeTouchMessageContextMenu({
  x,
  y,
  viewport = getFloatingOverlayViewport(),
}: {
  x: number;
  y: number;
  viewport?: FloatingOverlayViewport;
}): MessageContextMenuPosition {
  const position = placeFloatingOverlay({
    anchor: { x, y },
    floatingSize: {
      width: MESSAGE_CONTEXT_MENU_WIDTH,
      height: MESSAGE_CONTEXT_MENU_HEIGHT,
    },
    viewport,
    padding: MESSAGE_CONTEXT_MENU_VIEWPORT_MARGIN,
  });

  return {
    anchorX: x,
    anchorY: y,
    x: position.x,
    y: position.y,
    source: "touch",
  };
}
