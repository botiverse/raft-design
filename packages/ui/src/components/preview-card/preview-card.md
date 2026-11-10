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
- `PreviewCardContent`: the card, portaled and positioned under the trigger: 300px wide for a profile, and 400px with `size="item"` for an item card, which has a title, a state and buttons to fit. Choose by what the card shows, not by its parts: a card that shows an item (its title, with a state or details) is `size="item"`; a card that asks for one step, such as connecting an account, keeps the default 300px, even when it uses `PreviewCardBody` for its sentence; it then takes the body's 12px inset and its title the card title's size, like the item card it leads to. Required.
- `PreviewCardHeader`: the large [Avatar](../avatar/avatar.md) and, beside it, the name and the line under it.
- `PreviewCardTitle`: the name, on one line; in `PreviewCardBody`, an item's title, the title of a card in a message, which wraps.
- `PreviewCardSeparator`: the hairline under the header.
- `PreviewCardDescription`: the status line, one line, truncated.
- `PreviewCardArrow`: an optional pointer toward the trigger.
- `PreviewCardPortal` and `PreviewCardPopup`: lower-level parts. `PreviewCardPopup` is the card surface without positioning.

The item card adds these parts, experimental and exported from `@botiverse/raft-ui/wip` until the design is approved:

- `PreviewCardBody`: the block with the id line, the title and the details row, 12px from the card's edges. Its parts, the actions and the footer are a card's in a message ([Cards in messages](../../../../../design/patterns/cards-in-messages.md#popovers)), so the hover card and the block card ([AppLinkCard](../app-link-card/app-link-card.md)) stay alike.
- `PreviewCardEyebrow`: the id line above the title, in `foreground-muted` Space Mono, one line, truncated.
- `PreviewCardMeta`: the row under the title: the state, in a neutral Badge, then a muted line of details. It wraps when it runs out of room.
- `PreviewCardActions`: one row of up to two buttons at the card's end, 12px from its edges as in a card in a message: the confirm button last. A third action goes in a More menu (⋯) the app's card supplies; a status line beside the buttons wraps onto its own line before they do ([Buttons](../../../../../design/patterns/cards-in-messages.md#buttons)).
- `PreviewCardFooter`: a caption under a hairline at the bottom: the app and the host.

## Item card

The card an app link opens on hover ([App links](../../../../../design/patterns/navigation.md#app-links)). The app supplies its words and which details it has; Raft sets their order and their colors. Its parts follow the questions a reader asks, in order:

1. **Which item is it?** `PreviewCardEyebrow`: the app's id for it, such as `botiverse/slock#10449`. Optional.
2. **What is it about?** `PreviewCardTitle`: the app's title in ink, up to 2 lines, cut off with an ellipsis; only when it is cut off, the app wraps it in a [Tooltip](../tooltip/tooltip.md) that shows it whole on hover (not a native `title`); `PreviewCardTitle` doesn't add one itself. Not in `foreground-link`: the card is not a link itself, its buttons and the chip are.
3. **Where does it stand?** `PreviewCardMeta`: one state chip in the app's words, such as Merged, then one muted line of details, such as "Martin · +803 −498". Separate the details on one line with "·", but put none next to the state chip: the chip is set apart by its own fill.
4. **What can I do?** `PreviewCardActions`: up to two buttons the app provides, on one line at the card's end:
   - The app's action buttons (Approve), the first two in the app's order. With none, the first link (Open in Stamp ↗) takes the row instead.
   - Frameless buttons first, the bordered one last, at the right end.
   - Everything else, such as Refresh, further links and any further action, goes in a More menu (⋯) to the left of them, in the app's order, never wrapped onto a second line and never dropped. A link in the menu is a link item with the leaving mark (↗). The menu opens aligned to its button's end (`align="end"`), so it stays over the card.
5. **Who says so?** `PreviewCardFooter`: the app's name and the link's host, "Stamp · stamp.build".

```example
preview-card/preview-card-app-item
```

Before the reader has allowed the app, the chip stays gray with its address and has no card: a card is read-only, and its buttons can't be reached by keyboard or touch. Clicking, tapping or pressing Enter on the chip opens a [Popover](../popover/popover.md) that asks instead, the same on every device: a question as the title, a sentence on what allowing it does, Open link to go without previews, and Show previews. It is a popover about the item (`size="item"`, [Popover](../popover/popover.md#about-an-item)): 400px, with the item card's 12px inset and title, so the question looks like the card it leads to (stdrc, 2026-11-10). A profile card is about a person, not an item, and keeps its 16px.

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
- Use sentence case on the buttons: Message, View profile, Open in Stamp.

## Accessibility

- PreviewCard wraps the Base UI PreviewCard. It opens on hover and on focus of the trigger, and closes on Esc.
- The card is supplementary and doesn't open on touch, and its buttons can't be reached from the keyboard: focus moves on from the trigger, and the card closes. Make the trigger a real link, to the profile or to the app's item, so everything on the card is reachable another way: a button on an item card is a shortcut to something on the page the link opens, such as View changes on a pull request.

## Rules

- Keep the card read-only: no fields, no choices. Something people fill in is a [Popover](../popover/popover.md).
- Put at most two small buttons on it, on one row: never pink, the confirm button in ink-border (`variant="outline"`) and the other frameless, as in a card in a message ([Cards in messages](../../../../../design/patterns/cards-in-messages.md#buttons)).
- Show the item's state once, in the app's own words, in a neutral Badge (`appearance="soft"`): no status color and no status light. Which states an item has, and what they mean, is the app's concept, not Raft's; Raft's status colors and the status light mean task and presence states ([Status](../status/status.md#rules)), so mapping an app's "Merged" onto a task's "done" would put Raft's reading on the app's word.
- A line the app marks as a warning (`tone: "warning"`, such as "2 checks failing") reads in `warning-strong`, as raft-ui's own warning lines do. This is Raft's color for a warning, not the app's for a state: the state's Badge stays neutral, and nothing else on the card is colored.
- Put no colors of the app's on an item card: no brand color, no colored header. The app's icon on the chip is the only mark of its own.
