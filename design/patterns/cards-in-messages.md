---
title: Cards in messages
summary: How every card in a message and every item popover is drawn from one set of recipes — one frame with a 12px inset, two widths, a source row, a 2-line title, a row of state and details, and at most two buttons at the bottom end — so changing one card changes them all.
---

# Cards in messages

A message can carry many kinds of card: an app link's block card, an Artifact, an action card waiting for approval, a forwarded bundle, the replies to it. Read one after another in a conversation, they are one family: the same frame, the same inset, the same title, the same place for the state and the buttons. A reader who has learned one reads the next without looking for where things are, and a card from an app can't stand out from Raft's own by its shape.

They stay one family because they are drawn from one place. The frame and its two widths are [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md)'s recipe, and the parts inside, the source row, the title, the details, the buttons and the inset, are the `messageCard` recipe beside it (`packages/ui/src/components/message-embed/message-embed.recipe.ts`). A card component takes its styles from them and writes none of its own, and a test fails on a card that does ([One place for the styles](#one-place-for-the-styles)). Change a value there, and every card and every item popover follows.

## When it applies

Every card drawn in a message, under its text: [AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md), [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), [MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md), a link card or an Artifact card on [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), and a new kind of card. And the item card a link opens on hover ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`), which draws the same parts in its own popover frame.

It doesn't cover a file or an image ([MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)): a file is a tile with its name, not a card with a title, and media keep the gallery's sizes. A quoted message is a bar beside the text, not a card ([MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md)). A profile card is about a person, not an item, and keeps its own layout. A [Card](../../packages/ui/src/components/card/card.md) on a page is not a card in a message: don't put one in a message.

## Structure

From top to bottom, each part optional except the frame and the title:

1. **The frame**: `MessageEmbed`, a `line-hairline` border, `radius-container` and `layer-card`, no shadow.
2. **The source row**: where the card comes from, the app's icon and name, then "·" and the host, under a hairline (`AppLinkCardHeader`).
3. **The body**, 12px from the frame's edges: an id line in Space Mono, then the title, then a row with the state and the details.
4. **The buttons**, at the bottom end of the card.

```example
app-link-card/compositions/in-message
```

## Rules

### One frame, one inset

- Build every card on `MessageEmbed`: its frame is the only one a card in a message has. Not a [Card](../../packages/ui/src/components/card/card.md), and no frame of a card's own: a second frame would differ in a pixel of radius or a shade of line, and the family would come apart.
- Keep 12px between the frame and everything in it: the source row, the body and the buttons (`messageCard`'s `body`, `actions` and `inset`). A card that sets 16px on the same frame looks emptier than the one above it for no reason; 12px is what the action cards and forwarded bundles already had, and the tightest that still lets a two-line title breathe.
- Don't put a card inside a card. A card that needs to ask a question in a popover draws its question in the popover, with the same parts.

### Two widths

A card has one of two widths, set with `MessageEmbed`'s `size`, and never a width of its own:

| The card | `size` | Width |
| --- | --- | --- |
| Opens one thing: an app link, an Artifact, an action or approval, a web page | `item` | At most 400px; the message's width on a phone |
| Shows other messages: a forwarded bundle, the replies | `content` | As wide as the message's text, at most 560px |

- An item card is as wide as the item popover, so the same item reads the same in the message and on hover. It doesn't grow with the window: a two-line title stretched across a wide message reads as one long line, and the buttons drift away from it.
- On a phone an item card takes the message's whole width, so its buttons get the room a finger needs.
- A content card holds text, so it runs with the text it sits under, and stops where a line gets too long to read.

### Source

- Give a card that shows another party's content a source row: the app's registered icon and name, then the host. Raft draws it from what it stores for the app, never from the card's content, so an app's card can't pass for a person's words or for Raft's own ([Block cards](./navigation.md#block-cards)).
- The host loses its start when it doesn't fit, never its end: the end says where the link goes.
- A card Raft draws itself, such as an action card, has no source row.

### Title

- The title is `text-subhead`, bold, in ink, up to 2 lines and then an ellipsis (`messageCard`'s `title`). Every card's title is the same size, so none outranks the message it sits in, and two cards side by side line up.
- The title opens the item: put the link in it. Its link keeps the title's ink and is underlined on hover, like a sender's name.
- A card with no buttons opens as a whole (`MessageEmbed interactive`): it hovers and presses like a file card, and its title's link covers it.

### State and details

- Put the state under the title, in a neutral soft [Badge](../../packages/ui/src/components/badge/badge.md), then the details in `foreground-muted`, wrapping when they run out of room (`messageCard`'s `meta`). The state is the app's word for where the item stands, not one of Raft's status colors.
- [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) keeps its state at the end of its header, a pixel and a word: the card folds to its header once it is resolved, and the state has to stay in view then.

### Buttons

- Put the buttons at the bottom end of the card (`messageCard`'s `actions`), at most two: the frameless one first, the bordered one last. The rest go in a More menu (⋯) to their left, never onto a second row.
- Don't use the brand's primary button on a card: a card sits among people's words, and a pink button there shouts over them. The one that confirms is the bordered one.

### Popovers

An item popover ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`) is the same card, floating: its own popover frame and shadow, the item card's 400px, and inside it the same parts from `messageCard`, the body, the title, the details and the buttons, with the same 12px inset. A reader who hovers a link and then sees its block card in a later message reads the same thing twice.

## One place for the styles

The rules above are values in two recipes, and the components only use them:

- `messageEmbed`: the frame and its `size` (`item`, `content`).
- `messageCard`: `source` and its icon, name and host; `body`; `eyebrow`; `title` and `heading` (the title's type alone, for a title that shares a row); `meta`; `actions` and `actionRow`; `inset`; `popover`, the item popover's width.

`packages/ui/src/card-styles.test.ts` reads the code of every card component and fails when one writes the card's radius, a width, the 12px or 16px inset or a title size itself, with a message that points at these recipes. Its list of exceptions names the cards not on the recipes yet and the values that aren't a card's (a file tile, media, a profile card), each with its reason. To change how cards look, change the recipe; to add a card, build it on the recipe, and the test keeps it there.

## Wide and narrow

- Below 768px an item card takes the message's full width. A content card is already as wide as the text.
- An item popover doesn't open on a phone: a tap opens the link ([App links](./navigation.md#app-links)).

## Related

- [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), [AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md), [PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md), [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), [MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)
- [Navigation: app links and block cards](./navigation.md#app-links)
- [Built from existing parts](../components/overview.md#built-from-existing-parts)
