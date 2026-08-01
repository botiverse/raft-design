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
