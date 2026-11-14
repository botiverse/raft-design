import { tv } from "../../lib/tv";
import { panelAction } from "./panel-action.recipe";

/**
 * How much wider a `PanelTitleTrigger` is than a `PanelTitle` with the same
 * text, on a desktop (from 768px with a mouse or trackpad): 23px. It is what
 * the trigger adds after the title's last letter: the 4px gap, the 14px
 * chevron and the trigger's end inset, 5px ((`bar-button-size` 28px −
 * `control-icon-size` 18px) / 2). The start inset adds nothing: the trigger
 * pulls itself back by it. A head that measures its title to decide what
 * folds (panel.md, "A head fits its column") adds this to the title's width.
 * On a phone and on a touch screen the end inset is 9.5px, so the figure is
 * 27.5px there. panel-title-trigger.browser.test.tsx measures both.
 */
export const PANEL_TITLE_TRIGGER_EXTRA_WIDTH = 23;

/**
 * A panel action drawn as the panel's title (panel.md, "A title that
 * switches"). `--title-trigger-inset` is how far the title's first letter
 * sits inside the trigger: a text PanelAction's inset, its padding plus its
 * 1.5px border (9.5px on a phone and by touch, 5px on a desktop, which is the
 * bar button's icon inset). The trigger pads by it and pulls its start back
 * by it, so the title starts where a plain PanelTitle does. It has no border
 * of its own: it is never a pressed sticker, and Chromium draws a 1.5px
 * border as 1px at 1x, which would move the title by half a pixel between
 * screens.
 *
 * Under 768px the head is two lines, so the trigger is drawn as tall as the
 * title's line (`1lh`) and its ::after reaches the 44px target above and
 * below. From 768px it has the bar button's height.
 */
export const panelTitleTrigger = tv({
  extend: panelAction,
  base: [
    "max-w-full min-w-0 shrink justify-start gap-1",
    "text-headline",
    "[--title-trigger-inset:calc(--spacing(2)+1.5px)] md:pointer-fine:[--title-trigger-inset:var(--icon-inset)]",
    "border-0 px-(--title-trigger-inset) md:pointer-fine:px-(--title-trigger-inset) -ms-(--title-trigger-inset)",
    "max-md:h-auto",
    "max-md:after:inset-x-0 max-md:after:-inset-y-[calc((var(--control-height)+2*var(--control-hit-inset)-1lh)/2)]",
    "data-popup-open:bg-fill-medium",
    "[&>svg]:size-3.5 [&>svg]:text-foreground-muted",
  ],
});

export const panelTitleTriggerLabel = "min-w-0 truncate";
