---
title: AppLinkCard
summary: The card of an app link drawn in the message itself, where the app's answer lists one, with Raft's header naming the app, the item in the app's words, and buttons that work by keyboard and touch.
status: experimental
aliases: [Block card, App card]
layer: collaboration
category: messages
related: [preview-card, message-item, message-embed, skeleton]
---

# AppLinkCard

An app link's card drawn in the message, after the link's paragraph, for an answer whose `items` list a `card` with `placement: "block"` (protocol version 3). It shows the item as the hover card does ([PreviewCard](../preview-card/preview-card.md#item-card)), under a header in which Raft names the app; its title opens the item, and its buttons can be pressed right there, by mouse, keyboard or touch. The card never replaces the link: the link stays as the answer lists it, a chip with `inline` and the author's plain link without. What an answer lists, where the card goes in a message, and when Raft draws none are in [Navigation](../../../../../design/patterns/navigation.md#block-cards).

```example
app-link-card/compositions/with-actions
```

## When to use

| Situation                                                          | Use                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| An app link whose answer lists a block card, in the message itself | AppLinkCard                                                             |
| The same answer, while Raft fetches it again from its cache        | `AppLinkCardPlaceholder`                                                |
| An answer that lists `inline`, wherever the link is drawn          | A chip ([MessageItem](../message-item/message-item.md#app-links))       |
| An answer that lists a hover card                                  | An item card ([PreviewCard](../preview-card/preview-card.md#item-card)) |
| A link to a page no app previews                                   | A link card ([MessageEmbed](../message-embed/message-embed.md))         |

## Anatomy

All parts are experimental and exported from `@botiverse/raft-ui/wip`.

- `AppLinkCard`: the card, on the hairline frame of a link card. Required.
- `AppLinkCardHeader`: Raft's row at the top, under a hairline. Required: it says whose card this is.
  - `AppLinkCardIcon`: the app's registered icon, 16px.
  - `AppLinkCardName`: the app's name.
  - `AppLinkCardHost`: the link's host, after a "·".
- `AppLinkCardBody`: the item, 12px from the card's edges, as in every card in a message ([Cards in messages](../../../../../design/patterns/cards-in-messages.md#one-frame-one-inset)).
  - `AppLinkCardEyebrow`: the app's id for the item, in muted Space Mono, one line.
  - `AppLinkCardTitle`: the app's title, at `text-subhead`, up to 2 lines, then an ellipsis. Put a link to the item in it: the title opens the item.
  - `AppLinkCardMeta`: one state in a neutral Badge, then a muted line of details. It wraps when it runs out of room.
- `AppLinkCardActions`: the app's buttons, at the card's bottom end.
- `AppLinkCardPlaceholder`: in place of `AppLinkCard` while the answer loads. It holds the header and draws the item's lines and a button as gray bars.

The body is the hover card's: the same parts in the same order, with the same type and colors, drawn from the same recipe (`messageCard`), so a reader who has seen one reads the other and a change to one is a change to both. Three things differ, because this card is in the page: its title is a link to the item; a link to the item itself goes in ⋯ instead of taking a button's place; and its row takes the app's first two buttons whatever they are, where the hover card's takes only the app's actions (with none, its first link) and puts Refresh and further links in ⋯ ([PreviewCard](../preview-card/preview-card.md#item-card)). The hover card opens only under a pointer, for a glance at what someone can decide there; this card is read and used in place, by keyboard and touch too, so its row shows the app's buttons in the app's own order, and only the link the title already opens gives up its place.

```example
app-link-card/compositions/default
```

## States

While Raft fetches an answer it already holds from its cache, and that answer listed a block card, draw `AppLinkCardPlaceholder` after the link's paragraph at once, with the app's header in it. Its bars take the line heights of the parts they stand for, so it is the size of a card with a two-line title and a row of buttons, and the card that takes its place moves the message as little as it can. Without a cached answer, Raft doesn't know a link has a block card until its answer arrives: the link is drawn as any app link is until then, and the card is added after the paragraph when the answer lists one. The link itself never moves and is never replaced by the card ([Navigation](../../../../../design/patterns/navigation.md#block-cards)).

```example
app-link-card/compositions/loading-placeholder
```

A button the app marks disabled stays visible and disabled, as on the hover card.

## Behavior

- The card is an item card (`MessageEmbed size="item"`): as wide as the hover card, 400px, and never wider than the message. In the phone layout (below 768px) it takes the message's full width, so its buttons have the room a finger needs.
- It keeps the gap a table or an image keeps in the text, and none at the top or bottom of the message.
- The title wraps to 2 lines and then ends in an ellipsis; when it is cut off, the app wraps it in a [Tooltip](../tooltip/tooltip.md) that shows it whole, as on the hover card.
- The host, when it doesn't fit, loses its start, never its end: the end (`…review.attacker.example`) says where the link goes.
- The title's link stays in the title's ink, not link blue, and is underlined on hover, as a sender's name is: the whole title is the link, so it needs no color to say so.

```example
app-link-card/compositions/phone
```

## Content

- Fill the header from what Raft stores for the app: its registered icon and its name, then the link's host. Never from the answer.
- Write the app's words in the body as it sends them, and leave out a part it doesn't send rather than filling it with Raft's own.
- Put at most two buttons on the card: the app's first two buttons in its order, whatever they are (an action, Refresh, a link such as View changes), except a link to the item itself (below); frameless ones first and the bordered one last, at the end; everything else in a More menu (⋯) to their left, in the app's order, never wrapped onto a second line and never dropped. A link in the row ends in the leaving mark (↗) in the button's trailing icon place, and a link in the menu is a link item with ↗ where the shortcut goes ([Links that leave Raft](../../../../../design/patterns/navigation.md#links-that-leave-raft)).
- Make the title a link to the item, opening in a new tab, so the item opens from the card the way it opens from the chip. An Open link such as Stamp's Open in Stamp then goes in ⋯, never in the row: the title already opens the item, and the row keeps its two places for the app's other buttons. A link to the item itself is a link button whose address is the link's own, the one the title opens: the same address once both are read as URLs (as `new URL(…).href` gives them). A link to any other address, such as View changes, is one of the other buttons. A card with no other buttons has only ⋯.

## Accessibility

- `AppLinkCard` is a `group`. Label it with `aria-labelledby` pointing at the id of its `AppLinkCardTitle`: someone who tabs to Approve then hears which item it approves, not a bare button among the message's words.
- Unlike the hover card, this card is in the page: its title's link, ⋯ and its buttons are real links and buttons, in the message's tab order in that order, the order they sit in from left to right (⋯ is to the buttons' left), and work by keyboard and touch.
- The header comes first in the DOM, so a screen reader reads the app's name before the app's words.
- `AppLinkCardPlaceholder` is `aria-busy` and its bars are hidden from assistive technology; the header in it is read.

## Rules

- Always show the header, drawn by Raft from what it stores for the app, never from the card's content. The card sits in the message beside people's own words, and its buttons work there: without Raft's frame naming the app, an app's card could pass for a system message or for someone's words.
- Lead the header with the app's registered icon, never an image from an address the app sends: an image fetched from the app on every view tells it who read the message and when, and an app could draw an icon that passes for one of Raft's own.
- Put no colors of the app's on the card: no brand color, no colored header. Show the item's state once, in the app's words, in a neutral Badge (`appearance="soft"`), as on the hover card ([PreviewCard](../preview-card/preview-card.md#rules)).
- Keep the card's width at the hover card's 400px on desktop. A card the width of the message would stretch a two-line title into one long line on a wide window, and set it apart from every other card in the message.

### The confirmation for an app Raft hasn't reviewed

When someone presses an acting button on the card of an app that Raft hasn't reviewed (one made in the server, not an official app), Raft confirms the press in its own dialog ([AlertDialog](../alert-dialog/alert-dialog.md)) before the app is called. This includes a button that has an undo window.

- Make the first line of the dialog's body, under the title, Raft's "Run by {App}" line: the app's registered icon (`AppLinkCardIcon`, in the card's frame), then "Run by {App}" in small semibold type. The line truncates rather than wraps. Keep 12px between it and the rest of the body.
- Show the line for every acting button of an app Raft hasn't reviewed, including buttons with an undo window. Never show it for an official app.
- End the body with Raft's line saying the app was made in this server, isn't reviewed by Raft, and receives the person's name ("{App} was made in this server and isn't reviewed by Raft. It gets your name and acts with its own access.").
- Draw both lines from what Raft stores for the app, never from the app's answer. The app writes the title and the body between them, so an app could word those to pass for Raft. These two lines are the only place where the person learns that Raft hasn't reviewed the app and that it will get their name (Tenny, 2026-11-10, #proj-apps:#60). In the web app this is slock #13956, `LinkCardActions.tsx` (`LinkCardConfirmDialog`).
