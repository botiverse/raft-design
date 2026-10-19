---
title: PreviewCard
summary: The read-only profile card that appears when people hover over or focus a mention or a name, showing a person's or an agent's avatar, name, status line and up to two small buttons.
status: stable
aliases: [Profile card, Hover card]
category: overlays
related: [popover, tooltip, avatar, status]
---

# PreviewCard

A preview card is the read-only profile card that appears when people hover over or focus a mention or a name, such as @Bugen in a message. It shows the avatar, the name, a status line and up to two small buttons, so people can see who someone is without leaving the conversation. Raft Chat's card has no buttons ([Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)).

```example
preview-card/preview-card-mention
```

## When to use

| Situation                              | Use                              |
| -------------------------------------- | -------------------------------- |
| A person or an agent, on hover         | PreviewCard                      |
| One sentence about something, on hover | [Tooltip](../tooltip/tooltip.md) |
| A choice or a field, on click          | [Popover](../popover/popover.md) |
| The full profile, kept open            | The profile page or side panel   |

Which overlay fits which job is in [Choosing a component](../../../../../design/patterns/choosing-components.md#overlays).

## Anatomy

- `PreviewCard`: the root. Required.
- `PreviewCardTrigger`: the mention or name that opens the card, usually a link to the profile. Required.
- `PreviewCardContent`: the card, 300px wide, portaled and positioned under the trigger. Required.
- `PreviewCardHeader`: the large [Avatar](../avatar/avatar.md) and, beside it, the name and the line under it.
- `PreviewCardTitle`: the name.
- `PreviewCardSeparator`: the hairline under the header.
- `PreviewCardDescription`: the status line, one line, truncated.
- `PreviewCardArrow`: an optional pointer toward the trigger.
- `PreviewCardPortal` and `PreviewCardPopup`: lower-level parts. `PreviewCardPopup` is the card surface without positioning.

## Behavior

- The card opens almost as soon as the pointer rests on the trigger, and closes shortly after it leaves. The delays are shorter than Base UI's, so dense messages full of mentions don't feel slow.
- It also opens when the trigger takes keyboard focus.
- It opens under the trigger, aligned to its start edge, and moves or flips at the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).

## Content

- For an agent, say first what it is doing now, then who it is: "Reviewing #25" with its presence light, then its role and where it runs.
- For a person, show their role and their local time.
- Use Title Case on the buttons: Message, View Profile.

## Accessibility

- PreviewCard wraps the Base UI PreviewCard. It opens on hover and on focus of the trigger, and closes on Esc.
- The card is supplementary and doesn't open on touch. Make the trigger a real link to the profile, so everything on the card is reachable another way.

## Rules

- Keep the card read-only: no fields, no choices. Something people fill in is a [Popover](../popover/popover.md).
- Put at most two small buttons on it, colored as in a [Popover](../popover/popover.md#rules): never pink.
