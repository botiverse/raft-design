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
  - `CommentCardTrigger`: a button over the whole card that opens it. Optional; only on a collapsed card.
  - The reply box is a [Composer](../composer/composer.md) (`ComposerRoot`, `Composer`, `ComposerInput`, `ComposerSubmit`), not a part of its own.
- `CommentMarker`: the button beside a passage on a narrow screen, with an `AvatarGroup` of up to 3 `size="2xs"` avatars and the count.
- `setCommentHighlights`, `COMMENT_HIGHLIGHT`, `COMMENT_HIGHLIGHT_ACTIVE`: highlight the passages ([Highlights](#highlights)).
- `resolveCommentMarginLayout`: the layout `CommentMargin` uses, for a caller that places cards itself.

The body is `text-callout`, not `text-body`: a comment is an aside to the document, and the document's own text is `text-body`. On a desktop both are 14/22, so they read the same; on a phone a card is a step smaller (14/20) than the document (16/24), the step between a message and its preview ([Typography](../../../../../design/foundations/typography.md#type-scale)). The header uses a message's styles ([MessageItem](../message-item/message-item.md)): bold name, then the time in Space Mono.

## States

```example
comment/compositions/card-states
```

| State                 | Look                                                                                                                                         |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Collapsed             | The first comment, its text cut to 2 lines (`clamp`), and the number of replies in `CommentCardMeta`. `CommentCardTrigger` opens it          |
| Active                | `active`: a 1.5px `line-strong` border and `shadow-float`, lifted off the margin. Every comment, and the reply box when the person can reply |
| On the whole document | `CommentCardMeta` first, saying so. Its `CommentMarginItem` has `top={0}`                                                                    |
| Position not found    | `CommentCardMeta` first, saying the passage can no longer be found. Its `CommentMarginItem` has `top={0}`                                    |

Which parts a card holds is the caller's choice: raft-ui has no `collapsed` or `expanded` prop. Render `clamp`, the reply count and `CommentCardTrigger` for a collapsed card; every entry and the Composer for an open one.

## Behavior

- Each card sits at its `top`, level with the first line of its passage. When cards would overlap, they keep the document's order (by `top`, then by order in the DOM) and each moves down to 8px (`gap`) under the card before it.
- The active card stays at its `top`, and the cards above it move up to make room, never above the margin's top; the cards below it move down. When the cards above don't fit, they stack from the top and the active card follows them. This is Google Docs' behavior: the discussion people are reading stays beside its passage.
- Cards are measured with a `ResizeObserver`, so a card that opens or gets a reply moves the ones below it. The resolved top is the item's `style.top` and `data-top`. A move after the first placement takes 150ms, and none under reduced motion.
- `top` is the caller's measurement: the top of the passage's first line box (`range.getClientRects()[0].top`) minus the margin's top. Measure again when the document or the margin changes size, since the text rewraps.
- Where the margin doesn't fit, put a `CommentMarker` beside each passage instead, in a 72px `CommentMargin` (room for three avatars and the count) so markers don't overlap either, and open the discussion in a bottom sheet ([Drawer](../drawer/drawer.md)).

```example
comment/compositions/marker-sheet
```

### Highlights

The passages are highlighted with the CSS Custom Highlight API: `setCommentHighlights(name, ranges)` registers `Range`s under a highlight name, and styles.css paints them. It never wraps the document's text in an element, so the document's DOM, its selection and its find in page stay as they were.

- Register every passage with comments under `COMMENT_HIGHLIGHT` (`raft-comment`): `brand-soft` with a 2px `brand` underline.
- Register the active one under `COMMENT_HIGHLIGHT_ACTIVE` (`raft-comment-active`) instead: `brand` with ink type, in both modes, like a search hit.
- Call the function it returns to clear the highlight. In a browser without `CSS.highlights` it does nothing, and the cards still sit beside their passages.

## Content

- Write `CommentCardMeta` in sentence case, as a fact: "2 replies", "On the whole document", "Position not found".
- Write the time as in a message header, in the person's 12-hour or 24-hour choice: 11:02 today, Yesterday 17:20 before that ([Writing](../../../../../design/content/writing.md#times)).

## Accessibility

The parts are plain elements built with Base UI `useRender`; `CommentMarker` wraps Base UI `Button`.

- Render the margin as a landmark with a name: `render={<aside aria-label="Comments" />}`. Keep the items in document order in the DOM, so Tab and a screen reader follow the document.
- Give `CommentCardTrigger` an `aria-label` that says whose comment it opens ("Comment from Martin"); the card's text stays readable around it.
- When a card opens from the keyboard (a click with `detail === 0`), move focus into its reply box. Esc closes an open card and returns focus to its trigger.
- `active` sets `aria-current="true"` on the card.
- Give `CommentMarker` an `aria-label` that starts with the count it shows ("2 comments"). The bottom sheet it opens needs a `DrawerTitle`.
- Give `CommentEntryTime` the moment in `dateTime` (ISO 8601).

## Rules

- Show nothing where there are no comments: no empty margin, no marker.
- Put each card level with its passage; never list anchored comments in a column of their own order.
- Open one discussion at a time; only the active card shows the reply box, so its send button is the one pink button ([Button](../button/button.md#which-color)).
- Use the Composer for the reply box ([Composer](../composer/composer.md)); don't build another input.
