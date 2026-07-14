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
