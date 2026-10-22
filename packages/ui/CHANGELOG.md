## [0.20.1](https://github.com/botiverse/raft-design/compare/v0.20.0...v0.20.1) (2026-10-22)

### Design System

- **A mark that leads text**: an icon or status light that starts a line of text is centred on the first line of that text and stays there when the text wraps or a description follows. Only the place is shared; each component keeps its own icon size and gap. A status light beside text is always 9px. It applies to Banner, PanelNotice, ToastIcon, MessageActionCardNotice, Badge and PanelActivity. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: each component placed its mark with its own fixed offset, which held for one type size and drifted at the next; one rule, the line box centre (the cap-height centre in Space Grotesk), now places every mark.
  - Affects: offset `(1lh - size) / 2` on the row's own type; status light 9px with a 1.5px ink edge.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text
- **Popups stay on their trigger**: when the window or a pane scrolls under an open popup, the popup moves with the element that opened it. A context menu stays with the point where it was opened. ([#669](https://github.com/botiverse/raft-design/pull/669))
  - Why: popups stayed where they opened while the page scrolled, pointing at whatever had scrolled into place; see Popups under Fixed.
  - Docs: https://raft-design.botiverse.build/foundations/elevation/#popups

### Added

- **`lead-icon`** and **`lead-dot`** utilities: centre an icon (`lead-icon`) or a `Status` light (`lead-dot`) you place yourself on the first line of the text beside it. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: a mark placed outside the components above had no way to follow the same rule except a hand-tuned margin.
  - Affects: `lead-dot` sizes the light 9px with a 1.5px edge, so don't pass the `Status` a `size`. Both read `1lh`, so put the text's type on the row that holds the mark and the text.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text

### Changed

- **Status** in Banner, PanelNotice, ToastIcon, Badge and PanelActivity: held at 9px, centred on the first line, whatever `size` it was given. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: the same light showed at different sizes in a toast, a banner and a chip; a light beside text has one size, 9px, the least colour that tells green from yellow from orange, plus its ink edges.
  - Affects: a `Status` passed `xs` (6px), `sm` (8px) or `lg` (11px) in these components renders 9px; the `xs` edge 1px → 1.5px. The default `md` is unchanged, as are icon sizes and gaps.
  - Docs: https://raft-design.botiverse.build/components/status/#sizes

### Fixed

- **PanelNotice**: a leading status light or icon is centred on the first line of the notice's text. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: the light sat 6.5px and the icon 3px above the first line; the notice now follows A mark that leads text.
  - Affects: icon size and gap are unchanged (your icon's size, 10px before the text).
  - Docs: https://raft-design.botiverse.build/components/panel/
- **Popups**: SelectContent, ComboboxContent, PopoverContent, PreviewCardContent and NotificationCenterPopup follow their trigger while the window or a scrolling pane moves. ([#669](https://github.com/botiverse/raft-design/pull/669))
  - Why: these wrappers turned anchor tracking off by default, so an open popup kept its opening position and drifted off its trigger as soon as anything scrolled; they now leave it to Base UI's default.
  - Affects: `disableAnchorTracking` default `true` → unset (Base UI's default, tracking on), ContextMenuContent drops its `true` default too and still stays at the point where it was opened; DropdownMenuContent and TooltipContent already tracked. Pass `disableAnchorTracking` to turn it off for one popup. Select still turns tracking off with `alignItemWithTrigger`.
  - Docs: https://raft-design.botiverse.build/foundations/elevation/#popups

## [0.20.0](https://github.com/botiverse/raft-design/compare/v0.19.0...v0.20.0) (2026-10-22)

### Design System

- **Hover and press**: hover and press are one translucent ink layer over the resting colour, never a fill swap, in two tiers sized by what is under the pointer. Subtle for rows, messages, readable cards and a row whose menu is open; medium for small controls and for pressing anything clickable. A colour sticker and the frame get their own medium alphas. Selected items and fields don't hover, a message has no press, and every hover sits under `(hover: hover)`. It applies to every row, card, button, badge, tab, segment, sidebar and rail item, table row, inbox item and menu. ([#681](https://github.com/botiverse/raft-design/pull/681))
  - Why: the same hover looked different on paper, the sidebar and a card, rows and messages used three different steps, and some clickable parts gave no feedback on press; one layer in two tiers reads the same everywhere.
  - Affects: subtle `fill-subtle` 4% light / 3% dark; medium `fill-medium` 7.8% light / 6.5% dark (was 7.8%); `sticker-medium` 10% (was 12.2%); `fill-frame-medium` 10% light (was 12.2%) / 6% dark (was 7.8%); dark `brand-soft` 16% → 20%; colour `-hover` / `-active` pairs mix 10% ink (was 12%).
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press
- **Inside a frame**: a control embedded in another component's frame (a field, the composer, a toolbar, a card or media corner) wears `radius-chip` (6px) and sits the same distance from every side of the frame and from its siblings; frames themselves don't change. It applies to ComboboxSelect, Combobox, InputGroup, the composer, the message hover and text-selection toolbars, the lightbox and multi-select bars, CodeBlock, media and file card actions, popover close, menus and SegmentedControl / ToggleGroup. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: embedded buttons at the free-standing 8px corner read nearly round at 20px, and their offsets differed per component; one corner and one even inset make them read as one kind of thing.
  - Affects: new tokens `control-embedded-inset` 6px and `control-embedded-size` 20px desktop / 32px phone (utilities `embedded-inset`, `control-embedded`); insets 6px in a field, the composer and a corner, 4px in a floating toolbar and for a popup's highlight, 3px between segments.
  - Docs: https://raft-design.botiverse.build/foundations/shape/#inside-a-frame

### Breaking Changes

- **Dialog** `size`: `sm` is 400px (was 384) and `lg` is 640px (was 512); `md` 448 and `wide` 896 are unchanged. Sizes are chosen by content: `sm` for a decision, `md` for a small task, `lg` for content that needs width. ([#676](https://github.com/botiverse/raft-design/pull/676))
  - Why: the steps between sizes were too small to mean anything, and a confirmation could be 384 or 400 wide depending on the component; now every confirmation is 400, the same as AlertDialog.
  - Affects: `sm` `max-w-sm` (384px) → 400px; `lg` `max-w-lg` (512px) → 640px.
  - Migrate: dialogs with `size="sm"` grow 16px and `size="lg"` 128px; check their content and pick the size by content. Set width with `size` only, not your own `max-w-*`.
  - Docs: https://raft-design.botiverse.build/components/dialog/#variants
- **Hover tokens**: renamed to their tier. The old names stay as deprecated aliases until 1.0, but they now resolve to the tier values, so some hovers change. ([#681](https://github.com/botiverse/raft-design/pull/681))
  - Why: names that said where a fill was used (row hover, message hover, row open, pressed) could not describe two tiers that apply everywhere.
  - Affects: `fill-row-hover`, `fill-row-open`, `fill-message-hover` → `fill-subtle` (row open 5% → 4%, message hover 3% → 4%); `fill-pressed` → `fill-medium`; `fill-frame-pressed` → `fill-frame-medium`; `sticker-pressed` → `sticker-medium`; utilities `row-hover-overlay`, `row-open-overlay` → `overlay-subtle`, `press-overlay` → `overlay-medium`, `press-overlay-sticker` → `overlay-sticker-medium`. Overlays are registered with the `cn` helper as background images, so a later `hover:bg-none` or another tier replaces them.
  - Migrate: run `node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <paths>`; it renames classes, `var(--…)` and `var(--color-…)` forms. Then move readable cards that used `press-overlay` for hover to `overlay-subtle`. Tests that assert a token name in a class (for example `var(--fill-row-open)` on a message) look for the new name.
  - Docs: https://raft-design.botiverse.build/foundations/color/#hover-overlays
- **MessageItemToolbar** and **MessageTextSelectionToolbar**: 36px tall (was 32), buttons 4px from the frame and 4px apart (was 2px), at `radius-chip`. The hover toolbar rides 18px above the row (was 16). ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: at a 2px inset the buttons' hover fill nearly touched the frame; see Inside a frame above.
  - Affects: toolbar height 32 → 36px; inset and gap 2 → 4px; the message header's default reserve `--mi-toolbar-reserve` 6.5rem → 7rem (three buttons).
  - Migrate: if you set `--mi-toolbar-reserve` yourself, compute it as `1rem + 2rem × buttons` (was `1.25rem + 1.75rem × buttons`). Leave at least 18px above the first message of a scroll area and above a thread's root message.
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **MessageMultiSelectToolbar**: 36px tall (was 48) with 28px buttons (was 32) 4px from the frame; on a touch screen each button takes a 44px tap. The buttons go in the new `MessageMultiSelectToolbarActions`. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: every floating toolbar is now 36px with 28px buttons; the touch hit area keeps the smaller buttons easy to tap.
  - Affects: height 48 → 36px; buttons 32 → 28px; inset 8 / 10 → 4px; gap 6 → 4px.
  - Migrate: wrap the toolbar's buttons in `MessageMultiSelectToolbarActions`, which owns their 4px gap and the touch hit areas; remove your own gap or padding there.
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **ComboboxSelect**, **Combobox** and **InputGroup** chips and end buttons: chips and embedded buttons in a field are 20px on a desktop and 32px on a phone (chips were 28px, end buttons 32px), 6px from the field's edge and from each other, at `radius-chip`, so a field with chips stays 32 / 44px tall (it grew to 42). ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: 28px chips made a field with chips taller than one without, and the embedded buttons sat at different offsets per component.
  - Affects: chips 28 → 20px desktop / 32px phone; chip remove 16 / 28px at `radius-sticker`; InputGroup end-addon Button 32 → 20 / 32px with a 16px icon; ComboboxSelect `sm` keeps 22px chips at 3px, `lg` uses 40px chips in a 52px field.
  - Migrate: remove size, offset or radius overrides on chips and end-addon buttons in fields. In an InputGroup end addon, put a Kbd before the Button, so on a phone (Kbd hidden) the button is the last child and ends 6px from the edge.
  - Docs: https://raft-design.botiverse.build/components/combobox-select/

### Added

- **CodeBlockPre**: renders the code's `pre`. While the code overflows it is a keyboard-reachable named region (`tabindex=0`, `role=region`, `aria-label` "Code" by default), so it can be scrolled from the keyboard; code that fits adds no Tab stop. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: a scrolling code block could not be reached from the keyboard in Safari.
  - Docs: https://raft-design.botiverse.build/components/code-block/
- **MessageMultiSelectToolbarActions**: the multi-select toolbar's actions at its end, 4px apart, with touch hit areas. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: see MessageMultiSelectToolbar above.
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **Press feedback**: Badge, the mention sticker, InboxItem, Table rows, the system-message disclosure and the selected SidebarItem now press with the medium tier. ([#681](https://github.com/botiverse/raft-design/pull/681))
  - Why: anything clickable presses with the medium tier; these gave no feedback on press.
  - Affects: solid Badge `sticker-medium`; soft and outline Badge, InboxItem, Table row, system-message disclosure `fill-medium`; selected SidebarItem `sticker-medium`.
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press

### Changed

- **MessageItem**, **MessageAttachmentCard**, **MessageReplies**, **TaskCard** and menu-open rows: hover with the subtle tier. ([#681](https://github.com/botiverse/raft-design/pull/681))
  - Why: a message, a readable card and a row whose menu is open are large things people read; one subtle step keeps text contrast and never stacks with the menu-open fill.
  - Affects: message hover 3% / 2.2% → 4% / 3%; menu-open row 5% / 4% → 4% / 3%; attachment card, replies bar and task card 7.8% → 4% / 3%. Press stays medium.
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press
- **SegmentedControl**, **ToggleGroup** and **Select**: a selected segment or toggle no longer darkens on hover and presses with `sticker-medium`; the Select trigger and the top-bar SearchTrigger don't hover, only press. SegmentedControl and ToggleGroup items are 3px apart (was 2). ([#681](https://github.com/botiverse/raft-design/pull/681), [#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: selected items and fields don't hover, like selected tabs and the active sidebar item.
  - Affects: segment gap 2 → 3px.
  - Docs: https://raft-design.botiverse.build/components/segmented-control/
- **DropdownMenu**, **ContextMenu**, **Select**, **Combobox**, **ComboboxSelect**, the suggestion list and quick reactions: the highlighted item sits 4px inside the popup at `radius-chip`, and separators take 4px. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: see Inside a frame above.
  - Affects: highlight inset 6px (quick reactions 8px) → 4px; highlight radius 8 → 6px; separator margins 6 → 4px.
  - Docs: https://raft-design.botiverse.build/components/dropdown-menu/
- **CodeBlock**: the copy and other actions sit 6px from the corner at `radius-chip`, and without a header they take a column of their own instead of covering the first line; the code scrolls beside them. With a header, the actions sit 6px from its end, centred in it, 4px apart. ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: on a phone the copy button covered the first line of code.
  - Affects: action offset 9px (no header) / 5px (header) → 6px; radius 8 → 6px; a one-line block keeps 6px under the button.
  - Docs: https://raft-design.botiverse.build/components/code-block/
- **Composer**, **MessageActionCard**, **Popover** header close, **Lightbox** info bar, video preview, gallery and file card actions: embedded buttons at `radius-chip`, 6px from the frame's sides (4px in the lightbox bar, whose buttons are 28px with a 44px touch target). ([#682](https://github.com/botiverse/raft-design/pull/682))
  - Why: see Inside a frame above.
  - Affects: composer buttons 8 / 13px from the sides and 9px from the bottom → 6px; media and file card actions 9 / 7 / 5px → 6px; lightbox buttons 32 → 28px.
  - Docs: https://raft-design.botiverse.build/foundations/shape/#inside-a-frame

### Fixed

- **ComboboxSelect** and **FloatButton**: hover no longer sticks after a tap on a touch screen; their `:hover` rules are under `(hover: hover)`, and the ghost FloatButton hovers and presses with the overlay instead of a fill swap. ([#681](https://github.com/botiverse/raft-design/pull/681))
  - Why: ungated `:hover` rules stayed applied after a tap.
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press

## [0.19.0](https://github.com/botiverse/raft-design/compare/v0.18.0...v0.19.0) (2026-10-21)

### Design System

- **Collapsing the sidebar**: on desktop the sidebar toggle is the first item of the rail's footer, above Help and Settings. Its icon shows what pressing it does (`panel-left-close` while the sidebar is shown, `panel-left-open` while it is hidden), its tooltip says Collapse Sidebar or Expand Sidebar with the shortcut (⌘\ on macOS, Ctrl+\ elsewhere), and the state is remembered on the device. It applies to AppShellSidebarTrigger. ([#674](https://github.com/botiverse/raft-design/pull/674))
  - Why: the toggle belongs to the frame rather than to a page, so it needs one fixed place and one behavior whatever the main area shows.
  - Docs: https://raft-design.botiverse.build/patterns/navigation/#collapsing-the-sidebar

### Breaking Changes

- **BannerAction**: the buttons sit at the bottom right, at the end of the last line of text and centered on it, while the text fits beside them on one line. When the text would wrap beside them, or the banner is narrower than 480px, they take a line of their own under the text, aligned to the end. `BannerAction` places itself; it sets `data-wrap` when it takes its own line. ([#672](https://github.com/botiverse/raft-design/pull/672))
  - Why: the button sat in a start-aligned row under the text, away from where the eye ends; it now comes after what it acts on and ends where reading ends, as a dialog's commit button does.
  - Affects: action placement from a row under the text (start-aligned, `mt-2`) → the end of the last line from 452px of banner content (a 480px banner at `md`), otherwise its own line under the text, end-aligned; `size="sm"` banners with an action get vertical padding that centers a 32px button on the line.
  - Migrate: remove layout overrides on `BannerAction`, such as `col-span-full`, `col-start-*`, `row-start-*` or `mt-*`, which now fight its placement. Give `Banner` a width (or let it fill its parent); never `w-fit`. Use `variant="default" size="sm"` for the button, and put a ghost Dismiss (`variant="ghost" size="sm"`) before it when the banner can be dismissed; move a × out of `BannerAction` into `BannerClose`, on a banner with no button.
  - Docs: https://raft-design.botiverse.build/components/banner/
- **AppShellSidebarTrigger**: the trigger is a disclosure button. It has `aria-expanded` and `aria-controls` naming the sidebar slot, instead of `aria-pressed`, and its labels are Title Case: "Collapse Sidebar" and "Expand Sidebar". ([#674](https://github.com/botiverse/raft-design/pull/674))
  - Why: the trigger shows and hides a region, which assistive technology announces as expanded or collapsed, not as a pressed toggle.
  - Affects: `aria-pressed` → `aria-expanded`; new `aria-controls`; `AppShellSidebarSlot` gets a generated `id` when the root is `sidebarCollapsible` and none is passed; label and `title` "Collapse sidebar" / "Expand sidebar" → "Collapse Sidebar" / "Expand Sidebar".
  - Migrate: update tests and selectors that read `aria-pressed` or the old labels to `aria-expanded` and the Title Case labels. When you wrap the trigger in a Tooltip, pass `title={undefined}` and repeat the label in the tooltip; to translate it, pass your own `aria-label`.
  - Docs: https://raft-design.botiverse.build/components/app-shell/
- **AppShellMainSlot** and **AppShellSidebarSlot**: in a collapsible shell, the main area has a z-index only while it slides over the sidebar, and the collapsed sidebar is `inert`. ([#674](https://github.com/botiverse/raft-design/pull/674))
  - Why: the main area sat at z-index 45 at rest and covered the app's own fixed layers, such as a bar at z-40, and a collapsed sidebar's controls stayed in the tab order while hidden.
  - Affects: main slot `z-45` always → `z-2` with `data-sliding` only during the slide, none at rest; the expanded sidebar slot is `relative z-1`, so a resize handle past its edge stays grabbable; the collapsed sidebar slot adds `inert` to `aria-hidden`.
  - Migrate: remove workarounds that lowered the app's own layers below z-45 or raised them over the main slot, and any code or test that reads an inline or computed z-index on the main slot at rest. Don't make the collapsed sidebar focusable yourself; a shortcut that collapses it while focus is inside should move focus to the trigger first.
  - Docs: https://raft-design.botiverse.build/components/app-shell/

### Added

- **BannerClose**: the × of a banner that has no button, a frameless icon button at the end of the first line whose icon box ends on the banner's padding. Its label defaults to "Dismiss". ([#672](https://github.com/botiverse/raft-design/pull/672))
  - Why: a × put in `BannerAction` read as one of the actions and sat on the wrong line; the close control now has a place of its own.
  - Affects: `variant="ghost"`, `size="icon-sm"` (32px), centered on the first line. With `BannerAction` in the same banner, raft-ui warns in development and moves the actions to a line of their own.
  - Docs: https://raft-design.botiverse.build/components/banner/

### Fixed

- **BannerTitle** and **BannerDescription**: a long word or URL breaks onto the next line instead of pushing the banner wider. ([#672](https://github.com/botiverse/raft-design/pull/672))
  - Why: an unbroken string, such as a URL, ran out of the text column and under the actions; the text now wraps inside its column.
  - Docs: https://raft-design.botiverse.build/components/banner/
- **ResizableHandle**: under a coarse pointer, such as a finger on a tablet, the handle is easier to grab. ([#667](https://github.com/botiverse/raft-design/pull/667))
  - Why: a 12px handle was too narrow to hit with a finger.
  - Affects: handle hit area 12px → 24px under `pointer: coarse`, still centered on the boundary; mouse and pen keep 12px.
  - Docs: https://raft-design.botiverse.build/components/resizable/

## [0.18.0](https://github.com/botiverse/raft-design/compare/v0.17.0...v0.18.0) (2026-10-21)

### Design System

- **Field frames**: a field's ink frame is 1.5px, the same weight as a button's. It applies to Input, Textarea, InputGroup, Select, Combobox, ComboboxSelect, SearchTrigger, the composer and an option card. Read-only fields keep their light, thin edge. ([#661](https://github.com/botiverse/raft-design/pull/661))
  - Why: a field sits next to its send button, its submit button and the selected row, all 1.5px ink; at 1px it was the one thin control among them and read as a lighter style rather than the same system.
  - Affects: `line-field` width 1px → 1.5px.
  - Docs: https://raft-design.botiverse.build/foundations/shape/
- **Autofill**: a field the browser filled in looks like any other field, `layer-card` with ink text. ([#661](https://github.com/botiverse/raft-design/pull/661))
  - Why: Chrome's pale blue and Safari's yellow made the filled field the one field on the page that matched nothing else, and the colour tells a person nothing.
  - Docs: https://raft-design.botiverse.build/foundations/states/#autofill

### Fixed

- **Input, Textarea, Select and every other field**: browser autofill no longer paints a field pale blue or yellow. raft-ui's `styles.css` handles every `input`, `textarea` and `select` on the page; a disabled autofilled field keeps the disabled ink. ([#661](https://github.com/botiverse/raft-design/pull/661))
  - Why: see Autofill above.
  - Docs: https://raft-design.botiverse.build/foundations/states/#autofill

## [0.17.0](https://github.com/botiverse/raft-design/compare/v0.16.0...v0.17.0) (2026-10-21)

### Design System

- **Dragging on a touch screen**: on an item that can be moved, holding still opens its menu and holding then moving drags it. The item arms after 500ms, the same moment raft-ui's long-press menu opens, and the drag starts on the first 10px of movement; moving earlier is a scroll, and a second finger cancels. The component that owns the item's menu closes it when the drag starts. ([#662](https://github.com/botiverse/raft-design/pull/662))
  - Why: on a phone, a long press on a draggable item opened its context menu first, and a scroll that started on a tab, task card or attachment picked the item up instead.
  - Affects: touch drag hold 0ms (tabs, cards and attachments picked up at once) → 500ms, then 10px; held items get `select-none`, `-webkit-touch-callout: none` and `touch-manipulation`. Mouse and pen still start a drag after 5–6px, with no hold.
  - Docs: https://raft-design.botiverse.build/foundations/states/#dragging-on-a-touch-screen

### Added

- **SortableTabsList** `onDragStart`: called when a tab drag starts, so an app that puts its own menu on a tab can close it. ([#662](https://github.com/botiverse/raft-design/pull/662))
  - Why: the component that owns an item's menu closes it when the item's drag starts.
  - Docs: https://raft-design.botiverse.build/components/tabs/

### Fixed

- **SortableTabsList, task drag-and-drop and SortableComposerAttachments**: on a touch screen a finger no longer starts a drag at once; it has to hold still for 500ms and then move. Scrolling that starts on a card or an attachment scrolls again. ([#662](https://github.com/botiverse/raft-design/pull/662))
  - Why: the pointer sensor took every touch before the touch sensor could, and `touch-none` stopped the page from scrolling.
  - Docs: https://raft-design.botiverse.build/foundations/states/#dragging-on-a-touch-screen

## [0.16.0](https://github.com/botiverse/raft-design/compare/v0.15.0...v0.16.0) (2026-10-21)

### Breaking Changes

- **VirtualList** `items`: compared by reference. A row renders again only when its item, its index or one of the list's render props changes, so replace an item to change it instead of editing it in place. ([#658](https://github.com/botiverse/raft-design/pull/658))
  - Why: keeping rows across range updates is what removes the per-frame re-render.
  - Migrate: if your code edits an item object in place, or a render function reads mutable state outside the props, replace the item (a new object) when it changes.
  - Docs: https://raft-design.botiverse.build/components/virtual-list/

### Changed

- **VirtualList**: scrolling no longer restyles or re-renders every mounted row. Rows that stay in range keep their elements; rows are mounted ahead of the view in batches and passed rows stay mounted for a while; only the rows that fill the view below are mounted; rows above the view are planned at the average measured height; resize passes where nothing changed size write nothing. ([#658](https://github.com/botiverse/raft-design/pull/658))
  - Why: in a long chat timeline the list dropped more frames than a plain list while scrolling, most with a slow CPU: every row was restyled on almost every frame, and each range change re-rendered every row.
  - Affects: with a 4x slower CPU, frames over 33ms scrolling 320 messages 9 → 0 down and 24 → 0 up, p95 33ms → 16.7ms; main-thread time per frame 10–17ms → 2–5ms. Up to 2.5 viewports of passed rows stay mounted; after a jump only the rows in view mount, as before.
  - Docs: https://raft-design.botiverse.build/components/virtual-list/

## [0.15.0](https://github.com/botiverse/raft-design/compare/v0.14.0...v0.15.0) (2026-10-21)

### Design System

- **Server switcher**: on every surface (the web top bar, the phone web's Home and the mobile app) the server switcher is one button: the server's avatar, its name and a chevron, whatever sits beside it. The tilted ink pill on the phone web's Home is retired; build the switcher from `WorkspaceButton`, `Avatar type="server" size="sm"` and `WorkspaceButtonName`. ([#655](https://github.com/botiverse/raft-design/pull/655))
  - Why: the switcher had three different shapes across the web top bar, the phone web and the mobile app, and the desktop button changed shape with the window width.
  - Affects: avatar `sm` 27px, gaps 8px / 4px, name max 200px then an ellipsis, chevron 16px, on an on-frame `md` button (36px).
  - Docs: https://raft-design.botiverse.build/patterns/navigation/#servers

### Added

- **WorkspaceButton** and **WorkspaceButtonName**: the server switcher's button. ([#655](https://github.com/botiverse/raft-design/pull/655))
  - Why: one component keeps the switcher the same on every surface.
  - Affects: on-frame `md` button, 36px; name max 200px.
  - Docs: https://raft-design.botiverse.build/components/workspace-button/
- **Avatar** `type="server"`: a server's avatar, an ink fill with its initial in brand yellow. ([#655](https://github.com/botiverse/raft-design/pull/655))
  - Why: each app drew a server's avatar as a person's avatar recoloured to ink.
  - Affects: fill `sticker-ink`, initial `brand`.
  - Docs: https://raft-design.botiverse.build/components/avatar/

## [0.14.0](https://github.com/botiverse/raft-design/compare/v0.13.0...v0.14.0) (2026-10-21)

### Design System

- **Option height**: an option in any popup list is as tall as its content, and the space above and below its text is constant. ([#647](https://github.com/botiverse/raft-design/pull/647))
  - Why: options had a fixed 6px above and below whatever their content, which is less than a one-line 36px row leaves around its text, so a two-line option (a wrapped label, or a name with an id under it) looked more cramped than its one-line neighbors.
  - Affects: space above and below an option 6px → 7px with a mouse (22px line), 8px on a touch screen (20px line); one line stays 36px; a second line adds only its own height. On short windows (600px tall or less) the menus' extra `py-1` is removed.
  - Docs: https://raft-design.botiverse.build/patterns/forms/#option-height
- **The ends of a header**: the icon buttons at both ends of every header (panels, threads, phone top bars, drawers, sheets, a dialog's ×, the sidebar) put their icon box on the content margin, and their empty hit area hangs outward. ([#650](https://github.com/botiverse/raft-design/pull/650))
  - Why: a 44px button on a touch screen was placed by its own edge, so Back sat 11px inside the content line while the ⋮ at the other end stayed on it, and the two ends stopped mirroring.
  - Affects: icon box on the margin, 16px on a phone and 20px on a desktop and in a dialog, at every button size (32px or 44px); a phone's top bar moves its icon boxes from 14px to 16px from the edge.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#the-ends-of-a-header

- **A tab's own controls**: when a tab's content has controls (a view switch, filters, search, a sort), they go in one pinned toolbar row under the tabs, the same row the Tasks tab draws: filters and search on the left, a view switch on the right; a tab with no controls has no row. ([#652](https://github.com/botiverse/raft-design/pull/652))
  - Why: a view switch sat directly on the divider under the tabs, and each tab placed its controls differently, so a switch under the selected tab read as a second row of tabs.
  - Affects: the row has the content margin at its sides (20px desktop, 16px phone) and a `line-seam` below it.
  - Docs: https://raft-design.botiverse.build/components/tabs/#a-tabs-own-controls

### Added

- **Utilities** `py-option-inset` and `min-h-option`, the constant option padding and the floor for an option with no line of text. ([#647](https://github.com/botiverse/raft-design/pull/647))
  - Why: a product that builds its own option row keeps the same padding as raft-ui's.
  - Affects: `py-option-inset` = (36px − one line) / 2; `min-h-option` 36px.
  - Docs: https://raft-design.botiverse.build/patterns/forms/#option-height

### Changed

- **Select, Combobox, ComboboxSelect, DropdownMenu and ContextMenu options**: their padding is `py-option-inset` instead of a fixed 6px. ([#647](https://github.com/botiverse/raft-design/pull/647))
  - Why: see Option height above.
  - Affects: padding 6px → 7px (mouse) / 8px (touch); two-line options 2px taller with a mouse, 4px on a touch screen; one-line options unchanged at 36px.
  - Docs: https://raft-design.botiverse.build/patterns/forms/#option-height
- **PanelHeader, ThreadPanel, Drawer, Dialog, AlertDialog, Lightbox, NotificationCenter and Sidebar headers**: frameless icon buttons at the ends align by their icon box on the content margin. ([#650](https://github.com/botiverse/raft-design/pull/650))
  - Why: see The ends of a header above.
  - Affects: edge icon boxes at 16px (phone) / 20px (desktop, dialog) from the edge at every button size.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#the-ends-of-a-header

### Fixed

- **InputGroup**: a text addon is centered with flex, so older iOS Safari no longer sets its text at the top; long text still truncates. ([#646](https://github.com/botiverse/raft-design/pull/646))
  - Why: the previous centering needed Safari 17.4.
  - Docs: https://raft-design.botiverse.build/components/input-group/

## [0.13.0](https://github.com/botiverse/raft-design/compare/v0.12.0...v0.13.0) (2026-10-21)

### Design System

- **Row hover**: rows hover with their own lightest visible step, not the press overlay; a row whose menu is open is marked with one slightly stronger step. ([#641](https://github.com/botiverse/raft-design/pull/641), [#643](https://github.com/botiverse/raft-design/pull/643))
  - Why: the press fill made hovered messages and list rows read as grey and heavy, and on a phone a long-press menu left no mark of which row it belonged to.
  - Affects: hover `fill-pressed` 7.8% → `fill-row-hover` 4% (dark 3%), messages `fill-message-hover` 3% (dark 2.2%), menu-open `fill-row-open` 5% (dark 4%). Press and selection are unchanged; hover stays lighter than selection.
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press

### Added

- **Tokens** `fill-row-hover`, `fill-message-hover` and `fill-row-open`, with utilities `row-hover-overlay` and `row-open-overlay` for rows on a card or a tinted surface. ([#641](https://github.com/botiverse/raft-design/pull/641), [#643](https://github.com/botiverse/raft-design/pull/643))
  - Why: rows need a hover step lighter than press, and rows on a non-transparent surface need it as an overlay so the surface shows through.
  - Affects: `fill-row-hover` 4% / 3%, `fill-message-hover` 3% / 2.2%, `fill-row-open` 5% / 4% (ink, light / dark).
  - Docs: https://raft-design.botiverse.build/foundations/tokens/

### Changed

- **Message, SidebarItem, List, Inbox, Search, Table and File rows**: hover with `fill-row-hover` (messages with `fill-message-hover`) instead of `fill-pressed`. ([#641](https://github.com/botiverse/raft-design/pull/641))
  - Why: see Row hover above.
  - Affects: hover background 7.8% → 4% (messages 3%).
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press
- **Rows with a menu open** (right-click, ⋯ menu, phone long-press): take `fill-row-open` while the menu is open; selection still wins. **Comment cards** hover with `fill-row-hover`. ([#643](https://github.com/botiverse/raft-design/pull/643))
  - Why: the open menu needs one marker of which row it belongs to, including on a phone where there is no hover.
  - Affects: menu-open background `fill-row-open` 5% / 4%.
  - Docs: https://raft-design.botiverse.build/foundations/states/#hover-and-press
- **Select, Combobox**: `collisionPadding` defaults to 8px. ([#642](https://github.com/botiverse/raft-design/pull/642))
  - Why: popups touched the screen edge on phones.
  - Affects: popup inset from the screen edge, 8px.
  - Docs: https://raft-design.botiverse.build/patterns/forms/#long-values-in-fields

### Fixed

- **Field, FieldItem, InputGroup, SelectValue, ComboboxSelect, chips and options**: long values stay inside form fields on narrow screens. Labels, descriptions and errors wrap. A FieldItem label next to a checkbox, radio or switch shrinks. An InputGroup text prefix takes at most half the field and truncates. Values and chips truncate, with the full value as `title`. Options wrap to 2 lines, then clamp. Select and Combobox popups are never wider than the screen less 8px on each side. ([#642](https://github.com/botiverse/raft-design/pull/642))
  - Why: long names and values could push fields and popups past the screen edge on phones, so every form field, picker and option list was checked and fixed together.
  - Affects: InputGroup prefix `max-w-1/2`; options clamp at 2 lines; popups are never wider than the screen less 8px on each side, and on a desktop at most the wider of the trigger and `24rem`.
  - Docs: https://raft-design.botiverse.build/patterns/forms/#long-values-in-fields

## [0.12.0](https://github.com/botiverse/raft-design/compare/v0.11.0...v0.12.0) (2026-10-21)

### Breaking Changes

- `ComboboxSelect` always takes typing on a phone, as on a desktop: tapping the field focuses it and typing filters; `create` and remote search work in the field. The phone-only pick-only mode and bottom sheet from 0.10.5 are gone, with their props `sheetThreshold`, `sheetTitle` and `messages.search` / `done` / `close`. A pick-only field uses `Select`. The list still picks its side once and doesn't flip while the keyboard opens. ([#635](https://github.com/botiverse/raft-design/pull/635))

### Added

- `ComboboxSelect` takes `listMaxHeight` (a CSS length or pixels, default `16rem`, the whole list's height); the side the list opens on follows it. ([#635](https://github.com/botiverse/raft-design/pull/635))
- Jump controls that float over a conversation, from `@botiverse/raft-ui/wip`: `MessageListJumpControls`, `MessageListJumpPill` (a Button `outline md`), `MessageListJumpPillGroup` and `MessageListJumpPillDismiss`. ([#637](https://github.com/botiverse/raft-design/pull/637))
- A message an assistant sent for its owner, from `@botiverse/raft-ui/wip`: `MessageItemDelegatedBy`, `MessageItemDelegatedByName`, `MessageItemDelegatedByButton`, `MessageItemDelegatedAvatar` (with `deleted`) and `MessageQuotedPreviewAuthorDelegatedBy`. ([#633](https://github.com/botiverse/raft-design/pull/633))

### Fixed

- The 32px and 36px buttons' hit area reaches 44px; the overhang now counts the 1.5px border. ([#637](https://github.com/botiverse/raft-design/pull/637))
- Toast title and description use `text-callout` (desktop line height 20 to 22px). ([#637](https://github.com/botiverse/raft-design/pull/637))
- In a message header the name, notes (model, role, badge text) and time stand on one baseline. ([#639](https://github.com/botiverse/raft-design/pull/639))
- `MessageItemSenderGroup`: the gap before a role squeezed to nothing collapses with it. ([#633](https://github.com/botiverse/raft-design/pull/633))
- `VirtualList`: a jump holds its target row by key, so rows prepended while it settles don't move it; the focused row stays mounted across a window switch. ([#636](https://github.com/botiverse/raft-design/pull/636))

## [0.11.0](https://github.com/botiverse/raft-design/compare/v0.10.7...v0.11.0) (2026-10-21)

### Added

- `VirtualList`: a virtualized list for long, variable-height content such as a conversation, exported from the main entry. Rows are measured in block flow, so their margins collapse as in a plain list; it holds its anchor through items added above or below, jumps exactly to an item (`scrollTo` with `align`), lays out multi-column rows, and keeps mounted the row that holds focus (so End, Home, paging and wheel scrolling don't lose it) and the rows a text selection reaches into. The scroller takes native HTML attributes and its ref as `domRef`; styles are in `.r-virtual-list`. The implementation borrows from DeepSeek web's virtual list. ([#627](https://github.com/botiverse/raft-design/pull/627))

## [0.10.7](https://github.com/botiverse/raft-design/compare/v0.10.6...v0.10.7) (2026-10-21)

### Fixed

- A passage with comments now shows in dark mode: `raft-comment` paints `brand` over the page, 35% in light mode (as before) and 22% in dark, instead of `brand-soft`, which in dark mode barely differed from the page. The text on it stays at body-text contrast (APCA Lc 75 or more). ([#626](https://github.com/botiverse/raft-design/pull/626), [#629](https://github.com/botiverse/raft-design/pull/629))
- In `MessageActionCardProperties`, a label lines up with the first line of its value instead of the middle of a value that wraps. ([#631](https://github.com/botiverse/raft-design/pull/631))

## [0.10.6](https://github.com/botiverse/raft-design/compare/v0.10.5...v0.10.6) (2026-10-21)

### Added

- Comments beside a document, as in Google Docs, through `@botiverse/raft-ui/wip`: `CommentMargin`, `CommentCard` (with `CommentCardTrigger`, `CommentCardMeta`, `CommentCardQuote`), `CommentEntry` and `CommentMarker`. Cards sit level with their passages and keep the document's order; on a narrow viewer a `CommentMarker` beside each passage opens the discussion in a bottom sheet instead. `useCommentMarginFits(viewer, { minWidth })` picks between the two, `setCommentHighlights` with `COMMENT_HIGHLIGHT` / `COMMENT_HIGHLIGHT_ACTIVE` highlights the passages, and `resolveCommentMarginLayout` is the layout for callers that place cards themselves. New pattern: Comments. ([#614](https://github.com/botiverse/raft-design/pull/614))
- `AvatarGroup` reads `--avatar-group-surface` (default `layer-canvas`) for the ring between overlapping avatars, so a stack on another surface can match it. ([#614](https://github.com/botiverse/raft-design/pull/614))

## [0.10.5](https://github.com/botiverse/raft-design/compare/v0.10.4...v0.10.5) (2026-10-20)

### Added

- `ComboboxSelect` takes `sheetThreshold` (default 10) and `sheetTitle`, and its `messages` take `search`, `done` and `close` for the phone's bottom sheet. ([#618](https://github.com/botiverse/raft-design/pull/618))

### Fixed

- `ComboboxSelect` on a phone (a touch screen under 48rem) no longer focuses a text input and raises the keyboard when people only pick a value. Up to `sheetThreshold` options open as an anchored list that picks its side once and doesn't flip while the keyboard or the address bar moves; more options, `create` and remote search open a bottom sheet with the search input at its top. Desktop and touch tablets are unchanged. ([#618](https://github.com/botiverse/raft-design/pull/618))

## [0.10.4](https://github.com/botiverse/raft-design/compare/v0.10.3...v0.10.4) (2026-10-20)

### Fixed

- A page in Traditional Chinese (`<html lang="zh-TW">`, also `zh-HK`, `zh-MO` and `zh-Hant`) falls back to Traditional Chinese faces (PingFang TC, Microsoft JhengHei, Noto Sans TC) before the Simplified ones, so characters keep their Traditional glyph shapes. Simplified Chinese and default pages are unchanged. ([#610](https://github.com/botiverse/raft-design/pull/610))

## [0.10.3](https://github.com/botiverse/raft-design/compare/v0.10.2...v0.10.3) (2026-10-20)

### Added

- `MessageItemSenderGroup` wraps the name, badges and role and sets the order they give way in when the header is too narrow: the role truncates first, then the name; badges keep their width and the time never truncates. Existing headers without it keep working. ([#607](https://github.com/botiverse/raft-design/pull/607))
- `MessageItemEdited`: an inline "(edited)" marker at the end of the message text, on every row. ([#607](https://github.com/botiverse/raft-design/pull/607))

### Changed

- `MessageItemTime` sits right after the sender (name, badges, role) instead of at the far right, and no longer fades out under the hover toolbar: hover only adds, it never hides who said it or when. With a mouse the header keeps the toolbar's width free (`--mi-toolbar-reserve`, default 6.5rem for three buttons; set it on the list when the toolbar has more). This is visible wherever `MessageItemTime` is used, also without `MessageItemSenderGroup`; wrap the name, badges and role in it to get the give-way order. ([#607](https://github.com/botiverse/raft-design/pull/607))
- `MessageItemTime` and `MessageItemContinuationTime` render a `<time>` element and take `dateTime`. ([#607](https://github.com/botiverse/raft-design/pull/607))

### Fixed

- A long name no longer pushes the time out of the header (it was cut to "14:3"): `MessageItemSender` / `MessageItemSenderButton` can shrink now. ([#607](https://github.com/botiverse/raft-design/pull/607))

## [0.10.2](https://github.com/botiverse/raft-design/compare/v0.10.1...v0.10.2) (2026-10-20)

### Fixed

- `PanelAction` and `PanelToggleAction` follow the same desktop condition as every other control (`(width >= 48rem) and (pointer: fine)`). On a touch tablet they were 32px while the rest stayed 44px; they now keep 44px with 22px icons there. Phone and desktop sizes are unchanged. ([#605](https://github.com/botiverse/raft-design/pull/605))

## [0.10.1](https://github.com/botiverse/raft-design/compare/v0.10.0...v0.10.1) (2026-10-20)

### Fixed

- A page in Japanese or Korean (`<html lang="ja">` / `"ko"`, including regional tags like `ja-JP`) falls back to its own system faces (Hiragino Sans, Yu Gothic UI, Meiryo, Noto Sans JP; Apple SD Gothic Neo, Malgun Gothic, Noto Sans KR) before the Chinese ones, so kanji keep Japanese glyph shapes and Hangul gets a Korean face. Chinese and default pages are unchanged. ([#603](https://github.com/botiverse/raft-design/pull/603))

## [0.10.0](https://github.com/botiverse/raft-design/compare/v0.9.6...v0.10.0) (2026-10-20)

### Breaking Changes

- On a desktop (`(width >= 48rem) and (pointer: fine)`: a wide screen used with a mouse or trackpad) type and controls follow Feishu PC's density. Touch devices keep the phone sizes at any width. Existing names keep working, but their sizes change there, so check any layout that matched them by hand ([#601](https://github.com/botiverse/raft-design/pull/601)):
  - `text-headline` 16/24; `text-body`, `text-subhead` and `text-callout` 14/22; `text-footnote`, `text-caption` and `text-mono-meta` 12/18; `text-mono-code` 13/20. Hero, display, title and label are unchanged.
  - Fields (`Input`, `Select`, `Combobox`, `ComboboxSelect`, `InputGroup`) go from 44px to 32px, with 14/22 field text; card titles are 14/22.
  - `Button` `lg` and `icon-lg` go from 44px to 32px (icon 22 → 18) and keep a 44px hit area; `xl` goes from 52px to 40px. The default `md` stays 32px; its label goes from 13px to 14px.
  - Anything hardcoded to `h-11` / `size-11` to line up with a field no longer matches on desktop: use `h-control` / `size-control` instead.
  - The desktop type values sit after Tailwind's theme output, so they win over an app's own `@theme` values for these names; an app that changes one sets it inside the same query.
- Field frames (`Input`, `Textarea`, `InputGroup`, `Select`, `Combobox`, `ComboboxSelect`, `Composer`, option `Card`, `SearchTrigger`) are drawn at 1px in `line-field` instead of 1.5px, on the phone too. ([#601](https://github.com/botiverse/raft-design/pull/601))

### Added

- Control tokens that switch with the desktop query: `--control-height`, `--control-height-cta`, `--control-icon-size`, `--control-hit-inset`, and the `h-control`, `size-control`, `size-control-icon` and `text-control` utilities (registered with tailwind-merge). ([#601](https://github.com/botiverse/raft-design/pull/601))

### Changed

- `Tooltip`, `ComboboxSelect` options, `Steps` and `Timeline` use the type scale instead of fixed sizes, so they follow the desktop values. ([#601](https://github.com/botiverse/raft-design/pull/601))

## [0.9.6](https://github.com/botiverse/raft-design/compare/v0.9.5...v0.9.6) (2026-10-20)

### Added

- `installInputModality()` and the `InputModality` type: raft-ui records whether the person last used the keyboard, a pointer, or a screen reader's virtual cursor, on `<html data-input-modality>`. `ThemeProvider` installs it for you (with the default `syncDom`); an app without `ThemeProvider` calls it once on the client. ([#598](https://github.com/botiverse/raft-design/pull/598))
- `toast.add/info/success/warning/error(title, { leading })` puts a node, such as a person's avatar, in `ToastIcon` in place of the status pixel. It is `aria-hidden` and still shows with `icon: false`. Calls without `leading` render exactly as before. ([#599](https://github.com/botiverse/raft-design/pull/599))

### Changed

- Focus rings show only after keyboard navigation. A click, a tap, typing, or focus moved by a click no longer draws the ring, including on text fields (the caret marks them). Tab, F6, arrow keys outside a text field, and keys that move focus out of a text field (Esc closing a dialog, Enter submitting) still do, and so does focus a screen reader moves or that arrives with no input before it. Without the tracker installed every ring shows as before. Rings drawn with `shadow-focus` follow this automatically; other indicators take the new `keyboard:` variant, and groups ring on `has-focus-visible` instead of `focus-within`. ([#598](https://github.com/botiverse/raft-design/pull/598))

## [0.9.5](https://github.com/botiverse/raft-design/compare/v0.9.4...v0.9.5) (2026-10-20)

### Fixed

- On a touch screen, a tap no longer leaves a hover highlight on: `TableBody` rows, an `InboxItem`'s pressed toggle action, the Activity inbox sort button and a `FileRow` (when its `FileRowOpen` is hovered) now only show their hover on devices that can hover. With a mouse they look and behave as before. ([#596](https://github.com/botiverse/raft-design/pull/596))

## [0.9.4](https://github.com/botiverse/raft-design/compare/v0.9.3...v0.9.4) (2026-10-20)

### Changed

- Clickable text no longer sits underlined at rest: it underlines on hover in its own colour and never turns pink. This covers `TextLink` (both emphases; `strong` no longer turns its underline pink on hover), `MessageItemSenderButton`, `@` mentions, the forwarded-bundle and translation text actions, empty-state description links (now semibold so they stand apart from the hint text), the video-preview failure action and toast actions. Disabled ones do not underline. Rendered Markdown links are the one exception: they keep a faint underline at rest (link blue at 40%), because colour alone is below 3:1 against body text, and on hover the underline goes full strength and the text darkens. ([#594](https://github.com/botiverse/raft-design/pull/594))

### Fixed

- `MessageItemSenderButton` shows its hover state again when the app wraps it, for example in a tooltip trigger. ([#594](https://github.com/botiverse/raft-design/pull/594))
- A `SelectItem` with a `SelectItemDescription` is named by its `SelectItemText` alone and described by the description, so screen readers no longer read the two run together as the option's name. Items without a description are unchanged. ([#575](https://github.com/botiverse/raft-design/pull/575))

## [0.9.3](https://github.com/botiverse/raft-design/compare/v0.9.2...v0.9.3) (2026-10-20)

### Fixed

- Message reference chips sit on the sentence's baseline. Chips with a leading icon (task, joint channel, thread, link) sat 3px high and text-only chips like `#general` 1px high, which also pushed lines apart (26px instead of 24px). Height, colors and padding are unchanged. ([#583](https://github.com/botiverse/raft-design/pull/583))
- `InlineCode` in a message centres its letters in the fill (they sat about 0.6px low). ([#583](https://github.com/botiverse/raft-design/pull/583))

## [0.9.2](https://github.com/botiverse/raft-design/compare/v0.9.1...v0.9.2) (2026-10-19)

### Fixed

- On an `InboxItem` card row, `InboxItemTrailing` (the timestamp, and on a touch screen the room for `reveal="hover"` actions) takes width only beside the first two content lines; the body, message and chips below run the full width. Before, every line was narrowed, so phone cards wrapped more and grew taller. Compact rows and rows without a trailing column are unchanged. ([#586](https://github.com/botiverse/raft-design/pull/586))

## [0.9.1](https://github.com/botiverse/raft-design/compare/v0.9.0...v0.9.1) (2026-10-19)

### Added

- `InboxItemActions reveal="hover"`: with a mouse, the actions stay hidden (still reachable by Tab) until the row is hovered, focused, active or has a menu open, and the timestamp, marks and dot step aside while they show. On a touch screen they show at rest and the trailing column makes room. ([#584](https://github.com/botiverse/raft-design/pull/584))
- `InboxItemLeading`: a 36px leading visual (an avatar or channel tile); the divider starts after it. ([#584](https://github.com/botiverse/raft-design/pull/584))
- `InboxItem density="compact"`: a one-line title and excerpt for a conversation list, with the timestamp beside the title and `InboxItemMarks` (mention, muted, unread count, draft) beside the excerpt. In a compact row `data-unread` bolds the title without the pink dot. ([#584](https://github.com/botiverse/raft-design/pull/584))
- `InboxItemHoverTarget`: lets a badge inside the row take the pointer so its tooltip opens; a click on it still opens the row. ([#584](https://github.com/botiverse/raft-design/pull/584))

## [0.9.0](https://github.com/botiverse/raft-design/compare/v0.8.3...v0.9.0) (2026-10-19)

### Breaking Changes

- `Text.Mono` no longer has `size="eyebrow"` (10px all-caps mono). Head a section with `<Text.Sans size="group">` in sentence case instead; nothing in the product is in all caps. ([#576](https://github.com/botiverse/raft-design/pull/576))

### Added

- `Text.Sans size="group"`: the heading of a group of rows or a section in a panel (13px at 700, `foreground-hint`). ([#576](https://github.com/botiverse/raft-design/pull/576))
- `SegmentedControl` takes `iconsOnlyBelow` (`"xs"` to `"2xl"`, Tailwind's container sizes; type `SegmentedControlIconsOnlyBelow`). Mark the row `@container`; below that width each segment shows only its icon as a 32px square, its label and count stay the accessible name, and a tooltip shows the label. Use it only when every segment has an icon. ([#578](https://github.com/botiverse/raft-design/pull/578))
- `DescriptionList direction="inline"`: facts in a wrapping row on one text baseline, 12px from term to value and 24px between facts, with no stacked-list gap. A first-child Badge, TaskChip, TaskStatusBadge or Button in a value hangs its padding outward, so its text starts where plain text does. ([#579](https://github.com/botiverse/raft-design/pull/579))

### Fixed

- In a `SelectItem` with a `SelectItemLeading`, the `SelectItemDescription` starts under the label instead of under the icon. ([#577](https://github.com/botiverse/raft-design/pull/577))

## [0.8.3](https://github.com/botiverse/raft-design/compare/v0.8.2...v0.8.3) (2026-10-19)

### Added

- `SelectItemDescription`: an optional second line under an option's label, for what the value means. The trigger still shows only the label. ([#573](https://github.com/botiverse/raft-design/pull/573))
- The `layer-backdrop-nested` color token (`bg-layer-backdrop-nested`): the lighter scrim of a modal opened from another modal. ([#558](https://github.com/botiverse/raft-design/pull/558))

### Fixed

- A `SelectItem` grows with its content and keeps 6px above and below its text. A one-line item stays 36px. ([#573](https://github.com/botiverse/raft-design/pull/573))
- A `Dialog` or `AlertDialog` opened from a sheet or another dialog draws its own, lighter scrim, so it no longer sits undimmed on the surface below. A sheet opened from a dialog does the same; a sheet over a sheet is unchanged. Nesting follows the modal roots, as in Base UI, and a `modal={false}` parent doesn't count. ([#558](https://github.com/botiverse/raft-design/pull/558))
- The message hover toolbar and `MessageTextSelectionToolbar` have a 10px corner (`radius-container`) around their 8px buttons, so a hovered button's corner keeps an even 2px gap from the frame instead of pinching it. ([#572](https://github.com/botiverse/raft-design/pull/572))

## [0.8.2](https://github.com/botiverse/raft-design/compare/v0.8.1...v0.8.2) (2026-10-19)

### Added

- `createMessageTextSelectionAnchor` and `getTextSelectionFocusRect` (with the `MessageTextSelectionAnchor` type) give a selected-text toolbar a virtual anchor on the line that holds the selection's focus end, measured from text rects only. Pass the anchor to your popover so a full-line selection no longer anchors at the row's right edge. ([#569](https://github.com/botiverse/raft-design/pull/569))

### Fixed

- `MessageTextSelectionToolbar` matches the hover toolbar: 28px buttons with 16px icons in a `p-0.5` frame. Its labels no longer wrap. ([#569](https://github.com/botiverse/raft-design/pull/569))
- On a touch screen (`pointer: coarse`, at any width), each action in `InboxItemActions` keeps a 44px target and the actions sit 12px apart, so their targets don't overlap. With a mouse they stay 32px. ([#567](https://github.com/botiverse/raft-design/pull/567))

## [0.8.1](https://github.com/botiverse/raft-design/compare/v0.8.0...v0.8.1) (2026-10-19)

### Added

- `TaskDndProvider` takes `accessibility` (the `TaskDndAccessibility` type), passed through to dnd-kit, so you can translate the screen-reader announcements and drag instructions. ([#561](https://github.com/botiverse/raft-design/pull/561))

### Fixed

- Keyboard dragging in `TaskDndProvider` moves a card between drop targets. Before, Space picked the card up but the arrow keys never moved it. ([#561](https://github.com/botiverse/raft-design/pull/561))
- The `MessageItem` hover highlight sits 4px above and below the text on every row, including a merged message, instead of touching the first line. The 8px between groups is now a transparent top border (`border-t-8 bg-clip-padding`) and a `compact` row drops it (`border-t-0` instead of `pt-0`). Spacing between messages and row heights are unchanged. ([#564](https://github.com/botiverse/raft-design/pull/564))
- Below `md`, a `SidebarItem` row is at least 44px high in the 16px title type, so a phone sidebar row can be tapped without help from the app. ([#557](https://github.com/botiverse/raft-design/pull/557))
- The codemods run when called through a pnpm symlink. ([#565](https://github.com/botiverse/raft-design/pull/565))

## [0.8.0](https://github.com/botiverse/raft-design/compare/v0.7.1...v0.8.0) (2026-10-19)

### Breaking Changes

- **`Button` no longer has `variant="link"` or `size="inline"`.** Underlined text is now `TextLink`. A link inside a sentence (a banner's "View Billing") becomes `<TextLink variant="strong">`; a link on its own (Forgot Password, See All) becomes `<TextLink>`, which is muted. `TextLink` has no height, border or padding, so drop the classes that took them off. ([#554](https://github.com/botiverse/raft-design/pull/554))
- `AnnouncementDialogSecondaryAction` is a ghost button instead of an underlined link. Its API is unchanged, and it now looks like the frameless minor action of a dialog. ([#554](https://github.com/botiverse/raft-design/pull/554))
- The activity inbox sidebar no longer styles `[data-activity-inbox-show-all]` as a link (it keeps only `whitespace-nowrap`). Render Show All as a `TextLink`. ([#554](https://github.com/botiverse/raft-design/pull/554))
- `FieldLabel` no longer carries `leading-none`. tailwind-merge already dropped it beside the type class, so most labels don't change, but a label whose class list kept it is now a full line high. ([#541](https://github.com/botiverse/raft-design/pull/541))
- `SegmentedControl` no longer shrinks with `max-w-full`; it keeps its width (`shrink-0`). In a narrow row, give it room or let the row degrade as `responsive.md` says, or it overflows. ([#542](https://github.com/botiverse/raft-design/pull/542))

### Added

- `FieldItem` takes `size` (`sm`, `md`), to match the size of its label. ([#541](https://github.com/botiverse/raft-design/pull/541))
- `TextLink`: the bottom step of the button ladder, underlined text that takes the size of the text around it. It renders a `button`, or a real link with `render={<a href="…" />}`. `variant="muted"` (default) is for a link on its own; `variant="strong"` (ink, 600) is for a link inside a sentence. ([#554](https://github.com/botiverse/raft-design/pull/554))

### Fixed

- A checkbox, radio or switch is centered on the first line of its label, whether or not the label wraps or has a description. ([#541](https://github.com/botiverse/raft-design/pull/541))
- Timeline content runs the full width under its title, instead of staying in the column beside the time. ([#547](https://github.com/botiverse/raft-design/pull/547))
- `SegmentedControl` keeps its width and no longer gets squeezed by a neighbor in the same row. ([#542](https://github.com/botiverse/raft-design/pull/542))
- The time beside a merged message no longer wraps onto two lines, and it takes the person's 12-hour or 24-hour time. ([#544](https://github.com/botiverse/raft-design/pull/544))
- The presence light on a 19px avatar (`xs`, `2xs`) is 7px with a 1px edge, so it no longer covers the face. ([#549](https://github.com/botiverse/raft-design/pull/549))
- The message hover toolbar is 32px high with 28px buttons and 16px icons. It reaches 16px above the row, so leave 16px above the first message of a scroll area and above a thread's root message. ([#553](https://github.com/botiverse/raft-design/pull/553))

### Changed

- The design-system pages explain the rules behind button emphasis, empty-state titles, times, message text size and row degradation. ([#542](https://github.com/botiverse/raft-design/pull/542)), ([#543](https://github.com/botiverse/raft-design/pull/543)), ([#544](https://github.com/botiverse/raft-design/pull/544)), ([#545](https://github.com/botiverse/raft-design/pull/545)), ([#548](https://github.com/botiverse/raft-design/pull/548))

## [0.7.1](https://github.com/botiverse/raft-design/compare/v0.7.0...v0.7.1) (2026-10-19)

### Added

- `stack-y-*` / `stack-x-*` (including negative and arbitrary values) and `rule-y` / `rule-x` / `rule-<colour>`: space and rules between siblings, written as the owl `> * + *` at zero specificity. Use them instead of Tailwind's `space-*` / `divide-*`. ([#534](https://github.com/botiverse/raft-design/pull/534))

### Fixed

- **iOS scroll and open/close jank from structural selectors.** Tailwind v4 compiles `space-*` / `divide-*` to `:where(.x > :not(:last-child))`, which WebKit tests against every element; appending or removing a last child anywhere then restyled the previous last child's whole subtree (180–430ms under a long chat timeline). The package and its docs no longer use them, and `no-unanchored-structural.test.ts` keeps any rule from ending in an unanchored structural pseudo-class. Consumers should move their own `space-*` / `divide-*` to `stack-*` / `rule-*`. ([#534](https://github.com/botiverse/raft-design/pull/534))
- `codemods/package-name.mjs` keeps a deliberate `raft-ui` npm alias instead of rewriting it. ([#522](https://github.com/botiverse/raft-design/pull/522))

### Changed

- The design-system pages and component guides describe what the product ships. ([#523](https://github.com/botiverse/raft-design/pull/523), [#524](https://github.com/botiverse/raft-design/pull/524), [#526](https://github.com/botiverse/raft-design/pull/526), [#528](https://github.com/botiverse/raft-design/pull/528)–[#530](https://github.com/botiverse/raft-design/pull/530), [#532](https://github.com/botiverse/raft-design/pull/532))

## [0.7.0](https://github.com/botiverse/raft-design/compare/v0.6.1...v0.7.0) (2026-10-18)

### Breaking Changes

- **The package is now `@botiverse/raft-ui`.** Install it under that name and change imports from `raft-ui` (and `raft-ui/styles.css`, `raft-ui/cn`, …) to `@botiverse/raft-ui`: `node node_modules/@botiverse/raft-ui/codemods/package-name.mjs <src>` rewrites imports, CSS `@import`/`@source` paths and the dependency, and lists the aliases to check by hand. The unscoped `raft-ui` gets no further releases; this release also carries the changes of 0.6.1, which never reached npm.
- `MessageItemSavedIndicator` no longer takes `elevation`, and the `MessageItemSavedIndicatorElevation` type is removed. Its `"xs"` and `"sm"` values pointed at empty shadows, so the prop never drew one: delete it at call sites. ([#488](https://github.com/botiverse/raft-design/pull/488))

### Added

- `@botiverse/raft-ui/tokens.json`: every color, elevation and metric token in the Design Tokens Community Group format, with light and dark values, for design tools and code generators. `foundation.css` is generated from it. ([#482](https://github.com/botiverse/raft-design/pull/482))
- `codemods/token-names.mjs` ships in the package. `node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <src>` rewrites Tailwind utilities and `var(--…)` references from the former token names to the current ones (see Changed). ([#476](https://github.com/botiverse/raft-design/pull/476))
- `foreground-on-hud-muted` (`text-foreground-on-hud-muted`): secondary text on a tooltip or toast. ([#496](https://github.com/botiverse/raft-design/pull/496))
- Shadow utilities `shadow-float`, `shadow-sticker` and `shadow-focus`, registered with tailwind-merge in `@botiverse/raft-ui/cn`. ([#476](https://github.com/botiverse/raft-design/pull/476))

### Changed

- **Token names follow the Raft Design System.** Every former name keeps working as a deprecated alias (CSS variable and utility) until 1.0, and the values are unchanged; run the codemod to move:
  - `line` → `line-seam`, `line-muted` → `line-hairline`
  - `primary-*` → `brand-*` (yellow), `accent-*` → `attention-*` (pink)
  - `layer-panel` → `layer-canvas`, `layer-inset` → `fill-muted`, `layer-canvas-muted` → `layer-sidebar`
  - `foreground-strong` → `foreground`, `foreground-icon` → `foreground-muted`, `foreground-placeholder` → `foreground-hint`, `layer-hud-foreground` → `foreground-on-hud`
  - `--color-brutal-<color>-<step>` → `--palette-<color>-<step>` (purple is lavender), `bg-brutal-<color>` / `bg-soft-signal` → `bg-palette-<color>`
  - `--theme-shadow-float` / `-lg` / `-xl` → `--elevation-float`, `--theme-shadow-sticker` → `--elevation-sticker`, `--theme-focus-ring` → `--focus-ring`; utilities `shadow-raft-*` → `shadow-float` / `shadow-sticker` / `shadow-focus`

  Components render the current utility names, so tests that assert class names may need the new names. ([#476](https://github.com/botiverse/raft-design/pull/476), [#479](https://github.com/botiverse/raft-design/pull/479))

- `Banner` renders `role="status"`, and `role="alert"` only for `status="destructive"`, so a notice that isn't urgent no longer interrupts a screen reader. Pass `role` to override. ([#496](https://github.com/botiverse/raft-design/pull/496))
- Deprecated, to be removed in 1.0: `FloatButton` / `FloatButtonGroup` (not part of the design system), `LegacyTaskPanel*` (unused), and `LiveAgentActivityBar*` (the design system shows working agents where they appear). ([#488](https://github.com/botiverse/raft-design/pull/488))
- The package includes its MIT `LICENSE`, and its metadata points to [raft-design.botiverse.build](https://raft-design.botiverse.build). ([#487](https://github.com/botiverse/raft-design/pull/487))

### Fixed

- `Skeleton` stops pulsing under `prefers-reduced-motion`. ([#496](https://github.com/botiverse/raft-design/pull/496))
- `EmptyStateIcon` is hidden from assistive technology, and `NotificationCenterItemIcon` is announced as an image named by its status. ([#496](https://github.com/botiverse/raft-design/pull/496))

## [0.6.1](https://github.com/botiverse/rui/compare/v0.6.0...v0.6.1) (2026-10-18)

### Added

- `ListRow`, the Design System list row (`rf-row`): `ListRowGroup` (the inset card), `ListRowIcon`, `ListRowBody` / `ListRowTop` / `ListRowBottom`, `ListRowTitle`, `ListRowDescription`, `ListRowMeta`, `ListRowValue`, `ListRowChevron`. Variants `default` (64, hairline from the text), `plain` (setting row, 48) and `entry` (48, no hairlines); `tone` (`unread` / `muted` / `away`), `selected` (cyan-soft), `disabled`, and `interactive={false}` for a display-only row. ([#469](https://github.com/botiverse/rui/pull/469))
- `IconTile`, the neutral tile (`rf-tile`) for things with no face, on the avatar size ladder (19 / 27 / 35 / 51), with `warning` and `information` notice washes; `aria-hidden` unless given a role. ([#470](https://github.com/botiverse/rui/pull/470))
- `SearchTrigger` (`SearchTriggerLabel`, `SearchTriggerShortcut`): the web top bar's search box, a button drawn as a field. ([#470](https://github.com/botiverse/rui/pull/470))
- `Status` and `AvatarBadge` take `presence` (`online` / `busy` / `error` / `offline` / `external`), from one shared colour map (type `Presence`). ([#471](https://github.com/botiverse/rui/pull/471))
- `SidebarItem` takes `tone` (`RowTone`, shared with ListRow) and `interactive={false}` for a display-only row whose own buttons are the targets. ([#471](https://github.com/botiverse/rui/pull/471))
- `Button` `variant="on-frame"`: a frameless button on the yellow frame (rail, web top bar, desktop title bar); on the frame `md` and `icon-md` are the DS 36px frame item. ([#471](https://github.com/botiverse/rui/pull/471))

### Changed

- A disabled frameless (`ghost`) icon button only greys its icon; it no longer draws the sunken box. Disabled ghost text buttons and outline icon buttons keep it. ([#471](https://github.com/botiverse/rui/pull/471))
- The repository and its docs are now Raft Design; the npm package is still `raft-ui`. ([#472](https://github.com/botiverse/rui/pull/472), [#473](https://github.com/botiverse/rui/pull/473))

## [0.6.0](https://github.com/botiverse/rui/compare/v0.5.64...v0.6.0) (2026-10-18)

### Breaking Changes

- **Raft is the only look.** The brutal and elegant theme families are removed. `ThemeProvider` takes only the mode (`mode`, `defaultMode`, `onModeChange`, `storageKey`, `syncDom`) and sets a `.light` / `.dark` class and `color-scheme`; `data-theme`, `useThemeFamily`, `Theme`, `SetTheme`, `SetThemeOptions`, `BrutalOnly` and `ElegantOnly` are gone. Tokens live on `:where(:root)`, `.light` and `.dark`. ([#467](https://github.com/botiverse/rui/pull/467))
- **Props that no longer change anything are removed:** `Badge` `uppercase`; `Checkbox` `size`, `variant`, `color`; `Status` `pulse`, `attention` (status never animates); `Switch` / `SwitchThumb` `size`; `SidebarItem` `variant`; `SidebarItemCount` / `SidebarItemIndicator` `variant` and `appearance` (the count is always the pink sticker, the indicator the yellow @); `NotificationCenterActionButton` `variant`; `DrawerContent` `width` (one-go forms use the wide `Dialog`); `AppRailItemIndicator` `attention`; `AppRailItemAttention` `children`; `Steps` `size`, `track`, `renderIndicator`, `renderTraveler`; `FilePreviewBadge` `type`, `color`. Remove them at call sites. ([#467](https://github.com/botiverse/rui/pull/467))
- **Parts and exports removed:** `TabsBackground`, `TabsIndicator`, `MessageReferenceBadge`, `AppRailItemAttentionMask`, `IslandIndicator`, `OtterTraveler`, `tabsRecipe`, `taskStatus`, `taskStatusBorder`, `SidebarItemVariant`, `FilePreviewBadgeColor`, `FilePreviewBadgeType`, `StepIndicatorState`, `StepsSize`, `StepsTrack`, `StepTravelerState`. `OtterIndicator` stays as a standalone illustration. ([#467](https://github.com/botiverse/rui/pull/467))

### Added

- `CheckboxIndicator`: the 20px checkbox box as a visual part for picker rows. ([#467](https://github.com/botiverse/rui/pull/467))
- `FilePreviewBadge` `placement="inline"`: the file-type chip before a name (`"corner"` stays the default). ([#467](https://github.com/botiverse/rui/pull/467))
- The Raft Design System lives in the repository's `design/` folder: pages, component guides with reference previews, tokens, fonts and assets. ([#467](https://github.com/botiverse/rui/pull/467))

### Fixed

- A focused mention, filter trigger or active sidebar row keeps its ink edge: inset sticker edges are `inset-ring`, so the focus ring no longer replaces them. ([#467](https://github.com/botiverse/rui/pull/467))
- A `.dark` scope under a light root no longer inherits the light `foreground-active` / `foreground-hover` / `line-field` / `line-field-hover` aliases. ([#467](https://github.com/botiverse/rui/pull/467))
- Disabled outline, ghost and danger-outline buttons no longer change on hover. ([#467](https://github.com/botiverse/rui/pull/467))
- The thread panel head's actions end on the 20px edge like every other head; panel, section, drawer and thread heads share one edge rule. ([#467](https://github.com/botiverse/rui/pull/467))
- Horizontal `Steps` draw their connector (the column was 0px wide). ([#467](https://github.com/botiverse/rui/pull/467))
- `dark:` classes that restated a token no longer override a caller's class in dark mode. ([#467](https://github.com/botiverse/rui/pull/467))

### Changed

- `Button` transitions are colour-only (no `transition-all`); `xs` / `sm` render as `md`, `icon-xs` / `icon-sm` as `icon-md`. ([#467](https://github.com/botiverse/rui/pull/467))
- `FormSection`'s first section starts flush with its container. ([#467](https://github.com/botiverse/rui/pull/467))

## [0.5.64](https://github.com/botiverse/rui/compare/v0.5.63...v0.5.64) (2026-10-15)

### Changed

- `SidebarItemThreadCount` draws the package's `ThreadIcon` (was lucide `MessageSquare`), at 12px with a 1.75 stroke; badge height is unchanged. ([#463](https://github.com/botiverse/rui/pull/463))

## [0.5.63](https://github.com/botiverse/rui/compare/v0.5.62...v0.5.63) (2026-10-15)

### Added

- `MessageActionCardHeaderDescription`: a line under the title, placed inside `MessageActionCardHeaderTitle`, for what happened on a Done or Declined card or why you cannot act on a View only one. It stays visible while the card is folded. ([#461](https://github.com/botiverse/rui/pull/461))

### Changed

- `MessageActionCardHeader` aligns to the top: icon, status and collapse toggle line up with the title's first line when the title wraps or carries a description. ([#461](https://github.com/botiverse/rui/pull/461))
- `MessageActionCardNotice` is a tinted block (Elegant: soft fill, rounded; Brutal: inset fill, hairline border) meant to open the content, above the properties; it now carries a bottom margin instead of a top one. ([#461](https://github.com/botiverse/rui/pull/461))
- `MessageActionCardHintLabel` and `MessageActionCardScopeListLabel` match the property label style in Elegant; `MessageActionCardActionsNote` reads in the foreground colour; the notice icon is centred on the first line. ([#461](https://github.com/botiverse/rui/pull/461))

## [0.5.62](https://github.com/botiverse/rui/compare/v0.5.61...v0.5.62) (2026-10-15)

### Added

- `AvatarBadge` accepts `offset?: [x, y]` — the badge centre measured from the avatar's top-left: numbers are px, strings are CSS lengths, percentages are of the avatar's size (`["100%", 0]` = top-right at every size and theme). Omitted, the theme's default corner and the recipe class are untouched. ([#459](https://github.com/botiverse/rui/pull/459))

## [0.5.61](https://github.com/botiverse/rui/compare/v0.5.60...v0.5.61) (2026-10-14)

### Added

- `MessageActionCard` is a disclosure: `defaultOpen` / `open` / `onOpenChange`, and `MessageActionCardCollapseTrigger` (chevron toggle, `aria-label` required) folds the content with a 200ms height animation (off under reduced motion). ([#454](https://github.com/botiverse/rui/pull/454))
- Header parts `MessageActionCardHeaderIcon` (type icon; a generic action icon when given no children), `MessageActionCardHeaderTitle` and `MessageActionCardStatus` (state label: solid and uppercase in Brutal, soft in Elegant). ([#454](https://github.com/botiverse/rui/pull/454))
- `MessageActionCardHintLabel` ("Reason") above the agent's italic `MessageActionCardHint` quote, and `MessageActionCardNotice` for Raft's note about what the action does or who may run it: one plain line with a default info icon (`icon` replaces it). ([#454](https://github.com/botiverse/rui/pull/454))
- `MessageActionCardScopeListViewport` scrolls a long permission list inside a cap that cuts through the third row (132px Brutal, 172px Elegant). `aria-label` is required; it is a Tab stop only while the list overflows. ([#454](https://github.com/botiverse/rui/pull/454), [#457](https://github.com/botiverse/rui/pull/457))
- `MessageActionCardActionsNote` holds state text on the left of the actions. ([#454](https://github.com/botiverse/rui/pull/454))

### Changed

- `MessageActionCardActions` aligns its buttons to the right. ([#454](https://github.com/botiverse/rui/pull/454))
- Brutal `MessageActionCard` frame: 2px border, 2px hard shadow, tinted title band ruled off at 2px (the rule goes away when folded). ([#454](https://github.com/botiverse/rui/pull/454))

## [0.5.60](https://github.com/botiverse/rui/compare/v0.5.59...v0.5.60) (2026-10-14)

### Added

- `SidebarItemThreadCount` (thread icon + number of followed threads with new replies, with a visually hidden, localizable `label` for screen readers) and `SidebarItemCountSeparator` (the dot between counts), so a channel row's `SidebarItemCount` can read `5 · [thread] 1`. Both also work as quiet text inside `SidebarItemMeta` for muted channels. `SidebarItemCount` stays as tight as a plain number when it holds the thread icon. ([#455](https://github.com/botiverse/rui/pull/455))

## [0.5.59](https://github.com/botiverse/rui/compare/v0.5.58...v0.5.59) (2026-10-14)

### Reverted

- The `--layer-frame` surface token and Elegant `AppRail` painting it, released in 0.5.58, are taken back out until the app-frame colour is confirmed. Consumers should skip 0.5.58 and take 0.5.59. ([#452](https://github.com/botiverse/rui/pull/452), reverts [#449](https://github.com/botiverse/rui/pull/449))

## [0.5.58](https://github.com/botiverse/rui/compare/v0.5.57...v0.5.58) (2026-10-14)

### Added

- `Steps` takes `renderTraveler(state)` on `track="river"`: one traveler (drawn from `{ index, status }`) swims upstream from marker to marker. With a traveler each step after the first is the reach that leads into its marker, the river is full all along and runs back toward the first step, and the markers look as the traveler has got to them: it lands at each finished marker in turn (never skipping one), rests and sets off again, so a marker never shows finished ahead of it. Leg timing comes from `--r-steps-traveler-arrive-duration` and the new `--r-steps-traveler-rest-duration` (0s under reduced motion). The plain river track is unchanged. New `StepTravelerState` type. ([#445](https://github.com/botiverse/rui/pull/445))
- `IslandIndicator` (an island marker that flies the Raft flag once finished, red shallows on error) and `OtterTraveler` (an otter for `renderTraveler`). ([#445](https://github.com/botiverse/rui/pull/445))
- `--layer-frame` surface token (`bg-layer-frame`) for the app frame (top bar and rail); Elegant `AppRail` paints it. ([#449](https://github.com/botiverse/rui/pull/449))

### Fixed

- `TaskChip` / `TaskStatusBadge` `size="sm"` take the `sm` Badge's own box (padding, border, line height), so it no longer drifts from the Badge beside it. ([#450](https://github.com/botiverse/rui/pull/450))

## [0.5.57](https://github.com/botiverse/rui/compare/v0.5.56...v0.5.57) (2026-10-14)

### Added

- `OtterIndicator`: an otter step marker for `Steps` `renderIndicator`, taking a step `status` (`wait` sleeps on the dry bank, `process` paddles on its back, `finish` hugs its parcel, `error` shivers as the parcel floats off). Use with `track="river"` and `--r-steps-indicator-size: 48px`; its CSS now ships in the published package. ([#441](https://github.com/botiverse/rui/pull/441))

### Fixed

- `Steps` `track="river"` in a wide row sizes each step to its own content and shares the remaining space evenly, so every river reach is the same length even when titles differ in length. The plain connector and the narrow layout are unchanged. ([#442](https://github.com/botiverse/rui/pull/442))

## [0.5.56](https://github.com/botiverse/rui/compare/v0.5.55...v0.5.56) (2026-10-13)

### Added

- `Steps` takes `track="river"`: the connector becomes a channel that is full of water behind finished steps, has water flowing in behind the step in progress, stalls red half way after a failed step and is a dry bed ahead. Brutal and Elegant recipes, horizontal and vertical, RTL; under reduced motion the water stands still. In a column, `--r-steps-river-overlap-start` / `--r-steps-river-overlap-end` (default 0) reach the channel into a custom marker above / below. ([#439](https://github.com/botiverse/rui/pull/439))
- `Steps` takes `renderIndicator(state)`, which draws a step's marker from `{ index, status, current, marker }`. The slot keeps the marker size (`--r-steps-indicator-size`) and drops the default box; returning `undefined` or `null` keeps the default marker for that step. New `StepsTrack` and `StepIndicatorState` types. ([#439](https://github.com/botiverse/rui/pull/439))

## [0.5.55](https://github.com/botiverse/rui/compare/v0.5.54...v0.5.55) (2026-10-12)

### Fixed

- `TaskChip` / `TaskStatusBadge` `size="sm"` now also match the `sm` Badge's font weight and letter spacing (Elegant 500 / 0.22px, Brutal 700), so the chip no longer reads as a different font beside the Badges in slock's Activity card row. The default size and the inline variant are unchanged. ([#437](https://github.com/botiverse/rui/pull/437))

## [0.5.54](https://github.com/botiverse/rui/compare/v0.5.53...v0.5.54) (2026-10-12)

### Added

- `TaskChip` and `TaskStatusBadge` take `size="sm"`, which gives the chip the `sm` Badge's text size and height (Elegant 11px / 18px, Brutal 10px / 20px; icon 10px) for a chip that shares a row with Badges, such as slock's Activity card metadata row. The default size and the inline variant are unchanged. ([#435](https://github.com/botiverse/rui/pull/435))

## [0.5.53](https://github.com/botiverse/rui/compare/v0.5.52...v0.5.53) (2026-10-12)

### Fixed

- `MessageList` no longer lets wide content (a `w-max` tab strip, a long code line) stretch every message past a narrow list on a desktop viewport: its `ScrollAreaContent` resets Base UI's inline `min-width: fit-content` to 0, so the content keeps the list width and wide children scroll inside their own box. ([#431](https://github.com/botiverse/rui/pull/431))

## [0.5.52](https://github.com/botiverse/rui/compare/v0.5.51...v0.5.52) (2026-10-12)

### Fixed

- The collapsed system-note toggle's box is its real clickable height: no element overlaps (the historic negative margin is gone), both themes read `pb-0`, one seam value serves every note kind (`data-follows-system` is a plain marker again), and the 12/6/12 rhythm is unchanged. ([#425](https://github.com/botiverse/rui/pull/425) → [#426](https://github.com/botiverse/rui/pull/426) → [#427](https://github.com/botiverse/rui/pull/427), consolidated pre-release)

## [0.5.51](https://github.com/botiverse/rui/compare/v0.5.50...v0.5.51) (2026-10-11)

### Fixed

- The system note's seams read 12 after the marker fix: the follower's top lands `pt-[12px]` (elegant) / `mt-[5px]` (brutal); the single-note lead reads 3 / 0; the group layer flattens (title top 1 / 0, disclosure keeps its padding for the tap area behind `relative`); in-group note leads re-hang app-side. ([#423](https://github.com/botiverse/rui/pull/423))

## [0.5.50](https://github.com/botiverse/rui/compare/v0.5.49...v0.5.50) (2026-10-11)

### Changed

- The narrow tier joins the rhythm: the mobile group break lands 20 via the group-first `pt-[13px]`, and the narrow avatar image reads 28 through `--mi-avatar-narrow` (default `1.75rem`) in both themes; brutal's narrow shift keeps its default 3. ([#421](https://github.com/botiverse/rui/pull/421))

## [0.5.49](https://github.com/botiverse/rui/compare/v0.5.48...v0.5.49) (2026-10-11)

### Fixed

- The message-row avatar centers the box that occupies its slot (the image-level `mx-auto` was inert — the slot now flex-centers its child, putting the image's left edge back at 22). ([#419](https://github.com/botiverse/rui/pull/419))
- Brutal's +3 image shift becomes `--mi-avatar-shift` (default 3px) so the small font tier can set 0 — removing the tier's row-propping and the 1.4px overshoot. ([#419](https://github.com/botiverse/rui/pull/419))

## [0.5.48](https://github.com/botiverse/rui/compare/v0.5.47...v0.5.48) (2026-10-11)

### Changed

- The system note keeps a net 12/12 rhythm: the note owns a 4px lead-in and no trailing margin, and the message that follows cancels the rest of the seam via `data-follows-system` (elegant `pt-[10px]`; brutal `mt-0` with the note's own `pt-0.5` on its different row rhythm). Expanded note groups read 6 apart. ([#417](https://github.com/botiverse/rui/pull/417))

## [0.5.47](https://github.com/botiverse/rui/compare/v0.5.46...v0.5.47) (2026-10-11)

### Changed

- Group interiors tighten to 12: the followed-by collapse splits by follower kind — `data-[followed-by=compact]:pb-0.5` (interiors) vs `data-[followed-by=group]:pb-1.5` (breaks stay 24). ([#415](https://github.com/botiverse/rui/pull/415))
- Message-row avatars read at 32 via `--mi-avatar` (default `2rem`; the app raises it to 34px on the large font tier), horizontally centered in the unchanged 36 slot — the text line and header icon keep the 68 line, and the shorter avatar column stops propping the small-tier first row. ([#415](https://github.com/botiverse/rui/pull/415))
- Per-theme avatar alignment: elegant keeps top alignment; brutal shifts the image 3px down to meet its name line's optical position (provisional — Josh's post-merge capture decides 2 vs 3). ([#415](https://github.com/botiverse/rui/pull/415))

## [0.5.46](https://github.com/botiverse/rui/compare/v0.5.45...v0.5.46) (2026-10-11)

### Changed

- Message rhythm becomes marker-driven: the dead sibling collapse (`has(+[data-compact=true])`, blinded by per-message wrappers) is replaced by an explicit `data-followed-by` on any row another row follows — rows collapse their bottom padding to land 16 inside a group; group-first rows take `pt-[17px]` so every group break measures 24; the reply-card row collapses identically. Brutal's own rhythm is untouched. ([#412](https://github.com/botiverse/rui/pull/412))
- Docs: `packages/ui/TYPOGRAPHY.md` (Typography & Colour Foundations v2) with the review fixes and the corrected brutal clause. ([#410](https://github.com/botiverse/rui/pull/410), [#411](https://github.com/botiverse/rui/pull/411), [#413](https://github.com/botiverse/rui/pull/413))

## [0.5.45](https://github.com/botiverse/rui/compare/v0.5.44...v0.5.45) (2026-10-11)

### Changed

- Dark elegant `hint`/`placeholder` darken to 0.68/0.64 (explicit dark block + the pre-hydration mirror) so the note tiers separate the way they do in light; both stay above the 4.5 readability line. ([#408](https://github.com/botiverse/rui/pull/408))
- The reply-preview time aligns to its own theme's header time: elegant reads `font-sans` at 11.5px tabular (drops mono), brutal takes `font-mono` at 11.5px tabular (it was the odd sans one out). ([#408](https://github.com/botiverse/rui/pull/408))

## [0.5.44](https://github.com/botiverse/rui/compare/v0.5.43...v0.5.44) (2026-10-11)

### Changed

- The message header's right-side reserve (kept clear of the hover toolbar) becomes variable-driven: `pr-(--mi-hdr-pr,6rem)` with the 6rem default unchanged, so narrow hosts — the Thread panel inside a wide window — lower it locally instead of relying on viewport breakpoints. Contract test pins the variable and the default in both themes. ([#406](https://github.com/botiverse/rui/pull/406))

## [0.5.43](https://github.com/botiverse/rui/compare/v0.5.42...v0.5.43) (2026-10-10)

### Changed

- Elegant colour ladder lands as decided: panel titles move to `foreground` (base) under the 17/600 line; unselected tabs rest on `hint` in both elegant tab compounds (operable 13px text clears 4.5:1; the segmented variant's own selected token is untouched); message notes (meta / time / inline status) move to `hint` and the sender name goes 500→600 in the same content ink; `--foreground-placeholder` (elegant light) rises 0.58→0.55 for 4.85:1 on white and 4.56:1 on the header tint. Brutal unchanged this round. ([#404](https://github.com/botiverse/rui/pull/404))

## [0.5.42](https://github.com/botiverse/rui/compare/v0.5.41...v0.5.42) (2026-10-10)

### Changed

- Elegant panel titles sit at semibold: one title size (17) with weight and colour carrying the hierarchy (sidebar 700, panel 600). Brutal keeps its own bold 16. ([#402](https://github.com/botiverse/rui/pull/402))

## [0.5.41](https://github.com/botiverse/rui/compare/v0.5.40...v0.5.41) (2026-10-10)

### Changed

- `TaskStatusBadge` now renders through `TaskChip` and has no look of its own: a status badge in a task panel and the task chip under a message share one shape, size, border and colour and differ only in content (status icon + the caller's label). Visible change: in Elegant the badge goes from 12px to the chip's 13px with a hairline border and a 19px height; in Brutal from bold 12px at 20px tall to the chip's medium 13px at about 18px tall, so rows that carry it are about 2px shorter. `data-slot="task-status-badge"` and `data-status` are kept; no API change. ([#398](https://github.com/botiverse/rui/pull/398))

## [0.5.40](https://github.com/botiverse/rui/compare/v0.5.39...v0.5.40) (2026-10-10)

### Fixed

- Elegant `PanelHeader`'s icon chip: `fill-muted` measured 1.04:1 against the canvas-muted header (effectively invisible) and becomes `fill-strong`; avatar slots declare `data-icon-kind="avatar"` and drop the chip entirely, so a round avatar no longer sits on a square. Brutal's black-bordered chip is unchanged. ([#399](https://github.com/botiverse/rui/pull/399))
- Elegant `ThreadPanel` no longer casts a dark drop-shadow over the chat divider: the leftward gradient (and its paired vertical ambient shadow) is removed. ([#399](https://github.com/botiverse/rui/pull/399))

## [0.5.39](https://github.com/botiverse/rui/compare/v0.5.38...v0.5.39) (2026-10-10)

### Fixed

- Brutal `TaskStatusBadge` draws a 1px black keyline instead of 2px, matching `TaskChip` and `Badge`; `py-px` keeps it exactly 20px tall, so surrounding layout does not move (Elegant unchanged). ([#396](https://github.com/botiverse/rui/pull/396))

## [0.5.38](https://github.com/botiverse/rui/compare/v0.5.37...v0.5.38) (2026-10-10)

### Fixed

- `TaskChip`'s `inline` variant no longer paints its own neutral fill and transparent border over the status styling: task references inside message bodies take the same per-status fill, border, text and icon colours as the task chip under a message (Elegant; Brutal unchanged; font size and baseline rules untouched). ([#394](https://github.com/botiverse/rui/pull/394))

## [0.5.37](https://github.com/botiverse/rui/compare/v0.5.36...v0.5.37) (2026-10-10)

### Fixed

- Brutal `Combobox` keeps its shadow when open, as `Select` does: the control lifts 1px with `shadow-raft-md` instead of dropping the shadow. In Brutal, `SelectContent` and `ComboboxContent` now default `sideOffset` to 8px (was 4px), so the open trigger's shadow stays clear of the popup instead of running into it. Elegant keeps 4px; an explicit `sideOffset` still wins. ([#392](https://github.com/botiverse/rui/pull/392))

## [0.5.36](https://github.com/botiverse/rui/compare/v0.5.35...v0.5.36) (2026-10-09)

### Changed

- Panel alignment: the elegant `PanelHeader` puts its icon box on the 20px line and the title on the 68px line (36px to 20px at `md`+, gap 8 to 12); `MessageItem` rows in both themes carry the 8px inset (7px padding + 1px border, 6px + 2px in Brutal) that lands the avatar on 20 and the text on 68 next to the 12px the app shell keeps. Brutal also drops the row's `mx-3`, taking the mobile avatar inset from 32 to 20. The thread panel uses the chat panel's figures. ([#388](https://github.com/botiverse/rui/pull/388))
- Elegant `Tabs` underline: the bar starts on the 20px line at every width (the first icon lands at 32), and the strip has one source now — the indicator defaults to `bg-primary-400` and the placement blocks no longer draw a static hairline, so the conversation panel, the agent-details strip and the docs read the same look. Brutal underline: the conversation panel drops its asymmetric first-tab `pl-[22px]`; the strip sits at 16 and reads centred, as the agent-details strip. ([#389](https://github.com/botiverse/rui/pull/389))
- `MessageReplies` stays on the message text line: the dead right margin is gone (a 100%-wide block drops an over-constrained `-mr-2`) and a browser spec now pins the rendered right edge, so a class-only assertion can no longer regress it silently. Run it with `vp test --browser.enabled`. ([#389](https://github.com/botiverse/rui/pull/389))

## [0.5.35](https://github.com/botiverse/rui/compare/v0.5.34...v0.5.35) (2026-10-09)

### Changed

- Layout rules across the library no longer style descendants from an ancestor `:has()`. Selectors of that shape make Chromium fall back to recalculating the whole page's style on unrelated mutations — measured in the app, one such rule costs over 5ms per text-node change in a 300-message channel (~13.8k elements); this release removes the 28 in this library. Rendering is otherwise unchanged; the caller-visible points follow. ([#386](https://github.com/botiverse/rui/pull/386))
- `SidebarSection`'s attention badge no longer hides on its own while a section menu is open. The section's own open state and header hover still hide it; to also hide it while a menu is open, the header must mirror the menu's open state onto itself as `data-popup-open` (the docs composition shows the wiring). ([#386](https://github.com/botiverse/rui/pull/386))
- `Banner`'s action spans two rows only when it comes after both the title and the description; an action placed before them no longer spans. The status column now always spans two rows. ([#386](https://github.com/botiverse/rui/pull/386))
- `InputGroup` addon and text colours are driven by variables on the group root. A caller-provided text-colour class on those parts replaces their colour in every state, focus and disabled included. ([#386](https://github.com/botiverse/rui/pull/386))
- `ToastContent` measures its rendered content and writes `data-has-icon`, `data-has-description` and `data-has-actions` on itself; the content layout keys off these attributes instead of descendant selectors. ([#386](https://github.com/botiverse/rui/pull/386))

## [0.5.34](https://github.com/botiverse/rui/compare/v0.5.33...v0.5.34) (2026-10-09)

### Fixed

- In a horizontal `Steps`, the connector follows the title on its line and runs on to the next step's marker, as in naive-ui; the description goes on the line below, under the title and the connector. A description wider than its title no longer shortens the connector to a stub. Below 640px the stacked layout (text under the marker) is unchanged. CSS only; the DOM is the same. ([#384](https://github.com/botiverse/rui/pull/384))

## [0.5.33](https://github.com/botiverse/rui/compare/v0.5.32...v0.5.33) (2026-10-09)

### Changed

- `Steps` markers take the task-status colours shared with `TaskChip` (`--task-status-*`), so each status has its own colour: finished = Done (green), in progress = In Progress (blue), failed = danger (red), and waiting is neutral grey (the Closed ink). Brutal: solid status fill, ink outline and ink text, as the Brutal `TaskChip`. Elegant: the status's soft wash, strong ink and a 35% hairline, as the Elegant `TaskChip`; waiting steps follow naive-ui with no fill and the ring, number and title in the disabled grey. ([#381](https://github.com/botiverse/rui/pull/381))

## [0.5.32](https://github.com/botiverse/rui/compare/v0.5.31...v0.5.32) (2026-10-09)

### Added

- Added `Steps` and `Step`: numbered steps through a process, as an ordered list. Steps before `current` are finished, the ones after it waiting, and the current step takes `status` (`process`, `finish`, `error` or `wait`) and `aria-current="step"`. Supports `sm` / `md` sizes, a `vertical` layout, custom `finishIcon` / `errorIcon` / per-step `icon`, screen-reader `finishLabel` / `errorLabel`, and clickable steps through `onUpdateCurrent` (with `disabled` steps). Below 640px a horizontal Steps stacks each step's text under its marker. Styled for Brutal and Elegant from semantic tokens; `steps.css` ships in `styles.css` and as `dist/components/steps/steps.css`. ([#378](https://github.com/botiverse/rui/pull/378))

## [0.5.31](https://github.com/botiverse/rui/compare/v0.5.30...v0.5.31) (2026-10-08)

### Fixed

- `TaskStatusBadge` in Brutal is a square, hard-edged tag again (no radius, 2px black border, bold, 20px tall), matching the Brutal `TaskChip` and `Badge`. 0.5.30 rendered it as a rounded pill. Elegant is unchanged.

## [0.5.30](https://github.com/botiverse/rui/compare/v0.5.29...v0.5.30) (2026-10-08)

### Added

- Added the `--task-status-<status>` colour tokens (with `-soft` and `-strong`) for the five task states, defined for Brutal, Elegant light and Elegant dark, and exposed to Tailwind as `task-status-*`.
- Added `TaskStatusBadge`: a status badge that takes a `status` and caller-provided text.
- Added the `taskStatus` prop on `TimelineItem`, which paints the marker from the status colour. Omitting it leaves the item unchanged.

### Changed

- Task status colours now come from the tokens above everywhere (`TaskStatusIcon`, `TaskChip`, task card, board and list). In Elegant this changes three states so each status keeps one hue family across themes: Todo grey → orange, In Progress yellow → blue, In Review orange → purple. Closed uses the disabled foreground colour. Brutal colours are unchanged.
- `TaskStatusIcon` renders the lucide `Circle`, `Play`, `Eye`, `CheckCircle` and `Ban` glyphs instead of the previous hand-drawn icons, and forwards SVG props.

## [0.5.28](https://github.com/botiverse/rui/compare/v0.5.27...v0.5.28) (2026-10-07)

### Added

- Added the composable `AnnouncementDialog` through `raft-ui/wip`, built on existing Dialog and Button primitives, with a label, picture, scrolling body and fixed footer. Narrow dialogs stack both actions at full width. ([#363](https://github.com/botiverse/rui/pull/363))
- Updated the canonical announcement example to use the new component. Existing Dialog, Button and theme behavior remain unchanged.

## [0.5.1](https://github.com/botiverse/rui/compare/v0.5.0...v0.5.1) (2026-08-12)

### Fixed

- Removed the duplicate inset outline from Elegant dark `ThreadPanelContent` on large screens, leaving the header/content seam with a single visual owner. ([#213](https://github.com/botiverse/rui/pull/213))

## [0.5.0](https://github.com/botiverse/rui/compare/v0.4.0...v0.5.0) (2026-08-10)

### Breaking Changes

- **Brutal `SidebarItem` active styling is neutral by default.** Active items now use a white surface instead of pink. Pass `variant="accent"` to preserve the previous pink treatment, or `variant="primary"` for yellow. ([#207](https://github.com/botiverse/rui/pull/207))
- **Elegant `PanelHeaderIcon` now owns its container treatment.** It renders as a 36px rounded muted surface instead of a bare auto-sized slot. Remove redundant consumer wrappers and update layouts that relied on the previous intrinsic size. ([#208](https://github.com/botiverse/rui/pull/208))

### Added

- Graduated the composable `ActivityInbox` shell, sidebar, selection toolbar, and standalone `InboxItem` parts to the stable package entry point. ([#209](https://github.com/botiverse/rui/pull/209))
- Graduated the Search shell and entity, message, and thread result primitives to the stable package entry point. ([#210](https://github.com/botiverse/rui/pull/210))
- Graduated `PickerTriggerButton` for compact Select and Combobox filter triggers. ([#208](https://github.com/botiverse/rui/pull/208), [0fef4c1](https://github.com/botiverse/rui/commit/0fef4c1d39e18335d2c2fc3a7102054f6f72339d))
- Added `beam={false}` to `LiveAgentActivityBar` to disable the Elegant animated border and glow while preserving enter and exit transitions. ([#211](https://github.com/botiverse/rui/pull/211))

### Changed

- Icon-only `MessageFooterSavedIndicator` controls now receive dedicated compact sizing and theme interaction styling. ([#209](https://github.com/botiverse/rui/pull/209))

## [0.4.0](https://github.com/botiverse/rui/compare/v0.3.0...v0.4.0) (2026-08-07)

### Breaking Changes

- **Layer tokens renamed.** `--layer-page` and `--color-layer-page` are removed in favor of `--layer-canvas` / `--layer-canvas-muted` (plus new `--color-layer-canvas` and `--color-layer-canvas-muted`). Update any custom CSS or utility classes that referenced `layer-page`. ([2b9b5b2](https://github.com/botiverse/rui/commit/2b9b5b2))
- **Invalid-state styling now keys off `data-invalid` instead of `aria-invalid`.** `Input`, `Textarea`, and form controls style the error visual from `data-invalid` and mirror it to `aria-invalid`; passing `aria-invalid` alone no longer shows the error style. Update callers to pass `data-invalid`. ([b3786da](https://github.com/botiverse/rui/commit/b3786da))
- **`CopyableCodeAction` label props removed.** `ariaLabel` and `copiedAriaLabel` are gone; use the standard `aria-label` prop instead. The default label still swaps between "Copy code" and "Copied code". ([b3786da](https://github.com/botiverse/rui/commit/b3786da))
- **`PanelHeaderIcon` no longer sizes its icon.** The slot dropped the `[&_svg]` sizing (brutal 18px / elegant 14px stroke 2.5); consumers must now size icons themselves, e.g. with a `size-*` class or the `size` attribute. ([0295c2e](https://github.com/botiverse/rui/commit/0295c2e))

### Changed

- **AppShell no longer draws column dividers.** `AppShellRailSlot` and `AppShellSidebarSlot` dropped their border classes in both themes. The rail|sidebar divider now lives on `AppRailRoot` (brutal); seam borders the shell used to own (e.g. sidebar|main with an inset main panel) must be added by the caller. ([e219fd8](https://github.com/botiverse/rui/commit/e219fd8))
- **Button press feedback unified.** Buttons now always apply the active press scale, including when they act as popup triggers; size variants use a consistent `rounded-sm` corner radius. Select, Combobox, and DropdownMenu share the same press model. ([7295b34](https://github.com/botiverse/rui/commit/7295b34))
- **Brutal polish:** the active AppRail item received its hard shadow ([eedc270](https://github.com/botiverse/rui/commit/eedc270)) and the inline thread replies surface was aligned with the source app's wash style ([4974cfc](https://github.com/botiverse/rui/commit/4974cfc)).

### Fixed

- **Switch dark mode.** The unchecked thumb resolved to near-white in dark scope (`--ink` is "white ink" there) and is now a mid-dark warm gray; disabled thumbs are desaturated versions of their normal-state colors in both light and dark; the dark disabled track uses a black ring instead of the bright `--line-muted` hairline. ([7c81bd3](https://github.com/botiverse/rui/commit/7c81bd3))

## [0.3.0](https://github.com/botiverse/rui/compare/v0.2.1...v0.3.0) (2026-08-06)

### Breaking Changes

- Replaced the previous surface, line, state, shadow, and motion CSS names with the semantic token contract used by the completed Elegant dark theme. Migrate `layer-muted`/`layer-strong` to `fill-muted`/`fill-strong`, `line-subtle` to `line-muted`, lighter borders to `line-hairline`, `state-<tone>-*` to the corresponding semantic tone family, `shadow-*` to `shadow-raft-*`, and `ease-sheet` to `ease-slide`. The `safe-top`, `safe-bottom`, `safe-left`, and `safe-right` utilities are no longer provided. ([#178](https://github.com/botiverse/rui/pull/178))
- Renamed `PanelHeaderFrame` to `PanelHeaderRoot` and updated the corresponding type and `data-slot` from `panel-header-frame` to `panel-header-root`. Panel header parts remain available from the package root and are now owned by the shared Panel vocabulary. ([#175](https://github.com/botiverse/rui/pull/175))
- Renamed `MessageForwardedBundleToggle` to `MessageForwardedBundleFooterAction`, including its props type and `data-slot`. ([#189](https://github.com/botiverse/rui/pull/189))

### Added

- Completed Elegant dark mode across the component library, with dark-aware page, panel, inset, card, popover, backdrop, and HUD surfaces; semantic text, border, state, and interaction colors; elevated shadows; native color-scheme integration; and correct nested theme-scope behavior. Dialogs, menus, form controls, messages, task surfaces, navigation, search, activity, and multi-panel layouts now adapt consistently when rendered in dark mode. ([#178](https://github.com/botiverse/rui/pull/178), [#180](https://github.com/botiverse/rui/pull/180), [#181](https://github.com/botiverse/rui/pull/181), [#195](https://github.com/botiverse/rui/pull/195), [#196](https://github.com/botiverse/rui/pull/196), [#204](https://github.com/botiverse/rui/pull/204))
- Added the composable `Card` component with `default` and `inset` variants and the final `CardHeader`, `CardLeading`, `CardTitle`, `CardDescription`, `CardTrailing`, `CardContent`, and `CardFooter` parts. ([#184](https://github.com/botiverse/rui/pull/184), [#202](https://github.com/botiverse/rui/pull/202))
- Graduated `ProfilePanel` and `ToggleGroup` to the stable package entry point. ([#197](https://github.com/botiverse/rui/pull/197))
- Added `AppShellPanelSlot` and `AppShellOverlaySlot`, overlay-aware main slots, attached/inset Panel edges, and the shared `PanelActivity` header part for composable multi-panel layouts. ([#175](https://github.com/botiverse/rui/pull/175), [#198](https://github.com/botiverse/rui/pull/198), [#199](https://github.com/botiverse/rui/pull/199))
- Included the raft-ui guide and critique agent skills in the published package. ([#127](https://github.com/botiverse/rui/pull/127), [#193](https://github.com/botiverse/rui/pull/193))

### Changed

- Aligned existing components with the new semantic theme contract so surfaces, text hierarchy, borders, focus treatments, state colors, and elevation remain consistent across Brutal, Elegant light, and Elegant dark themes. ([#178](https://github.com/botiverse/rui/pull/178))
- Upgraded the Base UI runtime dependency from 1.6 to 1.7. ([3a76bec](https://github.com/botiverse/rui/commit/3a76bec9b7061ee5723d8733d547b378e6a5789a))

### Fixed

- Normalized Button sizing and focus treatments and restored the Brutal danger-outline lift interaction. ([#174](https://github.com/botiverse/rui/pull/174), [#183](https://github.com/botiverse/rui/pull/183))
- Restored component-owned Combobox input styling and corrected Select, Combobox, Input, Textarea, RadioGroup, and Switch interaction states across light and dark themes. ([679de8a](https://github.com/botiverse/rui/commit/679de8af32ceba1c5335b62dfc496728e2caa312), [ef814f9](https://github.com/botiverse/rui/commit/ef814f90c6001d965a166ef384a41623e1624114), [#179](https://github.com/botiverse/rui/pull/179), [#186](https://github.com/botiverse/rui/pull/186))
- Preserved message attachment order and spacing and improved reference and avatar alignment in message rows. ([c9118b7](https://github.com/botiverse/rui/commit/c9118b7b903e8ff2b3e59eec2aaabe686a64b8f3), [#194](https://github.com/botiverse/rui/pull/194))
- Restored App Rail state contrast, opaque Avatar group rings, panel resizing behavior, and Toast dismiss styling. ([#180](https://github.com/botiverse/rui/pull/180), [#188](https://github.com/botiverse/rui/pull/188), [#196](https://github.com/botiverse/rui/pull/196), [fcf0d14](https://github.com/botiverse/rui/commit/fcf0d149850a9192ea008999e05a9ae9d1cf905d))

## [0.2.1](https://github.com/botiverse/rui/compare/v0.2.0...v0.2.1) (2026-08-01)

### Fixed

- Restored the Brutal Toast action and close button treatment. ([#173](https://github.com/botiverse/rui/pull/173))

## [0.2.0](https://github.com/botiverse/rui/compare/v0.1.0...v0.2.0) (2026-07-31)

### Breaking Changes

- Renamed the stable `ChatSidebar*` compound API to `Sidebar*`. Replace each `ChatSidebar`-prefixed component and prop type with its `Sidebar` counterpart, and update selectors from `chat-sidebar-*` to `sidebar-*`. ([#167](https://github.com/botiverse/rui/pull/167))
- Generalized panel chrome: replace `PanelHeader` with `PanelHeaderFrame`, and replace `ConversationPanelActions`, `ConversationPanelHeader*`, `ConversationPanelHeading`, `ConversationPanelMeta`, `ConversationPanelSectionHeader`, `ConversationPanelStatus`, and `ConversationPanelTitle` with their `Panel*` counterparts. Update selectors targeting the renamed `data-slot` values. ([#169](https://github.com/botiverse/rui/pull/169))
- Renamed task status values from `in_progress` and `in_review` to `in-progress` and `in-review`. ([#159](https://github.com/botiverse/rui/pull/159))

### Added

- Added stable `CodeBlock*` and semantic `Markdown*` compound primitives. ([#132](https://github.com/botiverse/rui/pull/132), [#133](https://github.com/botiverse/rui/pull/133))
- Added the stable message core: `MessageItem*`, reactions, references, selection toolbars, quoted previews, reply previews, and system messages. ([#143](https://github.com/botiverse/rui/pull/143), [#150](https://github.com/botiverse/rui/pull/150), [#156](https://github.com/botiverse/rui/pull/156), [#160](https://github.com/botiverse/rui/pull/160), [#161](https://github.com/botiverse/rui/pull/161), [#163](https://github.com/botiverse/rui/pull/163))
- Graduated the remaining message surfaces to the stable entry: action cards, attachments and media previews, embeds, forwarded bundles, translation parts, and message lists. ([3bf4790](https://github.com/botiverse/rui/commit/3bf479075c53b2702a90a1c89df9b123137339e8))
- Graduated `DescriptionList`, Files panel primitives, and `LiveAgentActivityBar` to the stable entry. `DescriptionList` includes horizontal layout support. ([#120](https://github.com/botiverse/rui/pull/120), [#131](https://github.com/botiverse/rui/pull/131), [#168](https://github.com/botiverse/rui/pull/168))
- Added `TaskChip`, named task-status icon exports, and `PanelSection`. ([#159](https://github.com/botiverse/rui/pull/159), [#169](https://github.com/botiverse/rui/pull/169))

### Changed

- Added consistent `data-slot` attributes to the retained core Panel parts. ([#169](https://github.com/botiverse/rui/pull/169))
- Elegant badges now preserve caller-provided casing when `uppercase` is set; Brutal badges continue to render uppercase. ([#156](https://github.com/botiverse/rui/pull/156))

### Fixed

- Fixed conditional-hook rendering in `AppShellSidebarTrigger` and `LegacyTaskPanelRoot`, and corrected sortable Composer drag-overlay mapping. ([#128](https://github.com/botiverse/rui/pull/128))
- Aligned the AppRail attention indicator. ([#165](https://github.com/botiverse/rui/pull/165))

## [0.1.0](https://github.com/botiverse/rui/compare/v0.0.22...v0.1.0) (2026-07-24)

### Breaking Changes

- Flattened `CopyableCode`: the preset and `CopyableCode.Code` compound API are removed. Compose `CopyableCodeRoot`, `CopyableCode`, and `CopyableCodeAction`; `CopyableCodeCodeProps` is gone and data-slots were renamed. ([#76](https://github.com/botiverse/rui/pull/76))
- Removed public shadow CSS tokens/utilities: `shadow-soft-popover`, `shadow-brutal-sm`, `shadow-brutal`, and `shadow-brutal-lg`. Use theme shadows (`shadow-sm`…`shadow-xl`) or inline values. ([#98](https://github.com/botiverse/rui/pull/98), [#104](https://github.com/botiverse/rui/pull/104))

### Added

- Graduated `AppRail`, `AppShell` (with sidebar collapse trigger), `ChatSidebar`, `Composer` (including sortable attachments), and `Resizable*` to the stable entry. ([#55](https://github.com/botiverse/rui/pull/55), [#68](https://github.com/botiverse/rui/pull/68), [#88](https://github.com/botiverse/rui/pull/88))
- Added `ConversationPanel`, `ThreadPanel`, `Panel`, `ScrollArea`, `FilePreview`, `RaftLogo` / lockup / wordmark, and `MobileNav`.
- Added the task board / card / dnd / list / panel suite and `LegacyTaskPanel`. ([#99](https://github.com/botiverse/rui/pull/99), [#100](https://github.com/botiverse/rui/pull/100), [#101](https://github.com/botiverse/rui/pull/101), [#102](https://github.com/botiverse/rui/pull/102), [#103](https://github.com/botiverse/rui/pull/103), [#115](https://github.com/botiverse/rui/pull/115))
- Extended `Lightbox` with thumbnail strip and related chrome parts; added `ComboboxTriggerCount` and `ContextMenuPopup`. ([#73](https://github.com/botiverse/rui/pull/73), [#89](https://github.com/botiverse/rui/pull/89))
- Added safe-area utilities: `safe-top`, `safe-bottom`, `safe-left`, and `safe-right`.

### Changed

- Unified elegant focus rings across inputs and controls. ([#114](https://github.com/botiverse/rui/pull/114))
- `AvatarBadge` is a `useRender` shell for custom indicators; the default dot still inherits parent size. ([#94](https://github.com/botiverse/rui/pull/94), [#107](https://github.com/botiverse/rui/pull/107))
- Input invalid styling is driven by `data-invalid` (still mirrored from `aria-invalid`). ([#82](https://github.com/botiverse/rui/pull/82), [#105](https://github.com/botiverse/rui/pull/105))
- Banner status surfaces and action layout refined. ([#77](https://github.com/botiverse/rui/pull/77), [#106](https://github.com/botiverse/rui/pull/106))
- Elegant menu item presentation tuned. ([#90](https://github.com/botiverse/rui/pull/90))
- `cn` now merges classes with `tailwind-merge` (theme shadow-aware). Package dependencies dropped `border-beam` and added `tailwind-merge`.

### Fixed

- Tooltip leading icon aligns with content. ([#109](https://github.com/botiverse/rui/pull/109))
- Avatar badge inherits size from the parent avatar. ([#107](https://github.com/botiverse/rui/pull/107))
- Banner action height follows content. ([#106](https://github.com/botiverse/rui/pull/106))
- Thread panel search chrome alignment. ([#71](https://github.com/botiverse/rui/pull/71))

## [0.0.22](https://github.com/botiverse/rui/compare/v0.0.21...v0.0.22) (2026-07-14)

### Changed

- Let elegant dropdown menu triggers inherit hover and focus styling from their rendered button instead of applying menu-specific overrides. ([#44](https://github.com/botiverse/rui/pull/44))

### Fixed

- Fixed stacked toasts losing hover state while the pointer crosses gaps between visible toasts. ([#43](https://github.com/botiverse/rui/pull/43))

## [0.0.21](https://github.com/botiverse/rui/compare/v0.0.20...v0.0.21) (2026-07-14)

### Added

- Added `LiveAgentActivityBar` compound parts (`Row`, `Avatar`, `Status`, `Content`, `Text`) for composable live agent activity status. ([#38](https://github.com/botiverse/rui/pull/38))
- Added generic `ResizableGroup`, `ResizableHandle`, and `ResizablePanel` primitives for resizable panel layouts. ([#37](https://github.com/botiverse/rui/pull/37))

### Changed

- Extracted `AppShell`, `AppRail`, and `AppPanelStack` out of chat-shell into standalone components, with sidebar resizing now built on the generic resizable primitives. ([#37](https://github.com/botiverse/rui/pull/37))
- Refined drawer snap point interactions and drove drawer styling through recipe variants. ([#39](https://github.com/botiverse/rui/pull/39), [#40](https://github.com/botiverse/rui/pull/40))

### Removed

- Removed `DrawerSwipeHandle` and the `showSwipeHandle` prop; the swipe handle now renders automatically when snap points are set. ([#39](https://github.com/botiverse/rui/pull/39))
- Removed `AppShellMobileBar`, `AppPanelResizeHandle`, and `ChatSidebarResizeGroup`/`ChatSidebarResizeHandle`/`ChatSidebarResizePanel` in favor of the shared resizable primitives. ([#37](https://github.com/botiverse/rui/pull/37))

## [0.0.20](https://github.com/botiverse/rui/compare/v0.0.19...v0.0.20) (2026-07-14)

### Added

- Added `ContextMenuItemLabel`, `ContextMenuFooter`, `DropdownMenuItemLabel`, and `DropdownMenuFooter` for truncatable menu labels and structured footer content. ([#30](https://github.com/botiverse/rui/pull/30))
- Added opt-in selected, emphasized, and signal/accent interaction styling for brutal dropdown menu items. ([#30](https://github.com/botiverse/rui/pull/30))

### Changed

- Improved elegant combobox, context-menu, dropdown-menu, and select presentation with roomier variable-height items and consistent label spacing, and removed visible focus rings from combobox, dropdown-menu, and select triggers. ([#26](https://github.com/botiverse/rui/pull/26))
- Enhanced drawers with directional nested stacking and faster, swipe-aware motion while preserving the existing component API. ([#32](https://github.com/botiverse/rui/pull/32))
- Refined sortable-tab cursor feedback and elegant underline-tab spacing, and simplified elegant attention-status styling. ([#30](https://github.com/botiverse/rui/pull/30))

### Fixed

- Fixed stacked toasts so top placements animate and swipe from the correct edge and right placements stay right-aligned. ([#31](https://github.com/botiverse/rui/pull/31))
- Fixed theme-family and explicit light/dark propagation across portaled dialogs, drawers, menus, comboboxes, selects, lightboxes, notifications, popovers, preview cards, toasts, and tooltips. ([#36](https://github.com/botiverse/rui/pull/36))

## [0.0.19](https://github.com/botiverse/rui/compare/v0.0.18...v0.0.19) (2026-07-13)

### Features

- **chat-shell:** make elegant panel header title inline ([d941a18](https://github.com/botiverse/rui/commit/d941a18e792cfa15226b644718385aa83c22d36f))
- **chat-shell:** polish elegant chat sidebar and playground ([e8150cb](https://github.com/botiverse/rui/commit/e8150cb1f88a11720fd3e91edc1cabcb4b043235))
- **chat-shell:** polish elegant dm demos and notif trigger ([6a272c4](https://github.com/botiverse/rui/commit/6a272c44f529620a933f7d6427b719b08fee0c61))
- **chat-shell:** refine elegant workspace experience ([bd358d0](https://github.com/botiverse/rui/commit/bd358d0439ee146231e35a28bdde081d6d3a1cb3))
- **drawer:** add responsive placement and mobile full width ([dedfa89](https://github.com/botiverse/rui/commit/dedfa897b745a9eb2f813ba392733036a00fe5e5))
- **status:** add elegant attention prop with pulse compose ([8d3769e](https://github.com/botiverse/rui/commit/8d3769e9da27b2ae24e756a7bba195a730ea391d))
- **status:** polish attention and document trigger glow ([cc7dba8](https://github.com/botiverse/rui/commit/cc7dba82592e91e6877f7e1dc33d7674e0ee4463))
- **theme:** add theme-only rendering helpers ([#3](https://github.com/botiverse/rui/issues/3)) ([0363ae0](https://github.com/botiverse/rui/commit/0363ae0c41cd591628132af4d1fbfdae30ff1b40))
- **ui:** add chat main and thread panel parts ([db63532](https://github.com/botiverse/rui/commit/db6353283e8d3c6ce0112c36021c1d35f9b81910))
- **ui:** add chat page secondary surfaces ([08459d1](https://github.com/botiverse/rui/commit/08459d195d9cade1ca222ba95457f0bfe86069f1))
- **ui:** add chat shell app shell parts ([eb597a3](https://github.com/botiverse/rui/commit/eb597a371d6c38dd1dc84b526bad202581f8226b))
- **ui:** add message timeline and thread parent parts ([cce48c6](https://github.com/botiverse/rui/commit/cce48c6bfc7515d533ed505b050c5445619a1559))
- **ui:** add resizable chat sidebar ([1324892](https://github.com/botiverse/rui/commit/13248923465d95bb1c8cddbd58c0f84d8065840a))
- **ui:** add sortable chat sidebar list primitives ([929186e](https://github.com/botiverse/rui/commit/929186e9768ee40543975fb8aa1c4e458eaa1ae9))
- **ui:** align playground chat, tasks, and files with source ([#11](https://github.com/botiverse/rui/issues/11)) ([0b8c9ee](https://github.com/botiverse/rui/commit/0b8c9ee7dcf4073ea2c3b4d9a73a00f63cf6d798))
- **ui:** refine chat app shell docs parity ([a3f808a](https://github.com/botiverse/rui/commit/a3f808add9417ca8dc1cb45b33f8a9086259e7f7))

### Bug Fixes

- **badge:** tune soft badge colors ([00db53e](https://github.com/botiverse/rui/commit/00db53ecfb869e5035a7b525eb1231826895987a))
- **chat-shell:** remove elegant sidebar badge outline ([7a15242](https://github.com/botiverse/rui/commit/7a15242b8d307ceb17b61c8b9fd1e5c5f5156d09))
- **chat-shell:** stabilize elegant sidebar item height ([2dc935e](https://github.com/botiverse/rui/commit/2dc935e7f867cdc623ddd7897ba51016343ff7b3))
- **doc:** scope preview themes and fix source css collisions ([55d5f02](https://github.com/botiverse/rui/commit/55d5f02950fb288ecd5b3f88e19aaf5300a301b1))
- **docs:** unblock rsc deploy ([d3cb663](https://github.com/botiverse/rui/commit/d3cb663eb1e8bbdf8fee2a8d7a31fec96f6b609f))
- **doc:** tighten inline code and lead line height ([20dc9ba](https://github.com/botiverse/rui/commit/20dc9ba8d3386a847a781a9d28597244bf4bdd13))
- **ui:** align message item states with source ([ff88cc6](https://github.com/botiverse/rui/commit/ff88cc6a2507276f4dd3188e0b084bd8848f1c56))
- **ui:** align tooltip icons and tidy doc previews ([61dfeb9](https://github.com/botiverse/rui/commit/61dfeb9e8e4e64d1c5f82bc43b669b8e2b16fec4))
- **ui:** brutal sidebar selected item keeps medium weight to match source ([ec0fbe4](https://github.com/botiverse/rui/commit/ec0fbe4925e58a6e6f8bdc6474bcba25e3ce7f9a))
- **ui:** close 1px seam at resizable sidebar/main divider ([01d90f6](https://github.com/botiverse/rui/commit/01d90f635134ce587873757325f864ff5e733594))
- **ui:** handle empty tv recipes ([#7](https://github.com/botiverse/rui/issues/7)) ([3ee3307](https://github.com/botiverse/rui/commit/3ee3307cd7942946d18c15a7c2a4668a1a48852d))
- **ui:** import composer data attributes correctly ([7f591b7](https://github.com/botiverse/rui/commit/7f591b7576982670b70d77a25fa9e98c849578c5))
- **ui:** move body↔composer separator from footer to body slot so the composer is self-contained (brutal, visual-identical) ([685b3bc](https://github.com/botiverse/rui/commit/685b3bcdea363ab7fb76313b305c1ce2eac3d3c8))
- **ui:** refine elegant focus rings ([c5b8733](https://github.com/botiverse/rui/commit/c5b87332696bb93f542956895f37bf6b564573e7))
- **ui:** restore input focus rings ([4c57774](https://github.com/botiverse/rui/commit/4c5777467fee76069dfd76ba68f33eca7dd10885))
- **ui:** scope dark: variant to elegant theme context ([a5070b4](https://github.com/botiverse/rui/commit/a5070b4305672e429b7a8680c6e4150790251199))
- **ui:** share composer and align thread footer ([8e5d758](https://github.com/botiverse/rui/commit/8e5d758df83a07054eb7d8cfd5150e293b200113))
- **ui:** stable useId dnd context id for SortableTabsList to fix SSR hydration mismatch ([9673b22](https://github.com/botiverse/rui/commit/9673b22a58433727f36a8e9798c0983f7d915dfe))
