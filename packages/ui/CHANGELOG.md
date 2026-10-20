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
