---
title: Comments
summary: Where comments on a document go — in the margin, level with the passage they are about, as in Google Docs — and what replaces the margin on a narrow screen.
---

# Comments

People comment on a document to discuss one passage of it, so a comment belongs beside that passage. In a document viewer, comments sit in the right margin, each card level with the passage it is about, and the passage is highlighted. Where there is no room for a margin, a marker beside the passage opens the discussion in a bottom sheet. This is how Google Docs, Feishu Docs and Word show comments; people already know it, so Raft doesn't do it differently.

## When it applies

Comments on a document Raft renders itself: a Markdown, text or code file in the file viewer ([Built from existing parts](../components/overview.md#file-viewer)), and any later document surface. It doesn't cover replies to a message, which are a thread ([Conversation](./conversation.md#threads)), or a file whose content Raft can't measure, such as a page in a sandboxed frame. An Artifact's HTML page is such a frame, but its markers are drawn inside it, so it has rules of its own: [Commenting on an Artifact](#commenting-on-an-artifact).

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
- On the whole document: while a document has no comments, the viewer's Comments button starts one, at the top of the margin. Once there are comments, the button shows and hides them, and the top of the margin offers Comment on file until there is a discussion on the whole document; from then on, reply in that discussion. Name the button for what it does: a toggle only while it toggles.
- A selection the anchor can't name yet becomes a comment on the whole document, and its card says so, rather than showing no button: people should always be able to say something about what they are reading.
- In the narrow layout, the same Comment button on a selection opens the bottom sheet, and the top of the marker column offers Comment on file.
- From the keyboard, ⌘⌥M (Ctrl+Alt+M), Google Docs' shortcut, comments on the selection, so people who select with Shift and the arrow keys never have to leave the text. The Comment button also stays in the Tab order, after the document, and its tooltip shows the shortcut.

## Wide and narrow

Comments take one of three forms, by the room the document can give: cards in a margin beside it, markers beside it that open a bottom sheet, or, when the page can't give up any width, markers in the page that open a floating card.

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

- Show a marker on each commented passage, in the page, with the number of comments in its discussion, as `CommentMarker` counts them in the narrow layout. Not the discussion's place down the page: "3" would read as either, and inserting a discussion would renumber the rest.
- Clicking a marker opens its discussion as a card floating beside the marker: the active `CommentCard`, with every comment and the reply box. Esc, a click outside it, and scrolling the marker out of view close it; it moves with the marker while the page scrolls. This is how Figma shows comment pins.
- On a touch screen the marker opens the bottom sheet, as in the narrow layout.
- Keep the highlights. A list of all the comments, when the product has one, is the only list in this layout; in the margin layout the margin already is the list, so don't open both at once.

## Commenting on an Artifact

The Artifact viewer shows two kinds of page: an HTML page, which fills the viewer, and a Markdown document, which Raft renders itself. On both, people send a comment at once or save it as a draft and send their drafts together, and they never pick between the two before they start. The rules are xxchan's, from the final mockup (v8 of Artifact YL2pf8ML79U9jovzB5PhBF; 2026-11-04, #proj-workspace:1c7b5037). Where they differ from [Starting a comment](#starting-a-comment), they are the rule in the Artifact viewer.

- Selecting text shows Comment at once, with no comment mode to enter first. It is a button only as wide as its label, right after the end of the selection. Whether the comment goes out now or waits is chosen in the comment box, not here.
- Give the comment box two buttons: Send, which posts the comment and notifies the people it reaches, and Save draft, which keeps it on the page where only its author sees it. Once there are drafts, Save draft is the button Enter presses and ⌘Enter presses Send, so a batch isn't sent half-written.
- Write nothing under the comment box. Who Send notifies ("Notifies Judith (author)") is in Send's tooltip, and the box's placeholder already says to @ someone; a line under every box was read with every comment and said what the buttons already say.
- Keep the comment button in the viewer's header a split button, as it was: its main half enters and leaves comment mode, its ▾ opens the list of every comment, with their count. It shows no draft count: the bottom bar already counts the drafts, and two counts of one thing read as two things to do. A comment on the whole Artifact is still written in the box at the bottom of that list.
- Put the bottom bar along the bottom of the viewer with only these, in this order: Pick elements (on an HTML page only), Undo and Redo, Discard, and Send N ("Send 2"). It takes the place of the dark strip under the header ([ModeBar](../../packages/ui/src/components/mode-bar/mode-bar.md)) while commenting on an Artifact. Label Send with its count and nothing else, not "Drafts: 2 · Send together": the count is the only thing the label has to add.
- Show the bottom bar only while there are drafts or while the person is in comment mode, and hide it otherwise, so it never covers a page nobody is commenting on.
- Pick elements is on when comment mode starts on an HTML page: hovering outlines an element and names its type (`h1`, `p`), and a click opens the comment box beside it, for images, buttons and cards, which have no text to select. Turning it off returns to browsing, where selecting text still comments. A Markdown document has no elements to pick, so the bar has no Pick elements there.
- Send N sends the drafts at once, with no list and no confirmation (xxchan, 2026-11-04: "no need to confirm again after clicking Send 2"). To change or delete a draft, open it on the page. Discard asks in place before it throws the drafts away. Undo and Redo (⌘Z and ⇧⌘Z) step through changes to the drafts.
- On an HTML page, show a posted discussion as a marker at the end of its paragraph, with its authors' avatars and the count, drawn in the page ([A page that can't give up any width](#a-page-that-cant-give-up-any-width)), and a draft as a small dashed pin, whose text shows only when it is opened. The page fills the viewer, so nothing of Raft's stands beside it: no column of cards, no card with a draft's text hung beside its element.
- In a Markdown document, put discussions and drafts in the right-hand margin rail, each card level with its passage ([Rules](#rules)), and a draft's card says it is a draft only its author sees. Where the margin doesn't fit, it gives way to markers ([Wide and narrow](#wide-and-narrow)).
- A text or CSV file is neither kind of page: Raft draws it, and its comments are always markers beside it, never cards. Show a draft there as a `CommentMarker` of its own, level with the first line of its lines or rows: dashed and empty, with no avatars and no count, like a draft's pin on an HTML page, so a draft shows where it was written on every kind of file. Pressing it opens the draft beside it, or in a bottom sheet on a phone; while the list of comments is open, it goes to the draft's card there instead. Its lines or rows aren't highlighted. A reply draft has no marker: it shows under the replies in its discussion.
- Deleting a draft from the list of comments or from under the replies in a discussion takes no confirmation: only its author sees it, and the toast ("Draft deleted") has Undo, as anything taken out of a list does ([Confirming](./feedback.md#confirming)). Undo brings back that draft alone, where it was, whatever changed since; after the toast has gone, ⌘Z still brings it back, and so does the bottom bar's Undo while the bar is shown, until the viewer closes or Send N or Discard clears the history. Three deletes ask first: a draft with images, whose uploads go with it, so it can't be brought back; Delete in a draft's own view, the one its marker, pin or card opens, because the same view also opens from an HTML page's pin, which a page can trigger itself, and the view deletes the same way wherever it is opened from; and a posted comment, which is deleted for everyone.

## Related

- [Comment](../../packages/ui/src/components/comment/comment.md): the parts, the layout and its accessibility.
- [Conversation](./conversation.md): messages and threads, which are not comments.
- [Built from existing parts](../components/overview.md#file-viewer): the file viewer and its Comments action.
