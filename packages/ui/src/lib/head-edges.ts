/**
 * The ends of a header (design/foundations/alignment.md#the-ends-of-a-header).
 *
 * A head pads both sides by its column's content margin, so a shape (a
 * sticker, a filled button) and text land on the margin as they are. A
 * frameless icon button declares how far its icon box sits inside its edge,
 * `--icon-inset` = (button - icon) / 2, and the head pulls its first and last
 * child outward by that much: the icon box lands on the margin and the
 * button's empty hit area hangs past it, toward the edge. The two ends mirror,
 * and the line holds at every button size (32px with an 18px icon on a
 * desktop, 44px with a 22px icon on a phone and a touch screen) without a
 * number per size or per breakpoint. A title, a sticker or a filled button
 * declares no inset and stays on the margin.
 *
 * An element that declares an inset also carries `data-icon-inset`, which
 * anchors the head's `:first-child` / `:last-child` (packages/ui/CLAUDE.md,
 * Selector Cost). A group of actions declares its buttons' inset itself, so
 * the pull holds when its last action is hidden at some width.
 */

/** The pull alone, for a head whose padding is already its margin (a dialog's 20px). */
export const headEdgePull = [
  "[&>[data-icon-inset]:first-child]:-ml-icon-inset",
  "[&>[data-icon-inset]:last-child]:-mr-icon-inset",
];

/** A panel's head: the margin, 20px on a desktop and 16px on a phone, and the pull. */
export const headEdges = ["px-5 max-md:px-4", ...headEdgePull];

/**
 * The inset of a control-height icon button (a PanelAction, a Button at
 * `icon-lg`): 7px on a desktop, 11px on a phone and on a touch screen. Written
 * as the arithmetic so it follows the control tokens wherever they switch.
 */
export const controlIconInset =
  "[--icon-inset:calc((var(--control-height)-var(--control-icon-size))/2)]";
