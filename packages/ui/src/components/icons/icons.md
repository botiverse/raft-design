---
title: Icons
summary: The icons raft-ui draws itself — six for kinds of conversation, one for an Artifact and thirteen for following, joining, adding, creating and reopening; every other icon comes from Lucide.
status: stable
aliases:
  [
    MessageIcon,
    ChatIcon,
    DirectMessageIcon,
    ThreadIcon,
    CommentIcon,
    FeedbackIcon,
    Conversation icons,
    ArtifactIcon,
    FollowThreadIcon,
    UnfollowThreadIcon,
    JoinChannelIcon,
    LeaveChannelIcon,
    JoinPrivateChannelIcon,
    LeavePrivateChannelIcon,
    JoinJointChannelIcon,
    LeaveJointChannelIcon,
    FollowArtifactIcon,
    UnfollowArtifactIcon,
    AddCommentIcon,
    CreateTaskIcon,
    ReopenTaskIcon,
    Action icons,
  ]
layer: core
category: identity
related: [sidebar, message-quoted-preview, tasks, icon-tile]
---

# Icons

raft-ui exports a few icons of its own, for meanings no Lucide icon carries. Six stand for kinds of conversation: `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `ThreadIcon`, `CommentIcon` and `FeedbackIcon`. `ArtifactIcon` stands for an Artifact. Thirteen label actions: following a thread or an Artifact, joining or leaving a channel, adding a comment, creating a task and reopening one ([Action icons](#action-icons)). Every other icon in Raft comes from Lucide. The rules for all icons (the set, the stroke, the color and the size by context) are in [Iconography](../../../../../design/foundations/iconography.md).

```example
icons/icons
```

```example
icons/action-icons
```

## When to use

| Situation                                                                                                       | Use                                                                                                       |
| --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| A message, a chat, a direct message or a thread, as an icon                                                     | `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `ThreadIcon`                                              |
| A comment: the comments toggle, a comment count, no comments yet                                                | `CommentIcon`                                                                                             |
| Feedback to the Raft team: the Feedback menu item, a reply to it                                                | `FeedbackIcon`                                                                                            |
| An Artifact: Save as Artifact, the Artifacts page, an Artifact card in a side panel                             | `ArtifactIcon`                                                                                            |
| Following a thread or an Artifact, joining or leaving a channel, adding a comment, creating or reopening a task | The action icon for it ([Action icons](#action-icons))                                                    |
| A task's status                                                                                                 | `TaskStatusIcon` ([Tasks](../tasks/tasks.md))                                                             |
| Any other icon                                                                                                  | The Lucide icon of that name ([Iconography](../../../../../design/foundations/iconography.md#principles)) |
| An agent                                                                                                        | Its pixel avatar ([Avatar](../avatar/avatar.md)), never an icon                                           |
| A channel or another place beside its name                                                                      | A channel tile ([IconTile](../icon-tile/icon-tile.md))                                                    |

## Anatomy

- `MessageIcon`: a speech bubble.
- `ChatIcon`: a speech bubble with three dots.
- `DirectMessageIcon`: a speech bubble with a person.
- `CommentIcon`: a speech bubble with quote marks. A comment is said about a passage, so it carries the passage's quote marks.
- `FeedbackIcon`: a speech bubble with an exclamation mark, the mark most apps give feedback: a thought or a problem, told to the Raft team.
- `ThreadIcon`: two overlapping speech bubbles, both outlined. Every icon in Raft is a line drawing at one weight; a filled bubble read heavier than every Lucide icon beside it in a menu or a toolbar (stdrc, 2026-10-23). The back bubble stops a stroke's width short of the front one on both sides, so the overlap reads as a gap, not a join, and both stay inside the 18px box with their stroke.

The bubble is the same in `MessageIcon`, `ChatIcon`, `DirectMessageIcon`, `CommentIcon` and `FeedbackIcon`; only the mark inside it changes, so each kind of conversation has one icon and no two share one (Artea, 2026-10-28).

Each one is an 18px `svg` drawn in `currentColor`, so it takes the color of the text around it. Size it with a class, by the context it is in ([Iconography](../../../../../design/foundations/iconography.md#sizes)).

Their lines are 1.5 on the 18px grid, the weight of Lucide's 2 on its 24px grid, so at any size they match the Lucide icons beside them: 1.33px at 16px, as Lucide's are. At 1 they drew 0.89px at 16px, thinner than every icon around them in a menu or a toolbar.

`ArtifactIcon` is a page someone made: a page with no dog-ear, laid out like a web page, a header block over two lines of text. It has no dog-ear so it isn't read as one of Lucide's `file` icons, which say what kind of content an Artifact card holds (`file-text`, `file-code`). It is a 24px `svg` on Lucide's grid, lines of 2, like the action icons.

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
| `FollowArtifactIcon`      | Follow Artifact: in an Artifact's menu and on the Artifacts page                                                                                                 |
| `UnfollowArtifactIcon`    | Unfollow Artifact, in the same places                                                                                                                            |
| `AddCommentIcon`          | Add Comment: writing a comment on a passage of an Artifact or a file                                                                                             |
| `CreateTaskIcon`          | Create Task from a message: in the message menu                                                                                                                  |
| `ReopenTaskIcon`          | Reopen Task: taking a done task back to not done                                                                                                                 |

Pick the channel icon by the kind of channel the action is on, the same kind its own icon shows (`hash`, `lock`, `git-branch`; [Raft Chat channel](../../../../../design/products/raft-chat/channel.md)).

They are drawn on Lucide's grid: a 24px `svg`, lines of 2, round ends and joins, in `currentColor`. A pair shares one drawing and swaps only its mark, a plus to follow or join and a minus to unfollow or leave, so the two read as one command and its opposite:

- The thread pair is `ThreadIcon` at 24px, the mark inside the front bubble, as Lucide's `message-circle-plus` puts it.
- The Artifact pair is `ArtifactIcon`, the mark inside the page where its two lines of text were, as the thread pair puts it inside the bubble. Following is a mark inside the thing; the corner is for joining, leaving, adding and creating. At 16px and under, the minus of `UnfollowArtifactIcon` is drawn heavier, a line of 3 rather than 2, and 6 long rather than 5, on whole pixels: the plain minus, one line inside a page, read as one more line of its text and was easy to miss in a menu (Artea, 2026-10-28). From 18px up it is the plain minus, the same weight as the plus of `FollowArtifactIcon` ([A mark at small sizes](../../../../../design/foundations/iconography.md#a-mark-at-small-sizes)).

```example
icons/unfollow-artifact-sizes
```

- The channel pairs are Lucide's `hash`, `lock` and `git-branch`, full size and in place, the mark in the bottom-right corner (16 to 22). Where the glyph reaches that corner its strokes stop about a line's width short of the mark, as Lucide's `calendar-plus` cuts its corner. Every pair keeps the same gap, so the eight read as one set (Artea, 2026-10-28). `git-branch` leaves the corner empty and needs no cut.

`AddCommentIcon` and `CreateTaskIcon` put a plus in the same corner, with the same gap: `AddCommentIcon` is `CommentIcon` at 24px, its bubble cut short of the plus; `CreateTaskIcon` is Lucide's `list-todo` with the plus in place of its last line. They have no minus pair.

`ReopenTaskIcon` has no badge. It is a ticked box broken open at the top by a counter-clockwise arrow (Lucide's `rotate-ccw-square` with a check): a done task, opened again. Lucide's `rotate-ccw` already means restart and `refresh-cw` retry, so a reopen drawn as a bare circle arrow would read as one of them.

A channel's own icon with a globe (readable on the public page) has no pair of its own: its corner already holds the globe, and joining it is joining a channel.

## Accessibility

- The icons are hidden from assistive technology (`aria-hidden`) and can't take focus. The text or the `aria-label` of the control around them names what they stand for.
- To use one as the only content of a button, give the button an `aria-label`: Open Thread.

## Rules

- Don't add drawn icons. New icons come from Lucide ([Iconography](../../../../../design/foundations/iconography.md#principles)); these twenty are the only drawn ones, each for a meaning Lucide has no icon for.
- Use an action icon only for its action. `JoinChannelIcon` is not a channel's icon, and `AddCommentIcon` is not a comment's.
- A plus means add, create, follow or join this kind of thing, and a minus remove, unfollow or leave it: inside the thing for following, in the bottom-right corner for the rest. Never use either for another meaning, such as "new" or "more".
