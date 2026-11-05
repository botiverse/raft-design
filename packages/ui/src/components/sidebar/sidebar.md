---
title: Sidebar
summary: The desktop column next to the rail that lists what the selected destination contains, with rows that mark where you are, what is unread and what mentions you.
status: stable
aliases: [Sidebar row]
layer: core
category: navigation
related: [app-rail, list-row, panel, badge, avatar]
redirectFrom: [decisions/0030-one-sidebar-row]
---

# Sidebar

The sidebar is the desktop column between the rail and the main area. It lists what the destination selected on the [AppRail](../app-rail/app-rail.md) contains: channels, agents and people, for example. Its header names the destination, and its rows show where you are, what is unread and what mentions you.

```example
sidebar/sidebar
```

## When to use

| Situation                             | Use                                                        |
| ------------------------------------- | ---------------------------------------------------------- |
| The contents of a desktop destination | Sidebar                                                    |
| The same list on a phone              | Sidebar rows, on the page itself; below `md` they are 44px |
| The destinations themselves           | [AppRail](../app-rail/app-rail.md)                         |
| Activity and notifications            | [InboxItem](../inbox-item/inbox-item.md)                   |

Which destinations have a sidebar, and what each one lists, is the product's choice ([Raft Chat](../../../../../design/products/raft-chat/README.md)). A destination without a sidebar puts its content next to the rail ([Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)).

## Anatomy

- `SidebarRoot`: the column, on `layer-sidebar`, with a `line-seam` along its right edge.
- `SidebarHeader`: the header (56px on a phone, 44px on a desktop), with a `SidebarHeaderTitle` and, on its right, the working summary when someone is working.
- `SidebarBody` and `SidebarContent`: the scrolling list. On desktop `SidebarContent` is a [ScrollArea](../scroll-area/scroll-area.md) whose thin scrollbar shows only while the list scrolls; below 768px it scrolls natively.
- `SidebarSection`: a group of rows.
  - `SidebarSectionHeader`: holds a `SidebarSectionDisclosure` (the button that collapses the group, with `SidebarSectionChevron`, `SidebarSectionTitle` and `SidebarSectionCount`) and, in `SidebarSectionTrailing` or `SidebarSectionControls`, `SidebarSectionControl` buttons such as New. `SidebarSectionAttention` is the group's pink pixel.
  - `SidebarSectionEndChevron`: the section's chevron as the last of its controls, with a mouse on a desktop. It is a second trigger of the section, so it toggles it and turns with it. Put it last in `SidebarSectionControls` and give the header `chevronAtEnd`, which only hides the chevron before the title with a mouse; on a touch screen that one shows as before and the end one is gone.
  - `SidebarList`: the rows. `SidebarSectionEmpty` replaces them when the group is empty.
- `SidebarMenu`, with `SidebarMenuIcon`, `SidebarMenuTitle`, `SidebarMenuAside` and `SidebarMenuCount`: a single destination in a section header, such as Saved.
- `SidebarGroupLabel`: a plain group heading that doesn't collapse.
- `SidebarItem`: one row.
  - First, a `SidebarItemChannelIcon`, a `SidebarItemIcon` or a 19px [Avatar](../avatar/avatar.md).
  - `SidebarItemContent`: the `SidebarItemTitle` (the name) and an optional `SidebarItemSubtitle` (a description).
  - `SidebarItemAside`: what follows: `SidebarItemMeta`, `SidebarItemMetaIcon`, `SidebarItemStatus`, the unread `SidebarItemCount` (with `SidebarItemThreadCount` and `SidebarItemCountSeparator`), or the mention marker `SidebarItemIndicator`.

```example
sidebar-item/compositions/channel-item
```

## States

| State                 | Look                                                                                                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `active`              | A yellow sticker (`selected`, with an ink edge, in every theme) on the row's inset shape: you are here. It doesn't change on hover; a press lays `sticker-medium`                                                                                                                                |
| `tone="unread"`       | A bold name and a pink `SidebarItemCount`. When someone mentions the person, a yellow `SidebarItemIndicator` replaces the count                                                                                                                                                                  |
| `tone="muted"`        | A `bell-off` `SidebarItemMetaIcon`, the name in `foreground-muted`, and the unread number as quiet text in `SidebarItemMeta`                                                                                                                                                                     |
| `tone="away"`         | Offline, or not joined: the name in `foreground-hint`                                                                                                                                                                                                                                            |
| Menu open             | `data-popup-open` (a context menu, or press and hold on a phone): `fill-cell-hover` on the inset shape, the same fill as the hover, so the row the menu acts on stays marked; an `active` row stays the sticker ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)) |
| `interactive={false}` | A display-only row, such as this computer, whose action is a button inside it: a `div` that doesn't react to hover or press                                                                                                                                                                      |

