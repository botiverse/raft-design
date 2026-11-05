import { tv } from "../../lib/tv";

export const sidebarSectionRecipe = tv({
  slots: {
    sidebarSection: ["group/section", "px-0"],
    sidebarList: ["flex flex-col gap-0.5 py-2"],
    sidebarSectionEmpty: [
      "px-5 md:pointer-fine:px-(--page-inset) py-2",
      "font-sans text-footnote",
      "text-foreground-hint",
    ],
    sidebarSectionHeader: [
      "flex items-center justify-between",
      "group/section-header",
      "my-0 h-auto gap-2 pt-4 pb-0 pl-5",
      // A scroller that shows a classic scrollbar publishes its width as
      // --scrollbar-size (useScrollbarSize), and the rows give it back from
      // their end inset (lib/list-cell.ts). The header gives back the same, so
      // its controls end on the rows' content edge, 20px from the sidebar's
      // outer edge, and don't move left when the scrollbar appears.
      "pr-[calc(max(0px,calc(8px-var(--scrollbar-size,0px)))+12px)]",
      // With a mouse on a desktop the header is the rows' frame, so it sits
      // outside their content: 12px from the sidebar's edges (4px inside the
      // rows' 8px state shape) instead of the rows' 20px, its chevron and
      // its last control's icon box on that line (stdrc, 2026-11-04).
      "md:pointer-fine:pl-2 md:pointer-fine:pr-[calc(max(0px,calc(8px-var(--scrollbar-size,0px))))]",
      // On a touch screen the controls' 44px hit area hangs 14px under the
      // 16px line: 6px more here plus the list's 8px keep it off the first row.
      "not-pointer-fine:pb-1.5",
    ],
    sidebarSectionDisclosure: [
      "flex min-w-0 flex-1 items-center",
      "**:data-[slot=sidebar-section-chevron]:transition-transform",
      "[&[data-panel-open]_[data-slot=sidebar-section-chevron]]:rotate-90",
      "h-auto gap-1.5 rounded-sticker border-0",
      "font-sans text-footnote font-bold normal-case tracking-normal text-foreground-hint",
      "outline-none focus-visible:shadow-focus",
      "**:data-[slot=sidebar-section-chevron]:size-3.5 **:data-[slot=sidebar-section-chevron]:stroke-2",
    ],
    sidebarSectionTitle: ["min-w-0 truncate"],
    sidebarSectionCount: ["font-mono text-mono-meta font-normal tabular-nums text-foreground-hint"],
    sidebarSectionAttention: [
      "inline-flex min-w-4.5 shrink-0 items-center justify-center",
      // Two of these used to style descendants off an ancestor's `:has()`.
      // That shape makes Chromium fall back to recalculating the whole page on
      // unrelated mutations (measured on the app: ~55ms per text-node change in
      // a 300-message channel, see #386). They now key off render-time data
      // attributes instead: the root carries `data-open` from Base UI
      // Collapsible, and a header that hosts a popup mirrors `data-popup-open`
      // onto itself while it is open.
      // A collapsed section shows it beside its controls, which are always
      // shown, so it no longer hides on hover or while a menu is open: that
      // moved the controls sideways.
      "group-data-open/section:hidden",
    ],
    sidebarSectionTrailing: ["relative flex min-w-4.5 shrink-0 items-center justify-end"],
    sidebarSectionControls: [
      // 4px apart at every input, as they were before 2026-10-31: on a touch
      // screen a 20px gap read as two separate buttons (stdrc). Their hit
      // areas meet in the middle of the gap instead (sidebarSectionControl).
      "flex shrink-0 items-center gap-1",
      // Always shown, with a mouse too: stdrc asked for their color and size,
      // and showing them only on hover (2026-10-31) hid what the header can
      // do and moved the title's room around (stdrc, 2026-11-02).
      // The ends of a header (design/foundations/alignment.md): the last
      // control's icon box, not its button, ends on the header's line, and its
      // empty 5px hangs outward, mirroring the chevron at the start. "Last"
      // skips what Base UI inserts beside an open menu's trigger, its focus
      // guards and its portal's hidden `aria-owns` span: with them the plain
      // :last-child dropped the pull and moved the trigger 5px left while its
      // menu was open (stdrc, 2026-11-02; measured 305 to 300px).
      "[&>[data-icon-inset]:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:-mr-icon-inset",
    ],
    // 24px with a 14px icon, a step above the 12px bold title it sits
    // beside, so the header still reads as a title and not as a row of
    // buttons; it overhangs the 16px header line instead of making it taller.
    sidebarSectionControl: [
      "relative flex h-6 w-auto min-w-6 shrink-0 items-center justify-center p-0 -my-1",
      // A Button underneath: with a mouse its md / icon-md step is the 34px
      // control height, which must not reach this 24px label control.
      "md:pointer-fine:size-auto md:pointer-fine:h-6 md:pointer-fine:min-w-6",
      // Button wraps its children in a content span, so the glyph is reached
      // as a descendant; the same selector as Button's 18px icon size, so
      // tailwind-merge lets this one replace it.
      "[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
      "[--icon-inset:calc((--spacing(6)-14px)/2)]",
      // A label's control, not a toolbar's: at rest in the title's hint
      // color, so the header reads as one label; the control under the
      // pointer, in keyboard focus or with its menu open turns body color on
      // the ghost fill, so you see which one you are about to use.
      "text-foreground-hint",
      "hover:text-foreground active:text-foreground focus-visible:text-foreground",
      "data-popup-open:bg-fill-medium data-popup-open:text-foreground",
      // A touch screen shows the controls at rest: a transparent ::after takes
      // the 24px drawing to 44px high and 10px further out at the row's ends
      // (accessibility.md, Touch targets). Between two controls it reaches
      // only the middle of their 4px gap, so the areas meet without
      // overlapping and a tap there has one owner. It is placed from inside
      // the 1px border, so 11px, not 10, and 3px into the gap.
      "not-pointer-fine:after:absolute not-pointer-fine:after:inset-[-11px] not-pointer-fine:after:content-['']",
      // With a mouse the 24px drawing still answers a 28px target, a bar
      // button's (the desktop's smallest target), through the same ::after.
      "pointer-fine:after:absolute pointer-fine:after:inset-[-3px] pointer-fine:after:content-['']",
      "not-pointer-fine:not-first:after:left-[-3px] not-pointer-fine:not-last:after:right-[-3px]",
    ],
  },
});
