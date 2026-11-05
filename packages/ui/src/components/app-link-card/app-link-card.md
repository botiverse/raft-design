---
title: AppLinkCard
summary: The card of an app link drawn in the message itself, where the app asks for it, with Raft's header naming the app, the item in the app's words, and buttons that work by keyboard and touch.
status: experimental
aliases: [Block card, App card]
layer: collaboration
category: messages
related: [preview-card, message-item, message-embed, skeleton]
---

# AppLinkCard

An app link's card drawn in the message, under the link's paragraph or in its place, for an answer in which the app asks for it (`placement: "block"`). It shows the same item as the hover card ([PreviewCard](../preview-card/preview-card.md#item-card)), under a header in which Raft names the app, and its buttons can be pressed right there, by mouse, keyboard or touch. Where the card goes in a message, and when Raft shows the chip instead, is in [Navigation](../../../../../design/patterns/navigation.md#block-cards).

```example
app-link-card/compositions/with-actions
```

## When to use

| Situation                                                           | Use                                                                     |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| An app link whose answer asks for a block, in the message itself    | AppLinkCard                                                             |
| The same answer, while Raft fetches it again from its cache         | `AppLinkCardPlaceholder`                                                |
| Any other app link, or the same link in a quote, search or Activity | A chip ([MessageItem](../message-item/message-item.md#app-links))       |
| The details of a chip, on hover                                     | An item card ([PreviewCard](../preview-card/preview-card.md#item-card)) |
| A link to a page no app previews                                    | A link card ([MessageEmbed](../message-embed/message-embed.md))         |

## Anatomy

All parts are experimental and exported from `@botiverse/raft-ui/wip`.

- `AppLinkCard`: the card, on the hairline frame of a link card. Required.
- `AppLinkCardHeader`: Raft's row at the top, under a hairline. Required: it says whose card this is.
  - `AppLinkCardIcon`: the app's registered icon, 16px.
  - `AppLinkCardName`: the app's name.
  - `AppLinkCardHost`: the link's host, after a "·".
- `AppLinkCardBody`: the item, 16px from the card's sides.
  - `AppLinkCardEyebrow`: the app's id for the item, in muted Space Mono, one line.
  - `AppLinkCardTitle`: the app's title, up to 2 lines, then an ellipsis.
  - `AppLinkCardMeta`: one state in a neutral Badge, then a muted line of details. It wraps when it runs out of room.
- `AppLinkCardActions`: the app's buttons, at the card's bottom end.
- `AppLinkCardPlaceholder`: in place of `AppLinkCard` while the answer loads. It holds the header and draws the item's lines and a button as gray bars.

The body and the buttons are the hover card's: the same parts in the same order, with the same type and colors. A reader who has seen one reads the other.

```example
app-link-card/compositions/default
```

## States

While Raft fetches an answer it already holds from its cache, and that answer asked for a block, draw `AppLinkCardPlaceholder` with the app's header in its place at once. Its bars take the line heights of the parts they stand for, so it is the size of a card with a two-line title and a row of buttons, and the card that replaces it moves the message as little as it can. Without a cached answer, Raft doesn't know a link asks for a block until its answer arrives: the link is a loading chip until then ([Navigation](../../../../../design/patterns/navigation.md#block-cards)).

```example
app-link-card/compositions/loading-placeholder
```

A button the app marks disabled stays visible and disabled, as on the hover card.

## Behavior

- The card is as wide as the hover card, 400px, and never wider than the message. In the phone layout (below 768px) it takes the message's full width, so its buttons have the room a finger needs.
- It keeps the gap a table or an image keeps in the text, and none at the top or bottom of the message.
- The title wraps to 2 lines and then ends in an ellipsis; when it is cut off, the app wraps it in a [Tooltip](../tooltip/tooltip.md) that shows it whole, as on the hover card.
- The host, when it doesn't fit, loses its start, never its end: the end (`…review.attacker.example`) says where the link goes.

```example
app-link-card/compositions/phone
```

## Content

- Fill the header from what Raft stores for the app: its registered icon and its name, then the link's host. Never from the answer.
- Write the app's words in the body as it sends them, and leave out a part it doesn't send rather than filling it with Raft's own.
- Put the buttons as on the hover card: the app's actions, the first two in its order, frameless ones first and the bordered one last, at the end; with no actions, the first link (Open in Stamp ↗) takes the row; everything else in a More menu (⋯) to their left ([PreviewCard](../preview-card/preview-card.md#item-card)).

## Accessibility

- `AppLinkCard` is a `group`. Label it with `aria-labelledby` pointing at the id of its `AppLinkCardTitle`: someone who tabs to Approve then hears which item it approves, not a bare button among the message's words.
- Unlike the hover card, this card is in the page: its buttons are real buttons and links, in the message's tab order, and work by keyboard and touch.
- The header comes first in the DOM, so a screen reader reads the app's name before the app's words.
- `AppLinkCardPlaceholder` is `aria-busy` and its bars are hidden from assistive technology; the header in it is read.

## Rules

- Always show the header, drawn by Raft from what it stores for the app, never from the card's content. The card sits in the message beside people's own words, and its buttons work there: without Raft's frame naming the app, an app's card could pass for a system message or for someone's words.
- Lead the header with the app's registered icon, never an image from an address the app sends: an image fetched from the app on every view tells it who read the message and when, and an app could draw an icon that passes for one of Raft's own.
- Put no colors of the app's on the card: no brand color, no colored header. Show the item's state once, in the app's words, in a neutral Badge (`appearance="soft"`), as on the hover card ([PreviewCard](../preview-card/preview-card.md#rules)).
- Keep the card's width at the hover card's 400px on desktop. A card the width of the message would stretch a two-line title into one long line on a wide window, and set it apart from every other card in the message.
