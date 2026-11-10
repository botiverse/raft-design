---
title: Cards in messages
summary: How every card in a message and every item popover is drawn from one set of recipes — one frame with a 12px inset, two widths, a source row, a 2-line title, a row of state and details, and one row of at most two buttons at the bottom end — so changing one card changes them all.
---

# Cards in messages

A message can carry many kinds of card: an app link's block card, an Artifact, an action card waiting for approval, a forwarded bundle, the replies to it. Read one after another in a conversation, they are one family: the same frame, the same inset, the same title, the same place for the state and the buttons. A reader who has learned one reads the next without looking for where things are, and a card from an app can't stand out from Raft's own by its shape.

They stay one family because they are drawn from one place. The frame and its two widths are [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md)'s recipe, and the parts inside, the source row, the title, the details, the buttons and the inset, are the `messageCard` recipe beside it (`packages/ui/src/components/message-embed/message-embed.recipe.ts`). A card component takes its styles from them and writes none of its own, and a test fails on a card that does ([One place for the styles](#one-place-for-the-styles)). Change a value there, and every card and every item popover follows.

## When it applies

Every card drawn in a message, under its text: [AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md), [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), a link card or an Artifact card on [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), and a new kind of card. And the popovers about an item ([Popovers](#popovers)): the item card a link opens on hover ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`) and the question an app's link asks before it shows previews ([Popover](../../packages/ui/src/components/popover/popover.md) `size="item"`), which draw the same parts in their own popover frame.

[MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md) takes a content card's width but not its frame: it is a filled, borderless block, 10px from its sides and 8px from its top and bottom, not a framed card with a 12px inset. It is a summary of the thread under the message, read as part of the message, not an item of its own: a hairline and a card's inset would make every message with replies look as if it carried a second card, and the fill alone already sets it apart and shows that it opens (stdrc, 2026-11-10).

It doesn't cover a file or an image ([MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)): a file is a tile with its name, not a card with a title, and media keep the gallery's sizes. A quoted message is a bar beside the text, not a card ([MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md)). A profile card is about a person, not an item, and keeps its own layout. A [Card](../../packages/ui/src/components/card/card.md) on a page is not a card in a message: don't put one in a message.

## Structure

From top to bottom, each part optional except the frame and the title:

1. **The frame**: `MessageEmbed`, a `line-hairline` border, `radius-container` and `layer-card`, no shadow.
2. **The source row**: where the card comes from, the app's icon and name, then "·" and the host, under a hairline (`AppLinkCardHeader`).
3. **The body**, 12px from the frame's edges: an id line in Space Mono, then the title, then a row with the state and the details.
4. **The buttons**, on one row at the bottom end of the card.

```example
app-link-card/compositions/in-message
```

## Rules

### One frame, one inset

- Build every card on `MessageEmbed`: its frame is the only one a card in a message has. Not a [Card](../../packages/ui/src/components/card/card.md), and no frame of a card's own: a second frame would differ in a pixel of radius or a shade of line, and the family would come apart.
- Keep 12px between the frame's sides and everything in it, and 12px above and below the body and the buttons (`messageCard`'s `body`, `actions` and `inset`). The source row and a card's header and footer rows keep 12px at the sides and 8px above and below: they are one line of caption, not a block. A card that sets 16px on the same frame looks emptier than the one above it for no reason; 12px is what the action cards and forwarded bundles already had, and the tightest that still lets a two-line title breathe.
- Don't put a card inside a card. A card that needs to ask a question in a popover draws its question in the popover, with the same parts.

### Two widths

A card has one of two widths, set with `MessageEmbed`'s `size`, and never a width of its own:

| The card | `size` | Width |
| --- | --- | --- |
| Opens one thing: an app link, an Artifact, an action or approval, a web page | `item` | At most 400px; the message's width on a phone |
| Shows other messages: a forwarded bundle, the replies | `content` | As wide as the message's text, at most 560px |

- An item card is as wide as the item popover, so the same item reads the same in the message and on hover. It doesn't grow with the window: a two-line title stretched across a wide message reads as one long line, and the buttons drift away from it.
- On a phone an item card takes the message's whole width, so its buttons get the room a finger needs. It switches at the page shell's 768px, not on a container query: below 768px the shell lays out the phone's conversation, whose message column is the window less its gutters, so there the window's width is the column's ([Switch on the region's width](./responsive.md#switch-on-the-regions-width)). It doesn't switch on touch: a tablet over 768px is touch, but its message column is a desktop's, where a 400px card already leaves its buttons the 44px target every button has.
- A content card holds text, so it runs with the text it sits under, and stops at 560px, where a line of 14px text reaches about 70 characters: past that a line gets too long to read, and the eye loses the start of the next one.

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
- [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) keeps its state at the end of its header, its status pixel and word: the card folds to its header once it is resolved, and the state has to stay in view then.

### Buttons

- Put the buttons on one row at the bottom end of the card (`messageCard`'s `actions`), at most two: the frameless one first, the bordered one last. The row never wraps: a second row of buttons reads as a second card. A third action and every further one go in a More menu (⋯) to the left of the two; the card's author supplies that menu (a [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) on an icon button), and the row draws none of its own. A note before the buttons, such as an action card's, moves above them when there's no room beside them; the buttons stay on their row.
- Don't use the brand's primary button on a card: a card sits among people's words, and a pink button there shouts over them. The one that confirms is the bordered one.

### Popovers

A popover belongs to the family of what it is about, not to the family of popovers. A popover about an app's item is the same card, floating: its own popover frame and shadow, the item card's 400px, and inside it the same parts from `messageCard`, the body, the title, the details and the buttons, with the same 12px inset. A reader who hovers a link and then sees its block card in a later message reads the same thing twice. Two popovers are about an item:

- the item card a link opens on hover ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`);
- the question the same link asks, before the reader has allowed the app, whether to show its previews ([Popover](../../packages/ui/src/components/popover/popover.md) `size="item"`). It stands in for the item card the chip will open once allowed, so it looks like it, not like the other popovers (stdrc, 2026-11-10).

The trade-off is that these two sit 4px tighter than every other popover, which keeps 16px ([Popover](../../packages/ui/src/components/popover/popover.md#rules)): a popover with a field or a choice is a small step of its own, and a profile card is about a person, not an item, so both keep the popover's inset. One thing differs from a card in a message: a popover puts its source, the app and the host, in a caption under a hairline at the bottom (`messageCard`'s `sourceFooter`, PreviewCardFooter), not in a row at the top, so the title is the first thing under the pointer.

## One place for the styles

The rules above are values in two recipes, and the components only use them:

- `messageEmbed`: the frame and its `size` (`item`, `content`).
- `messageCard`: `source` and its icon, name and host; `sourceFooter`, the source as a popover's caption; `body`; `eyebrow`; `title` and `heading` (the title's type alone, for a title that shares a row); `meta`; `actions` and `actionRow`; `inset`; `popover`, the item popover's width.

Both are exported from `@botiverse/raft-ui`, beside MessageEmbed, so an app's own card (an Artifact card, an audio card) takes the same parts: `messageCard().title()`, `messageCard().meta()`, and the width from `MessageEmbed size`.

`packages/ui/src/card-styles.test.ts` reads every component folder that builds on MessageEmbed, PreviewCard or these recipes, found by what its code uses rather than from a list, so a new card is read the day it is written. It fails on any class there that writes a card's radius, a width (`max-w-md`, `w-[440px]`), an inset of 8px or more (`p-2.5`, `px-4`, `px-[14px]`) or a title size (`text-headline`, `text-[17px]`) by hand, and names the file, the line and the class, with a message that points at these recipes. Its exceptions are listed by file and class, each with its reason: the profile card, a plain popover, MessageReplies' summary and the parts inside a card that aren't the card's (a permission tile, a property's label). To change how cards look, change the recipe; to add a card, build it on the recipe, and the test keeps it there.

## Wide and narrow

- Below 768px an item card takes the message's full width. A content card is already as wide as the text.
- An item popover doesn't open on a phone: a tap opens the link ([App links](./navigation.md#app-links)).

## Related

- [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), [AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md), [PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md), [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), [MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)
- [Navigation: app links and block cards](./navigation.md#app-links)
- [Built from existing parts](../components/overview.md#built-from-existing-parts)
