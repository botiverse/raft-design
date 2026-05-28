export const SIDEBAR_CONTEXT_MENU_VIEWPORT_MARGIN = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function placeMenuAxis({
  anchor,
  size,
  viewportSize,
  margin,
}: {
  anchor: number;
  size: number;
  viewportSize: number;
  margin: number;
}): number {
  if (anchor + size <= viewportSize - margin) {
    return clamp(anchor, margin, viewportSize - size - margin);
  }

  if (anchor - size >= margin) {
    return anchor - size;
  }

  return clamp(anchor, margin, viewportSize - size - margin);
}

export function placeSidebarContextMenu({
  x,
  y,
  menuWidth,
  menuHeight,
  viewportWidth,
  viewportHeight,
  margin = SIDEBAR_CONTEXT_MENU_VIEWPORT_MARGIN,
}: {
  x: number;
  y: number;
  menuWidth: number;
  menuHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  margin?: number;
}) {
  return {
    x: placeMenuAxis({ anchor: x, size: menuWidth, viewportSize: viewportWidth, margin }),
    y: placeMenuAxis({ anchor: y, size: menuHeight, viewportSize: viewportHeight, margin }),
  };
}
