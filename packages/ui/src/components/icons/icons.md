---
title: Icons
summary: The icons raft-ui draws itself — four for kinds of conversation and eight for following a thread and joining or leaving a channel; every other icon comes from Lucide.
status: stable
aliases:
  [
    MessageIcon,
    ChatIcon,
    DirectMessageIcon,
    ThreadIcon,
    Conversation icons,
    FollowThreadIcon,
    UnfollowThreadIcon,
    JoinChannelIcon,
    LeaveChannelIcon,
    JoinPrivateChannelIcon,
    LeavePrivateChannelIcon,
    JoinJointChannelIcon,
    LeaveJointChannelIcon,
    Action icons,
  ]
layer: core
category: identity
related: [sidebar, message-quoted-preview, tasks, icon-tile]
---

# Icons

raft-ui exports two sets of icons of its own. Four stand for kinds of conversation: `MessageIcon`, `ChatIcon`, `DirectMessageIcon` and `ThreadIcon`. Eight label the actions that follow a thread or join or leave a channel ([Action icons](#action-icons)). Every other icon in Raft comes from Lucide. The rules for all icons (the set, the stroke, the color and the size by context) are in [Iconography](../../../../../design/foundations/iconography.md).

```example
icons/icons
```

```example
icons/action-icons
```

## When to use

| Situation                                                   | Use                                                                                                       |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A message, a chat, a direct message or a thread, as an icon | `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `ThreadIcon`                                              |
| Following a thread, or joining or leaving a channel         | The action icon for it ([Action icons](#action-icons))                                                    |
| A task's status                                             | `TaskStatusIcon` ([Tasks](../tasks/tasks.md))                                                             |
| Any other icon                                              | The Lucide icon of that name ([Iconography](../../../../../design/foundations/iconography.md#principles)) |
| An agent                                                    | Its pixel avatar ([Avatar](../avatar/avatar.md)), never an icon                                           |
| A channel or another place beside its name                  | A channel tile ([IconTile](../icon-tile/icon-tile.md))                                                    |

## Anatomy

- `MessageIcon`: a speech bubble.
- `ChatIcon`: a speech bubble with three dots.
- `DirectMessageIcon`: a speech bubble with a person.
- `ThreadIcon`: two overlapping speech bubbles, both outlined. Every icon in Raft is a line drawing at one weight; a filled bubble read heavier than every Lucide icon beside it in a menu or a toolbar (stdrc, 2026-10-23). The back bubble stops a stroke's width short of the front one on both sides, so the overlap reads as a gap, not a join, and both stay inside the 18px box with their stroke.

Each one is an 18px `svg` drawn in `currentColor`, so it takes the color of the text around it. Size it with a class, by the context it is in ([Iconography](../../../../../design/foundations/iconography.md#sizes)).

Their lines are 1.5 on the 18px grid, the weight of Lucide's 2 on its 24px grid, so at any size they match the Lucide icons beside them: 1.33px at 16px, as Lucide's are. At 1 they drew 0.89px at 16px, thinner than every icon around them in a menu or a toolbar.

## Action icons

Each one labels one action, in a menu item or on a button, beside the action's name:

| Icon                      | Labels                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `FollowThreadIcon`        | Follow Thread: in the message menu, a thread's More menu and an inbox row's menu                                                                                 |
| `UnfollowThreadIcon`      | Unfollow Thread, in the same places                                                                                                                              |
| `JoinChannelIcon`         | Joining a channel: the Join button in a channel the person isn't in ("Join #design", "Join channel to reply"). A channel readable on the public page uses it too |
| `LeaveChannelIcon`        | Leave Channel, for a channel                                                                                                                                     |
| `JoinPrivateChannelIcon`  | Joining a private channel. A private channel can only be joined by invitation, so it goes on the action that accepts one                                         |
| `LeavePrivateChannelIcon` | Leave Channel, for a private channel                                                                                                                             |
| `JoinJointChannelIcon`    | Joining a joint channel: an admin accepting the invitation that brings the server in                                                                             |
| `LeaveJointChannelIcon`   | Leave Channel, for a joint channel                                                                                                                               |

Pick the channel icon by the kind of channel the action is on, the same kind its own icon shows (`hash`, `lock`, `git-branch`; [Raft Chat channel](../../../../../design/products/raft-chat/channel.md)).

They are drawn on Lucide's grid: a 24px `svg`, lines of 2, round ends and joins, in `currentColor`. A pair shares one drawing and swaps only its mark, a plus to follow or join and a minus to unfollow or leave, so the two read as one command and its opposite:

- The thread pair is `ThreadIcon` at 24px, the mark inside the front bubble, as Lucide's `message-circle-plus` puts it.
- The channel pairs are Lucide's `hash`, `lock` and `git-branch`, full size and in place, the mark in the bottom-right corner (16 to 22). Where the glyph reaches that corner its strokes stop about a line's width short of the mark, as Lucide's `calendar-plus` cuts its corner. Every pair keeps the same gap, so the eight read as one set (Artea, 2026-10-28). `git-branch` leaves the corner empty and needs no cut.

A channel's own icon with a globe (readable on the public page) has no pair of its own: its corner already holds the globe, and joining it is joining a channel.

## Accessibility

- The icons are hidden from assistive technology (`aria-hidden`) and can't take focus. The text or the `aria-label` of the control around them names what they stand for.
- To use one as the only content of a button, give the button an `aria-label`: Open Thread.

## Rules

- Don't add drawn icons. New icons come from Lucide ([Iconography](../../../../../design/foundations/iconography.md#principles)); these twelve are the only drawn ones.
- Use an action icon only for its action. `JoinChannelIcon` is not a channel's icon, and a plus or minus badge is not a way to say "new" or "remove" on other icons.
