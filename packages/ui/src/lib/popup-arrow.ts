/**
 * A popup's arrow: an 8px square turned 45°, half over the panel's edge that
 * faces the trigger, with the seam on its two outer edges. Shared with
 * PreviewCardArrow.
 *
 * inline-start and inline-end are drawn by `data-dir`, the direction Base UI
 * placed the panel by (its DirectionProvider, `ltr` without one), not by the
 * page's `dir`: where the two disagree, the arrow still faces the trigger.
 */
export const popupArrowClasses = [
  "size-2 rotate-45",
  "border-line-seam bg-layer-popover",
  "data-[side=bottom]:-top-1 data-[side=bottom]:border-t data-[side=bottom]:border-l",
  "data-[side=top]:-bottom-1 data-[side=top]:border-r data-[side=top]:border-b",
  "data-[side=left]:-right-1 data-[side=left]:border-t data-[side=left]:border-r",
  "data-[side=right]:-left-1 data-[side=right]:border-b data-[side=right]:border-l",
  "data-[side=inline-start]:data-[dir=ltr]:-right-1 data-[side=inline-start]:data-[dir=ltr]:border-t data-[side=inline-start]:data-[dir=ltr]:border-r",
  "data-[side=inline-start]:data-[dir=rtl]:-left-1 data-[side=inline-start]:data-[dir=rtl]:border-b data-[side=inline-start]:data-[dir=rtl]:border-l",
  "data-[side=inline-end]:data-[dir=ltr]:-left-1 data-[side=inline-end]:data-[dir=ltr]:border-b data-[side=inline-end]:data-[dir=ltr]:border-l",
  "data-[side=inline-end]:data-[dir=rtl]:-right-1 data-[side=inline-end]:data-[dir=rtl]:border-t data-[side=inline-end]:data-[dir=rtl]:border-r",
];
