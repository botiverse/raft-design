import { tv } from "../../lib/tv";
import { panelAction, panelToggleAction } from "./panel-action.recipe";

/**
 * A split action reads as one control: the group is one rounded shape, and
 * whichever part is under the pointer takes the medium tier (`fill-medium`)
 * while the other part takes the subtle tier (`fill-subtle`). The coupling is
 * `group-hover` on the root, which only hovers through a part (the root lets
 * the pointer through, so a disabled part, which takes no pointer, hovers
 * nothing). A part's resting fill is a custom property: the menu reads the
 * main part's pressed state through a sibling selector, the main part reads
 * the open menu through a has-selector on the root itself (packages/ui/CLAUDE.md,
 * Selector Cost), so a hover, a press, a selection or a disabled state on the
 * part itself always wins over the tint.
 */
export const panelSplitAction = tv({
  base: [
    "group/split-action relative inline-flex shrink-0 items-center",
    "rounded-control pointer-events-none",
    "has-[>[data-popup-open]]:[--split-action-main-tint:var(--fill-subtle)]",
  ],
});

const splitActionMainParts = [
  "pointer-events-auto rounded-e-none",
  "after:end-0",
  "bg-(--split-action-main-tint,transparent) group-hover/split-action:bg-fill-subtle hover:bg-fill-medium active:bg-fill-medium",
];

export const panelSplitActionMain = tv({
  extend: panelAction,
  base: splitActionMainParts,
});

export const panelSplitActionToggleMain = tv({
  extend: panelToggleAction,
  base: splitActionMainParts,
});

export const panelSplitActionMenu = tv({
  extend: panelAction,
  base: [
    "pointer-events-auto min-w-0 rounded-s-none px-0",
    "w-6 me-5 md:pointer-fine:w-5 md:pointer-fine:me-0",
    "after:start-0 after:inset-e-[-21.5px] md:pointer-fine:after:-end-control-hit",
    "[[data-slot=panel-split-action-main][data-pressed]~&]:[--split-action-menu-tint:var(--fill-subtle)]",
    "[[data-slot=panel-split-action-main][aria-pressed=true]~&]:[--split-action-menu-tint:var(--fill-subtle)]",
    "bg-(--split-action-menu-tint,transparent) group-hover/split-action:bg-fill-subtle hover:bg-fill-medium active:bg-fill-medium data-popup-open:bg-fill-medium",
    "[&>svg]:size-4",
  ],
});
