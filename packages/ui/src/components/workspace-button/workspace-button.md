---
title: WorkspaceButton
summary: The server switcher on the frame — the server's avatar, its name and a chevron, one button that opens the server list.
status: stable
aliases: [Server switcher, Workspace pill, Workspace switcher]
layer: core
category: navigation
related: [button, avatar, popover, app-rail]
---

# WorkspaceButton

WorkspaceButton shows which server you are in and opens the list to switch. It looks the same everywhere it appears: on the left of the web top bar, at the top of a phone's Home on the web, and at the top of Home in the mobile app.

```example
workspace-button/workspace-button
```

## When to use

| Situation                                                | Use                                                                   |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| The current server, on the frame, opening the list       | WorkspaceButton                                                       |
| Another server, one click away, beside the button        | The workspace strip: the server's [Avatar](../avatar/avatar.md) alone |
| The server on the desktop rail, when there is no top bar | The rail's workspace tile ([AppRail](../app-rail/app-rail.md))        |

## Anatomy

- `WorkspaceButton`: the on-frame `md` [Button](../button/button.md): 36px high, 10px each side, `text-subhead` bold in `foreground-on-frame`, with `fill-frame-pressed` on hover, on press and while the list is open. It ends with a 16px chevron, 4px after the name. The chevron is part of the button and always shows.
- The server's [Avatar](../avatar/avatar.md), `type="server" size="sm"` (27px): the server's logo, or its initial in yellow on ink. 8px before the name.
- `WorkspaceButtonName`: the server's name, at most 200px, then an ellipsis.
- Optional, between the name and the chevron: the globe, when the server's public page is on.

## Behavior

- Opening the list: on desktop a menu under the button, 256px wide; on a phone a popover anchored under the top bar, 8px from each side ([Switching servers](../../../../../design/components/overview.md#switching-servers)).
- The button shrinks from the name. The avatar and the chevron keep their size, so the button reads as a switcher in any width.
- The button keeps its avatar when the workspace strip shows beside it.
- Place it by its avatar: the avatar's left edge is on the page's content line (16px on a phone), and the press fill reaches past it by the button's padding ([Alignment](../../../../../design/foundations/alignment.md)).

## States

- **Unread elsewhere:** when another server has unread items, an attention dot sits on the avatar's top-right corner (`AvatarBadge` with `offset={["100%", 0]}`).
- **Pressed and open:** `fill-frame-pressed` under the whole button.

## Accessibility

- The button's name is the server's name. When another server has unread items, say so in the label ("Acme, another server has unread items").
- The chevron is decorative (`aria-hidden`).
