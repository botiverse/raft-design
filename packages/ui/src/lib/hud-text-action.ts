// A text action on the HUD (a toast's action, a mode bar's Done): bold type in
// the HUD ink that underlines on hover (design/foundations/states.md#clickable-text),
// a pressed veil on a hit area larger than the word (44px tall on a 20px line),
// and the HUD ink as its focus outline. A button's fill and focus ring would
// not read on the dark surface.
export const hudTextAction = [
  "font-sans text-callout font-bold text-foreground-on-hud",
  "decoration-[1.5px] underline-offset-[3px] not-disabled:not-aria-disabled:hover:underline",
  "after:absolute after:-inset-x-2 after:-inset-y-3 after:rounded-control after:content-['']",
  "active:after:bg-foreground-on-hud/15",
  "outline-1 outline-offset-2 outline-transparent focus-visible:keyboard:outline-2 focus-visible:keyboard:outline-foreground-on-hud",
];