```example
sidebar-item/compositions/tones-item
```

## Behavior

- The sidebar is 240px wide and can be dragged between 200px and 400px; it keeps one width on every page that has it ([Spacing](../../../../../design/foundations/spacing.md#layout-widths)).
- A name stays on one line and ends with an ellipsis. A description after it gives up its room first; the name truncates only once the description is gone.
- A row whose content is 2 lines (a computer's name and whether it runs agents) uses `wrap` with `SidebarItemContent stacked`: it grows from the row height, and its icon lines up with the first line. Its text stays (row height − 20px) / 2 from the row's top and bottom: 7px on a desktop, 9px on a touch screen. The shape is as tall as the row, so that is the same inside the shape. The name still stays on one line.
- A group shows how many rows it holds in `SidebarSectionCount`, right after its title, open or collapsed.
- While an agent works, what it is doing replaces its runtime ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)), in `text-footnote` and `foreground-muted`, and takes at most 58% of the row.

## Content

- Title the header with the destination's name.
- Mark a channel with a bare `#` icon, a private channel with `lock`, and agents and people with their 19px avatar.
- Write an agent's runtime in Space Mono after its name.

## Accessibility

- `SidebarRoot` renders a `div`. Render it as an `aside` or a `nav` and name it after the destination: `aria-label="Chat"`.
- `SidebarItem` renders the Base UI Button. For a row that navigates, render a link (`render={<a href="…" />}`) and set `aria-current="page"` on the `active` row: `active` only changes how it looks.
- Give the unread count a name that says what it counts ("2 unread"), and give an icon-only `SidebarItemMetaIcon` a name ("Muted").
- `SidebarSectionDisclosure` is a Base UI Collapsible trigger, which sets `aria-expanded`.
- On a display-only row, focus lands only on the controls inside it.

## Rules

- Draw a row the same way in every group: original, pinned or custom. A group never changes a row (no wrapping, no hidden description in one group), because the same conversation would look like two different things.
- Don't use `wrap` to let a name run onto more lines, including in a pinned group. Use it only for a row whose content is 2 lines.
- Draw no line between rows. A row is a list cell ([Lists](../../../../../design/patterns/lists.md)): it runs the sidebar's full width, and its hover, press, menu-open fill, the yellow sticker and the focus ring are drawn on one rounded shape as tall as the row and inset 8px from each side. `SidebarList` is a column with a 2px gap and 8px at its top and bottom, so two filled rows show 2px between them and the first shape sits 8px under the section header, whose words have no padding below them; put the rows of a section in it. `SidebarContent` has no side padding for this reason; on a phone and a touch screen its group labels, section headers and a section's empty line start 20px in, where the rows' content starts. `SidebarRoot` sets the column's margin to 20px at every width on a touch screen (16px with a mouse), so `SidebarHeader` starts there too on a phone ([Lists](../../../../../design/patterns/lists.md#one-edge)).
- Pad the row's content from its shape: 12px inside it at the start and at the end, 20px from the sidebar's edges, on a phone and a touch screen ([Lists](../../../../../design/patterns/lists.md#rules)).
- With a mouse on a desktop the sidebar has two axes (stdrc, 2026-11-05, option B; [Desktop density](../../../../../design/foundations/desktop-density.md#3-the-outer-thing-sits-further-out)). A row's glyph (its icon, `#` or avatar) starts on the glyph axis, 16px from the sidebar's edge (`--sidebar-glyph-axis`: the shape 8px in, the content 8px inside it), and its text on the text axis, 40px (`--sidebar-text-axis`). A section's or group's title starts on the glyph axis, outdented from the rows' text, so it reads as the frame of the rows under it; a section's empty line starts on the text axis. A section's chevron is its last control, at the end of its header, and the header's control icons and the rows' trailing counts end 16px from the right edge. Rows are the row height, 34px. The icon or avatar starts at the shape's inner start; the time, a count, the @ sticker and any trailing mark end at its inner end, so none touches the shape or the selected sticker's ink edge (a sticker's own 1.5px outer edge leaves 10.5px). This is the web sidebar row the design review set as the reference: the shape 8px from the sidebar's sides, the trailing count 12px inside it (it was 11.5px when the review named it). Don't add side padding to the scroller or the row: either one moves the shape or the content off the rule.
- Keyboard focus is the 2px inset ring on the shape. On the `active` row it sits inside the sticker's ink edge.
- Make every row the row height (`row-height`: 34px with a mouse, 38px on a touch screen from 768px), its shape as tall, in `text-subhead`, on a desktop. Below `md` the row grows on its own to at least 44px in `text-body` at 600: there it is a phone list of places (Home, Members, the Settings list), which a finger has to hit. Don't add phone sizes at the callsite. The Settings list sat at 36px on phones because the size lived in one product class that only Home's rows were given.
- Make a section's controls (`SidebarSectionControl`, such as Sort and New) 24px with a 14px icon, overhanging the 16px header line. The title beside them is 12px bold in the hint color, a label for the group, not a toolbar: a 28px button with an 18px icon outweighed it, and the header read as a row of buttons (stdrc, 2026-10-31; it was 24px before 2026-10-18). On a touch screen, where the controls show at rest, they stand 4px apart as with a mouse; a 20px gap read as two separate buttons rather than one pair (stdrc, 2026-11-01). Each one's hit area reaches 44px high and 10px past the row's ends through a transparent `::after`, and between two controls it stops in the middle of the gap, so the areas meet without overlapping and a tap there belongs to one of them (about 36px wide each). The header keeps 6px more under its line so the hit area stays off the first row.
- Draw a section header as the group's label: the chevron first, then the title, then the count, with the controls at its end. With a mouse on a desktop the chevron is the last of those controls instead, at the end of the header, always shown, and the title starts on the glyph axis (`SidebarSectionEndChevron`, `chevronAtEnd`); on a touch screen it stays before the title, where a thumb reaches the title and its chevron as one target. The title is the section's one toggle for the keyboard and a screen reader at every input: the end chevron is a second pointer target for the same thing, so it stays out of the tab order and the accessibility tree (`tabIndex={-1}`, `aria-hidden`), and pressing it leaves focus where it was. Two toggles would be read twice and tabbed through twice for one action. The count belongs to the label ("Channels 6"), so it follows the title in the hint color and Space Mono and is always shown, open or collapsed. At the end of the row it would read as an unread count, the place a row keeps one, and a control appearing on hover would land on it.
- Rest a section's controls in the title's hint color. Only the control under the pointer, in keyboard focus or with its menu open turns body color on the ghost fill. In body color at rest they were darker than the label they serve, and the header read as two weights fighting; in the hint color the header reads as one label, and the color change says which control you are about to use.
- Show a section's controls at all times, with a mouse as on a touch screen. They are what the header can do; showing them only on hover (2026-10-31) hid them from anyone who hadn't found them and made a long title's room change as the pointer passed (stdrc, 2026-11-02). They hold their place at the end of the row, so a long title truncates before them and keeps its count. A collapsed section's attention mark sits before them in the row, and hides only while the section is open.
- Put the controls in `SidebarSectionControls` inside `SidebarSectionTrailing`; don't wrap them in a `div` of your own. The part spaces them for touch and pulls the last one out to the header's line, also while its menu is open: an open menu's trigger gets Base UI's focus guards and its portal's hidden `aria-owns` span beside it, and a plain `:last-child` lost the pull and moved the trigger 5px left (stdrc, 2026-11-02); a wrapper of your own does none of that.
- End the last control's icon box on the header's line, 20px in on a touch screen and 16px with a mouse, as the chevron starts on it ([The ends of a header](../../../../../design/foundations/alignment.md#the-ends-of-a-header)): the 24px control's 14px icon sits 5px inside its edge, so `SidebarSectionControls` pulls its last control out by 5px and the empty part of the button hangs past the line. Placed by its button, the icon sat 5px further in than the chevron on the other end.
- Keep the controls still when a classic scrollbar appears. A scroller that shows one publishes its width as `--scrollbar-size` (`useScrollbarSize`); the rows give that much back from their end inset, and `SidebarSectionHeader` gives back the same from its right padding, so its controls end on the rows' content edge with or without a scrollbar (20px from the sidebar's outer edge on a touch screen, 16px with a mouse, with a scrollbar up to 8px wide). With a fixed 20px of padding the controls moved 8px left whenever the scrollbar appeared.
- Don't put the server switcher in the sidebar header. It is in the web top bar, or at the top of the rail when there is no top bar.
- Don't put a live bar at the bottom of the sidebar. Working agents appear in the header's working summary and in their own rows instead ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)).
