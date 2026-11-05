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

/** The pull alone, for a head whose padding is already its margin (a dialog's surface inset). */
export const headEdgePull = [
  "[&>[data-icon-inset]:nth-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:-ml-icon-inset",
  "[&>[data-icon-inset]:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:-mr-icon-inset",
];

/**
 * A panel's head: its column's margin, and the pull. The margin is
 * `--column-margin` (styles.css): 16px on a phone, 20px from 768px by touch
 * and 16px with a mouse; in a column of list cells 20px at every width by
 * touch, whose rows put their content 8 + 12 = 20px in, and 16px with a mouse
 * (8 + 8; lib/list-cell.ts). The column sets it (an
 * ActivityInboxPanel, a SidebarRoot, a Search frame), so its head, its
 * toolbar and its rows start on one line on a phone as on a desktop.
 */
export const headEdges = ["px-(--column-margin)", ...headEdgePull];

/**
 * Sets a column of list cells' margin to the rows' content edge (lib/list-cell.ts):
 * 20px at every width by touch, the 16px page inset with a mouse. The heads
 * and notices in it follow.
 */
export const listColumnMargin =
  "[--column-margin:20px] md:pointer-fine:[--column-margin:var(--page-inset)]";

/**
 * The inset of a control-height icon button (a PanelAction, a Button at
 * `icon-lg`): 7px on a desktop, 11px on a phone and on a touch screen. Written
 * as the arithmetic so it follows the control tokens wherever they switch.
 */
export const controlIconInset =
  "[--icon-inset:calc((var(--control-height)-var(--control-icon-size))/2)]";

/**
 * The inset of a bar button (a PanelAction, a head's x, a composer icon):
 * the same arithmetic on `bar-button-size`, which is the control height
 * until a bar sets its own step.
 */
export const barIconInset =
  "[--icon-inset:calc((var(--bar-button-size)-var(--control-icon-size))/2)]";

/**
 * A bar button's hit area: past each side by what it lacks of a 44px
 * control target (the control height plus its hit inset), plus the 1.5px
 * border an overhanging ::after is measured from.
 */
export const barButtonHit =
  "after:absolute after:-inset-[calc((var(--control-height)+2*var(--control-hit-inset)-var(--bar-button-size))/2+1.5px)]";

/** A Button drawn as a bar button: the size, the corner, the hit area and the inset. */
export const barButton = [
  "size-(--bar-button-size) rounded-(--bar-button-radius)",
  barButtonHit,
  barIconInset,
];

/**
 * The same from 768px with a mouse or trackpad only, for a bar button that is
 * a 32px `icon-md` on a phone (a dialog's x, the composer's icons): its size,
 * corner, hit area and inset.
 */
export const barButtonDesktop = [
  "md:pointer-fine:size-(--bar-button-size) md:pointer-fine:rounded-(--bar-button-radius)",
  "md:pointer-fine:after:-inset-[calc((var(--control-height)+2*var(--control-hit-inset)-var(--bar-button-size))/2+1.5px)]",
  "md:pointer-fine:[--icon-inset:calc((var(--bar-button-size)-var(--control-icon-size))/2)]",
];
