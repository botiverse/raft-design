---
title: PreviewCard
summary: The read-only card that appears when people hover over or focus a mention, a name or an app link, showing who someone is or what an app's item is, with up to two small buttons.
status: stable
aliases: [Profile card, Hover card, Item card]
layer: core
category: overlays
related: [popover, tooltip, avatar, status, message-item]
---

# PreviewCard

A preview card is the read-only card that appears when people hover over or focus something in the text, so they can see what it is without leaving the conversation. It has two uses: the profile card of a person or an agent, on a mention or a name such as @Bugen, with the avatar, the name and a status line; and the item card of an app link, such as a pull request a message links to, with its title and the details the app supplies. Either holds up to two small buttons. Raft Chat's profile card has no buttons ([Raft Chat](../../../../../design/products/raft-chat/README.md#overlays)).

```example
preview-card/preview-card-mention
```

## When to use

| Situation                                       | Use                                                    |
| ----------------------------------------------- | ------------------------------------------------------ |
| A person or an agent, on hover                  | PreviewCard, as a profile card                         |
| An item an app links to, on hover over its chip | PreviewCard, as an item card ([Item card](#item-card)) |
| One sentence about something, on hover          | [Tooltip](../tooltip/tooltip.md)                       |
| A choice or a field, on click                   | [Popover](../popover/popover.md)                       |
| The full profile, kept open                     | The profile page or side panel                         |

Which overlay fits which job is in [Choosing a component](../../../../../design/components/overview.md#overlays).

## Anatomy

- `PreviewCard`: the root. Required.
- `PreviewCardTrigger`: the mention, name or chip that opens the card, usually a link to what it names. Required.
- `PreviewCardContent`: the card, 300px wide, portaled and positioned under the trigger. Required.
- `PreviewCardHeader`: the large [Avatar](../avatar/avatar.md) and, beside it, the name and the line under it.
- `PreviewCardTitle`: the name, on one line; in `PreviewCardBody`, an item's title, which wraps.
- `PreviewCardSeparator`: the hairline under the header.
- `PreviewCardDescription`: the status line, one line, truncated.
- `PreviewCardArrow`: an optional pointer toward the trigger.
- `PreviewCardPortal` and `PreviewCardPopup`: lower-level parts. `PreviewCardPopup` is the card surface without positioning.

The item card adds these parts, experimental and exported from `@botiverse/raft-ui/wip` until the design is approved:

- `PreviewCardBody`: the block with the id line, the title and the details row, 16px from the card's edges.
- `PreviewCardEyebrow`: the id line above the title, in `foreground-muted` Space Mono, one line, truncated.
- `PreviewCardMeta`: the row under the title: the state, in a neutral Badge, then a muted line of details. It wraps when it runs out of room.
- `PreviewCardActions`: the row of up to two buttons.
- `PreviewCardFooter`: a caption under a hairline at the bottom: the app and the host.

## Item card

The card an app link opens on hover ([App links](../../../../../design/patterns/navigation.md#app-links)). The app supplies its words and which details it has; Raft sets their order and their colors. Its parts follow the questions a reader asks, in order:

1. **Which item is it?** `PreviewCardEyebrow`: the app's id for it, such as `botiverse/slock#10449`. Optional.
2. **What is it about?** `PreviewCardTitle`: the app's title in ink, up to 3 lines. Not in `foreground-link`: the card is not a link itself, its buttons and the chip are.
3. **Where does it stand?** `PreviewCardMeta`: one state chip in the app's words, such as Merged, then one muted line of details, such as "Martin · +803 −498".
4. **What can I do?** `PreviewCardActions`: up to two buttons the app provides, such as Open in Stamp.
5. **Who says so?** `PreviewCardFooter`: the app's name and the link's host, "Stamp · stamp.build".

```example
preview-card/preview-card-app-item
```

Before the reader has allowed the app, the chip stays gray with its address and has no card: a card is read-only, and its buttons can't be reached by keyboard or touch. Clicking, tapping or pressing Enter on the chip opens a [Popover](../popover/popover.md) that asks instead, the same on every device: a question as the title, a sentence on what allowing it does, Open Link to go without previews, and Show Previews.

```example
preview-card/preview-card-app-prompt
```

## Behavior

- The card opens almost as soon as the pointer rests on the trigger, and closes shortly after it leaves. The delays are shorter than Base UI's, so dense messages full of mentions don't feel slow.
- It also opens when the trigger takes keyboard focus.
- It opens under the trigger, aligned to its start edge, and moves or flips at the window edge ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- It keeps clear of the frame insets: where a shell keeps part of the window for itself (`--raft-frame-inset-top`, `--raft-frame-inset-start`, `--raft-frame-inset-end`), it stops 8px from that part, not from the window's edge ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)). The web sets none.

## Content

- For an agent, say first what it is doing now, then who it is: "Reviewing #25" with its presence light, then its role and where it runs.
- For a person, show their role and their local time.
- On an item card, show the app's words as it sends them; leave out a part the app doesn't send rather than filling it with Raft's own.
- Use Title Case on the buttons: Message, View Profile, Open in Stamp.

## Accessibility

- PreviewCard wraps the Base UI PreviewCard. It opens on hover and on focus of the trigger, and closes on Esc.
- The card is supplementary and doesn't open on touch, and its buttons can't be reached from the keyboard: focus moves on from the trigger, and the card closes. Make the trigger a real link, to the profile or to the app's item, so everything on the card is reachable another way: a button on an item card is a shortcut to something on the page the link opens, such as View Changes on a pull request.

## Rules

- Keep the card read-only: no fields, no choices. Something people fill in is a [Popover](../popover/popover.md).
- Put at most two small buttons on it, colored as in a [Popover](../popover/popover.md#rules): never pink.
- Show the item's state once, in the app's own words, in a neutral Badge (`appearance="soft"`): no status color and no status light. Which states an item has, and what they mean, is the app's concept, not Raft's; Raft's status colors and the status light mean task and presence states ([Status](../status/status.md#rules)), so mapping an app's "Merged" onto a task's "done" would put Raft's reading on the app's word.
- A line the app marks as a warning (`tone: "warning"`, such as "2 checks failing") reads in `warning-strong`, as raft-ui's own warning lines do. This is Raft's color for a warning, not the app's for a state: the state's Badge stays neutral, and nothing else on the card is colored.
- Put no colors of the app's on an item card: no brand color, no colored header. The app's icon on the chip is the only mark of its own.
