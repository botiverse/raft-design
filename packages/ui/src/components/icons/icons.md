---
title: Icons
summary: The four conversation icons raft-ui draws itself — Message, Chat, Direct Message and Thread; every other icon comes from Lucide.
status: stable
aliases: [MessageIcon, ChatIcon, DirectMessageIcon, ThreadIcon, Conversation icons]
layer: core
category: identity
related: [sidebar, message-quoted-preview, tasks, icon-tile]
---

# Icons

raft-ui exports four icons of its own for kinds of conversation: `MessageIcon`, `ChatIcon`, `DirectMessageIcon` and `ThreadIcon`. Every other icon in Raft comes from Lucide. The rules for all icons (the set, the stroke, the color and the size by context) are in [Iconography](../../../../../design/foundations/iconography.md).

```example
icons/icons
```

## When to use

| Situation                                                   | Use                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A message, a chat, a direct message or a thread, as an icon | `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `ThreadIcon`                                              |
| A task's status                                             | `TaskStatusIcon` ([Tasks](../tasks/tasks.md))                                                             |
| Any other icon                                              | The Lucide icon of that name ([Iconography](../../../../../design/foundations/iconography.md#principles)) |
| An agent                                                    | Its pixel avatar ([Avatar](../avatar/avatar.md)), never an icon                                           |
| A channel or another place beside its name                  | A channel tile ([IconTile](../icon-tile/icon-tile.md))                                                    |

## Anatomy

- `MessageIcon`: a speech bubble.
- `ChatIcon`: a speech bubble with three dots.
- `DirectMessageIcon`: a speech bubble with a person.
- `ThreadIcon`: two overlapping speech bubbles, both outlined. Every icon in Raft is a line drawing at one weight; a filled bubble read heavier than every Lucide icon beside it in a menu or a toolbar (stdrc, 2026-10-23).

Each one is an 18px `svg` drawn in `currentColor`, so it takes the color of the text around it. Size it with a class, by the context it is in ([Iconography](../../../../../design/foundations/iconography.md#sizes)).

Their lines are 1.5 on the 18px grid, the weight of Lucide's 2 on its 24px grid, so at any size they match the Lucide icons beside them: 1.33px at 16px, as Lucide's are. At 1 they drew 0.89px at 16px, thinner than every icon around them in a menu or a toolbar.

## Accessibility

- The icons are hidden from assistive technology (`aria-hidden`) and can't take focus. The text or the `aria-label` of the control around them names what they stand for.
- To use one as the only content of a button, give the button an `aria-label`: Open Thread.

## Rules

- Don't add drawn icons. New icons come from Lucide ([Iconography](../../../../../design/foundations/iconography.md#principles)); these four are the only drawn ones.
