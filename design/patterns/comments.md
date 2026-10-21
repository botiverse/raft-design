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
- Highlight every commented passage in a soft yellow (`brand` over the page, 35% in light mode and 22% in dark, with a `brand` underline), and the passage of the open discussion in full yellow with ink type: the open discussion is the one the person selected, and yellow is what you selected ([Color](../foundations/color.md#meanings-of-color)).
- Open one discussion at a time. Its card gets an ink border and lifts off the margin (`shadow-float`), stays level with its passage, and the other cards move out of its way. The open card is the one people read and type in; the others are a list of where else there is something to read.
- Show a collapsed card as its first comment, cut to 2 lines, and the number of replies. Opening it shows every comment and the reply box. A margin of full discussions would push every card far from its passage.
- Put the comments on the whole document once, at the top of the margin, with a line that says so. Don't repeat the file's name on each card: the viewer already shows it.
- Put a comment whose passage can no longer be found (the document changed under it) at the top of the margin too, with a line that says so ("Position not found"). Never drop it, and never attach it to whatever text is there now: the comment is still part of the discussion, and a wrong anchor says something nobody said.
- Reply in the [Composer](../../packages/ui/src/components/composer/composer.md) inside the open card, with the pink send button: only the open card has one, so it is the screen's one pink button.
- Close the open card with Esc, or by opening another one.

## Starting a comment

Start a comment where the reading is, and keep the screen free of comment controls until someone wants one ("show nothing where there are no comments").

- On a passage: selecting text shows a Comment button in the margin, level with the selection, as in Google Docs. It opens a new card in its place, with the reply box focused; the selection takes the open highlight, the other cards move out of its way, and Esc or Cancel throws the card away. Until the first comment there is no margin, so the button floats at the document's right edge, and the document makes room only when the card opens: selecting never moves the text under the pointer.
- On the whole document: while a document has no comments, the viewer's Comments button starts one, at the top of the margin. Once there are comments, the button shows and hides them, and the top of the margin offers Comment on File until there is a discussion on the whole document; from then on, reply in that discussion. Name the button for what it does: a toggle only while it toggles.
- A selection the anchor can't name yet becomes a comment on the whole document, and its card says so, rather than showing no button: people should always be able to say something about what they are reading.
- In the narrow layout, the same Comment button on a selection opens the bottom sheet, and the top of the marker column offers Comment on File.
- From the keyboard, ⌘⌥M (Ctrl+Alt+M), Google Docs' shortcut, comments on the selection, so people who select with Shift and the arrow keys never have to leave the text. The Comment button also stays in the Tab order, after the document, and its tooltip shows the shortcut.

## Wide and narrow

Comments take one of three forms, by the room the document can give: cards in a margin beside it, markers beside it that open a bottom sheet, or, when the page can't give up any width, numbered markers in the page that open a floating card.


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

### A page that can't give up any width

Some documents can't move over for a margin or a marker column: a full-width HTML page or a canvas, which would be cut off on the right. There, leave the page at its own width and put the markers in it:

- Show a numbered marker on each commented passage, in the page. Its number is the order of the discussions down the page.
- Clicking a marker opens its discussion as a card floating beside the marker: the active `CommentCard`, with every comment and the reply box. Esc, a click outside it, and scrolling the marker out of view close it; it moves with the marker while the page scrolls. This is how Figma shows comment pins.
- On a touch screen the marker opens the bottom sheet, as in the narrow layout.
- Keep the highlights. A list of all the comments, when the product has one, is the only list in this layout; in the margin layout the margin already is the list, so don't open both at once.

## Related

- [Comment](../../packages/ui/src/components/comment/comment.md): the parts, the layout and its accessibility.
- [Conversation](./conversation.md): messages and threads, which are not comments.
- [Built from existing parts](../components/overview.md#file-viewer): the file viewer and its Comments action.
