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

/**
 * A panel's head: its column's margin, and the pull. The margin is
 * `--column-margin` (styles.css): 20px on a desktop and 16px on a phone,
 * and 20px at every width in a column of list cells, whose rows put their
 * content 8 + 12 = 20px in (lib/list-cell.ts). The column sets it (an
 * ActivityInboxPanel, a SidebarRoot, a Search frame), so its head, its
 * toolbar and its rows start on one line on a phone as on a desktop.
 */
export const headEdges = ["px-(--column-margin)", ...headEdgePull];

/**
 * Sets a column of list cells' margin to 20px at every width: the rows'
 * content edge (lib/list-cell.ts), which the heads and notices in it follow.
 */
export const listColumnMargin = "[--column-margin:20px]";

/**
 * The inset of a control-height icon button (a PanelAction, a Button at
 * `icon-lg`): 7px on a desktop, 11px on a phone and on a touch screen. Written
 * as the arithmetic so it follows the control tokens wherever they switch.
 */
export const controlIconInset =
  "[--icon-inset:calc((var(--control-height)-var(--control-icon-size))/2)]";
