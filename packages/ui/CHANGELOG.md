## [0.49.0](https://github.com/botiverse/raft-design/compare/v0.48.0...v0.49.0) (2026-10-29)

### Design System

- **List cells:** a list's rows draw no line between them. Every state (hover, press, menu open, selected, located, keyboard focus) is one rounded shape inset 8px from the list's sides, with the row's content 12px inside it. The list spaces its rows 2px apart with `gap` and pads 8px at its ends. A column of list cells starts its title, toolbar and content on one 20px edge, on a phone too (`--column-margin`). Settings cards keep their hairlines. ([#815](https://github.com/botiverse/raft-design/pull/815))
  - Docs: https://raft-design.botiverse.build/patterns/lists/

### Added

- `lib/list-cell` recipe fragments (`listCell`, `listCellStates`, `listCellFocus`) shared by the row components; `ListRow` takes `cell` to become a list cell (off by default).
- Tokens **`fill-cell-hover`**, **`fill-cell-press`**, **`fill-cell-selected`**; the variable `--column-margin`. ([#815](https://github.com/botiverse/raft-design/pull/815))

### Changed

- **SidebarItem, InboxItem, SearchEntity/SearchHit rows:** list cells, no dividers; their lists (`SidebarList`, `SearchResultsList`, `ActivityInboxViewport`, `InboxItemSkeletonList`, `DialogNav`) space rows with `gap-0.5 py-2`. An app that drew its own row padding or right inset on these rows should remove it. ([#815](https://github.com/botiverse/raft-design/pull/815))

## [0.48.0](https://github.com/botiverse/raft-design/compare/v0.47.1...v0.48.0) (2026-10-28)

### Design System

- **Hover and press on an ink sticker:** the server tile (rail header, sidebar header) is ink, and ink over ink doesn't show, so it hovers, presses and shows its open list with 6% paper, in light and dark. ([#875](https://github.com/botiverse/raft-design/pull/875))
  - Docs: https://raft-design.botiverse.build/foundations/states/

### Added

- Token **`sticker-ink-medium`** (6% paper in both modes) and the utility `overlay-sticker-ink-medium`. ([#875](https://github.com/botiverse/raft-design/pull/875))

## [0.47.1](https://github.com/botiverse/raft-design/compare/v0.47.0...v0.47.1) (2026-10-28)

### Fixed

- **SelectActionItem:** when its action adds items above the row and the list stays open, the row keeps the highlight, so the next arrow key goes on from the row instead of from whatever item now sits at its old position. ([#873](https://github.com/botiverse/raft-design/pull/873))
- **SelectActionItem:** the docs no longer ask for `aria-expanded`, which ARIA does not allow on an option; remove it where you added it. ([#873](https://github.com/botiverse/raft-design/pull/873))
  - Docs: https://raft-design.botiverse.build/components/select/

## [0.47.0](https://github.com/botiverse/raft-design/compare/v0.46.0...v0.47.0) (2026-10-28)

### Changed

- **Badge.Experimental:** takes its label as children, so an app shows the word in its own language (`<Badge.Experimental>{t("experimental")}</Badge.Experimental>`); with no children it still reads Experimental. ([#871](https://github.com/botiverse/raft-design/pull/871))
  - Docs: https://raft-design.botiverse.build/components/badge/

## [0.46.0](https://github.com/botiverse/raft-design/compare/v0.45.0...v0.46.0) (2026-10-28)

### Design System

- **Task head pull-down:** once a task's head scrolls away, the top bar collapses to the task's number, status and assignee; tapping it pulls the head down over the conversation (shadow only), and it closes on a tap outside, Back, Esc, or an upward swipe once its content is at its end; it doesn't follow the finger. ([#869](https://github.com/botiverse/raft-design/pull/869))
  - Docs: https://raft-design.botiverse.build/patterns/tasks/
- **Warnings in charts:** a warning mark in a chart (fill, stroke, marker, legend swatch) uses `warning-graphic`, at least 3:1 on every surface; text keeps `warning-strong`. ([#869](https://github.com/botiverse/raft-design/pull/869))
  - Docs: https://raft-design.botiverse.build/foundations/color/

### Added

- **SelectActionItem:** an action row at the end of a Select's list ("Show All Runtimes"). It joins arrow keys and typeahead, runs `onAction`, and never becomes the value; the list stays open unless `closeOnAction`. ([#869](https://github.com/botiverse/raft-design/pull/869))
- Token **`warning-graphic`** (light and dark). ([#869](https://github.com/botiverse/raft-design/pull/869))

### Changed

- **UnfollowArtifactIcon:** below 18px its minus is heavier and longer, so it reads at 16px; 20px and 24px are unchanged. ([#869](https://github.com/botiverse/raft-design/pull/869))

## [0.45.0](https://github.com/botiverse/raft-design/compare/v0.44.0...v0.45.0) (2026-10-28)

### Added

- **ModeBar** (experimental, from `@botiverse/raft-ui/wip`): the dark strip under a panel header while the panel is in a mode the person turned on, such as commenting in batch: a title and a description in a status region, and one text action (Done). It mirrors in right-to-left. ([#867](https://github.com/botiverse/raft-design/pull/867))
  - Docs: https://raft-design.botiverse.build/components/mode-bar/

## [0.44.0](https://github.com/botiverse/raft-design/compare/v0.43.0...v0.44.0) (2026-10-28)

### Design System

- **Foldable phones:** on the outer screen, a top-level page's name is a 56px header line on paper with a seam under it, and the system column keeps a top-level page's actions just above the tab bar, stacked bottom-up; a pushed page keeps Back at the top. ([#862](https://github.com/botiverse/raft-design/pull/862), [#864](https://github.com/botiverse/raft-design/pull/864))
  - Docs: https://raft-design.botiverse.build/patterns/page-structure/#foldable-phones

### Fixed

- **Tap activation:** a control focused by a tap (MobileNavItem and every control using tap activation) no longer shows the keyboard focus ring; keyboard focus is unchanged. ([#865](https://github.com/botiverse/raft-design/pull/865))

## [0.43.0](https://github.com/botiverse/raft-design/compare/v0.42.0...v0.43.0) (2026-10-28)

### Design System

- **Frame insets:** tooltips flip away from every frame inset (`--raft-frame-inset-top`, `-start`, `-end`), and popups stay 8px clear of one. Start and end follow the popup's text direction. With no inset set, which is every web page, nothing moves. ([#860](https://github.com/botiverse/raft-design/pull/860))
  - Docs: https://raft-design.botiverse.build/patterns/page-structure/#frame-insets

### Changed

- **Tooltip:** keeps at least 5px, or the inset, from the top, left and right. ([#860](https://github.com/botiverse/raft-design/pull/860))
- **Popover, DropdownMenu, PreviewCard:** keep the inset plus 8px from each side that has an inset. ([#860](https://github.com/botiverse/raft-design/pull/860))
- **ContextMenu, Select, Combobox, ComboboxSelect, NotificationCenter:** keep the larger of their default and the inset plus 8px. A `collisionPadding` you pass still wins. ([#860](https://github.com/botiverse/raft-design/pull/860))

## [0.42.0](https://github.com/botiverse/raft-design/compare/v0.41.0...v0.42.0) (2026-10-28)

### Design System

- **Frame insets:** a host shell that draws native window controls over the page (the desktop app's macOS traffic lights, Windows' caption buttons) publishes them on the root element as `--raft-frame-inset-start`, `--raft-frame-inset-end` and `--raft-frame-inset-top`; the web sets none. ([#856](https://github.com/botiverse/raft-design/pull/856))
  - Docs: https://raft-design.botiverse.build/components/tooltip/

### Changed

- **Tooltip:** one that would open into `--raft-frame-inset-top` flips below its trigger; one beside its trigger moves down out of it. ([#856](https://github.com/botiverse/raft-design/pull/856))
- **frame-decor-top** (the top bar's theme strip) is placed from the bar's end plus `--raft-frame-inset-end`, and a bar drops it when the whole strip can't fit clear of its trailing actions. ([#856](https://github.com/botiverse/raft-design/pull/856))

## [0.41.0](https://github.com/botiverse/raft-design/compare/v0.40.0...v0.41.0) (2026-10-28)

### Design System

- **Icons:** Raft draws its own icons where Lucide has none, on Lucide's grid. A plus means add, create, follow or join this kind of thing, and a minus remove, unfollow or leave it: inside the thing for following, in the bottom-right corner for the rest; never another meaning. ([#851](https://github.com/botiverse/raft-design/pull/851), [#854](https://github.com/botiverse/raft-design/pull/854))
  - Docs: https://raft-design.botiverse.build/foundations/iconography/
- **Swipeable rows:** unfollow waits for its undo toast, like Done; the right swipe's armed cue, and the rows without one; swipeable rows own sideways drags. ([#848](https://github.com/botiverse/raft-design/pull/848), [#849](https://github.com/botiverse/raft-design/pull/849), [#850](https://github.com/botiverse/raft-design/pull/850))
- **Banner:** the open-in-app offer on a phone browser. ([#848](https://github.com/botiverse/raft-design/pull/848))
- **Card versus seam**, and DropPlaceholder in a layout's gap. ([#842](https://github.com/botiverse/raft-design/pull/842))

### Added

- Action icons: `FollowThreadIcon` / `UnfollowThreadIcon`, `JoinChannelIcon` / `LeaveChannelIcon` and their private and joint pairs. ([#851](https://github.com/botiverse/raft-design/pull/851))
- `CommentIcon`, `AddCommentIcon`, `FeedbackIcon`, `CreateTaskIcon`, `ReopenTaskIcon`, `ArtifactIcon`, `FollowArtifactIcon` / `UnfollowArtifactIcon`. ([#854](https://github.com/botiverse/raft-design/pull/854))

### Fixed

- **DropPlaceholder** is opaque in a layout's gap. ([#842](https://github.com/botiverse/raft-design/pull/842))
- **FilterChip:** its × reaches 44px on touch. ([#842](https://github.com/botiverse/raft-design/pull/842))

## [0.40.0](https://github.com/botiverse/raft-design/compare/v0.39.0...v0.40.0) (2026-10-28)

### Design System

- **MessageActionCard:** an Expired state: folded, saying no one acted in time and nothing changed. The 0.39.0 rule that a Done card stays open while it holds a next step is withdrawn. ([#836](https://github.com/botiverse/raft-design/pull/836), [#837](https://github.com/botiverse/raft-design/pull/837))
  - Docs: https://raft-design.botiverse.build/components/message-action-card/
- **Combobox:** an inline list (`inline open`), in a page or dialog, where choosing a row starts work: unlike ChoiceList, the arrow keys only move a highlight; Enter or a click chooses, Esc reaches the dialog. ([#838](https://github.com/botiverse/raft-design/pull/838))
  - Docs: https://raft-design.botiverse.build/components/combobox/
- **Comments and search:** a reply is one more `CommentEntry` in the card, with no indent or wrapper; put test ids on `SearchEntityResult` itself, since a wrapper hides the hairlines between results. ([#838](https://github.com/botiverse/raft-design/pull/838))

### Added

- **AvatarGroupButton** (wip): an avatar stack that is a button, opening the list of who is in it (who is viewing, a channel's members). ([#838](https://github.com/botiverse/raft-design/pull/838))
- **CommentCardMeta** (wip) styles itself as clickable text when rendered as a `<button>` (the anchor line that jumps to the commented spot). ([#838](https://github.com/botiverse/raft-design/pull/838))

### Fixed

- **Tap activation** (TabsTab, SegmentedControlItem, ToggleGroupItem, MobileNavItem, PanelAction `activateOnTouchEnd`): a tap no longer moves focus out of a text field that already has it. ([#835](https://github.com/botiverse/raft-design/pull/835))

## [0.39.0](https://github.com/botiverse/raft-design/compare/v0.38.0...v0.39.0) (2026-10-27)

### Design System

- **Themes:** status lights, the Working chip and task status keep their colour in every theme, Boring Gray included. A theme is chosen per member per server (the docs said it followed the account). ([#832](https://github.com/botiverse/raft-design/pull/832))
  - Docs: https://raft-design.botiverse.build/foundations/themes/
- **MessageActionCard:** a Done card that leaves the viewer a next step stays open, with that step in its actions row. ([#831](https://github.com/botiverse/raft-design/pull/831))

### Added

- Token `presence-busy-soft` (same values as `brand-soft`) and **Badge** `variant="busy"`: the Working chip's tint and a `presence-busy` sticker that no theme recolours. ([#832](https://github.com/botiverse/raft-design/pull/832))

### Changed

- **Status** `variant="primary"` and the **MessageActionCardStatus** primary pixel use `presence-busy` (were `brand-400` / `brand`). Same colour in Raft Yellow; stays yellow in Boring Gray. ([#832](https://github.com/botiverse/raft-design/pull/832))
  - Affects: a "Working" chip built as `Badge variant="primary" appearance="soft"` still follows the theme; use `variant="busy"`.

### Fixed

- **Tap activation** (TabsTab, SegmentedControlItem, ToggleGroupItem, MobileNavItem, PanelAction `activateOnTouchEnd`): when the click moves focus (a tab that focuses a search field), the control no longer takes focus back. ([#833](https://github.com/botiverse/raft-design/pull/833))

## [0.38.0](https://github.com/botiverse/raft-design/compare/v0.37.0...v0.38.0) (2026-10-27)

### Design System

- **Navigation:** tabs, segmented controls, toggle groups and the mobile tab bar switch on finger lift, so a tap while a list is still momentum-scrolling switches on the first try. Rows, list items and menu items stay on click. ([#829](https://github.com/botiverse/raft-design/pull/829))
  - Docs: https://raft-design.botiverse.build/patterns/navigation/
- **Filters:** a filter people set by habit uses a Filter button that always says Filter, plus a FilterChip naming the filter in effect. ([#825](https://github.com/botiverse/raft-design/pull/825))
- **Responsive:** the side area's columns, and a Thread that covers the conversation when the window is narrow. Columns that don't fit beside it become tabs. ([#821](https://github.com/botiverse/raft-design/pull/821), [#827](https://github.com/botiverse/raft-design/pull/827))
- **Spacing and page structure:** these docs now describe the channel's side columns; Tasks and Files are sections, not cards. ([#822](https://github.com/botiverse/raft-design/pull/822), [#824](https://github.com/botiverse/raft-design/pull/824))
- **Drag and drop:** in a layout, the target column makes room and the origin stays uncovered. ([#820](https://github.com/botiverse/raft-design/pull/820))
- **Public page:** the sign-up prompt. ([#823](https://github.com/botiverse/raft-design/pull/823))
- **Dialog:** the showcase frame also holds Pro's Add seats dialog. ([#818](https://github.com/botiverse/raft-design/pull/818))

### Added

- **FilterChip** (experimental, from `wip`): the filter in effect as an `info-soft` chip, with an × that resets the filter to its default. ([#825](https://github.com/botiverse/raft-design/pull/825))
- **PanelAction** `activateOnTouchEnd`: opt-in switch on finger lift for a back or close action; `DialogSheetBack` sets it. ([#829](https://github.com/botiverse/raft-design/pull/829))

### Changed

- **TabsTab**, **SegmentedControlItem**, **ToggleGroupItem** and **MobileNavItem** activate on a tap's `touchend` (one finger, moved ≤10px, lifted inside, under 500ms), and the click that follows is dropped. Mouse, pen and keyboard are unchanged. ([#829](https://github.com/botiverse/raft-design/pull/829))
  - Affects: an `onClick` on these controls still runs exactly once per tap. A touch handler that relied on the browser's click arriving after `touchend` now sees the click earlier.
- **VirtualList** no longer writes `--virtual-list-transform-y` or `--virtual-list-ios-compensation-y` on the rows' element (every scroll used to restyle every row). ([#819](https://github.com/botiverse/raft-design/pull/819))
  - Affects: content that read those variables uses `onTransformChange` instead.

## [0.37.0](https://github.com/botiverse/raft-design/compare/v0.36.1...v0.37.0) (2026-10-26)

### Design System

- **Edges fade:** content that goes on past an edge fades with a mask, not a colour gradient, so the fade works on any surface (a hovered, selected or located row, a card). Two lengths: 24px at the edge of a scrolling strip, 48px over cut-off content. `MessageListEndFade` is the one exception. ([#816](https://github.com/botiverse/raft-design/pull/816))
  - Docs: https://raft-design.botiverse.build/foundations/spacing/
- **Dimmed:** deleted, offline and pending items are `opacity-dimmed` (60%); a drag origin stays 40%. Media hover is an `ink-8` overlay, not a brightness filter. ([#816](https://github.com/botiverse/raft-design/pull/816))
  - Docs: https://raft-design.botiverse.build/foundations/states/
- **Tooltip:** a disabled control's reason under its name is a second line in `foreground-on-hud-muted`, 4px below. ([#813](https://github.com/botiverse/raft-design/pull/813))
- **Drag and drop:** a panel grip's hit area stays clear of a neighbouring resize seam, with its bar inside it. ([#814](https://github.com/botiverse/raft-design/pull/814))
- **Raft Chat:** the history paywall where a plan cuts a conversation's history. ([#757](https://github.com/botiverse/raft-design/pull/757))

### Added

- Utilities `mask-fade-t`, `mask-fade-b` (48px), `mask-fade-t-edge`, `mask-fade-b-edge` (24px) and `mask-fade-x` (24px on the side named by `data-overflow="start|end|both"`); tokens `fade-edge`, `fade-content`. ([#816](https://github.com/botiverse/raft-design/pull/816))
- Token `layer-veil` (the page at 80%) for busy and loading covers, `bg-layer-veil`; `opacity-dimmed` (0.6). Both registered with `cn`'s tailwind-merge. ([#816](https://github.com/botiverse/raft-design/pull/816))

### Changed

- **Tabs**: the overflow fade is `mask-fade-x`, 24px (was 32px). ([#816](https://github.com/botiverse/raft-design/pull/816))
- **MessageForwardedBundle**: the fold fades with `mask-fade-b` (48px, was a 40px card-colour gradient; a tight fold 24px, was 20px). ([#816](https://github.com/botiverse/raft-design/pull/816))
  - Affects: overrides that targeted the fold's `::after` must drop it.
- **Composer** upload and failed covers, and the pending **MessageImageGallery** image, use `layer-veil` (were `layer-card/80`, `layer-card/90` and `opacity-70`); the pending spinner uses its default colour. ([#816](https://github.com/botiverse/raft-design/pull/816))
- **Lightbox** thumbnails dim with `layer-backdrop-nested` (40%, was `black/45`); hover 28% unchanged. ([#816](https://github.com/botiverse/raft-design/pull/816))
- Task chip and task-card busy states, and the deleted delegated avatar, use `opacity-dimmed` (same 60%). ([#816](https://github.com/botiverse/raft-design/pull/816))

## [0.36.1](https://github.com/botiverse/raft-design/compare/v0.36.0...v0.36.1) (2026-10-26)

### Design System

- **Drag and drop:** a panel of live content (a side section) is lifted by its grip only, so its head keeps its clicks (opening a thread, jumping to the channel). The grip shows while the head is hovered or the grip has focus, always on a device that can't hover, and its hit area is at least 24px tall and wider than the bar. ([#809](https://github.com/botiverse/raft-design/pull/809))
  - Docs: https://raft-design.botiverse.build/patterns/drag-and-drop/
- **Motion:** the app's columns change without animation: collapsing or expanding the sidebar, and Focus Mode in or out, by a button or by dragging past the end. ([#811](https://github.com/botiverse/raft-design/pull/811))
  - Docs: https://raft-design.botiverse.build/foundations/motion/
- **Field:** an action at the end of a field's label row (Forgot Password) comes after the control in the markup, so Tab and a screen reader reach the field first. ([#808](https://github.com/botiverse/raft-design/pull/808))
  - Docs: https://raft-design.botiverse.build/components/field/

### Fixed

- **AppShell**: the sidebar collapses and expands at once; the main area no longer slides and the sidebar no longer fades. `data-sliding` is gone. ([#811](https://github.com/botiverse/raft-design/pull/811))
  - Why: Focus Mode already switched at once while the sidebar slid; a whole column sliding flickers.
  - Affects: no transition on `AppShellMainSlot` (`left`) or `AppShellSidebarSlot` (opacity); no z-index on the main slot while collapsing.
  - Docs: https://raft-design.botiverse.build/components/app-shell/
- **Composer**: its buttons sit 6px apart (`gap-embedded-inset`), the same as their distance from the frame. ([#810](https://github.com/botiverse/raft-design/pull/810))
  - Why: the buttons were 8px apart but 6px from the edge, against Shape › Inside a frame.
  - Affects: gap in the toolbar, actions and meta 8px → 6px.
  - Docs: https://raft-design.botiverse.build/components/composer/
- **DragRefusalHint**: the chip stays inside the window and off the lifted copy: left of the pointer and the copy at the right edge, above the pointer at the bottom edge, 8px inside on every side. ([#807](https://github.com/botiverse/raft-design/pull/807))
  - Why: near the window's edge the chip was drawn outside it, or under the copy when flipped.
  - Docs: https://raft-design.botiverse.build/components/drag/
- **useDragSensors**: Escape during a drag, however it started, only cancels the drag; the keydown is stopped in the capture phase, so no app Escape handler (closing a panel, a dialog, a popover) hears it. ([#807](https://github.com/botiverse/raft-design/pull/807))
  - Why: Escape cancelled the drag and also closed the panel around it.
  - Docs: https://raft-design.botiverse.build/components/drag/

## [0.36.0](https://github.com/botiverse/raft-design/compare/v0.35.1...v0.36.0) (2026-10-26)

### Design System

- **Drag and drop:** one model for every drag: a mouse drag starts after 6px, a touch drag after a 500ms hold then 10px, the keyboard picks up with Space (never Enter), moves with the arrows, drops with Space and cancels with Escape. A lifted copy follows the pointer 1:1 (opaque popover surface, `shadow-float`, a hairline ring), the item it came from stays in place at 40%, every landing place is one dashed placeholder, and a drop or a cancel glides in 160ms. Screen readers hear names and positions, never ids. ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Docs: https://raft-design.botiverse.build/patterns/drag-and-drop/

### Added

- Tokens `motion-drag-settle-duration` (160ms) and `motion-drag-settle-easing` (`cubic-bezier(0.25, 1, 0.5, 1)`), with the Tailwind ease `ease-drag-settle`. ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Why: drops, cancels and sibling slides each used their own timing (250ms, 160ms or none); one settle motion now serves them all.
  - Docs: https://raft-design.botiverse.build/foundations/motion/
- Attributes `data-drag-origin` (the item a drag came from, at 40%) and `data-drag-into` (a container the dragged item has moved into, `fill-subtle`). ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Why: each surface faded the origin and marked containers differently; these two attributes give every drag the same look.
  - Docs: https://raft-design.botiverse.build/patterns/drag-and-drop/

### Changed

- **TaskDnd**: the lifted card is a copy that glides into place on a drop and back on a cancel; the card stays in its column at 40% instead of collapsing, and a drop on its own place moves nothing. A mouse drag starts after 6px (was 5px) and Enter no longer starts a keyboard drag. New `describe` on `TaskDndProvider` announces cards and places by name; without it nothing is announced (no ids). `TaskDragOverlay` takes `container`. ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Why: the overlay snapped, the column reflowed under the hand, and the screen reader read internal ids.
  - Affects: activation 5px → 6px; drop and cancel 160ms `motion-drag-settle-*`; overlay z-index 999.
  - Docs: https://raft-design.botiverse.build/components/task-dnd/
- **SortableTabsList**: tabs can be reordered by keyboard (Space picks up, arrows move, Space drops, Escape cancels; Enter selects); a lifted copy follows the pointer and renders in `document.body` (`container` to change it), and the tab's slot shows the dashed place. Announcements use the tab's label and position; `messages` takes translations. ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Why: reordering had no keyboard path, and inside a drawer or dialog the moving tab was offset by the ancestor's transform.
  - Affects: Space on a focused sortable tab picks it up instead of selecting it.
  - Docs: https://raft-design.botiverse.build/components/tabs/
- **SortableComposerAttachments**: the lifted thumbnail moves on both axes, renders in `document.body` (`container`), glides on drop and cancel, and is announced by its `label`; `messages` takes translations. ([#804](https://github.com/botiverse/raft-design/pull/804))
  - Why: the drag looked and moved differently from every other drag.
  - Docs: https://raft-design.botiverse.build/components/composer/

## [0.35.1](https://github.com/botiverse/raft-design/compare/v0.35.0...v0.35.1) (2026-10-25)

### Fixed

- **PanelNotice**: a leading `Spinner` is centred on the first line of text, in the 16px icon's column. ([#801](https://github.com/botiverse/raft-design/pull/801))
  - Why: a pending notice that led with a Spinner showed it 3–4px above the text's first line, because only an icon was centred; the Spinner now takes the icon's place the way it does in Banner.
  - Affects: Spinner column 16px (any Spinner size); text starts where it does after a 16px icon.
  - Docs: https://raft-design.botiverse.build/components/panel/

## [0.35.0](https://github.com/botiverse/raft-design/compare/v0.34.0...v0.35.0) (2026-10-24)

### Changed

- A search hit (`searchHit`: `MessageItemSearchMatch`, `MarkdownMark`, `SearchMessageResultMatch`) is a `you` fill with ink type, in the surrounding weight, with no ink ring, and 1px of fill above and below so descenders stay inside it. A mention of you keeps its sticker. ([#796](https://github.com/botiverse/raft-design/pull/796))

### Design System

- **Search:** matched words sit on a yellow fill, no edge, no bold (stdrc); a leading @ or # is part of the hit. Principle 3 names the inline "you" highlight as the one full-yellow highlight without an edge. ([#796](https://github.com/botiverse/raft-design/pull/796))
  - Docs: https://raft-design.botiverse.build/components/search/

## [0.34.0](https://github.com/botiverse/raft-design/compare/v0.33.0...v0.34.0) (2026-10-24)

### Added

- Token `read-mark` (`text-read-mark`): the read mark's check, `palette-lime-700` in light (6.2:1 on white) and the online lime in dark (10.5:1). ([#794](https://github.com/botiverse/raft-design/pull/794))

### Changed

- `MessageReferenceReadMark` is a bare 10px Lucide check (stroke 2.5) in `read-mark`, with no light and no box, 2px after the name; the mention reserves 10px after its text, as for the indicator. The API is unchanged. ([#794](https://github.com/botiverse/raft-design/pull/794))

### Design System

- **Read mark:** a bare check, since the light with an ink check read as a black frame (stdrc). It is no longer a status light. ([#794](https://github.com/botiverse/raft-design/pull/794))
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **Touch screens:** a right swipe on an Activity row marks it read or unread, one button with the menu's icon and word, no toast; under Unread or Mentions the row stays until the person leaves the list or changes the filter. ([#793](https://github.com/botiverse/raft-design/pull/793))

## [0.33.0](https://github.com/botiverse/raft-design/compare/v0.32.2...v0.33.0) (2026-10-24)

### Added

- Tokens `you` and `selected` (`bg-you`, `bg-selected`, `border-selected`): the yellow of a signal addressed to you and of a selected or "on" state. They equal `brand-400` in Raft Yellow, and no theme overrides them. ([#791](https://github.com/botiverse/raft-design/pull/791))
- Badge `variant="you"`: the @ marker for something addressed to you outside the sidebar. It stays yellow in every theme, while `primary` follows the theme. ([#791](https://github.com/botiverse/raft-design/pull/791))

### Changed

- Selected and "on" states (segmented control, sidebar row, tabs, toggle group, mobile nav, pressed panel action, switch, current step) paint `selected`, and signals addressed to you (mention-of-you chip, sidebar @ marker, search hit, active comment) paint `you`. Raft Yellow looks the same; Boring Gray now keeps them yellow. ([#791](https://github.com/botiverse/raft-design/pull/791))
- The selected sidebar row's edge is `sticker-ink`, so it keeps its ink edge in Boring Gray. ([#791](https://github.com/botiverse/raft-design/pull/791))
- `Text variant="primary"` uses `brand-strong` and follows the theme (deeper in light, yellow in dark; 8.9:1 and 12.5:1). ([#791](https://github.com/botiverse/raft-design/pull/791))

### Design System

- **Themes:** a theme quiets the environment, never information. Signals addressed to you and selected states keep their color in every theme; the rail and anything on the frame follow the theme's frame. ([#791](https://github.com/botiverse/raft-design/pull/791))
  - Docs: https://raft-design.botiverse.build/foundations/themes/
- **ChoiceList:** a description line is cut at its end, so it leads with what people compare. ([#789](https://github.com/botiverse/raft-design/pull/789))
- **Touch screens:** the swipe buttons' type, and what a tap does while a row is open. ([#790](https://github.com/botiverse/raft-design/pull/790))

## [0.32.2](https://github.com/botiverse/raft-design/compare/v0.32.1...v0.32.2) (2026-10-23)

### Added

- `TOUCH_DRAG_HOLD_MS` (wip), the 500ms hold before a touch drag, exported next to `useHoldThenMoveTouchSensor`, so a product that tells a hold from a tap uses the same number. ([#787](https://github.com/botiverse/raft-design/pull/787))

### Design System

- **Touch drags:** every touch drag, task cards included, waits for a 500ms hold and then a move; the Accessibility page no longer says 200ms. ([#787](https://github.com/botiverse/raft-design/pull/787))
  - Docs: https://raft-design.botiverse.build/foundations/states/#dragging-on-a-touch-screen

## [0.32.1](https://github.com/botiverse/raft-design/compare/v0.32.0...v0.32.1) (2026-10-23)

### Fixed

- **ChoiceList** (wip): a row's name or description line that is cut off has its whole text as its `title` while it is cut off, so a long description can still be read with a mouse. ([#783](https://github.com/botiverse/raft-design/pull/783))
  - Docs: https://raft-design.botiverse.build/components/choice-list/

## [0.32.0](https://github.com/botiverse/raft-design/compare/v0.31.0...v0.32.0) (2026-10-23)

### Added

- **ChoiceList** (wip): `matchedValues`, for a product with its own search (a ranked people search shared with mentions). With it ChoiceList shows the values the caller's search found, in the caller's order, instead of matching `searchText` itself; the chosen rows still come first and "No match" still shows. A value given twice shows once. Pass matches for the current text, and keep the previous ones while a slower search works. ([#780](https://github.com/botiverse/raft-design/pull/780))
  - Docs: https://raft-design.botiverse.build/components/choice-list/

## [0.31.0](https://github.com/botiverse/raft-design/compare/v0.30.0...v0.31.0) (2026-10-23)

### Design System

- **A row swipe on a phone**: a swipe starts once the finger has gone 10px on the web (twice as far across as up or down), and swipes that start within 24px of the screen edge stay with the browser. A release applies the action past 40% of the row's width, or past 20% with a quick flick. The uncovered layer is soft until a release would apply, then solid `success` with ink, and ticks once on Android as it turns solid. It says "Done"; the menu keeps "Mark as Done". The row leaves at once, with an 8-second Undo. On a phone, Activity's Mark as Done stays in the row as a button only screen readers see. ([#775](https://github.com/botiverse/raft-design/pull/775), [#776](https://github.com/botiverse/raft-design/pull/776))
  - Why: Activity on a phone moved Mark as Done to the swipe (stdrc); the swipe must be predictable, reversible, and reachable without swiping.
  - Affects: a rule for products.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#touch-screens

### Added

- **ChoiceList** (wip): ([#774](https://github.com/botiverse/raft-design/pull/774))
  - `groups` with headings. Each group is named by its heading, and the arrow keys cross groups.
  - `searchValue` / `onSearchValueChange`, so the app can read and set the search text. It hears `""` when the box hides.
  - `footer`, which stays in view while the rows scroll.
  - `fill`, which fills its container's height.
  - The frame now wraps a `choice-list-scroller`.
  - Docs: https://raft-design.botiverse.build/components/choice-list/

## [0.30.0](https://github.com/botiverse/raft-design/compare/v0.29.0...v0.30.0) (2026-10-23)

### Design System

- **A dialog whose job is to choose keeps an open list**: when choosing is the dialog's main content (a computer to move an agent to, people to add), the choices stay open as a list at any count, not a select: a radio circle for one choice, a checkbox for several. A search field shows always when people look for something they know by name, and from 6 choices when they choose by comparing. Filtering never clears the choice; the chosen rows stay first. A row may have two description lines, and a details button at its end outside the row's label. ([#767](https://github.com/botiverse/raft-design/pull/767), [#772](https://github.com/botiverse/raft-design/pull/772))
  - Why: a dropdown hides what people came to compare (stdrc, xxchan).
  - Affects: a rule for products; raft-ui adds `ChoiceList` (wip).
  - Docs: https://raft-design.botiverse.build/components/choice-list/

### Added

- **ChoiceList** (wip, `@botiverse/raft-ui/wip`): an always-open list to choose one (`value: string | null`) or several (`multiple`, `string[]`), built on Base UI RadioGroup / CheckboxGroup. `items` take a label, search text, up to two description lines, media, a row-end action and disabled; `search="auto" | "always"`; `searchLabel` and `clearSearchLabel` are required. Rows are 36px with a mouse and 44px on a touch screen. ([#772](https://github.com/botiverse/raft-design/pull/772))
  - Docs: https://raft-design.botiverse.build/components/choice-list/

## [0.29.0](https://github.com/botiverse/raft-design/compare/v0.28.0...v0.29.0) (2026-10-23)

### Design System

- **A mention's read mark is the online light with an ink check**: once an agent has read a message that mentions it, the online light (the 8px lime square with its ink edge) shows at the mention's top right with an ink check in it. A light with no check means presence; a light with a check means read. It never covers the name: the mention keeps 10px after it. Nothing shows until the agent has read the message, the hover card still says Read or Not read yet, and on a touch screen the read light alone says it. Colored fills carry ink, never white. ([#770](https://github.com/botiverse/raft-design/pull/770))
  - Why: the bare gray check was too faint to notice (artin), and the corner light is what people knew from the app; the check keeps it apart from presence (decided by artin and stdrc).
  - Affects: a rule for products; `MessageReferenceReadMark` draws the new mark; status and color rules list the read light.
  - Docs: https://raft-design.botiverse.build/components/message-item/#read-receipts-on-a-mention
- **On a phone, Activity's Mark as Done is the left swipe and the press-and-hold menu**: no button at rest on a phone; a tablet or a desktop keeps it. A swipe starts only when the finger moves clearly sideways. ([#769](https://github.com/botiverse/raft-design/pull/769))
  - Why: a list of rows to clear read as a column of buttons; swiping a row away is how people clear lists on a phone (decided by stdrc).
  - Affects: a rule for products.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#touch-screens

### Changed

- **`MessageReferenceIndicator` placement**: `right: -10px` (was `-6px`) and `top: 0`; the mention keeps 10px after its text (was 8px), so the corner mark no longer overlaps the last letter. ([#770](https://github.com/botiverse/raft-design/pull/770))
- **`MessageReferenceReadMark`** is exported from `@botiverse/raft-ui` (still from `/wip` too) and draws the online light with a check; its API is unchanged (children are what a screen reader says). ([#770](https://github.com/botiverse/raft-design/pull/770))

## [0.28.0](https://github.com/botiverse/raft-design/compare/v0.27.0...v0.28.0) (2026-10-23)

### Design System

- **Toasts: one at a time, no Dismiss, above the composer on a phone**: a toast shows alone; a new one replaces it at once and the replaced one is closed, not queued. It has no Dismiss: it closes by itself after 5 seconds, or 8 with an action or as an error, and can be swiped away or closed with Esc. It stays at the bottom center: at the bottom of the window on a desktop, and on a phone just above the composer, the tab bar or the keyboard, which the app sets with `--toast-viewport-bottom`. ([#675](https://github.com/botiverse/raft-design/pull/675))
  - Why: stacked toasts and a × on each one asked people to manage messages that were only receipts; at the very bottom of a phone a toast sat under the composer and the keyboard (decided with stdrc).
  - Affects: a rule for products; raft-ui's Toast defaults.
  - Docs: https://raft-design.botiverse.build/components/toast/#where-it-appears

- **Pull to refresh looks like Android's own on Android**: on Android web the indicator is Material 3's: a small disc with a shadow slides down over the list, which stays still; inside, a progress arc with an arrowhead grows with the pull, faint until the pull is armed and faint again when it is pulled back (disarmed); while refreshing the arc turns; at the end the disc scales away. iOS and everything else keep the Spinner. The disc is the one round surface besides switches, radios and grab handles, and its turning arc the one other looping animation. ([#765](https://github.com/botiverse/raft-design/pull/765))
  - Why: a pull on Android should look the way it does in every Android app (decided by stdrc); armed and disarmed now look different.
  - Affects: `PullToRefresh` (wip) on Android; shape, motion and navigation rules record the exception.
  - Docs: https://raft-design.botiverse.build/components/pull-to-refresh/#on-android

### Changed

- **Toast defaults** ([#675](https://github.com/botiverse/raft-design/pull/675)):
  - `limit` is 1 (was 3); a newer toast replaces the older and closes it.
  - The command API shows `ToastClose` only with `dismissible: true`.
  - `actionTimeout` (8s) applies to toasts with an action and to errors; `timeout` stays 5s.
  - Bottom placements sit 16px above `max(var(--toast-viewport-bottom, 0px), env(safe-area-inset-bottom))`; `top-center` takes `--toast-viewport-top`. A toast swipes away toward the edge it came from.
  - Migration: an app that passed its own `placement` or drew its own close can drop them; set `--toast-viewport-bottom` on a phone (from `visualViewport` while the keyboard is up on iOS).

## [0.27.0](https://github.com/botiverse/raft-design/compare/v0.26.0...v0.27.0) (2026-10-23)

### Design System

- **Refreshing a snapshot page by pulling**: on a phone, a page that shows a snapshot and doesn't update itself (Saved, search results, a conversation's files, the lists in Settings) refreshes when pulled down past 100px; while it refreshes the indicator holds at 60px, and it snaps back in 300ms without overshoot. Pages fed by realtime updates (conversations, Home, Activity, Tasks, Members, Computers) are never pulled: they stay current on their own. On iOS a pull that passed the trigger stays armed; on Android, as in Material 3, pulling back above it takes it back, and crossing it gives a short vibration. The indicator is the Spinner on every platform. Every such page also reloads when it is opened, so the gesture is never the only way. `PullToRefresh` is experimental, from `@botiverse/raft-ui/wip`. ([#743](https://github.com/botiverse/raft-design/pull/743))
  - Why: on a phone there was no way to ask a snapshot page for what is new without leaving it; the numbers match Raft's iOS app so the two feel the same.
  - Affects: a rule for products; raft-ui adds `PullToRefresh` (wip).
  - Docs: https://raft-design.botiverse.build/patterns/navigation/#refreshing
- **A right panel grows until the area left of it is 360px**: a thread, a profile or task side panel and the side cards have no fixed maximum width (640px, 720px before); they grow until the area beside them is down to its 360px minimum. ([#759](https://github.com/botiverse/raft-design/pull/759))
  - Why: a fixed maximum stopped them at about half of a 1280px to 1440px window, though people wanted three quarters while they worked in them.
  - Affects: a rule for products.
  - Docs: https://raft-design.botiverse.build/foundations/spacing/
- **Dragging past the end snaps**: dragging the sidebar 40px past its minimum collapses it, and dragging a thread 40px past where the conversation is down to 360px puts it in focus mode, during the drag; dragging back undoes it, and the width before the snap comes back. ([#761](https://github.com/botiverse/raft-design/pull/761))
  - Why: the jump is how people know they went past the end; 40px keeps a drag that only reaches it from snapping by accident.
  - Affects: a rule for products.
  - Docs: https://raft-design.botiverse.build/components/resizable/#dragging-past-the-end

## [0.26.0](https://github.com/botiverse/raft-design/compare/v0.25.0...v0.26.0) (2026-10-23)

### Design System

- **Links that leave Raft end in ↗**: a control that takes someone to another site (docs, pricing, terms and privacy, an app's homepage, TestFlight, Stripe, GitHub) ends in Lucide's `ArrowUpRight`, the only mark for it, never the box with an arrow. A TextLink takes `TextLinkExternalIcon`; a button puts it in its trailing icon's place; a menu item where the shortcut goes; a sidebar row in its trailing slot, in `foreground-hint`. It opens in a new tab with `rel="noopener noreferrer"` and a screen reader hears "(opens in a new tab)"; Stripe checkout and the billing portal stay in the same tab and still end in ↗. Sign-in round trips, downloads, links people write in messages and anything inside Raft get no mark. ([#758](https://github.com/botiverse/raft-design/pull/758))
  - Why: people couldn't tell before pressing whether a control would take them out of Raft, and the product used three different marks (and none on most links) for it.
  - Affects: a rule for products; raft-ui adds `TextLinkExternalIcon`.
  - Docs: https://raft-design.botiverse.build/patterns/navigation/#links-that-leave-raft
- **An item card's warning line**: a line an app marks as a warning (`tone: "warning"`, such as "2 checks failing") reads in `warning-strong`, Raft's color for a warning; the state's Badge stays neutral and nothing else on the card is colored. ([#760](https://github.com/botiverse/raft-design/pull/760))
  - Why: an app's own state colors on a card competed with Raft's; a warning reads the same everywhere when it is Raft's color.
  - Affects: a rule for products rendering app item cards.
  - Docs: https://raft-design.botiverse.build/components/preview-card/

### Added

- **TextLinkExternalIcon**: the ↗ after a TextLink that leaves Raft. Lucide `ArrowUpRight` at 0.857em of the text, 2px after it, centered on the letters' cap height at every size, in an inline-flex box so the hover underline stops at the text. `label` is read by a screen reader after the text ("(opens in a new tab)"); the caller supplies the copy. ([#758](https://github.com/botiverse/raft-design/pull/758))
  - Docs: https://raft-design.botiverse.build/components/text-link/#leaving-raft

## [0.25.0](https://github.com/botiverse/raft-design/compare/v0.24.0...v0.25.0) (2026-10-23)

### Design System

- **Themes: a frame, never a new palette**: a person can pick a theme for themselves, and it follows their account to every server. Raft Yellow, the foundation itself, stays the default; beside it are Boring Gray and nine avatar-series themes (Bots, Critters, Space, Desk, Food, Quest, Weather, Plants, Spooky). A theme may recolor only the frame (rail, web top bar, phone top bar), the sidebar and, in dark mode, the canvas, cards and popups, tinted to its hue. The pink primary button, unread and @ counts, status lights, warnings and errors look the same in every theme. Every theme has a light and a dark version. An avatar-series theme can draw its series' pixel sprites on the empty parts of the frame, and the person can turn them off. Boring Gray is the one theme that also changes the brand: where you are is a gray fill with ink type, not yellow. It applies to AppRail and SidebarItem. ([#754](https://github.com/botiverse/raft-design/pull/754))
  - Why: the frame is on every screen but nobody reads it, so it can carry a person's choice of look; keeping every meaning fixed means someone who switches themes doesn't have to learn the product again. In dark mode the surfaces take the theme's hue because a neutral black panel inside a colored frame looked pasted on.
  - Affects: Navigation and States: "where you are is always yellow" now has one exception, Boring Gray, where `brand` and its washes are neutral grays and `brand-edge` is transparent. Sprites go only on the web top bar right of the search field (from 1024px) and on the desktop rail under its items, never where they could be taken for a control, an avatar or a status, and never behind text.
  - Docs: https://raft-design.botiverse.build/foundations/themes/#principles
- **The first frame is the settled one**: draw the first frame the way it will stay. Read what decides a layout (a remembered width, a collapsed section, a view mode, the viewport, the pointer, the platform) before the first paint, not in an effect after mount. Measure and decide in a layout effect, not in the next animation frame. While data reloads, keep a part's presence and size, such as counts and the controls that depend on them, at their last values until the new answer arrives. A placeholder, such as the fallback of a lazily loaded panel, takes the size and place of what it stands for. ([#748](https://github.com/botiverse/raft-design/pull/748))
  - Why: a frame drawn from a "not known yet" default and corrected a moment later is a flash: a row grows and shrinks back, a panel snaps to another width, and controls move under the pointer.
  - Affects: a rule for products; nothing in raft-ui changes. Feedback's skeleton rule now points to it.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#the-first-frame-is-the-settled-one
- **A row with a fill: one line height, no mark taller than the line**: in a row whose items share the first baseline, such as a task row, every text takes the main text's line height, and a taller hit area hangs into the padding instead of making the row taller. A row that centers its items (`items-center`), as every raft-ui list row does, needs neither. ([#750](https://github.com/botiverse/raft-design/pull/750))
  - Why: a smaller text has a shorter line box, so a Space Mono group sat 3px lower than the title and a mark centered in it sat 1.5px below the row's center; a 32px button made the row taller and the text sat 2.5px above the center of the hover fill.
  - Affects: give the row `leading-(--text-callout--line-height)` (and set it on sizes that set their own); `text-mono-meta` and `text-caption` 18px → 22px line on such a row.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#text-of-different-sizes-on-one-line
- **Grab handles have round ends**: round is now for switches, radios and grab handles: the bar at a bottom sheet's top edge and the bar in a gap between side cards. It applies to Drawer. ([#747](https://github.com/botiverse/raft-design/pull/747))
  - Why: every platform draws a grab handle with round ends (the iOS sheet grabber, Material's drag handle), and square ends on a 4px bar read as a cut edge, not something to take hold of.
  - Affects: `rounded-full`: switches and radios only → switches, radios and grab handles. A bottom sheet's grab handle is a 36 × 4px bar in `line-seam`.
  - Docs: https://raft-design.botiverse.build/foundations/shape/#principles
- **The gap handle's bar follows the pointer**: on hover, the 56 × 4px bar in a gap between side cards is centered on the pointer along the gap, kept half a bar inside each end, with round ends; while dragging it stays where the drag started, and with keyboard focus it sits in the middle. Where two gaps cross, the crossing gap's bar lights at the pointer and the other at its end against the corner. `ResizableHandle` still draws only the seam handle; products draw the gap handle themselves. ([#746](https://github.com/botiverse/raft-design/pull/746))
  - Why: a gap has no line, so the bar is the only thing that shows where the hand is, and a bar fixed in the middle of a long edge looked unrelated to the pointer.
  - Affects: hover bar: middle of the gap, `rounded-[1px]` → at the pointer, `rounded-full`. Touch has no hover, so there the bar stays in the middle.
  - Docs: https://raft-design.botiverse.build/components/resizable/#the-gap-handle
- **An app link shows its host wherever a touch can open it**: a chip for a link that an app previews shows the link's host after its title (`MessageReferenceSuffix`) on any device with touch input, including a laptop with a touch screen. Write the full host, dropping only a leading `www.`, never shortened to the registered domain, and an internationalized host in its ASCII form (`xn--…`). The title truncates first; if the host alone still doesn't fit, it loses its start, never its end. It applies to MessageItem and MessageReference. ([#749](https://github.com/botiverse/raft-design/pull/749), [#753](https://github.com/botiverse/raft-design/pull/753), [#755](https://github.com/botiverse/raft-design/pull/755))
  - Why: the title is the app's own words and may say anything, and a tap opens the link without the hover card that shows where it goes on a desktop. A link someone can open without seeing where it goes is a safety problem, and the end of a host (`…review.attacker.example`) is the part that says where.
  - Affects: suffix `hidden any-pointer-coarse:inline` (any touch input, not only the main pointer). A host that overflows is truncated at its start: `dir="ltr"` and `unicode-bidi: isolate` inside a right-to-left box, so the ellipsis lands at the start.
  - Docs: https://raft-design.botiverse.build/components/message-item/#app-links
- **An app link is a plain link until Raft knows an app previews it**: before a message's previews are first read, an app's link is an ordinary link. Once someone allows an app's previews and Raft reads them again, each of that app's links is `MessageReferencePending capped` until its preview arrives. It applies to MessageItem. ([#753](https://github.com/botiverse/raft-design/pull/753))
  - Why: until the previews are read, the client can't tell an app's link from any other.
  - Affects: pending chip shown while any preview loads → only for links of an app whose previews are allowed, after they are read again.
  - Docs: https://raft-design.botiverse.build/components/message-item/#app-links
- **Read receipts on a mention: on a touch screen the check alone says it**: there is no hover card on a touch screen, and tapping a mention opens the agent's profile, so the check is the whole answer there: no mark means not read yet. Don't add a long press or a popup only for this line. It applies to MessageItem. ([#745](https://github.com/botiverse/raft-design/pull/745))
  - Why: a gesture for one line of text is more to learn than it tells.
  - Affects: a rule for products; the check's own word ("Read") still reaches a screen reader.
  - Docs: https://raft-design.botiverse.build/components/message-item/#read-receipts-on-a-mention
- **The message menu: its order written down**: the menu opens with the message's full date and time as a label that can't be chosen, then the 7 quick reactions and a `smile-plus` button that opens every emoji, then the actions in three sections by what they do to the message: keep going on it (Reply in Thread, Follow or Unfollow Thread, the task action), take it elsewhere (Copy Link, Copy Markdown, Forward, Select Message), and just for me (Save or Remove from Saved, Translate). A section with nothing in it is left out with its separator. It applies to DropdownMenu, ContextMenu and MessageReactionQuickRow. ([#751](https://github.com/botiverse/raft-design/pull/751))
  - Why: the order lived only in the compositions; it is now a rule, grouped by what each action does to the message.
  - Affects: 8 buttons of 36px make the menu 316px wide, wider than its 240px minimum; the actions take the same width.
  - Docs: https://raft-design.botiverse.build/components/dropdown-menu/#the-message-menu

### Added

- **Themes**: a new export, `@botiverse/raft-ui/themes.css`, with Boring Gray (`boring`) and the nine avatar-series themes (`bots`, `critters`, `space`, `desk`, `food`, `quest`, `weather`, `plants`, `spooky`), each with a light and a dark version. Import it after `foundation.css` and put `data-theme="<id>"` on the element that carries the mode class (`.light` / `.dark`); without `data-theme` the app is Raft Yellow. Put `data-theme-decor="off"` on the same element to turn the sprites off and keep the colors. A top bar you draw yourself takes the new `frame-decor-top` utility for its sprites; `frame-decor-rail` is the rail's, which AppRail already draws. ([#754](https://github.com/botiverse/raft-design/pull/754))
  - Why: see Themes: a frame, never a new palette, above.
  - Affects: a theme overrides only `layer-frame`, `layer-frame-active`, `foreground-on-frame` (and `-muted`, `-active`), `fill-frame-medium`, `line-frame-active` and `layer-sidebar`; in dark mode also `layer-canvas`, `layer-card` and `layer-popover`; Boring Gray also `brand`, `brand-soft`, `brand-strong`, `brand-glow`, `brand-edge` and `selection`. `frame-decor-top` paints `--frame-decor-top` 72px from the right end, from 1024px wide only; both are `none` without a decorated theme. Themes are generated from `themes.json` (`vp run @botiverse/raft-ui#build:themes`).
  - Docs: https://raft-design.botiverse.build/foundations/themes/#using-themes
- **`brand-edge`** Tailwind color: `--color-brand-edge` maps the existing `--brand-edge` token (`border-brand-edge`, `ring-brand-edge`). ([#754](https://github.com/botiverse/raft-design/pull/754))
  - Why: the edge of a selected navigation item has to follow the theme: ink by default, transparent in Boring Gray.
  - Affects: `var(--brand-edge)`, which is `var(--sticker-ink)` in the foundation and `transparent` in Boring Gray.
  - Docs: https://raft-design.botiverse.build/foundations/themes/#what-a-theme-may-change

### Changed

- **SidebarItem**: the active item's border takes `brand-edge` instead of `sticker-ink`, so in Boring Gray the selected row is a plain gray fill. It renders the same in Raft Yellow and the avatar-series themes. ([#754](https://github.com/botiverse/raft-design/pull/754))
  - Why: see Themes: a frame, never a new palette, above.
  - Affects: `data-active:border-sticker-ink` → `data-active:border-brand-edge`.
  - Docs: https://raft-design.botiverse.build/foundations/themes/#the-themes
- **AppRail**: the nav draws the theme's rail sprites as its last flex item, an `::after` pushed to the bottom under the items, up to 48 × 112px, which shrinks when the rail has less room so it never sits behind an item. Without a decorated theme it is empty. ([#754](https://github.com/botiverse/raft-design/pull/754))
  - Why: see Themes: a frame, never a new palette, above.
  - Affects: nav gains `after:mt-auto after:h-28 after:min-h-0 after:w-12 after:shrink after:content-[''] after:frame-decor-rail`. A nav `::after` of your own would replace it.
  - Docs: https://raft-design.botiverse.build/foundations/themes/#decorations
- **Drawer**: a bottom or top sheet's grab handle has round ends. ([#747](https://github.com/botiverse/raft-design/pull/747))
  - Why: see Grab handles have round ends, above.
  - Affects: handle `before:rounded-[1px]` → `before:rounded-full`.
  - Docs: https://raft-design.botiverse.build/components/drawer/#rules
- **MessageIcon**, **ChatIcon** and **ThreadIcon**: their lines are drawn at Lucide's weight. ([#751](https://github.com/botiverse/raft-design/pull/751))
  - Why: at 1 they drew 0.89px at 16px, thinner than every Lucide icon beside them in a menu or a toolbar.
  - Affects: `strokeWidth` 1 → 1.5 on the 18px grid (1.33px at 16px, as Lucide's 2 on its 24px grid).
  - Docs: https://raft-design.botiverse.build/components/icons/#anatomy
- **ThreadIcon**: both bubbles are outlined; the back one stops a stroke's width short of the front one on both sides, and both stay inside the 18px box with their stroke. ([#752](https://github.com/botiverse/raft-design/pull/752))
  - Why: every icon in Raft is a line drawing at one weight, and a filled bubble read heavier than the Lucide icons beside it.
  - Affects: front bubble `fill="currentColor"` → outline; the paths are redrawn, so the icon's shape changes slightly.
  - Docs: https://raft-design.botiverse.build/components/icons/#anatomy

### Fixed

- **MessageReactionQuickRow**: the quick reactions line up with the menu's items: the first drawing starts 10px in, where the items' icons do. ([#751](https://github.com/botiverse/raft-design/pull/751))
  - Why: with no side padding the reactions stood 3px left of the icons below them, so the column the eye follows down the menu stepped out at the top.
  - Affects: `p-0` → `px-0.75 py-0` (3px at each side).
  - Docs: https://raft-design.botiverse.build/components/dropdown-menu/#the-message-menu
- **Banner** `size="sm"`: with a × (and no action button), the banner keeps the same room above and below as with a button, so the ×'s 32px hover fill stays 4px inside the banner's edges. ([#677](https://github.com/botiverse/raft-design/pull/677))
  - Why: the room was kept only for an action button, so the ×'s hover fill reached the banner's edge.
  - Affects: padding above and below with a × only: 8px → (32px − one line) / 2 + 4px, 9px on a desktop and 10px on a phone.
  - Docs: https://raft-design.botiverse.build/components/banner/#sizes
- **VirtualList**: scrolling up near the end of a list no longer snaps back, and on iOS the rows stay painted when older rows land at the top while the finger is still down. `onContentResize` is no longer called for rows above the view that the list measures and scrolls away exactly as you scroll up, since nothing in view moves and neither does the distance to the end. ([#683](https://github.com/botiverse/raft-design/pull/683))
  - Why: a chat that follows the end from `onContentResize` and still counted the person as at the bottom scrolled back to the end, taking back the scroll that had mounted those rows; and when rows above the view shrank near the end, the browser's clamp and the list's own compensation both moved the view, so the rows in view jumped down. On iOS, at the top with the finger down, the pending compensation wasn't applied as a transform, so the rows were drawn below the view and a newly loaded older page showed blank.
  - Affects: `onContentResize` still runs when content in view or below it changes, and when a pending scroll is replayed. The clamp is subtracted from the scroll compensation instead of being applied twice.
  - Docs: https://raft-design.botiverse.build/components/virtual-list/#following-the-end

## [0.24.0](https://github.com/botiverse/raft-design/compare/v0.23.1...v0.24.0) (2026-10-23)

### Design System

- **Phone popups 8px from each screen edge**: on a phone, a popup about as wide as the screen is the screen's width less 8px on each side, at most 480px, and stops 8px from the edge it is pushed against, measured from the screen's edge, not the safe area. Its width comes from the positioner's `--available-width`, not `100vw`. It applies to NotificationCenter. ([#737](https://github.com/botiverse/raft-design/pull/737))
  - Why: popups that open from the same phone top bar sat at different insets and widths, so they didn't line up with each other or sit evenly between the screen's edges; every popup that wide now takes the server list's 8px inset.
  - Affects: inset 8px from both screen edges; width `min(var(--available-width), 480px)`. The 480px cap only reaches a phone on its side.
  - Docs: https://raft-design.botiverse.build/foundations/elevation/#popups
- **Located: focus on the item is the inset ring, and a message is an article**: an item that a keyboard jump focuses draws the 2px inset ring in `foreground`, inside the item and with its corners, only after keyboard input, never the browser's outline. A message is announced as an article named by its sender and its time. It applies to MessageItem. ([#740](https://github.com/botiverse/raft-design/pull/740))
  - Why: the browser's outline is drawn outside the item with its own rounded corners, so on a message it framed the transparent gap above the row and a scroller cut it off, and a screen reader landing on a message heard its text with no sender or time; the ring now sits inside the item and the row carries its own name.
  - Affects: focus on a jumped-to item: browser outline → `inset-ring-2 inset-ring-foreground` after keyboard input.
  - Docs: https://raft-design.botiverse.build/foundations/states/#located

### Breaking Changes

- **MessageItem**: the row is an `article` named by its sender and its time. When it holds a `MessageItemSender` or `MessageItemSenderButton`, a `MessageItemTime` or a `MessageItemContinuationTime`, the row gets `role="article"` and `aria-labelledby` pointing at them, in that order, and those parts get ids raft-ui generates (an `id` you pass is kept and is the one the row points at). A screen reader announces, for example, "Atlas 2:20 PM" before the text; a continuation row is named by its time. A row with none of these parts and no `aria-label` or `aria-labelledby` stays a plain `div`. ([#740](https://github.com/botiverse/raft-design/pull/740))
  - Why: a screen reader landing on a message, after a jump or with its reading keys, read the text with no sender or time; the row now carries its own role and name.
  - Affects: every row with a sender or time part, role none (`div`) → `article`, with `aria-labelledby`; the sender and time parts gain an `id`. Your own `role` or `aria-labelledby` on `MessageItem` or its `render` element is left as is; your own `aria-label` drops the generated `aria-labelledby`, and a role that takes no name (`none`, `presentation`, `generic`) gets none.
  - Migrate: don't render `MessageItem` as an `li` or put rows in a `list`: `role="article"` replaces `listitem`, and a list may hold only list items. Remove the list role from the timeline, or pass `role="listitem"` on `MessageItem` to keep the old semantics. Update tests and selectors that find rows by role or expect no `role` on the row. When `render` is a function, pass `role`, `aria-label` and `aria-labelledby` on `MessageItem`, since a function's props can't be read. Don't give `MessageItemSenderButton` an `aria-label` of its own: the row would read that instead of the visible name.
  - Docs: https://raft-design.botiverse.build/components/message-item/#accessibility

### Changed

- **MessageItem**: a focused row (`tabIndex={-1}`, set by the caller when a keyboard jump lands on it) shows the 2px inset ring in `foreground`, square like its hover, after keyboard input, and shows its toolbar; it never shows the browser's outline. After a click, nothing shows. raft-ui still doesn't make the row focusable. ([#740](https://github.com/botiverse/raft-design/pull/740))
  - Why: see Located: focus on the item is the inset ring, above.
  - Affects: focused row: browser outline → `outline-none focus-visible:keyboard:inset-ring-2 focus-visible:keyboard:inset-ring-foreground`. While the toolbar shows, its card covers part of the ring's top edge at the right.
  - Docs: https://raft-design.botiverse.build/components/message-item/#states

### Fixed

- **NotificationCenterPopup** `viewport="mobile"`: the popup is the screen's width less 8px on each side, at most 480px, and sits 8px from both screen edges, though it hangs from a bell at the right, lined up with the server list under the same top bar. Pass `collisionPadding` to change the inset. On desktop it is unchanged: 380px with Base UI's default collision padding. ([#737](https://github.com/botiverse/raft-design/pull/737))
  - Why: see Phone popups 8px from each screen edge, above.
  - Affects: width `min(92vw, 360px)` → `min(var(--available-width), 480px)`; collision padding Base UI's default → 8px with `viewport="mobile"`.
  - Docs: https://raft-design.botiverse.build/components/notification-center/#behavior

## [0.23.1](https://github.com/botiverse/raft-design/compare/v0.23.0...v0.23.1) (2026-10-22)

### Fixed

- **MessageItemToolbar**: measures its width onto the row (`--mi-toolbar-width`) as the toolbar shows, on the row's `pointerenter` or `focusin`, instead of when the row mounts, so a message row mounts in one commit again and keeps no ResizeObserver of its own. The fade under the toolbar looks the same. ([#738](https://github.com/botiverse/raft-design/pull/738))
  - Why: 0.23.0 kept the toolbar's element in React state and gave every toolbar its own ResizeObserver, and every message row renders a toolbar, so each row committed twice on mount and a long channel held one observer per message; only the toolbar that shows needs its width, so it is now measured then.
  - Affects: per row on mount, 2 commits → 1 and 1 ResizeObserver → 0; while a toolbar shows (hover, focus inside the row, an open popup), one ResizeObserver shared by the page watches it; it lets go of a toolbar once the pointer and focus have left its row with no popup open (after a popup closed elsewhere, the next time any toolbar shows) and is disconnected when it watches none. On mount the row gets `--mi-toolbar-width: 164px` (five buttons' width), replaced by the measured width as the toolbar shows, so a toolbar that ever shows without a pointer or focus event on its row fades five buttons' width until it measures itself: too much for a smaller toolbar rather than too little. A row without a `MessageItemToolbar` still gets no width and masks nothing.
  - Docs: https://raft-design.botiverse.build/components/message-item/#behavior

## [0.23.0](https://github.com/botiverse/raft-design/compare/v0.22.1...v0.23.0) (2026-10-22)

### Design System

- **Switch on the region's width**: a layout switches on the width of the region it sits in (a panel, a column, a card), not on the window's. A component that switches its own layout makes itself a container, so it lays out the same in a 360px panel on a wide window as on a phone; it then fills its row and needs a parent with a definite width. Only what the window itself sizes reads the window (the page shell, dialogs, sheets, toasts), and mouse or touch is read with `pointer` and `hover`, never with the width. Every row needs a way to give way: a row of controls that still doesn't fit wraps onto a second line, and a value such as an email truncates last. Whether a part's content fits is measured, not guessed from a width. It applies to DescriptionList, MessageActionCard, MessageImageGallery, MessageVideoPreview, MessageForwardedBundleGallery, Steps, the TasksPanel toolbar, ActivityInboxSelectionToolbar, ListRowMeta, SegmentedControl, SidebarSectionControls, SearchEntityResult and CodeBlockPre. ([#721](https://github.com/botiverse/raft-design/pull/721), [#733](https://github.com/botiverse/raft-design/pull/733))
  - Why: the same component sits in a narrow panel on a wide window and fills a phone, so a layout that asked the window laid itself out for a screen it didn't have (a two-column list in a 360px panel, a step row that wrapped where it should stack); every layout that switched on the window was moved to its own region, or to the input where the switch is about touch.
  - Affects: the switch points listed under Breaking Changes and Changed below.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#switch-on-the-regions-width
- **Stacked buttons each take a frame**: when buttons stack full width (a dialog footer whose row doesn't fit, a bottom or top sheet's actions), a ghost button there takes the ink border of `default`, with its hover and press; it goes back to frameless when the row fits again. It applies to Button, DialogFooter, AlertDialogFooter and DrawerActions. ([#727](https://github.com/botiverse/raft-design/pull/727))
  - Why: stretched to the full width, a frameless Cancel read as a line of text under the commit button, not as a button; once buttons stack, each needs its own box.
  - Affects: a stacked ghost button: border `transparent` → `line-strong` on `layer-card`, hover and press `overlay-medium`, as `default`; text sizes `xs` to `xl` only, ghost icon buttons stay frameless.
  - Docs: https://raft-design.botiverse.build/components/dialog/#the-footer
- **Text selection: its own token**: selected text (`::selection`) is painted with the new `selection` token and keeps its own text color. In light mode it is `brand-soft`, as before; in dark mode it is `brand` over the page at 22%, the same wash as a commented passage. `brand-soft` stays the menu highlight. It applies to MessageItem text. ([#730](https://github.com/botiverse/raft-design/pull/730))
  - Why: in dark mode `brand-soft` left a selection at 1.23:1 against the canvas, so it was hard to see what was selected; a menu row's highlight and a selection need different values in dark mode, so they no longer share one.
  - Affects: dark `selection` `brand-soft` (`oklch(0.5501 0.0999 91.5 / 0.2)`) → `color-mix(in oklch, var(--brand-400) 22%, transparent)`: 1.23:1 → 1.77:1 against the canvas, the selected text 7.7:1 (APCA Lc 80). Light mode is unchanged (1.14:1 against the canvas, the text 16.5:1, Lc 96).
  - Docs: https://raft-design.botiverse.build/foundations/color/#text-selection

### Breaking Changes

- **MessageItem**: the header keeps no room for the hover toolbar, and `--mi-toolbar-reserve` is no longer read. At rest the sender line has the full width; while the toolbar shows (hover, focus inside the row, an open menu), the end of a sender line long enough to reach the corner fades out under it. `MessageItemToolbar` measures its own width onto the row as `--mi-toolbar-width`, so a toolbar with more or fewer buttons masks exactly its width. ([#726](https://github.com/botiverse/raft-design/pull/726))
  - Why: keeping room for the toolbar cut the name to a few letters in a narrow column all the time, to protect a corner that is covered only while the pointer is on that message; the line now keeps its full width and nothing reflows on hover.
  - Affects: with a mouse, header end padding `--mi-toolbar-reserve` (default 7rem) → 0. While the toolbar shows, the header is masked from 4px left of the toolbar's left edge to its end, after a 12px fade (`--mi-header-mask`); a row without a `MessageItemToolbar` masks nothing. The time's tooltip, when it fades out under the toolbar, can be pointed at once the pointer leaves the toolbar, and stays in the keyboard order.
  - Migrate: remove `--mi-toolbar-reserve` wherever you set it; it has no effect. Render the toolbar with `MessageItemToolbar` inside the `MessageItem` row, which writes `--mi-toolbar-width`; a hover toolbar of your own gets no fade unless it sets `--mi-toolbar-width` (its width in px) on the row (`[data-message-item]`).
  - Docs: https://raft-design.botiverse.build/components/message-item/#behavior
- **DescriptionList** `direction="horizontal"`, **MessageActionCardContent**, **MessageImageGallery**, **MessageForwardedBundleGallery**, **Steps** (without `vertical`) and **TasksPanelRoot** are size containers (`container-type: inline-size`) and switch their layout on their own width instead of the window's; the list, the galleries and the step row fill their row (`width: 100%`). ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: see Switch on the region's width, above.
  - Affects: DescriptionList stacks below 24rem (384px) of its own width (was below a 640px window), the value right under its label (its 32px minimum row height dropped) and 10px between pairs (the 2px row gap plus 8px; was 2px). MessageActionCard properties stack below 24rem of the card's content (was below a 640px window) with the same spacing, the value's 6px padding above and below dropped; a card at its 440px cap keeps two columns. MessageImageGallery: at most `min(360px, 100%)` of its column (was `min(360px, 100vw − 112px)` below a 768px window); rows 8rem (7rem with three images) below 360px of the gallery's own width and 9rem (8rem) at it (was by a 640px window); three images stay two across and one under them. MessageForwardedBundleGallery: a row of three is three across from 360px of the gallery's own width (was from a 768px window) and two across below; its rows grow as above from 360px (was from a 640px window). Steps: below 40rem (640px) of the row's own width each step stacks its text under its marker (was below a 640px window), and from 40rem a row too long for its width wraps. TasksPanelToolbar: New Task and the view switch on one line and the filters on the next below 28rem (448px) of the panel's width (was below a 768px window), one wrapping row from 28rem; toolbar and viewport sides 16px below 28rem, 20px from it (was by a 768px window). The same window can now show a different layout: a narrow panel on a desktop takes the narrow layout, and a wide region on a small window keeps the wide one.
  - Migrate: put each of these in a parent with a definite width: a block, a stretched flex or grid item, or anything with a width set. In a parent that shrinks to fit its content (`inline-block`, `w-fit` or `fit-content`, an absolutely positioned box or a floating layer with no width, a flex item with `flex-basis: auto` and no width) a size container takes no width from what it holds and collapses, its text one word to a line. Keep `TasksPanelToolbar` and `TasksPanelViewport` inside `TasksPanelRoot`, and `MessageActionCardProperties` inside `MessageActionCardContent`: outside them there is no container, so the tasks toolbar keeps its two-line layout with 20px sides and the properties stay in two columns at every width. Remove window breakpoint overrides (`sm:`, `md:`, `max-sm:`) you added to adjust these layouts, and check them in your narrowest panels.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#switch-on-the-regions-width

### Added

- **SegmentedControl** `iconsOnlyBelow="auto"`: the segments show only their icons exactly when their labelled segments don't fit the width the control is given, and their labels again once they fit. It decides before the first frame paints, and again when the room, a label, a count, the selection or a web font changes, always against the labelled layout, so it doesn't flicker at the boundary. `iconsOnlyBelow` also takes any length in `px`, `rem` or `em` (`"18.5rem"`, `"296px"`), measured against the nearest `@container` (the control's parent when there is none), beside the presets `xs` to `2xl`, which stay CSS container queries. With `auto` or a length the track carries `data-icons-only` while it shows only icons. The presets' type is exported as `SegmentedControlIconsOnlyPreset`. ([#733](https://github.com/botiverse/raft-design/pull/733))
  - Why: a width picked for one language, one count or one font was wrong for the others, and the room a control is given changes with what sits beside it; `auto` measures the labels against that room instead.
  - Affects: with `auto`, the control is a shrinkable flex item (`min-w-0`); leave it free to shrink in its row (don't make it `shrink-0`). In development raft-ui warns when a segment has no icon, or when `iconsOnlyBelow` is neither a preset, `auto` nor a `px`, `rem` or `em` length (the segments then keep their labels).
  - Docs: https://raft-design.botiverse.build/components/segmented-control/#behavior
- **`selection`** token: `--selection` in `foundation.css` and `tokens.json`, and the Tailwind color `selection` (`selection:bg-selection`). ([#730](https://github.com/botiverse/raft-design/pull/730))
  - Why: see Text selection: its own token, above.
  - Affects: light `var(--brand-soft)`; dark `color-mix(in oklch, var(--brand-400) 22%, transparent)`. Paint your own `::selection` with it in place of `brand-soft`.
  - Docs: https://raft-design.botiverse.build/foundations/color/#text-selection

### Changed

- **SegmentedControl**: the track may shrink to its row. When the row is narrower than the track, its neighbors have given way and the segments can't show only their icons (or no `iconsOnlyBelow` is set), the segments scroll sideways inside the track, the checked one kept in view, instead of spilling onto the next control; the track sets `data-overflowing` while they do. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: the track never shrank below its segments, so in a narrow row it ran over its neighbor; scrolling inside it is the last way it gives way.
  - Affects: track `shrink-0` → `min-w-0 max-w-full`; while overflowing, `overflow-x: auto` with no scrollbar. Segments still never shrink. A track you made `shrink-0` yourself still never shrinks.
  - Docs: https://raft-design.botiverse.build/components/segmented-control/#behavior
- **SidebarSectionControls** and **SearchEntityResult**: decided by the input, not the window's width. The section controls show at rest wherever there is no fine pointer (a touch screen, a tablet at any width) and on hover, focus or an open menu with a mouse; a search result row is at least 64px tall on a touch screen at any width. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: a tablet is touch at 1024px and a narrow desktop window still has a mouse, so the width was the wrong question.
  - Affects: section controls at rest: shown below a 768px window → shown without `pointer: fine`; a narrow desktop window with a mouse now shows them on hover only. Search result `min-height: 64px`: below a 768px window → `pointer: coarse`.
  - Docs: https://raft-design.botiverse.build/patterns/responsive/#touch-screens
- **ActivityInboxSelectionToolbar**: one 44px row while its controls fit, and they wrap onto a second line in a narrow column, whatever the window. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: it wrapped only below a 768px window, so in a narrow column on a wide window its controls overflowed.
  - Affects: `flex-wrap` at every width (was below a 768px window only); padding 6px above and 5px below (was 8px below a 768px window, 0 with a fixed 44px height from it).
  - Docs: https://raft-design.botiverse.build/components/activity-inbox/
- **ListRowMeta**: stays whole while the title gives way first, then truncates when there is still no room, so a long value (an email beside a button in a 320px row) is cut instead of running under the button. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: the meta never shrank, so a long value overflowed the row.
  - Affects: `shrink-0` → `min-w-0 truncate`.
  - Docs: https://raft-design.botiverse.build/components/list-row/#content
- **MessageVideoPreview**: at most `min(360px, 100%)` of its column. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: its cap was the window less a guess at the message's chrome, which was wrong in a thread beside a conversation.
  - Affects: `max-width` `min(360px, 100vw − 112px)` → `min(360px, 100%)`.
  - Docs: https://raft-design.botiverse.build/components/message-attachment/#rules
- **Button** `variant="ghost"`, so **DialogFooter**, **AlertDialogFooter** (`AlertDialogCancel`) and **DrawerActions**: a ghost text button inside an element with `data-stacked` takes the ink frame of `default`. Dialog and alert dialog footers set `data-stacked` only while their buttons stack; `DrawerActions` sets it in a bottom or top sheet, where its buttons are always stacked, and not in a drawer from a side. Keep writing Cancel as `ghost`. ([#727](https://github.com/botiverse/raft-design/pull/727))
  - Why: see Stacked buttons each take a frame, above.
  - Affects: as above; a disabled ghost button keeps the disabled fill, and ghost icon buttons stay frameless. A stacked footer's buttons have no transition until the row has been measured and painted once (`data-measured`), so the frame doesn't fade in as a dialog opens.
  - Docs: https://raft-design.botiverse.build/components/button/#which-color
- **MessageItem** text: selected text uses the `selection` token, so in dark mode a selection is deeper; light mode is unchanged. ([#730](https://github.com/botiverse/raft-design/pull/730))
  - Why: see Text selection: its own token, above.
  - Affects: `selection:bg-brand-soft` → `selection:bg-selection`.
  - Docs: https://raft-design.botiverse.build/foundations/color/#text-selection

### Fixed

- **TaskChip** (default and `size="sm"`): the chip's baseline is its text's, so its words sit on the line of the text beside it, such as a DescriptionList label; the status pixel and icons stay centered in the chip. ([#732](https://github.com/botiverse/raft-design/pull/732))
  - Why: a centered flex box takes its baseline from its first item, so a chip that led with its status pixel sat on the pixel's bottom edge and its words stood a pixel off the label beside them.
  - Affects: text laid out on the baseline inside the chip with 3px above and below (default, 22px) and 2px (`sm`, 20px), marks `self-center`; heights unchanged. `variant="inline"` is unchanged.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#text-of-different-sizes-on-one-line
- **CodeBlockPre**: measures again whenever the `pre` resizes or its code changes (highlighting that arrives late, code that streams in), so a line that grows too long becomes the keyboard-reachable region (`tabindex="0"`, `role="region"`) it should be. ([#721](https://github.com/botiverse/raft-design/pull/721))
  - Why: it measured once when it mounted, so code that changed later kept the first answer.
  - Docs: https://raft-design.botiverse.build/components/code-block/#accessibility

## [0.22.1](https://github.com/botiverse/raft-design/compare/v0.22.0...v0.22.1) (2026-10-22)

### Design System

- **Located: one highlight for every jump**: the item a jump took someone to, such as a link to a message, a search result or Activity item that opens a message, Back to the list a result was opened from, a file comment's passage or the rows a bulk change touched, shows `info-soft` at once, holds it 1.2s and fades out with `ease-out`, gone at 2s. It is layered over the item's own fill and takes the item's corners; a stronger mark (selected, current, a search match, checked, an open menu) wins and the item isn't painted; a located item doesn't answer hover while it lasts, but a press still shows. With reduced motion it is held still for 2s and then goes off without a fade. It is only a look: a jump started from the keyboard also moves focus to the item. It applies to MessageItem. ([#719](https://github.com/botiverse/raft-design/pull/719))
  - Why: the system had one line for a jumped-to message (`info-soft`, cleared after 2 seconds, listed under selection) and nothing shared to apply it, so each jump drew its own flash with its own timing and colour; every jump now shows one highlight that goes away by itself.
  - Affects: `info-soft` cleared at 2s → held 0–1.2s, `ease-out` fade 1.2s–2s, gone at 2s (`LOCATED_MS` = 2000); the current match of a search inside a page is a selection and keeps `info-soft` while the search is open.
  - Docs: https://raft-design.botiverse.build/foundations/states/#located
- **A status light beside text is 10px**: every status light and attention dot that sits beside text, in a chip, a badge, a panel header, a sidebar row or a list row, is 10px with a 1.5px ink edge and a 2px radius; none of them is 9px. A light on an avatar's corner still follows the avatar, and the 8px `Status` `sm` stays the attention dot on an icon's corner (the NotificationCenter bell's dot, a `Status` at the default size, is 10px). It applies to Status, Badge, PanelActivity, SidebarSectionAttention, LiveAgentActivityBarStatus, NotificationCenter and its trigger's dot, the task status icons (TaskStatusIcon, TaskChip, TaskCardStatus, TaskStatusBadge, TaskList, TaskBoard), InboxItem, MessageActionCard, Timeline and the `lead-dot` utility. ([#722](https://github.com/botiverse/raft-design/pull/722))
  - Why: every line, chip and row a light sits in is an even number of pixels, so a 9px light had half a pixel left over and was drawn with one more device pixel above it than below (0.5px off center on a 1x screen, 0.17px on a 3x one); a 10px light centers on a whole pixel.
  - Affects: light 9px → 10px, its colour 6px → 7px; the 1.5px ink edge and 2px radius are unchanged. Avatar corner badges (`AvatarBadge`) and `Status` `xs`, `sm` and `lg` are unchanged.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text
- **Link blue: a deeper, quieter blue**: `foreground-link`, the blue used only for links in running text, is a deep, quiet blue: in light mode about half the chroma of a bright link blue, so it sits beside black ink and yellow without being the loudest thing on a page full of links, and still reads as a link at a glance; dark mode uses the same blue, lightened to read on the dark canvas. It applies to Markdown links and anything colored with `foreground-link`. ([#725](https://github.com/botiverse/raft-design/pull/725))
  - Why: with the bright blue, a page full of links looked loud against the black-and-yellow brand; links keep their blue and their underline, in a deeper, quieter shade.
  - Affects: light `oklch(0.4878 0.2432 264.4)` (#1447e6) → `oklch(0.4327 0.1282 256.54)` (#184f95); dark `oklch(0.8071 0.1007 250.45)` (#8ec5ff) → `oklch(0.717 0.1183 253.58)` (#6da7ec). Against the canvas 6.83:1 → 8.11:1 in light mode and 9.51:1 → 6.89:1 in dark mode; against `foreground` 2.75:1 → 2.32:1 and 1.44:1 → 1.98:1, still under 3:1, so the underline at rest still marks the link.
  - Docs: https://raft-design.botiverse.build/foundations/color/#meanings-of-color

### Added

- **useLocated**, **LOCATED_MS** and **LocatedRequest**, with the `data-located` highlight in `styles.css`: `useLocated(request)` returns `true` while an item should show the located highlight; set `data-located` on the item while it does. Pass a new `request` (a counter or token, a string or number, not the item's id) for each jump once the item is on screen. The hook turns the highlight on two frames later, so a second jump to the same item restarts it, and off after `LOCATED_MS`. ([#719](https://github.com/botiverse/raft-design/pull/719))
  - Why: see Located: one highlight for every jump, above.
  - Affects: `[data-located]` runs a 2s animation of the registered `--located-fill` colour (`info-soft` → transparent), painted as a `background-image` layer over the item's own fill; not painted while the item is `:active`, selected (`data-selected`, `data-active="true"`, `aria-selected="true"`), current (`aria-current`) or has `data-popup-open`. The `animation` shorthand replaces the item's own animation while it is located. Don't set `data-located` by hand: left on, it keeps hiding hover.
  - Docs: https://raft-design.botiverse.build/foundations/states/#located
- **MessageItem** `located`: shows the located highlight on the message row; pass `useLocated(request)`. ([#719](https://github.com/botiverse/raft-design/pull/719))
  - Why: see Located: one highlight for every jump, above.
  - Affects: the row's resting fill is `--located-fill` (transparent unless located), so a search match, a checked row or an open menu keeps its own fill, and the ring around a delegated face matches the row; a located row doesn't take the `fill-subtle` hover while the highlight lasts. A row without `located` renders as before.
  - Docs: https://raft-design.botiverse.build/components/message-item/#states

### Changed

- **Status** `size="md"` (the default) and the `lead-dot` utility, so also **SidebarSectionAttention**, **LiveAgentActivityBarStatus** and the **NotificationCenterTrigger** dot; **TaskStatusIcon** and the per-status task icons, so the status pixel in **TaskChip**, **TaskCardStatus**, **TaskStatusBadge**, **TaskList** and **TaskBoard**; the unread dots of **InboxItem** and **NotificationCenter**, the **MessageActionCard** status dot and the **Timeline** default marker: 9px → 10px; props and markup are unchanged. ([#722](https://github.com/botiverse/raft-design/pull/722))
  - Why: see A status light beside text is 10px, above.
  - Affects: `--lead-dot` 9px → 10px, so Badge and PanelActivity hold a `Status` at 10px; the task status pixel svg 9×9 → 10×10; `--r-timeline-icon-size` default 9px → 10px. A chip that holds a status pixel is 1px wider, its height unchanged. The Timeline axis column is 1px wider and a horizontal Timeline 1px taller. The NotificationCenter unread dot sits centered on the title line: top 17.5px → 17px on a phone, 18px on a desktop. The NotificationCenterTrigger dot keeps its top-right anchor and grows 1px down and left. The InboxItem unread dot takes its extra pixel out of the gap below it, so rows keep their height.
  - Docs: https://raft-design.botiverse.build/components/status/#sizes
- **`foreground-link`** token: light and dark values deepened to the quieter link blue, in `foundation.css` and `tokens.json`; the token name is unchanged. ([#725](https://github.com/botiverse/raft-design/pull/725))
  - Why: see Link blue: a deeper, quieter blue, above.
  - Affects: light #1447e6 → #184f95, dark #8ec5ff → #6da7ec (values above). Markdown links take the new blue, and so does their hover colour (the link blue mixed 20% toward `foreground`).
  - Docs: https://raft-design.botiverse.build/foundations/color/#meanings-of-color

## [0.22.0](https://github.com/botiverse/raft-design/compare/v0.21.2...v0.22.0) (2026-10-22)

### Design System

- **A mark that leads text: a notice leads with its intent's icon**: a toast, a banner or a panel notice never uses a status light to say what kind of notice it is (success, info, warning, error); it leads with its intent's Lucide icon, or the avatar of whoever it is about. A status light keeps its own meanings: whether an agent, a person or a computer is working or online, a task's status, and the square attention dot that marks something waiting or unread. A notice about one of those things may still show that thing's light inside it. It applies to Toast, Banner and PanelNotice. ([#709](https://github.com/botiverse/raft-design/pull/709))
  - Why: the same square light said both what kind of notice it was and whether someone was online or a task was done, so one mark carried several meanings; notices now lead with their intent's icon and the light keeps its own meanings.
  - Affects: a notice's leading mark, a 9px status light → the intent's icon: `Info`, `CircleCheck`, `TriangleAlert` (and `OctagonAlert` for a `destructive` banner), 16px in a toast and a `sm` banner, 20px in a banner.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text
- **Chips in running text: one box**: every chip with a fill in a message's text, a reference chip, the yellow sticker of a mention of the person reading and an inline task chip, shares one box: 0.875em semibold type on a line 2px shorter than the body line, its words on the sentence's baseline, a leading mark centered on the chip, 6px at each end (4.5px with a leading mark, the mark 4px from the text) and `radius-sticker` corners. A chip never makes its line taller. In dark mode the sticker keeps its ink edge, drawn inside, and has no die-cut edge outside. Text marks without a fill, a mention of someone else and a web link, are unchanged. It applies to MessageReferenceChip, MessageReferencePending, MessageReferenceUnavailable, MessageReferenceText `primary` and TaskChip `inline`. ([#706](https://github.com/botiverse/raft-design/pull/706))
  - Why: chips in one sentence had two sizes: a reference chip was 22px tall and made a desktop line 1px taller, while a task chip and the sticker took the sentence's own type on a shorter line, about 5px shorter than a reference chip with letters 2px larger; every filled chip in message text now takes the same box.
  - Affects: chip height = body line − 2px: 20px on a desktop (body 14/22), 22px on a phone (body 16/24); type 12.25px on a desktop, 14px on a phone.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#marks-in-running-text

### Breaking Changes

- **Banner**, **PanelNotice** and **ToastIcon**: a `Status` light placed as the leading mark is no longer laid out as one. ([#709](https://github.com/botiverse/raft-design/pull/709))
  - Why: see A mark that leads text: a notice leads with its intent's icon, above.
  - Affects: in a Banner, a `Status` that is a direct child no longer gets the 20px (16px at `sm`) icon column, so it drops to a row of its own under the text; in a PanelNotice it is no longer centered on the first line; in a ToastIcon it is no longer held at 9px whatever size it was given. An icon in any of them is unchanged.
  - Migrate: replace the leading `Status` with the intent's Lucide icon, as listed in Banner's and Toast's Variants (`Info`, `CircleCheck`, `TriangleAlert`, and `OctagonAlert` for a `destructive` banner). For something still pending, put a `Spinner` in a `status="info"` banner instead (see Added). A `Status` that shows a person's, an agent's or a task's own state may stay inside the notice's text.
  - Docs: https://raft-design.botiverse.build/components/banner/

### Added

- **Banner** with a `Spinner`: while something is still pending, such as a computer that hasn't connected yet, a `Spinner` placed as a direct child takes the icon's place. Banner puts it in the icon's column and centers it on the first line, so the text starts where it does after an icon. Use it in a `status="info"` banner. ([#709](https://github.com/botiverse/raft-design/pull/709))
  - Why: a pending state had no leading mark but a warning light, and waiting is not a problem; a spinner in an info banner says it is still going without the warning tint or its icon.
  - Affects: the spinner's column is 20px (16px at `sm`), one line tall, with the icon's gap before the text (10px, 8px at `sm`).
  - Docs: https://raft-design.botiverse.build/components/banner/
- **MessageReferenceChip** and **MessageReferencePending** `capped`: stops the chip at `min(100%, 24em)`, and a longer `MessageReferenceLabel` truncates at the end. For words Raft doesn't write, such as the title an app gives a link it previews. Give the pending chip the same `capped` as the chip that replaces it, so the line keeps its width when it loads. ([#696](https://github.com/botiverse/raft-design/pull/696))
  - Why: an app's link is shown as a reference chip with the app's own title, and a long title could take the whole line; a capped chip keeps each link to at most one line.
  - Affects: cap 24em of the chip's text: 294px on a desktop, 336px on a phone, or the line when it is narrower.
  - Docs: https://raft-design.botiverse.build/components/message-item/#app-links

### Changed

- **toast** command API: `toast.info`, `toast.success`, `toast.warning` and `toast.error` lead with their intent's icon in `ToastIcon` instead of a status pixel. The calls, `icon: false` and `leading` are unchanged, and a `leading` node still takes the icon's place. ([#709](https://github.com/botiverse/raft-design/pull/709))
  - Why: see A mark that leads text: a notice leads with its intent's icon, above.
  - Affects: 9px status pixel → 16px Lucide icon in the same 20px column, hidden from assistive technology as before: `info` `Info`, `success` `CircleCheck`, `warning` and `error` `TriangleAlert`.
  - Docs: https://raft-design.botiverse.build/components/toast/
- **MessageReferenceChip**, **MessageReferencePending**, **MessageReferenceUnavailable**, **MessageReferenceText** `variant="primary"` and **TaskChip** `variant="inline"` take the shared chip box in running text; props, variants and markup are unchanged. ([#706](https://github.com/botiverse/raft-design/pull/706))
  - Why: see Chips in running text: one box, above.
  - Affects: reference chips: 1px padding above and below → 0, height 22px → body line − 2px (20px desktop, 22px phone), gap after a leading icon or `Spinner` and before a `MessageReferenceSuffix` 2px → 4px, a chip led by a `Spinner` (a pending reference) 6px → 4.5px at each end, as a chip led by an icon. The sticker (`primary`): sentence-size type on a 1.2em line → 0.875em on the chip line, sides 3px → 6px, the outer 1.5px `ring-sticker-edge` removed (the 1.5px inset ink ring stays). TaskChip `inline`: sentence-size type on a 1.2em line → 0.875em on the chip line, status pixel to text 6px → 4px, a leading icon 12px → 14px, its −2px side margins removed. Text set on a line other than the body's can give its chips their own line height with `--chip-line-height` on a container. The default and `sm` TaskChip are unchanged.
  - Docs: https://raft-design.botiverse.build/components/message-item/#chips-in-running-text
- **DialogFooter** and **AlertDialogFooter**: the buttons stay in one row at the end, Cancel then the commit button, at every width, and stack full width, the commit button on top, only when they don't fit on one line. In `DialogFooter`, a `TextLink` written first sits at the start in footnote text, and the buttons after it form one group (`data-slot="dialog-footer-actions"`) that stays beside the link when both fit and wraps under it, still at the end, when they don't. Props are unchanged. ([#673](https://github.com/botiverse/raft-design/pull/673))
  - Why: a commit button with a long label pushed the row past the dialog's padding; the footer now measures its row and stacks only then, never because the window is narrow, so Cancel and the commit button sit in the same place on every screen.
  - Affects: a row that doesn't fit gets `data-stacked`, a full-width column with the commit button on top; Tab order stays the markup's, Cancel then commit. A `TextLink` in `DialogFooter` takes `text-footnote`. A footer that sets its own layout with `className` keeps it while it fits on one line; give text that may give way `min-w-0`, so it shrinks before the footer stacks. With a leading `TextLink`, styles aimed at the footer's direct button children now need to target the `dialog-footer-actions` group.
  - Docs: https://raft-design.botiverse.build/components/dialog/#the-footer
- **Banner** `size="sm"`: the title and description keep the banner's 14px text (`text-callout`), as `md` and `lg`; `sm` tightens only its padding and its icon. ([#718](https://github.com/botiverse/raft-design/pull/718))
  - Why: a `sm` banner's text was smaller than the label of its 32px button, which made the button look too big for the banner; a banner's text is now never smaller than its button's label.
  - Affects: `sm` text `text-footnote` → `text-callout`: 12/18 → 14/22 on a desktop, 13/18 → 14/20 on a phone. The 16px icon and the 8px × 12px padding are unchanged. With a button, the button stays centered on the last line, 4px from the top and bottom edges, so the space above and below the text, (32px − one line) / 2 + 4px, goes 11px → 9px on a desktop and 11px → 10px on a phone; a one-line banner stays 40px tall.
  - Docs: https://raft-design.botiverse.build/components/banner/#sizes

## [0.21.2](https://github.com/botiverse/raft-design/compare/v0.21.1...v0.21.2) (2026-10-22)

### Fixed

- **DescriptionList** inline: a default-size TaskChip or TaskStatusBadge that comes first in `DescriptionDetails` hangs by its 7px left padding, so its icon or text starts where the other values' text does. ([#710](https://github.com/botiverse/raft-design/pull/710))
  - Why: 0.21.1 gave these chips 7px of left padding, but the list still pulled them 6px, so they started 1px to the right of the plain values beside them; the pull now matches the default chip's padding.
  - Affects: left margin `-6px` → `-7px` and `max-width` `calc(100% + 6px)` → `calc(100% + 7px)` for a leading TaskChip or TaskStatusBadge of any size; the pull fits the default 7px padding, so a `size="sm"` (5px) or `variant="inline"` (4.5px) chip in that place is pulled 7px too. A Badge (6px) and a Button are unchanged.
  - Docs: https://raft-design.botiverse.build/components/description-list/

## [0.21.1](https://github.com/botiverse/raft-design/compare/v0.21.0...v0.21.1) (2026-10-22)

### Design System

- **Chips**: the ink at a chip's two ends sits the same distance from its fill's edges. A chip keeps its total padding and its width, and splits the padding between its ends so each end makes up for the empty space its own content brings. A smaller note after a chip's label centers on the label's letters, and the label stays on the sentence's baseline. It applies to MessageReferenceChip, MessageReferencePending, MessageReferenceUnavailable, MessageReactionChip, MessageItemSavedIndicator, MessageForwardedBundleAttachment, TaskChip and TaskCardStatus, and to the new MessageReferenceSuffix. ([#700](https://github.com/botiverse/raft-design/pull/700))
  - Why: the chips split their padding as if every end were the same, so an icon or a status pixel sat closer to its edge than the last letter did to the other (3.6px against 7px in a reference chip), and the end after the text looked empty; each chip's padding is now set from where its ink is drawn.
  - Affects: the padding at each end, left / right, totals unchanged; see Fixed below.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#chips
- **A control and its label**: a settings row is the exception to the first-line rule. The leading icon, avatar or tile and the trailing switch, checkbox, radio, value or chevron of a `ListRow variant="plain"` center on the whole row, with or without a description, as they did in 0.20. A checkbox or radio beside wrapping text in a `<label>` row still sits on that text's first line. It applies to ListRow. ([#703](https://github.com/botiverse/raft-design/pull/703))
  - Why: a setting reads as one unit, and with its controls on the title's first line they belonged to the title instead of the row; settings rows center them on the row again.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-control-and-its-label
- **Timeline rhythm: the edge that messages scroll under fades**: the bottom edge of a message list, over the composer, fades from the panel's color to transparent over the section step, at all times, instead of cutting the message under it. The line of who is about to post sits on the same fade and has none of its own. It applies to the new MessageListEndFade. ([#699](https://github.com/botiverse/raft-design/pull/699))
  - Why: a message scrolled under the composer was cut off by a hard edge; the edge now fades, as a tab bar fades on the side that hides tabs.
  - Affects: fade height `timeline-section` 24px, `layer-canvas` to transparent.
  - Docs: https://raft-design.botiverse.build/foundations/spacing/#timeline-rhythm

### Added

- **MessageReferenceSuffix**: a short note after a reference chip's label, in muted Space Mono, such as `msg` on a link to a message. Put it inside `MessageReferenceChip`, after `MessageReferenceLabel`. ([#700](https://github.com/botiverse/raft-design/pull/700))
  - Why: a note in a span of the caller's own sat on the label's baseline, 0.3px low beside a 12.25px label and 0.75px low beside a 14px one, and its descenders made it look lower still; the part keeps the label's baseline in the layout and draws the note a quarter of the size difference higher, so the middles of the two x-heights meet.
  - Affects: `text-label` (11px) in `foreground-hint`, line height 1; drawn `(label size - 1em) / 4` higher.
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **MessageListEndFade**: the fade over a message list's bottom edge. Put it beside `MessageList`, in the same positioned parent (`ConversationPanelBody` is one), like the jump controls; it lies under them, is hidden from assistive technology and takes no pointer events. ([#699](https://github.com/botiverse/raft-design/pull/699))
  - Why: see Timeline rhythm: the edge that messages scroll under fades, above.
  - Affects: 24px tall (`h-timeline-section`), `layer-canvas` to transparent upward, `z-index` 5.
  - Docs: https://raft-design.botiverse.build/components/message-list/
- **SegmentedControl** `variant="on-frame"`, for a control in the frame (a top bar). `variant="default"` is unchanged and stays the default. ([#693](https://github.com/botiverse/raft-design/pull/693))
  - Why: a yellow sticker on the yellow frame did not read as selected, and a white segment beside it looked chosen instead; in the frame the selected segment takes the frame's active colors, as a selected rail item does.
  - Affects: track `fill-frame-medium`; other segments `foreground-on-frame-muted`, with `foreground-on-frame` on hover and `overlay-frame-medium` on hover and press; the selected segment `layer-frame-active` with a `line-frame-active` edge and `foreground-on-frame-active` text (white on the yellow frame, yellow on the dark one).
  - Docs: https://raft-design.botiverse.build/components/segmented-control/

### Changed

- **ListRow** `variant="plain"` with a description: the leading icon, avatar or tile and the trailing switch, checkbox, radio, value or chevron center on the whole row again, as in 0.20, instead of on the title's first line. With a title alone, nothing changes. This reverts the 0.21.0 change to ListRow. ([#703](https://github.com/botiverse/raft-design/pull/703))
  - Why: see A control and its label above.
  - Affects: the ends move without changing size, so row heights are unchanged (54px on a phone for a one-line row with a switch).
  - Docs: https://raft-design.botiverse.build/components/list-row/

### Fixed

- **MessageReferenceChip**, **MessageReferencePending**, **MessageReferenceUnavailable**, **MessageReactionChip**, **MessageItemSavedIndicator**, **MessageForwardedBundleAttachment**, **TaskChip** and **TaskCardStatus**: the ink at both ends sits the same distance from the edges; each chip keeps its total padding and its width. ([#700](https://github.com/botiverse/raft-design/pull/700))
  - Why: see Chips above.
  - Affects: padding left / right: MessageReferenceChip, MessageReferencePending and MessageReferenceUnavailable with an icon 3px / 6px → 4.5px / 4.5px (without an icon unchanged, 6px / 6px); MessageReactionChip 6px / 8px → 7px / 7px; MessageItemSavedIndicator and MessageForwardedBundleAttachment 6px / 6px → 5.5px / 6.5px (their bookmark and file icons are drawn inside their boxes); TaskChip 6px / 8px → 7px / 7px, `size="sm"` 4px / 6px → 5px / 5px and `variant="inline"` 3px / 6px → 4.5px / 4.5px; TaskCardStatus 6px / 8px → 7px / 7px.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#chips
- **MessageReferencePending**, and any reference chip, holding a `Spinner`: the spinner centers on the middle of the label's line, as an icon does. ([#700](https://github.com/botiverse/raft-design/pull/700))
  - Why: the chip centered only `svg` icons on the label's line, and a spinner is not one, so it sat on the baseline, 5–6px below the middle of the label's line.
  - Docs: https://raft-design.botiverse.build/components/message-item/
- **MessageQuotedPreviewChannel** and **MessageQuotedPreviewThread**: the icon sits on the first line of the name when a long name wraps, instead of in the middle of both lines. ([#700](https://github.com/botiverse/raft-design/pull/700))
  - Why: the icon was centered on the whole name, so it slid between the lines of a wrapped name; it now follows A mark that leads text, like the other components.
  - Affects: the icon (14px) is placed `(1lh - 14px) / 2` from the top of the name's first line.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text

## [0.21.0](https://github.com/botiverse/raft-design/compare/v0.20.1...v0.21.0) (2026-10-22)

0.20.1 was not published to npm. This release includes its changes, listed under [0.20.1](https://github.com/botiverse/raft-design/blob/v0.21.0/packages/ui/CHANGELOG.md#0201-2026-10-22) in the changelog.

### Design System

- **Timeline rhythm**: a conversation uses three distances between its lines, measured from text to text: 8px between the rows of one turn, the message step (16px) between turns, and the section step (24px) at a boundary: either side of a date line, from the top of the list to its first line, and from the last line to the composer's frame. It applies to MessageItem, SystemMessage, SystemMessageGroupHeader, MessageListDateDivider, MessageListNotice, ThreadPanelOriginalMessage, ThreadPanelReplySummary, ThreadPanelReplyCount, ConversationPanelFooter and ThreadPanelFooter. ([#694](https://github.com/botiverse/raft-design/pull/694))
  - Why: each part kept its own spacing, so a date line sat closer to the message above it than to the one below and looked attached to it, an event line had more space under it than over it, and the composer's frame read as touching the last message; the parts now read one rhythm from tokens, one step wider for each kind of break.
  - Affects: new tokens `timeline-gap-message` 16px, `timeline-gap-section` 24px and `timeline-row-inset` 4px (the reach of a row's highlight above and below its text).
  - Docs: https://raft-design.botiverse.build/foundations/spacing/#timeline-rhythm
- **A control and its label**: a checkbox, radio or switch sits 8px before its label, centered on the label's first line, and keeps its size wherever it sits. In a settings row with a description, both ends center on the title's first line. A tap between two options lands on the nearer one. It applies to Checkbox, RadioGroupItem and ListRow; FieldItem already followed it. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: a box in a `<label>` row followed the row instead of the text's line, so callers nudged it with a margin, and a settings row's ends centered on the title and description together, level with neither; the components now place the control themselves.
  - Affects: switch 50 × 30px and checkbox and radio 20px, unchanged; 8px from control to label.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-control-and-its-label

### Breaking Changes

- **ConversationPanelFooter** and **ThreadPanelFooter**: no space of their own above the composer; the end of the list sets it. ([#694](https://github.com/botiverse/raft-design/pull/694))
  - Why: the footer's 12px stacked on whatever space the list left under its last message, so the gap to the composer differed from list to list; now the list ends with one token and the composer's frame sits a section step, 24px, under the last line.
  - Affects: footer top padding 12px → 0; `pb-timeline-end` is 20px (the 24px section step less the last row's 4px inset).
  - Migrate: end your message list with `pb-timeline-end` under its last row, in place of any spacer you had there; without it the composer moves 12px closer to the last message. You can also start the list with `pt-timeline-start` over its first row, so its top follows the same step.
  - Docs: https://raft-design.botiverse.build/components/conversation-panel/

### Added

- **Timeline spacing utilities**: `pt-timeline-start` and `pb-timeline-end` for the top and end of a message list you build, and `timeline-message`, `timeline-section`, `timeline-row`, `timeline-turn` and `timeline-lead`, which the components use. All are registered with the `cn` helper, so they merge with other padding and margin classes. ([#694](https://github.com/botiverse/raft-design/pull/694))
  - Why: a list's top and end were written by hand in each product, which is how the gaps drifted; two utilities now give the section step with the rows' own insets taken out.
  - Affects: `timeline-start` 12px, `timeline-end` 20px, `timeline-turn` 8px, `timeline-lead` 12px, `timeline-message` 16px, `timeline-section` 24px, `timeline-row` 4px. Use only `timeline-start` and `timeline-end` in a product.
  - Docs: https://raft-design.botiverse.build/foundations/spacing/#timeline-rhythm
- **`ButtonSize`** and **`DeprecatedButtonSize`** types, and the **`button-sizes` codemod**, which renames deprecated Button sizes to the size they render as. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: the deprecated names could only be found by hand, and `sm` and `xs` are also sizes of other components; the codemod parses TSX and renames `size` only on Buttons, the raft-ui parts that pass `size` to a Button and wrappers you name, plus `icon-sm` / `icon-xs` on any element and `size` in `buttonVariants()` calls.
  - Affects: run `node node_modules/@botiverse/raft-ui/codemods/button-sizes.mjs <src> [--dry] [--components=MyButton]`; it renames `xs`, `sm` → `md` and `icon-xs`, `icon-sm` → `icon-md`, then lists every `sm`, `xs`, `icon-sm` and `icon-xs` it left for review. It needs `@babel/parser`, a new optional peer dependency (`pnpm add -D @babel/parser`); nothing else uses it.
  - Docs: https://raft-design.botiverse.build/components/button/#sizes

### Changed

- **Button** `size`: `xs` and `sm` are deprecated aliases of `md`, and `icon-xs` and `icon-sm` of `icon-md`, kept until raft-ui 1.0. They already rendered as those sizes, so nothing on screen changes. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: nine names for five sizes made a smaller button look available where there is none; a new Size by place table says which size each place takes.
  - Affects: sizes `md` (32px), `lg`, `xl`, `icon-md` and `icon-lg`; `size` is typed `ButtonSize | DeprecatedButtonSize`, so every existing size name still type-checks. No runtime warning.
  - Docs: https://raft-design.botiverse.build/components/button/#size-by-place
- **Checkbox** and **RadioGroupItem** directly in a `<label>`: the box takes one line of the label's height and centers on it, so it sits on the first line in an `items-start` row and on the one line in an `items-center` row, at any min-height. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: the box followed the row rather than the text's line, so it sat above the center of a line taller than 20px and callers added a `margin-top`; see A control and its label above.
  - Affects: vertical margin `max(0, (1lh - 20px) / 2)` from the `<label>`'s type (2px on a 24px line); the box stays 20px and a `text-xs` row stays 20px tall. A `margin-top` you added to line it up is no longer needed. Set the label's type on the `<label>`, use `items-start` when the text can wrap, and give a wrapping `text-xs` label `leading-5`.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-control-and-its-label
- **DescriptionList** `direction="inline"`: every fact is at most 24rem wide, or the row's width if that is narrower, and keeps the same 24px between facts and 8px between lines as the others. ([#697](https://github.com/botiverse/raft-design/pull/697))
  - Why: a long value, such as a message, made its fact as wide as the row on a line of its own, so one line of facts no longer read as one flow; every fact now wraps the same way, and a long value wraps at the cap, or is cut there when the caller truncates it.
  - Affects: fact `max-width` none → `min(100%, 24rem)` (384px); plain text longer than that wraps inside the 24rem. To cut a long value on one line instead, truncate it with an ellipsis and make the whole value available elsewhere, such as a tooltip.
  - Docs: https://raft-design.botiverse.build/components/description-list/
- **ListRow** `variant="plain"` with a description: the leading icon, avatar or tile and the trailing switch, checkbox, radio, value or chevron center on the title's first line instead of the middle of the title and description. With a title alone, nothing changes. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: with a description the ends sat between the title and the description, level with neither and with no line of text.
  - Affects: the ends move without changing size, so row heights are unchanged (54px on a phone for a one-line row with a switch).
  - Docs: https://raft-design.botiverse.build/components/list-row/
- **MessageListDateDivider**, **SystemMessage**, **SystemMessageGroupHeader**, **MessageListNotice**, **ThreadPanelOriginalMessage**, **ThreadPanelReplySummary** and **ThreadPanelReplyCount**: spaced on the timeline rhythm. ([#694](https://github.com/botiverse/raft-design/pull/694))
  - Why: see Timeline rhythm above.
  - Affects: a date line's rule sits 24px from the text above and below it (was 24px / 32px on a phone, 25px / 33px on a desktop); SystemMessage padding 12px / 12px → 12px / 4px, 16px from the text on both sides; a closed SystemMessageGroupHeader keeps the same 12px / 4px around its disclosure's text (padding 6px / 6px → 6px top and −2px bottom on a phone, 7px and −1px on a desktop), and an open one keeps its 6px under the header; MessageListNotice padding 0 / 8px → 12px / 4px; ThreadPanelOriginalMessage bottom padding 8px → 20px and ThreadPanelReplySummary top padding 8px → 12px, so the thread's rule sits 24px from the text on both sides; ThreadPanelReplyCount gains 4px above it (margin 0 / 4px → 4px / 4px). MessageItem keeps its 4px / 8px, now read from the tokens.
  - Docs: https://raft-design.botiverse.build/foundations/spacing/#timeline-rhythm

### Fixed

- **Select**, **Combobox**, **ComboboxSelect** and **InputGroup**: a value cut with an ellipsis gets its full text as a `title` whenever it is cut. ([#695](https://github.com/botiverse/raft-design/pull/695))
  - Why: the check compared whole pixels with 1px to spare, so it missed cuts of about 0.6–1.3px that still showed an ellipsis, and it did not measure again when a web font finished loading; it now compares fractional sizes and measures again after fonts load.
  - Affects: tolerance 1px (whole pixels) → 0.5px (fractional).
  - Docs: https://raft-design.botiverse.build/components/select/
- **Checkbox** and **RadioGroupItem** hit areas: in a `<label>` row the box or circle reaches 4px past its line, half the 8px gap to the next option, so a tap between two options lands on the nearer one; the label is the target for the rest. On its own, its hit area is 44px tall on a touch screen. ([#686](https://github.com/botiverse/raft-design/pull/686))
  - Why: each option's hit area reached across the gap and the next option's covered it, so a tap just under one option could select the next one.
  - Affects: standalone touch hit area 44px tall (was 36px for a checkbox, 33px for a radio); standalone mouse hit area unchanged; in a `<label>` row the hit area is the line plus 4px above and below, for every pointer.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-control-and-its-label

## [0.20.1](https://github.com/botiverse/raft-design/compare/v0.20.0...v0.20.1) (2026-10-22)

### Design System

- **A mark that leads text**: an icon or status light that starts a line of text is centered on the first line of that text and stays there when the text wraps or a description follows. Only the place is shared; each component keeps its own icon size and gap. A status light beside text is always 9px. It applies to Banner, PanelNotice, ToastIcon, MessageActionCardNotice, Badge and PanelActivity. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: each component placed its mark with its own fixed offset, which held for one type size and drifted at the next; one rule, the line box center (the cap-height center in Space Grotesk), now places every mark.
  - Affects: offset `(1lh - size) / 2` on the row's own type; status light 9px with a 1.5px ink edge.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text
- **Popups stay on their trigger**: when the window or a pane scrolls under an open popup, the popup moves with the element that opened it. A context menu stays with the point where it was opened. It applies to SelectContent, ComboboxContent, PopoverContent, PreviewCardContent and NotificationCenterPopup. ([#669](https://github.com/botiverse/raft-design/pull/669))
  - Why: popups stayed where they opened while the page scrolled, pointing at whatever had scrolled into place; the wrappers no longer turn Base UI's anchor tracking off.
  - Docs: https://raft-design.botiverse.build/foundations/elevation/#popups

### Added

- **`lead-icon`** and **`lead-dot`** utilities: center an icon (`lead-icon`) or a `Status` light (`lead-dot`) you place yourself on the first line of the text beside it. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: a mark placed outside the components above had no way to follow the same rule except a hand-tuned margin.
  - Affects: `lead-dot` sizes the light 9px with a 1.5px edge, so don't pass the `Status` a `size`. Both read `1lh`, so put the text's type on the row that holds the mark and the text.
  - Docs: https://raft-design.botiverse.build/foundations/alignment/#a-mark-that-leads-text

### Changed

- **Status** in Banner, PanelNotice, ToastIcon, Badge and PanelActivity: held at 9px and centered on the first line, whatever `size` or vertical margin it was given. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: the same light showed at different sizes in a toast, a banner and a chip; a light beside text has one size, 9px, the least color that tells green from yellow from orange, plus its ink edges.
  - Affects: a `Status` passed `xs` (6px), `sm` (8px) or `lg` (11px) in these components renders 9px; the `xs` edge 1px → 1.5px (its 1px corner stays). The default `md` is unchanged, as are icon sizes and gaps.
  - Docs: https://raft-design.botiverse.build/components/status/#sizes

### Fixed

- **PanelNotice**: a leading status light or icon is centered on the first line of the notice's text. ([#670](https://github.com/botiverse/raft-design/pull/670), [#687](https://github.com/botiverse/raft-design/pull/687))
  - Why: the mark sat at the top of the first line, a light 6.5px above the line's center on a desktop (5.5px on a phone) and a 16px icon 3px (2px); the notice now follows A mark that leads text.
  - Affects: icon size and gap are unchanged (your icon's size, 10px before the text).
  - Docs: https://raft-design.botiverse.build/components/panel/
- **Popups**: SelectContent, ComboboxContent, PopoverContent, PreviewCardContent and NotificationCenterPopup follow their trigger while the window or a scrolling pane moves. ([#669](https://github.com/botiverse/raft-design/pull/669))
  - Why: these wrappers turned anchor tracking off by default, so an open popup kept its opening position and drifted off its trigger as soon as anything scrolled; they now leave it to Base UI's default.
  - Affects: `disableAnchorTracking` default `true` → unset (Base UI's default, tracking on). ContextMenuContent drops its `true` default too; it is anchored to a point, so it looks the same. Pass `disableAnchorTracking` to turn it off for one popup. Select still turns tracking off with `alignItemWithTrigger`.
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
