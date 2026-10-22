---
title: Comment
summary: Comments beside a document, Google Docs style — a margin of cards each level with the passage it is about, the card of one discussion, its comments, and the marker that replaces the margin on a narrow screen.
status: experimental
aliases: [CommentMargin, CommentCard, CommentMarker, Margin comments, Document comments]
layer: collaboration
category: messages
related: [drawer, composer, avatar, card, message-item]
---

# Comment

The parts for comments on a document: `CommentMargin` lays out a column of `CommentCard`s beside the document, each level with the passage it is about; `CommentEntry` is one comment in a card; `CommentMarker` replaces the margin where it doesn't fit. When and how a product shows comments is in [Comments](../../../../../design/patterns/comments.md); this page covers the parts.

```example
comment/compositions/margin
```

## When to use

| Situation                                                                       | Use                                                                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Comments on a document or on passages of it, in a viewer with room for a margin | `CommentMargin` with a `CommentCard` per discussion                                                  |
| The same comments where the margin doesn't fit                                  | A `CommentMarker` beside each passage, opening a bottom sheet ([Drawer](../drawer/drawer.md))        |
| A reply to a message in a conversation                                          | A thread ([ThreadPanel](../thread-panel/thread-panel.md)), not a comment                             |
| The number of comments on a file, on its card in a message                      | `MessageAttachmentCommentSummary` ([MessageAttachment](../message-attachment/message-attachment.md)) |

## Anatomy

- `CommentMargin`: the column beside the document, `position: relative`, as tall as its lowest card. Required for the margin.
  - `CommentMarginItem`: one card's place. `top` is where its anchor is, in px from the margin's top; `active` pins it there. Required for each card.
- `CommentCard`: one discussion, on `layer-card` with a `line-hairline` border and `radius-container`. `active` marks the open one.
  - `CommentCardMeta`: a line in `text-caption` and `foreground-hint` with the caller's words: "2 replies", "On the whole document", "Position not found". Optional.
  - `CommentEntry`: one comment. At least one.
    - `CommentEntryHeader`: the author's [Avatar](../avatar/avatar.md) at `size="xs"`, `CommentEntryAuthor` (`text-subhead`, bold) and `CommentEntryTime` (Space Mono, `text-mono-meta`, `foreground-hint`), a `<time>`.
    - `CommentEntryBody`: the text, in `text-callout`. `clamp` cuts it to 2 lines.
  - `CommentCardQuote`: the passage the discussion is about, in the caller's words, visually hidden (`sr-only`). Point the trigger's or the marker's `aria-describedby` at it. Optional, but give every anchored discussion one.
  - `CommentCardTrigger`: a button over the whole card that opens it. Optional; only on a collapsed card.
  - The reply box is a [Composer](../composer/composer.md) (`ComposerRoot`, `Composer`, `ComposerInput`, `ComposerSubmit`), not a part of its own.
