import { createContext, useContext } from "react";

// Where raft-ui's popups portal to when their caller names no container.
// undefined: no surface provides one, so Base UI's own default holds (the
// portal of the popup they were opened from, else the body). null: a surface
// provides one whose element has not mounted yet; Base UI waits for it.
const PortalContainerContext = createContext<HTMLElement | null | undefined>(undefined);

/**
 * Makes `container` the portal container of every raft-ui popup rendered
 * under it (Tooltip, Popover, the menus, Select, Combobox, PreviewCard,
 * Dialog, AlertDialog, Drawer). A surface drawn above the page's own popups
 * (Lightbox, `z-70`) provides itself, so what opens from inside it is drawn
 * in its stacking context, above it, instead of under it on the body.
 *
 * Each popup's own `container` prop could do this, but only if every popup
 * inside a lightbox passed it, and one that didn't would be drawn under the
 * scrim with a press on it closing the lightbox. Base UI's own default, the
 * portal of the popup it was opened from, puts it in the lightbox's portal but
 * still at its own `z-50`, under the lightbox's `z-70`. So the surface
 * provides the container once, and a `container` a caller passes still wins.
 */
export const PortalContainerProvider = PortalContainerContext.Provider;

/**
 * The portal container the nearest surface provides: undefined outside any,
 * null until its element mounts.
 */
export function usePortalContainer(): HTMLElement | null | undefined {
  return useContext(PortalContainerContext);
}

/**
 * A portal's props with the provided container filled in. A `container` the
 * caller passes (an element, a ref, or `null`) wins as it is.
 */
export function usePortalContainerProps<Props extends { container?: unknown }>(
  props: Props,
): Props {
  const container = useContext(PortalContainerContext);
  if (container === undefined || props.container !== undefined) return props;
  return { ...props, container };
}
