---
title: Comments
summary: Where comments on a document go — in the margin, level with the passage they are about, as in Google Docs — and what replaces the margin on a narrow screen.
---

# Comments

People comment on a document to discuss one passage of it, so a comment belongs beside that passage. In a document viewer, comments sit in the right margin, each card level with the passage it is about, and the passage is highlighted. Where there is no room for a margin, a marker beside the passage opens the discussion in a bottom sheet. This is how Google Docs, Feishu Docs and Word show comments; people already know it, so Raft doesn't do it differently.

## When it applies

Comments on a document Raft renders itself: a Markdown, text or code file in the file viewer ([Built from existing parts](../components/overview.md#file-viewer)), and any later document surface. It doesn't cover replies to a message, which are a thread ([Conversation](./conversation.md#threads)), or a file whose content Raft can't measure, such as a page in a sandboxed frame.

## Structure

```example
comment/compositions/margin
```

- The document, then the margin to its right: a [CommentMargin](../../packages/ui/src/components/comment/comment.md) of `CommentCard`s, each `CommentMarginItem` placed at the top of its passage.
- In each card, the comments ([CommentEntry](../../packages/ui/src/components/comment/comment.md#anatomy)), a line with the number of replies when collapsed, and the reply box ([Composer](../../packages/ui/src/components/composer/composer.md)) when open.
- In the document, the commented passages, highlighted without changing the document's DOM ([Highlights](../../packages/ui/src/components/comment/comment.md#highlights)).

## Rules

- Show nothing where there are no comments: no empty margin, no placeholder, no marker. The document is what people came to read.
- Put each card level with the first line of its passage, so the eye goes straight across from the text to what was said about it. When two cards would overlap, the lower one moves down; cards never cover each other.
- Highlight every commented passage in the soft yellow of a highlight (`brand-soft`), and the passage of the open discussion in full yellow with ink type: the open discussion is the one the person selected, and yellow is what you selected ([Color](../foundations/color.md#meanings-of-color)).
- Open one discussion at a time. Its card gets an ink border and lifts off the margin (`shadow-float`), stays level with its passage, and the other cards move out of its way. The open card is the one people read and type in; the others are a list of where else there is something to read.
- Show a collapsed card as its first comment, cut to 2 lines, and the number of replies. Opening it shows every comment and the reply box. A margin of full discussions would push every card far from its passage.
- Put the comments on the whole document once, at the top of the margin, with a line that says so. Don't repeat the file's name on each card: the viewer already shows it.
- Put a comment whose passage can no longer be found (the document changed under it) at the top of the margin too, with a line that says so ("Position not found"). Never drop it, and never attach it to whatever text is there now: the comment is still part of the discussion, and a wrong anchor says something nobody said.
- Reply in the [Composer](../../packages/ui/src/components/composer/composer.md) inside the open card, with the pink send button: only the open card has one, so it is the screen's one pink button.
- Close the open card with Esc, or by opening another one.

## Wide and narrow

The margin needs 304px beside the document: a 280px column of cards and 24px between it and the document. Show it only while the document keeps at least 480px, about 60 characters of text per line, so from a viewer 784px wide, and only on a desktop: from 768px with a mouse or a trackpad, the condition of every desktop metric ([Spacing](../foundations/spacing.md#hit-targets)). A tablet used by touch gets the markers at any width, like a phone.

Measure the viewer, not the window: the viewer can sit beside a sidebar or a thread ([Responsive layout](./responsive.md#when-a-row-runs-out-of-room)). Cards and markers are different structures, not one structure restyled, so the viewer measures its own width in JavaScript, with [`useCommentMarginFits`](../../packages/ui/src/components/comment/comment.md#wide-and-narrow), rather than with a container query.

```example
comment/compositions/viewer
```

- Where the margin doesn't fit, replace the cards with a `CommentMarker` beside each commented passage: the authors' avatars (up to 3) and the count. A card squeezed under 280px wraps every line, and cards over the document would hide the text they are about.
- Tapping a marker opens the discussion in a bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md)): its comments, the reply box, and a button that closes it. The passage stays highlighted while the sheet is open.
- Keep the passage highlights, the comments on the whole document (a marker at the top) and the comments whose position is lost (in the sheet of that top marker, under a line that says so) in the narrow layout too.

```example
comment/compositions/marker-sheet
```

## Related

- [Comment](../../packages/ui/src/components/comment/comment.md): the parts, the layout and its accessibility.
- [Conversation](./conversation.md): messages and threads, which are not comments.
- [Built from existing parts](../components/overview.md#file-viewer): the file viewer and its Comments action.
