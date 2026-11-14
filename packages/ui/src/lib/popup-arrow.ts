/**
 * A popup's arrow: an 8px square turned 45°, half over the panel's edge that
 * faces the trigger, with the seam on its two outer edges. inline-start and
 * inline-end follow the writing direction. Shared with PreviewCardArrow.
 */
export const popupArrowClasses = [
  "size-2 rotate-45",
  "border-line-seam bg-layer-popover",
  "data-[side=bottom]:-top-1 data-[side=bottom]:border-t data-[side=bottom]:border-l",
  "data-[side=top]:-bottom-1 data-[side=top]:border-r data-[side=top]:border-b",
  "data-[side=left]:-right-1 data-[side=left]:border-t data-[side=left]:border-r",
  "data-[side=right]:-left-1 data-[side=right]:border-b data-[side=right]:border-l",
  "data-[side=inline-start]:-end-1 data-[side=inline-start]:ltr:border-t data-[side=inline-start]:ltr:border-r data-[side=inline-start]:rtl:border-b data-[side=inline-start]:rtl:border-l",
  "data-[side=inline-end]:-start-1 data-[side=inline-end]:ltr:border-b data-[side=inline-end]:ltr:border-l data-[side=inline-end]:rtl:border-t data-[side=inline-end]:rtl:border-r",
];
