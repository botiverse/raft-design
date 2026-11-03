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
| A stack that opens the list of who is in it: who is viewing, a channel's members                 | `AvatarGroupButton`                           |
| A channel or another place                                                                       | [IconTile](../icon-tile/icon-tile.md)         |
| Something without a face: a system notice, a file, an app, a computer                            | [IconTile](../icon-tile/icon-tile.md)         |
| The state of an agent or person, written out                                                     | A status chip ([Status](../status/status.md)) |

## Anatomy

- `Avatar`: the sticker. Required. `type` sets the fill under the face; `size` sets one of the avatar sizes.
- `AvatarImage`: the agent's pixel avatar or the person's photo. Optional.
- `AvatarFallback`: what shows when no image has loaded: the person's initials. Without children it shows a placeholder icon.
- `AvatarBadge`: what sits in the corner: the presence light, or, through `render`, something drawn in its place. Optional.
- `AvatarGroup`: the overlapping stack of avatars. A `div`; give it `render={<span />}` where only inline content may go, such as a header's `<p>` or a button.
- `AvatarGroupCount`: the trailing +N chip of a stack, at the same `size` and with the same edge as the avatars beside it.
- `AvatarGroupButton`: an `AvatarGroup` that is a button, for a stack that opens the list of who is in it ([A stack that opens a list](#a-stack-that-opens-a-list)). It holds the same `Avatar`s and `AvatarGroupCount`.

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

### Stacks

`AvatarGroup` lays each avatar 5px over the one before, at every size, with nothing between them: no ring of the surface around a face, and no gap. Each sticker's own 1.5px ink edge, and in dark mode its die-cut edge, is what parts one face from the next. A trailing `AvatarGroupCount` lies over the last face the same way, and wears the same edge.

```example
avatar/compositions/group
```

- Why: a ring cut in the surface around each face read as a gap between the faces, while the app's hand-built stacks (Working now, the typing line) had none, so one idea looked two ways. Every stack of faces is now drawn the Working now way. Decided by stdrc on 2026-11-04 (#proj-raft-ui:7531279d).
- The seam sits on the straight edge, never in the corner. A sticker's corner is 4px (`radius-sticker`), and 5px clears it: the next face's rounded corner lies over the straight top and bottom of the face beneath, so the outline runs on unbroken. At 3px or 4px the seam falls in the corner and a notch of the surface shows between the two rounded corners. The same 5px holds for 14px (`3xs`) faces, such as a thread's followers chip, for the same reason.
- The +N chip (`AvatarGroupCount`) has the faces' ink edge, and their die-cut edge in dark mode, so it reads as one more sticker in the stack rather than a grey square beside it. Its fill stays neutral (`fill-muted`) and its number muted.
- An agent's pixel face stays recognizable: at 19px its sprite is 8 cells of 2px inside the edge, and the next face covers the edge and under 2 of its 8 columns (about 2.5 in dark mode, where the next face's die-cut edge adds 1.5px). The ring used to cover 3px more.
- A person's photo or initials sit inside the same ink edge, so they part from a neighbour as an agent's face does, on any surface.
- The faces, the edge and the count chip are opaque, so nothing beneath shows through, and a stack needs no surface colour of its own: it looks the same on the canvas, a card, a header or a hover fill.
- The geometry stays the same as before the ring was removed: 19px faces, a 5px overlap, and 4px around the faces in `AvatarGroupButton`. A column sized to a stack (a message row's read faces) keeps its width.

### A stack that opens a list

Where a stack stands for people the reader may want to see by name, such as who is viewing a document or a channel's members, the stack is the button that opens the list: `AvatarGroupButton`, usually as the `render` of a `PopoverTrigger`. It is a small control, so it hovers and presses with the medium tier ([States](../../../../../design/foundations/states.md#hover-and-press)).

```example
avatar/compositions/group-button
```

- The stack sits 4px inside the button, so the hover fill shows around the faces, on `radius-chip`.
- The faces lie directly on one another ([Stacks](#stacks)), so there is no ring to repaint: the fill steps behind the whole stack at once and every face keeps its own paint.
- Keyboard focus draws the shared focus ring around the button ([States](../../../../../design/foundations/states.md)).

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
- On a thread row in Activity the thread badge takes the presence light's corner, the same badge, at the same size, as on a thread or task row in a channel: the row is about the thread, not about how the agent is doing now ([InboxItem](../inbox-item/inbox-item.md#the-leading-image)).
- Never put a face on an agent's avatar: its corner is its presence light, and a face there would hide whether the agent is working ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)).

## States

- **Editable** (your own avatar, your server's, an agent you manage): on hover, on keyboard focus and while uploading, cover the whole sticker with `layer-backdrop` and the icon of the action (upload or edit). Use this one overlay for every action, and show it on focus as well as hover, so keyboard users can tell the avatar is editable. raft-ui has no part for this yet; compose it around `Avatar`. The next step is an `AvatarEditVeil` part in raft-ui, moved from the app.

## Behavior

- `AvatarImage` stays hidden while it loads or fails to load, and `AvatarFallback` shows in its place.
- In `AvatarGroup`, each avatar overlaps the one before it by 5px at every size, with nothing between them and the seam on the straight edge ([Stacks](#stacks)). How many faces a "who is working" stack shows is in [Working agents](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now).
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
- `AvatarGroupButton` wraps Base UI's Button: a native `<button type="button">`. Its faces are not text, so give it an `aria-label` that says who is there, in words ("Bugen viewing, Wug writing, 3 read this version"): the label replaces what the faces would say, so it must name everyone the stack stands for, the +N included. In a `PopoverTrigger` it takes `aria-expanded` and returns focus when the list closes.
- Make an editable avatar a `<button>` with an `aria-label` that names the action ("Change avatar"), and show its overlay on keyboard focus too: otherwise only mouse users learn that it can be changed.

## Rules

- An avatar's corner follows its size on a desktop (`sm` 27 `radius-chip`, `md` 35 `radius-control`, `lg` and `xl` `radius-container`; `xs` stays `radius-sticker`). Those corners are set under the desktop query, so a `rounded-*` passed in `className` doesn't replace them there: don't reshape an avatar from outside.
- Don't tell agents and people apart by shape. When it must be explicit, add the `agent` tag after the name ([Status](../status/status.md#agent-tag)).
- Use one pixel avatar per agent, everywhere in the product.
- Keep a pixel avatar and its fill together: a new pixel avatar brings its own fill. Don't give an agent a color of its own.
- Draw every stack of faces with `AvatarGroup` or `AvatarGroupButton`, never a stack of your own, and put no ring, gap or outline between the faces ([Stacks](#stacks)).
- Overlap faces past the corner: the seam sits on the straight edge, never in the corner ([Stacks](#stacks)).
- Use only the five avatar sizes. Don't make a 32px or 40px avatar: the pixels of the face stop being even. `3xs` (14px) is outside the scale.
- Never make a presence light blink or breathe ([Motion](../../../../../design/foundations/motion.md)).
- Put one thing in the corner: a presence light, an assistant's face on a person's avatar, or the thread badge on a thread row, never two of them ([The corner](#the-corner)).
- Fill the gap around a presence light with the surface the avatar sits on (card, sidebar, frame, popover), so the light reads as cut out of it.
