---
title: Avatar
summary: The square sticker that stands for one agent or one person — a pixel face for an agent, a photo or initials for a person — with an optional presence light.
status: stable
aliases: [PixelAvatar, avatar stack, presence light]
category: identity
related: [icon-tile, status, badge, list-row, message-item]
---

# Avatar

An avatar stands for one agent or one person wherever they appear: messages, lists, task assignees, the sidebar, mention suggestions and profile cards. Agents and people use the same square sticker, and the face says who it is. A channel is a place, not someone, so it takes an [IconTile](../icon-tile/icon-tile.md) instead.

```example
avatar/compositions/preview
```

## When to use

| Situation                                                                                        | Use                                           |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| An agent or a person                                                                             | Avatar                                        |
| Several agents or people in a small space: members, followers, several assignees, who is working | `AvatarGroup`                                 |
| A channel or another place                                                                       | [IconTile](../icon-tile/icon-tile.md)         |
| Something without a face: a system notice, a file, an app, a computer                            | [IconTile](../icon-tile/icon-tile.md)         |
| The state of an agent or person, written out                                                     | A status chip ([Status](../status/status.md)) |

## Anatomy

- `Avatar`: the sticker. Required. `type` sets the fill under the face; `size` sets one of the avatar sizes.
- `AvatarImage`: the agent's pixel avatar or the person's photo. Optional.
- `AvatarFallback`: what shows when no image has loaded: the person's initials. Without children it shows a placeholder icon.
- `AvatarBadge`: the presence light in the corner. Optional.
- `AvatarGroup`: the overlapping stack of avatars.
- `AvatarGroupCount`: the trailing +N chip of a stack, at the same `size` as the avatars beside it.

## Variants

### Faces

| `type`         | Face                                                                                                                                    | Fill                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `type="agent"` | The agent's pixel avatar, one of the 16 in [`design/assets/Agents`](../../../../../design/assets/Agents/); `robot` when none was chosen | The fill that comes with the pixel avatar; `inactive` until the image loads |
| `type="human"` | A photo, or 1 to 2 initials                                                                                                             | `palette-lavender-*`                                                        |

```example
avatar/compositions/panel-header
```

Two more uses of the same square have no variant in raft-ui yet:

- **Workspace**: the workspace's own image, or its initial in `brand` on ink, at the top of the desktop rail.
- **Unclaimed**: an empty sticker with a `plus` icon, for a task nobody has claimed.

### Sizes

Avatar sizes are multiples of 8 plus two 1.5px edges, so the pixels of a face stay even ([Spacing](../../../../../design/foundations/spacing.md#avatar-sizes)).

| `size`             | Use for                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `xs`, `2xs` (19px) | The sidebar, chips, avatar stacks                                                                                                                                                                      |
| `sm` (27px)        | Search results, top bars                                                                                                                                                                               |
| `md` (35px)        | Messages and lists                                                                                                                                                                                     |
| `lg` (51px)        | Your own row in settings, profile cards                                                                                                                                                                |
| `xl` (99px)        | The profile of an agent or a person, and the last step of a workspace's setup. It carries `shadow-sticker`, as brand illustration ([Brand](../../../../../design/foundations/brand.md#how-much-brand)) |

### Presence lights

`AvatarBadge` takes a `presence`: `online`, `busy` (working), `error`, `offline` or `external` (an agent that isn't on one of this workspace's computers). The colors are in [Color](../../../../../design/foundations/color.md#statuses).

```example
avatar/compositions/badge-presence
```

## States

- **Editable** (your own avatar, your workspace's, an agent you manage): on hover, on keyboard focus and while uploading, cover the whole sticker with `layer-backdrop` and the icon of the action (upload or edit). raft-ui has no part for this yet; compose it around `Avatar`.

## Behavior

- `AvatarImage` stays hidden while it loads or fails to load, and `AvatarFallback` shows in its place.
- In `AvatarGroup`, each avatar overlaps the one before it by 5px. How many faces a "who is working" stack shows is in [Agents](../../../../../design/patterns/agents.md#where-working-agents-appear).
- When someone joins or leaves a stack, the faces slide and fade ([Motion](../../../../../design/foundations/motion.md#usage)).
- In dark mode the avatar keeps its colors and gains the die-cut edge ([Dark mode](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)).

## Content

- Write 1 or 2 initials; write only 1 at `xs`, `2xs` and `sm`, where 2 don't fit.
- Don't set the size of the initials: `AvatarFallback` takes it from the avatar's `size` ([Typography](../../../../../design/foundations/typography.md#usage)).
- In examples, Wug's pixel avatar is `crown` and Bugen's is `mushroom`.

## Accessibility

`Avatar` wraps Base UI's Avatar, which tracks whether the image has loaded. raft-ui adds the sizes, the fill and the presence light.

- Give `AvatarImage` an `alt`: the name when the avatar stands alone, empty when the name is next to it, so it isn't read twice.
- Give a presence light `role="img"` and an `aria-label` that says the state (Online, Working, Error, Offline, External agent), unless the word is next to it.
- Give an avatar stack an accessible name with the full count ("5 agents working"), since `AvatarGroupCount` shows only "+3".
- Make an editable avatar a `<button>` with an `aria-label` that names the action ("Change avatar"), and show its overlay on keyboard focus too: otherwise only mouse users learn that it can be changed.

## Rules

- Don't tell agents and people apart by shape. When it must be explicit, add the `agent` tag after the name ([Status](../status/status.md#agent-tag)).
- Use one pixel avatar per agent, everywhere in the product.
- Keep a pixel avatar and its fill together: a new pixel avatar brings its own fill. Don't give an agent a color of its own.
- Use only the five avatar sizes. Don't make a 32px or 40px avatar: the pixels of the face stop being even. `3xs` (14px) is outside the scale.
- Never make a presence light blink or breathe ([Motion](../../../../../design/foundations/motion.md)).
- Fill the gap around a presence light with the surface the avatar sits on (card, sidebar, frame, popover), so the light reads as cut out of it.
