---
title: Avatar
summary: The square sticker that stands for one agent or one person — a pixel face for an agent, a photo or initials for a person — with an optional presence light.
status: stable
aliases: [PixelAvatar, avatar stack, presence light]
layer: core
category: identity
related: [icon-tile, status, badge, list-row, message-item]
redirectFrom: [decisions/0024-initials-for-people-without-photo, decisions/0041-editable-avatar]
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
- `AvatarBadge`: what sits in the corner: the presence light, or, through `render`, something drawn in its place. Optional.
- `AvatarGroup`: the overlapping stack of avatars.
- `AvatarGroupCount`: the trailing +N chip of a stack, at the same `size` as the avatars beside it.

## Variants

### Faces

| `type`          | Face                                                                                                                                    | Fill                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `type="agent"`  | The agent's pixel avatar, one of the 72 in [`design/assets/Agents`](../../../../../design/assets/Agents/); `robot` when none was chosen | The fill that comes with the pixel avatar; `inactive` until the image loads |
| `type="human"`  | A photo, or 1 to 2 initials                                                                                                             | `palette-lavender-*`                                                        |
| `type="server"` | The server's logo, or its initial in yellow (`brand`); the workspace tile                                                               | `sticker-ink`                                                               |

```example
avatar/compositions/panel-header
```

Two more uses of the same square have no variant in raft-ui yet:

- **Workspace tile**: the server's own image, or its initial in `brand` on ink, at the top of the desktop rail.
- **Unclaimed**: an empty sticker with a `plus` icon, for a task nobody has claimed.

### Sizes

Avatar sizes are multiples of 8 plus two 1.5px edges, so the pixels of a face stay even ([Spacing](../../../../../design/foundations/spacing.md#avatar-sizes)).

| `size`             | Use for                                                                                                                                                                                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xs`, `2xs` (19px) | The sidebar, chips, avatar stacks                                                                                                                                                                   |
| `sm` (27px)        | Search results, top bars                                                                                                                                                                            |
| `md` (35px)        | Messages and lists                                                                                                                                                                                  |
| `lg` (51px)        | Your own row in settings, profile cards                                                                                                                                                             |
| `xl` (99px)        | The profile of an agent or a person, and the last step of a server's setup. It carries `shadow-sticker`, as brand illustration ([Brand](../../../../../design/foundations/brand.md#how-much-brand)) |

### Presence lights

`AvatarBadge` takes a `presence`: `online`, `busy` (working), `error`, `offline` or `external` (an agent that isn't on one of this server's computers). The colors are in [Color](../../../../../design/foundations/color.md#statuses).

- Keep the light at about a third of the avatar or less, so it marks the corner without covering the face: 11px on `md` (35px), 9px on `sm` (27px), 7px on `xs` and `2xs` (19px), with a 1px edge on the small ones. The one exception is an assistant's face on its person's avatar ([The corner](#the-corner)).

```example
avatar/compositions/badge-presence
```

### The corner

The bottom-right corner holds one thing at a time:

| Avatar                                                 | Its corner holds                                                                                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| An agent                                               | Its presence light                                                                                                                          |
| A person, on a message their assistant sent for them   | The assistant's face, `2xs`, ringed with the surface ([`MessageItemDelegatedAvatar`](../message-item/message-item.md#sent-by-an-assistant)) |
| An agent or a person, leading a thread row in Activity | The thread badge, and no presence light ([`InboxItemLeadingBadge`](../inbox-item/inbox-item.md#the-leading-image))                          |
| A person, anywhere else                                | Nothing                                                                                                                                     |

- The assistant's face takes the presence light's place and sticks out as far: the same visible 2.5px past the avatar's edge on `md`, so the two read as the same kind of mark.
- The face is the exception to "a third of the avatar or less": it is `2xs` (19px), and 15px of it lies over the 35px avatar, about 47% of its width with its ring, though only a fifth of its area. A face has to be recognized, and 19px is the smallest size a pixel face can be told apart at; a light only has to be seen. The person's initials or photo stay readable above and to the left of it. Decided by stdrc on 2026-10-21 (RFC 077).
- On a thread row in Activity the thread badge takes the presence light's corner, the same badge as on a channel's tile: the row is about the thread, not about how the agent is doing now ([InboxItem](../inbox-item/inbox-item.md#the-leading-image)).
- Never put a face on an agent's avatar: its corner is its presence light, and a face there would hide whether the agent is working ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)).

## States

- **Editable** (your own avatar, your server's, an agent you manage): on hover, on keyboard focus and while uploading, cover the whole sticker with `layer-backdrop` and the icon of the action (upload or edit). Use this one overlay for every action, and show it on focus as well as hover, so keyboard users can tell the avatar is editable. raft-ui has no part for this yet; compose it around `Avatar`.

## Behavior

- `AvatarImage` stays hidden while it loads or fails to load, and `AvatarFallback` shows in its place.
- In `AvatarGroup`, each avatar overlaps the one before it by 5px. How many faces a "who is working" stack shows is in [Working agents](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now).
- When someone joins or leaves a stack, the faces slide and fade ([Motion](../../../../../design/foundations/motion.md#usage)).
- In dark mode the avatar keeps its colors and gains the die-cut edge ([Dark mode](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)).

## Content

- Show a person without a photo by their initials on lavender, not by a person icon: an icon says only "this is a person", and initials let people be told apart without photos.
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
- Put one thing in the corner: a presence light, an assistant's face on a person's avatar, or the thread badge on a thread row, never two of them ([The corner](#the-corner)).
- Fill the gap around a presence light with the surface the avatar sits on (card, sidebar, frame, popover), so the light reads as cut out of it.