- `CommentMarker`: the button beside a passage on a narrow screen, with an `AvatarGroup` of up to 3 `size="2xs"` avatars and the count.
- `useCommentMarginFits(viewer, { minWidth })`: whether the viewer has room for the margin ([Wide and narrow](#wide-and-narrow)).
- `setCommentHighlights`, `COMMENT_HIGHLIGHT`, `COMMENT_HIGHLIGHT_ACTIVE`: highlight the passages ([Highlights](#highlights)).
- `resolveCommentMarginLayout`: the layout `CommentMargin` uses, for a caller that places cards itself.

The body is `text-callout`, not `text-body`: a comment is an aside to the document, and the document's own text is `text-body`. On a desktop both are 14/22, so they read the same; on a phone a card is a step smaller (14/20) than the document (16/24), the step between a message and its preview ([Typography](../../../../../design/foundations/typography.md#type-scale)). The header uses a message's styles ([MessageItem](../message-item/message-item.md)): bold name, then the time in Space Mono.

## States

```example
comment/compositions/card-states
```

| State                 | Look                                                                                                                                                                                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Collapsed             | The first comment, its text cut to 2 lines (`clamp`), and the number of replies in `CommentCardMeta`. `CommentCardTrigger` opens it                                                                                                                                                                              |
| Hovered               | `CommentCardTrigger` lays `fill-subtle` over the collapsed card, the subtle tier of a row: the card is read while the pointer rests on it, so the hover is a small step and leaves the text as it was ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)). A press is `fill-medium` |
| Active                | `active`: a 1.5px `line-strong` border and `shadow-float`, lifted off the margin. Every comment, and the reply box when the person can reply                                                                                                                                                                     |
| On the whole document | `CommentCardMeta` first, saying so. Its `CommentMarginItem` has `top={0}`                                                                                                                                                                                                                                        |
| Position not found    | `CommentCardMeta` first, saying the passage can no longer be found. Its `CommentMarginItem` has `top={0}`, after the whole document's                                                                                                                                                                            |

Which parts a card holds is the caller's choice: raft-ui has no `collapsed` or `expanded` prop. Render `clamp`, the reply count and `CommentCardTrigger` for a collapsed card; every entry and the Composer for an open one.

## Behavior

- Each card sits at its `top`, level with the first line of its passage. When cards would overlap, they keep the document's order (by `top`; items with the same `top` keep the order they were first rendered in) and each moves down to 8px (`gap`) under the card before it.
- The active card stays at its `top`, and the cards above it move up to make room, never above the margin's top; the cards below it move down. When the cards above don't fit, they stack from the top and the active card follows them. This is Google Docs' behavior: the discussion people are reading stays beside its passage.
- The margin measures its cards with one `ResizeObserver`, so a card that opens or gets a reply moves the ones below it. The resolved top is the item's `data-top`, applied as `transform: translateY()`, so a move doesn't lay the margin out again; it takes 150ms after the first placement, and none under reduced motion. The transform makes the item the containing block of anything `position: fixed` inside it: portal popups out of the card.
- `top` is the caller's measurement: the top of the passage's first line box (`range.getClientRects()[0].top`) minus the margin's top. Measure again when the document or the margin changes size, since the text rewraps.
- Show a discussion whose passage can't be found in the document any more at the top, with the comments on the whole document, and say so in `CommentCardMeta`; never drop it ([Comments](../../../../../design/patterns/comments.md#rules)).

### Wide and narrow

Cards in a margin and markers with a bottom sheet are different trees, so the switch between them is made in JavaScript, not with a container query. `useCommentMarginFits(viewer)` returns true only on a desktop, from 768px with a mouse or a trackpad (`(width >= 48rem) and (pointer: fine)`, the query of every desktop metric), and while the viewer element, the one that holds the document and the margin, is at least 784px wide (`minWidth`). It watches the viewer with a `ResizeObserver`, so the layout changes when a sidebar or a thread opens beside it.

```example
comment/compositions/viewer
```

- Where it returns false, put a `CommentMarker` beside each passage instead, in a 72px `CommentMargin` (room for three avatars and the count) so markers don't overlap either, and open the discussion in a bottom sheet ([Drawer](../drawer/drawer.md)). The marker at the top holds the comments on the whole document and those whose position is lost.

```example
comment/compositions/marker-sheet
```

### Highlights

The passages are highlighted with the CSS Custom Highlight API: `setCommentHighlights(name, ranges)` registers `Range`s under a highlight name, and styles.css paints them. It never wraps the document's text in an element, so the document's DOM, its selection and its find in page stay as they were.

- Register every passage with comments under `COMMENT_HIGHLIGHT` (`raft-comment`): `brand` over the page (`color-mix`), 35% in light mode and 22% in dark, with a 2px `brand` underline. The two amounts are measured, not picked by eye: the passage has to stand out from the page, and the text on it has to stay easy to read for a long stretch (APCA Lc 75 or more, the level for body text). In light mode 35% keeps the text at Lc 96 (16.5:1). In dark mode `brand-soft`, a 16% wash meant for a menu row, left the passage almost the same as the page (1.18:1 between them); 35% made it stand out (2.6:1) but dropped the text to Lc 68; 22% keeps both, 1.8:1 against the page and Lc 77 (6.9:1) for the text.
- Register the active one under `COMMENT_HIGHLIGHT_ACTIVE` (`raft-comment-active`) instead: `brand` with ink type, in both modes, like a search hit.
- Call the function it returns to clear the highlight. In a browser without `CSS.highlights` it does nothing, and the cards still sit beside their passages.
- The names are global to the page: registering a name replaces what was registered under it. Let one viewer at a time own them, the one on screen, and clear them when it closes.

## Content

- Write `CommentCardMeta` in sentence case, as a fact: "2 replies", "On the whole document", "Position not found".
- Write the time as in a message header, in the person's 12-hour or 24-hour choice: 11:02 today, Yesterday 17:20 before that ([Writing](../../../../../design/content/writing.md#times)).

## Accessibility

The parts are plain elements built with Base UI `useRender`; `CommentMarker` wraps Base UI `Button`.

- Render the margin as a landmark with a name, after the document in the DOM: `render={<aside aria-label="Comments" />}`. Render its items in reading order: the whole document's, the lost ones, then by passage. The passages themselves can't be focused, so Tab leaves the document and goes through the cards (or the markers) top to bottom, and a screen reader's landmark list reaches them directly.
- The highlights carry no semantics. Say which passage a card is about with `CommentCardQuote` ("On “Re-run the guard suites on staging”"), pointed at by the `aria-describedby` of `CommentCardTrigger` or `CommentMarker`; for the whole document or a lost position, point it at the `CommentCardMeta` that says so as well.
- Give `CommentCardTrigger` an `aria-label` that says whose comment it opens ("Comment from Martin"); the card's text stays readable around it.
- Opening a card removes its trigger, so move focus into the open card: into its reply box when it was opened from the keyboard (a click with `detail === 0`), and to the card itself after a click (`tabIndex={-1}`, `focus({ preventScroll: true })`), so Esc still reaches it. Esc closes the card and returns focus to its trigger.
- `active` sets `aria-current="true"` on the card.
- Give `CommentMarker` an `aria-label` that starts with the count it shows ("2 comments"). The bottom sheet it opens needs a `DrawerTitle`.
- Give `CommentEntryTime` the moment in `dateTime` (ISO 8601).

## Rules

- Show nothing where there are no comments: no empty margin, no marker.
- Put each card level with its passage; never list anchored comments in a column of their own order.
- Open one discussion at a time; only the active card shows the reply box, so its send button is the one pink button ([Button](../button/button.md#which-color)).
- Use the Composer for the reply box ([Composer](../composer/composer.md)); don't build another input.
