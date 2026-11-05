---
title: Desktop density
summary: The eight rules that keep a desktop screen (from 768px with a mouse or a trackpad) dense and calm, why each one holds, and the token or part that enforces it.
---

# Desktop density

With a mouse or a trackpad on a screen from 768px, `(width >= 48rem) and (pointer: fine)`, Raft draws a denser interface than on a phone: people point from further away and with more precision. These rules come from the design review of the desktop density work (stdrc, November 2026). Each one says what to do, why, and what enforces it, so a new screen follows them by reading the tokens, not by copying numbers. A phone and a touch screen keep their own sizes ([Spacing and sizing](spacing.md)).

## Rules

### 1. One size for a single line you can press

A sidebar row, a menu or context-menu option, a field, a select, a Button, a tab, a selected segment, a filter picker, a chip that is a button and a floating toolbar's button are all 34px tall: the control height. Things that sit side by side in one row are exactly the same height.

- **Why:** when two pressable things beside each other differ by a pixel or two, the row looks careless, and the eye reads the taller one as more important.
- **Enforced by:** `control-height` (34px). `row-height` and `option-height` read it; Button `md`, Tabs, SegmentedControl, ToggleGroup, PickerTriggerButton, FilterChip and the floating toolbars read it with `md:pointer-fine:`.
- **Exceptions, on purpose:**
  - A head's own buttons are bar buttons, 28px at `bar-button-radius` (`bar-button-size`), and so is anything that sits among them (an AvatarGroupButton, a followers button): a head's actions stay lighter than its title.
  - A control embedded in a field (a clear button, a chip) is `control-embedded-size` (22px), 6px inside the field.
  - A section header's Sort and New controls are 24px label controls beside a 12px title, with a 28px target.
  - The call to action is `control-height-cta` (40px).

### 2. A head is one line, 44px

Every head (a panel, a sidebar, a thread, a drawer, a dialog's bar, a side section) is one line: the title, then its meta on the same baseline. It is the control height and the header air above and below: 34 + 2 × 5 = 44.

- **Why:** two-line heads made each column's seam a different height and pushed content down.
- **Enforced by:** `header-height` (`control-height` + 2 × `header-air`); `PanelHeaderContent` lays the title and `PanelMeta` on one baseline.

### 3. The outer thing sits further out

A section's header, a group label and a container's edge stand further out than the content they hold, never further in and never emptier.

- **Why:** an outdented title reads as the frame of what is under it; at the same inset it reads as one more row.
- **Enforced by:** a panel's section header and a settings card stand outside the content they hold.
- **Exception:** a sidebar section title doesn't stand outside its rows: its chevron is centred on the rows' icon column and its last control's icon ends on the rows' content edge, where their counts end (stdrc, 2026-11-05).

### 4. Space says what belongs together

The gap inside a group is smaller than the gap between groups, and both are smaller than the container's padding.

- **Why:** people read nearness as belonging. When the space under a setting's control equals the space to the next setting, the setting falls apart.
- **Enforced by:** `field-gap` inside a group, `section-gap` between sections, `page-inset` (16px) around them, the one content edge of heads, toolbars, rows, sections, drawers and dialogs; `page-top` (12px) from a head's seam to the first thing under it. A lone control that belongs to the content under a head (a segmented control, rule 7) has the content's 12px top inset above it and 8px below it, so it reads as one unit with its content ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)). A settings card of stacked settings is 20px inside and 16px between settings, with 4px from a title to its description and 8px to its control (4 and 8 < 16 < 20).

### 5. Reserve no room for what isn't there

Don't keep empty space for something that is usually absent: an idle "Saved" line, a column of read receipts, an empty slot.

- **Why:** empty reserved space reads as a gap someone forgot to fill, and it costs room on every row for an element most rows don't have.
- **Enforced by:** the last result line of a settings card takes no room while idle and is drawn in the space under its control when it shows, so nothing moves.

### 6. Line things up on their optical centre

In one line, text of different sizes shares a baseline; an icon, a tile or an avatar beside text is centred on the text's cap height, not on the line box; a separator such as `·` is a glyph of the text, so it sits on its x-height.

- **Why:** box-centred text of two sizes looks like it is sliding off the line.
- **Enforced by:** `items-baseline` in `PanelHeaderContent`; the header tile is centred within 0.5px of the title's cap-height midpoint.

### 7. A divider separates regions, not a control from what it controls

A control belongs to the content it controls. A segmented control or a lone filter sits on the page's background with its content right under it: no bar of its own with lines above and below.

- **Why:** a line between a switch and what it switches cuts them apart and adds a band of chrome that carries nothing.
- **Enforced by:** a row that holds only a segmented control draws no seam, and its spacing joins it to the content below (rule 4) ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)); toolbars with several tools keep theirs.

### 8. Start at the start; identities keep their shape

Align to the start of the row by default. Put a control at the end only when it is grouped there with other tools on purpose. In a choice (a segmented control, tabs, a radio group, a sort or filter menu), the default option comes first (stdrc, 2026-11-05). An avatar keeps its sticker shape at every size: an identity doesn't change form.

- **Why:** a lone control at the far end is hard to find on a wide screen, and a face whose corners change with its size stops reading as the same person.
- **Enforced by:** a lone segmented control is left-aligned, its default option first ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#content)); Avatar is `radius-sticker` at every size ([Shape](shape.md)).
