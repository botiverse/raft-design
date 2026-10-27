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
- `SidebarHeader`: the 56px header, with a `SidebarHeaderTitle` and, on its right, the working summary when someone is working.
- `SidebarBody` and `SidebarContent`: the scrolling list.
- `SidebarSection`: a group of rows.
  - `SidebarSectionHeader`: holds a `SidebarSectionDisclosure` (the button that collapses the group, with `SidebarSectionChevron`, `SidebarSectionTitle` and `SidebarSectionCount`) and, in `SidebarSectionTrailing` or `SidebarSectionControls`, `SidebarSectionControl` buttons such as New. `SidebarSectionAttention` is the group's pink pixel.
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
- A row whose content is 2 lines (a computer's name and whether it runs agents) uses `wrap` with `SidebarItemContent stacked`: it grows from 38px, its text stays 9px from the row's top and bottom (7px inside the shape), and its icon lines up with the first line. The name still stays on one line.
- A collapsed group shows how many rows it holds in `SidebarSectionCount`.
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
- Draw no line between rows. A row is a list cell ([Lists](../../../../../design/patterns/lists.md)): it runs the sidebar's full width, and its hover, press, menu-open fill, the yellow sticker and the focus ring are drawn on one rounded shape as tall as the row and inset 8px from each side. `SidebarList` is a column with a 2px gap and 8px at its top and bottom, so two filled rows show 2px between them and the first shape sits 8px under the section header, whose words have no padding below them; put the rows of a section in it. `SidebarContent` has no side padding for this reason; its group labels, section headers and a section's empty line start 20px in, where the rows' content starts. `SidebarRoot` sets the column's margin to 20px at every width, so `SidebarHeader` starts there too on a phone ([Lists](../../../../../design/patterns/lists.md#one-edge)).
- Pad the row's content from its shape: 12px inside it at the start and at the end, 20px from the sidebar's edges ([Lists](../../../../../design/patterns/lists.md#rules)). The icon or avatar starts at the shape's inner start; the time, a count, the @ sticker and any trailing mark end at its inner end, so none touches the shape or the selected sticker's ink edge (a sticker's own 1.5px outer edge leaves 10.5px). This is the web sidebar row the design review set as the reference: the shape 8px from the sidebar's sides, the trailing count 12px inside it (11.5px there). Don't add side padding to the scroller or the row: either one moves the shape or the content off the rule.
- Keyboard focus is the 2px inset ring on the shape. On the `active` row it sits inside the sticker's ink edge.
- Make every row 38px high (its shape as tall), in `text-subhead`, on a desktop. Below `md` the row grows on its own to at least 44px in `text-body` at 600: there it is a phone list of places (Home, Members, the Settings list), which a finger has to hit. Don't add phone sizes at the callsite. The Settings list sat at 36px on phones because the size lived in one product class that only Home's rows were given.
- Don't put the server switcher in the sidebar header. It is in the web top bar, or at the top of the rail when there is no top bar.
- Don't use `SidebarLiveActivity` for a live bar at the bottom of the sidebar. Working agents appear in the header's working summary and in their own rows instead ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)).
