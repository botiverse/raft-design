---
title: ListRow
summary: The row for the people and agents on a detail page, settings and shortcuts — a leading block, a title and a preview, the time and a badge.
status: stable
aliases: [AvatarListRow]
layer: core
category: data-display
related: [sidebar, inbox-item, search, avatar, icon-tile, badge, switch]
---

# ListRow

A ListRow is one row of a list: a person, an agent, a setting or a shortcut into another page. The whole row is the target. Use it for the agents and people on a detail or profile page, and for settings. Raft Chat's phone lists of places (Home, Members, the Settings list) use the sidebar row instead ([Choosing a component](../../../../../design/components/overview.md#rows)).

```example
list-row/compositions/conversations
```

## When to use

| Situation                                                                   | Use                                                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Channels, direct messages and members in a phone list                       | The sidebar row ([Sidebar](../sidebar/sidebar.md)), as in Raft Chat                                                                        |
| Channels and people among search results                                    | ListRow, through the search result row ([Search](../search/search.md))                                                                     |
| Agents and people on a profile or detail page, such as a computer's details | ListRow in a `ListRowGroup` ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)) |
| A row of the desktop sidebar                                                | The sidebar row ([Sidebar](../sidebar/sidebar.md))                                                                                         |
| Activity and notifications                                                  | [InboxItem](../inbox-item/inbox-item.md)                                                                                                   |
| A task                                                                      | [TaskCard](../task-card/task-card.md)                                                                                                      |

## Anatomy

- `ListRow`: the row. A `button` by default; render a link for a row that goes somewhere.
- Leading block: an [Avatar](../avatar/avatar.md), a channel tile ([IconTile](../icon-tile/icon-tile.md)) or a 20px `ListRowIcon`. Optional.
- `ListRowBody`: the text column. Required.
  - `ListRowTop`: `ListRowTitle`, then the time in `ListRowMeta`.
  - `ListRowBottom`: the preview in `ListRowDescription`, then at most one badge.
- Trailing: a setting's `ListRowValue` and `ListRowChevron`, or a [Switch](../switch/switch.md). Optional.
- `ListRowGroup`: an inset group that wraps rows in a card. Optional.

## Variants

| Variant             | Use for                                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"` | A conversation, a person or an agent: leading block, title, preview, time and badge. At least 64px tall                                               |
| `variant="plain"`   | A setting: an optional icon, a title (and its consequence), then the current value and a chevron, or a switch. 48px tall with one line of text        |
| `variant="entry"`   | A shortcut into another page at the top of a list (Saved on phone Home): a 20px icon and a name, with a badge or a gray count on the right. 48px tall |

```example
list-row/compositions/settings
```

```example
list-row/compositions/entries
```

## States

`tone` says what the place is to the person. The shared states are in [States](../../../../../design/foundations/states.md).

| State           | Use for                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone="unread"` | Something waits here: bold title, the preview in `foreground`, and a pink count in `ListRowBottom`. When someone mentions the person, the yellow @ marker replaces the count ([Badge](../badge/badge.md)) |
| `tone="muted"`  | The person muted it: the title in `foreground-muted`. Add a `bell-off` icon after the title, and show unread as a gray count in `ListRowMeta` instead of a pink badge                                     |
| `tone="away"`   | The person hasn't joined yet: title and preview in `foreground-hint`                                                                                                                                      |
| `selected`      | The item open beside the list: an `info-soft` wash, and no hover                                                                                                                                          |
| `disabled`      | Every part in `foreground-disabled`; no tone, no unread or muted marks, no hover or press, and the fill doesn't change                                                                                    |

```example
list-row/compositions/tones
```

## Behavior

- Divide rows with `line-hairline`. In the default variant the line starts where the text starts; in a settings list it starts at the row's edge (16px); entry rows have no lines between them, because they are a set of buttons, not a list of content.
- The whole row is the target: hover lays the subtle tier, `fill-subtle`, over all of it and press the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)). While a menu it opened is up (`data-popup-open`: a context menu, or press and hold on a phone), it lays `fill-subtle` too, hovered or not; a selected row keeps its selection.
- A row whose only targets are its own controls (a setting with a switch) takes `interactive={false}`: it renders a plain element with no hover or press. See [States](../../../../../design/foundations/states.md).

## Content

- Start a preview with who spoke: "Wug: Release notes are drafted."
- Show at most one badge in a row.
- Set the time and counts in Space Mono; `ListRowMeta` does this.
- Write a setting's consequence in `ListRowDescription` with `wrap`, so it isn't cut off.

### Group headings

A group of rows can have a heading above it, such as Channels.

- Write it in sentence case, in `text-footnote` at weight 700 and `foreground-hint` ([Typography](../../../../../design/foundations/typography.md#casing)).
- Make the heading a button with `aria-expanded` when the group can collapse, and show the number of rows when it is collapsed.
- Put the group's action on the right as an ink text button that underlines on hover ([TextLink](../text-link/text-link.md)): Browse.

raft-ui has no exported heading part for these lists yet.

## Accessibility

- `ListRow` uses Base UI's `useRender` and renders a native `button` (or the link you pass with `render`), so the row is reached with Tab and activated with Enter or Space. With `interactive={false}` it is a `div` and only its controls are focusable.
- The accessible name is the row's text. Add an accessible name to a badge that is only a number or an icon: `aria-label="3 unread"`, `aria-label="Mentions you"`.
- `selected` is visual only. Set `aria-current` or `aria-selected` on the row yourself.
- Label a switch in a settings row with the row's title (`aria-labelledby`).
- `ListRowIcon` and `ListRowChevron` are hidden from assistive technology.

## Rules

- Don't add an ink border or a shadow to a row or a group: a list is content, and an ink border means a control ([Color](../../../../../design/foundations/color.md#lines)).
