/**
 * The attribute on the portal container of every raft-ui overlay: Popover,
 * DropdownMenu, ContextMenu, Select, Combobox, ComboboxSelect, Tooltip,
 * PreviewCard, NotificationCenter, Dialog, AlertDialog, Drawer, Lightbox and
 * Toast. Each `…Portal` part sets it, so an overlay opened from inside another
 * (portaled into that one's container) is inside both.
 */
export const OVERLAY_PORTAL_ATTRIBUTE = "data-raft-ui-overlay";

const OVERLAY_SELECTOR = `[${OVERLAY_PORTAL_ATTRIBUTE}]`;

/**
 * Whether `node` is inside a raft-ui overlay: a popover, menu, select list,
 * tooltip, preview card, dialog, drawer, lightbox or toast, rendered through
 * its portal (the default). Use it where a page's own handler must leave
 * events from an overlay alone, such as a shortcut on the page, a press
 * outside a region that closes it, or a drag that starts in a row: an
 * overlay's content is portaled out of the tree it was opened from, so
 * `region.contains(target)` is false for it even when it belongs to the
 * region. `null` (an event with no target, `document.activeElement` before
 * anything is focused) is outside. A text node counts by its parent element.
 *
 * Read this instead of Base UI's own `[data-base-ui-portal]`, which is
 * internal: raft-ui marks its portals itself, with `data-raft-ui-overlay`.
 * An overlay rendered in place (`container` set to an element of the page)
 * is inside its portal container all the same; a portal of the app's own
 * (`createPortal`) or `DragLift`'s copy is not an overlay.
 */
export function isInsideOverlay(node: Node | null): boolean {
  if (!node) return false;
  const element = node.nodeType === 1 ? (node as Element) : node.parentElement;
  return element?.closest(OVERLAY_SELECTOR) != null;
}
