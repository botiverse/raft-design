---
title: IconTile
summary: A neutral square with an icon, sized like an avatar, for a place or a thing without a face — a channel, a system notice, a file, an app, a computer.
status: stable
aliases: [ChannelIcon, channel tile]
layer: core
category: identity
related: [avatar, panel, sidebar, notification-center]
---

# IconTile

IconTile is a neutral square holding one icon. A channel is a place, not someone, so in lists it is a neutral `#` tile rather than an avatar; anything else without an identity (a system notice, a file, an app, a computer, a kind of search result) uses the same tile with its own icon. The tile takes the avatar sizes, so it sits where an avatar would.

```example
icon-tile/compositions/sizes
```

## When to use

| Situation                                                            | Use                                                                                                                                                                         |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A channel in a list, a search result or a reference                  | IconTile with the `hash` icon                                                                                                                                               |
| A thread in a channel, leading an Activity row                       | IconTile with the `hash` icon and the thread badge ([InboxItem](../inbox-item/inbox-item.md#the-leading-image)); a thread in a direct message leads with the avatar instead |
| A system notice, a file, an app, a computer, a kind of search result | IconTile with its icon                                                                                                                                                      |
| An error, a warning or a message in the notification center          | IconTile with `variant="warning"` or `variant="information"`                                                                                                                |
| The place the person is in, beside its title                         | The yellow location tile, `PanelHeaderIcon` ([Panel](../panel/panel.md))                                                                                                    |
| A channel in a desktop sidebar row                                   | The bare icon, `SidebarItemChannelIcon` ([Sidebar](../sidebar/sidebar.md)), without a tile                                                                                  |
| An agent or a person                                                 | [Avatar](../avatar/avatar.md)                                                                                                                                               |

## Anatomy

- `IconTile`: the square. It holds one Lucide icon and sizes the icon to fit ([Iconography](../../../../../design/foundations/iconography.md#sizes)).

## Variants

| Variant                 | Use for                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"`     | Everything: channels, files, apps, computers, notices. A `fill-muted` square with a `foreground-muted` icon and no border |
| `variant="warning"`     | An error or a warning in the notification center: `warning-soft`, with an ink icon                                        |
| `variant="information"` | A message in the notification center: `info-soft`, with an ink icon                                                       |

```example
icon-tile/compositions/variants
```

| `size`      | Use for                                                                 |
| ----------- | ----------------------------------------------------------------------- |
| `xs` (19px) | Compact rows, beside 19px avatars                                       |
| `sm` (27px) | Beside 27px avatars, such as search results; the icon of an action card |
| `md` (35px) | Lists and search results; the default                                   |
| `lg` (51px) | The header of a profile page                                            |

## Accessibility

IconTile renders a `<span>` and wraps no Base UI primitive.

- The tile is decorative beside its words, so it is hidden from assistive technology by default.
- Give a tile that means something on its own (such as the kind of a channel, with no words next to it) `role="img"` and an `aria-label`; it is then announced.

## Rules

- Don't give a channel a color: a channel is a place, not an identity.
- Show at most one yellow location tile per screen, beside the title of the place the person is in. In a list, the current item is the selected row, not a yellow tile ([States](../../../../../design/foundations/states.md#usage)).
- Use `warning` and `information` only for system notices. Everywhere else the tile is neutral.
- Put the tile where an avatar would go in the same row, at the same size, so tiles and avatars line up in one column.
