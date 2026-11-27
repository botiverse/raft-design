---
title: Comments
summary: Where comments on a document go — in the margin, level with the passage they are about, as in Google Docs — what replaces the margin on a narrow screen, and the one bar at the bottom of a phone that writes them.
---

# Comments

People comment on a document to discuss one passage of it, so a comment belongs beside that passage. In a document viewer, comments sit in the right margin, each card level with the passage it is about, and the passage is highlighted. Where there is no room for a margin, a marker beside the passage opens the discussion in a bottom sheet. On a phone, one bar at the bottom of the screen is where people write ([On a phone](#on-a-phone)). This is how Google Docs, Feishu Docs and Word show comments; people already know it, so Raft doesn't do it differently.

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
- Opening a discussion shows its reply box at once, wherever the discussion is: a card in the margin, a floating card, or a row in the list of all comments. Selecting a row in that list opens it as the margin opens a card, with its passage highlighted; there is no Reply button to press first. A discussion that isn't open shows no reply box (Kirby, 2026-11-26, #proj-workspace:#447).
- Close the open card with Esc, or by opening another one.

## Starting a comment

Start a comment where the reading is, and keep the screen free of comment controls until someone wants one ("show nothing where there are no comments").

- On a passage: selecting text shows a Comment button in the margin, level with the selection, as in Google Docs. It opens a new card in its place, with the reply box focused; the selection takes the open highlight, the other cards move out of its way, and Cancel throws the card away. Until the first comment there is no margin, so the button floats at the document's right edge, and the document makes room only when the card opens: selecting never moves the text under the pointer.
- When a new card closes with the person's words in it, keep them as a draft and leave the draft's marker in the document: Esc, a press in the page, Tab out of the card and the passage going away all do this, and an empty card just closes. Cancel is the exception and drops the words. Drafts are the reader's own until they are sent, so nothing someone typed disappears because they looked away. In the Artifact viewer a card with words in it doesn't close on a press in the page at all ([When a comment card closes](#when-a-comment-card-closes)).
- On the whole document: while a document has no comments, the viewer's Comments button starts one, at the top of the margin. On a phone the talk bar at the bottom writes on the whole document instead, with or without comments ([On a phone](#on-a-phone)). Once there are comments, the button shows and hides them, and the top of the margin offers Comment on file until there is a discussion on the whole document; from then on, reply in that discussion. Name the button for what it does: a toggle only while it toggles.
- The margin's head holds its own controls, such as the sort of its cards, but no button that hides the margin. The viewer's Comments button shows and hides it, in the same place either way, and is pressed while the margin shows. A hide button in the margin's head reads as folding in place, yet it leaves with the margin, so the way back is somewhere else (xxchan, 2026-11-22, #proj-workspace:2df75147). The bottom sheet of the narrow layout keeps its own close button, as every sheet does, because the toggle sits under it.
- A selection the anchor can't name yet becomes a comment on the whole document, and its card says so, rather than showing no button: people should always be able to say something about what they are reading.
- In the narrow layout, the top of the marker column offers Comment on file (on a phone, the talk bar does), and markers and the comments on the whole document open in the bottom sheet. With a mouse, the Comment button on a selection opens the bottom sheet too; on a touch screen a selection gets the reply box on top of the keyboard instead (below).
- On a touch screen a selection never opens a sheet while someone is still selecting: a sheet's scrim takes the touches the selection handles need. It gets the reply box on top of the keyboard instead: one line high, with a close button before it and Send after it, and the tap that opens it focuses it so the keyboard, and its dictation, come up at once. It does everything the comment box does elsewhere, mentions with @ and attachments included, and grows a few lines as the text gets longer, then scrolls; being one line is its starting height, not a cut. It has no title, and the passage keeps its highlight in the page, lifted to sit above the box. A light scrim may cover the page; a press on it closes the box like the close button, and words in it stay as a draft, as when a new card closes. Once sent, the highlight becomes the passage's marker (xxchan, Remy, Kirby, 2026-11-25, #proj-workspace:#423).
- On a phone, with the talk bar, a selection shows no Comment button and doesn't bring up the keyboard. The talk bar stays, and a quote strip sits on top of it: a short bar mark, the selected text cut to one line, and × that clears the selection, with a 44px tap area. Someone who only wants to copy keeps the page and the system's menu, with no keyboard over them. Pressing the talk bar then opens the reply box in the same tap, with the same one-line quote at its top, and what is sent is a comment on the passage. Comment, then the box, was one tap too many, and the quote shows what the comment is about where it is written, as in Feishu (artin, 2026-11-27, #proj-mobile:25b73c52).
- Without a talk bar (a touch tablet, desktop mode, a split view), the Comment button for a selection is the [toolbar for selected text](../../packages/ui/src/components/text-selection-toolbar/text-selection-toolbar.md#behavior) at the bottom of the column, and tapping Comment opens the reply box, with no quote: the highlight shows the passage. The box takes no touches for a moment after it opens, so the tap that opened it can't land in it. The talk bar needs no such pause: it doesn't move, and it is pressed on purpose.
- From the keyboard, ⌘⌥M (Ctrl+Alt+M), Google Docs' shortcut, comments on the selection, so people who select with Shift and the arrow keys never have to leave the text. The Comment button also stays in the Tab order, after the document, and its tooltip shows the shortcut.

## Wide and narrow

Comments take one of three forms, by the room the document can give: cards in a margin beside it, markers beside it that open a bottom sheet, or, when the page can't give up any width, markers in the page that open a floating card.

The margin starts 340px wide, and people can drag its edge between 280px and the width that leaves the document 360px. It remembers the width, and it is the same column, at the same width, as the list of all comments, which takes the same place beside the document, so switching between them doesn't move the document. A long reply or a block of code is why someone widens it; the document they read beside it is why it stops at 360px, where the person has chosen a narrower document (Kirby, 2026-11-26, #proj-workspace:#447). Show the margin only while, at its narrowest, the document keeps at least 480px, about 60 characters of text per line, so from a viewer 784px wide (280px of cards and 24px between them and the document), and only on a desktop: from 768px with a mouse or a trackpad, the condition of every desktop metric ([Spacing](../foundations/spacing.md#hit-targets)). A tablet used by touch gets the markers at any width, like a phone.

Measure the viewer, not the window: the viewer can sit beside a sidebar or a thread ([Responsive layout](./responsive.md#when-a-row-runs-out-of-room)). Cards and markers are different structures, not one structure restyled, so the viewer measures its own width in JavaScript, with [`useCommentMarginFits`](../../packages/ui/src/components/comment/comment.md#wide-and-narrow), rather than with a container query.

```example
comment/compositions/viewer
```

- Where the margin doesn't fit, replace the cards with a `CommentMarker` beside each commented passage: the authors' avatars (up to 3) and the count. A card squeezed under 280px wraps every line, and cards over the document would hide the text they are about.
- Tapping a marker opens the discussion in a bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md)): its comments, the reply box, and a button that closes it. The passage stays highlighted while the sheet is open.
- Keep the passage highlights, the comments on the whole document (a marker at the top) and the comments whose position is lost (in the sheet of that top marker, under a line that says so) in the narrow layout too.
- A new card at a selection or a picked block follows what it comments on, as a thread's card follows its passage: it stays beside the target as the page scrolls or reflows, and flips where it doesn't fit, inside the document rather than over the app's own chrome. When the target scrolls out of view, hide the card without losing the words or the focus, and leave a dashed marker at the document's top or bottom edge, level with the target across; pressing the marker shows the card there again. On a touch screen the card is the bottom sheet (for a selection, the reply box on top of the keyboard, as in [Starting a comment](#starting-a-comment)), the picked block stays highlighted, and the page is lifted just enough for the target to sit above the sheet.

```example
comment/compositions/marker-sheet
```

### A page that can't give up any width

Some documents can't move over for a margin or a marker column: a full-width HTML page or a canvas, which would be cut off on the right. There, leave the page at its own width and put the markers in it:

- Show a marker on each commented passage, in the page, with the number of comments in its discussion, as `CommentMarker` counts them in the narrow layout. Not the discussion's place down the page: "3" would read as either, and inserting a discussion would renumber the rest.
- Clicking a marker opens its discussion as a card floating beside the marker: the active `CommentCard`, with every comment and the reply box. Esc, its ×, a click outside it while nothing is typed in it, and scrolling the marker out of view close it; a card with words in it stays open on a click outside ([When a comment card closes](#when-a-comment-card-closes)). It moves with the marker while the page scrolls. This is how Figma shows comment pins. The card is 320px wide and doesn't resize: it sits over the page, and a wider card hides more of what it is about. A long discussion scrolls inside it, and the card is never taller than the viewport less 16px above and below (Kirby, 2026-11-26, #proj-workspace:#447).
- On a touch screen the marker opens the bottom sheet, as in the narrow layout.
- Keep the highlights. A list of all the comments, when the product has one, is the only list in this layout; in the margin layout the margin already is the list, so don't open both at once.

## On a phone

On a phone, people read a document full screen and have one thumb free, so writing about it has one place: a talk bar along the bottom of the viewer, always there, that writes a comment on the whole document. Selecting a passage, where the document allows it, makes the bar comment on the passage. A bar the person has to find first, such as an icon in a crowded head or a box at the end of a list that covers the page, was missed: people copied the link to a browser to talk about what they were reading (a user artin and DiRenJie heard from, 2026-11-25, #proj-mobile:#366). The design is Kirby's, with Remy and Lagoon's review, approved by xxchan (2026-11-25, #proj-mobile:#366).

It applies to a phone's layout. A tablet, a split view and the apps' desktop mode lay the viewer out as on a desktop and have no talk bar. A tablet used by touch still keeps its markers at any width, never the margin ([Wide and narrow](#wide-and-narrow)), and what it takes on a touch screen (a selection's toolbar, the reply box on the keyboard) follows [Starting a comment](#starting-a-comment).

### The talk bar

- Put two things in the bar: the number of comments at its start, the comments icon and the count, as a button that opens the list of comments, and a control that looks like a field and fills the rest of the row. Nothing else: no microphone, since the keyboard's own dictation is one tap away once it is up, and no comment mode to enter. At 0 comments the count shows the icon alone, with no number: a "0" reads as something to check.
- Make the field 44px high with the control's corner, `control-radius` (10px on a touch screen), like every other field on a phone, never a pill: a full radius is only for switches, radios and grab handles ([Shape](../foundations/shape.md)) (xxchan, 2026-11-25, #proj-mobile:388d92ed).
- Its placeholder says who will hear it: the author agent, by name, when an agent wrote the document, and otherwise the document itself. The product's page gives the words.
- Keep pink off the bar. The send button is pink, and appears only once there is text to send.
- Make the bar a button drawn as a field, not a real field. Pressing it opens the reply box on top of the keyboard, the one a selection gets ([Starting a comment](#starting-a-comment)), with mentions and attachments, and focuses it so the keyboard comes up at once. A real field kept at the bottom of the screen makes iOS scroll the page the moment it takes the focus.
- Keep the bar clear of the system's home indicator: the bottom safe area is under it, not in it.
- Keep the bar in its place while text is selected. Pressing it then comments on the passage, which the quote strip on top of it names; with no selection, or once the strip's × clears it, it comments on the whole document again ([Starting a comment](#starting-a-comment)) (artin, 2026-11-27, #proj-mobile:25b73c52).
- When the reply box closes with words in it, keep them as a draft, as a new card does. A phone has no Save draft button and no bottom bar of drafts: while there are drafts, the status line says so with Send ("2 unsent drafts · Send", [After sending](#after-sending)), and a draft is changed or deleted in the list of comments, which has Undo.

### One bar at a time

- Show one bar along the bottom at a time: the talk bar, or the reply box on the keyboard, which takes its place and gives it back when it closes. Stacked, a field, another bar and the keyboard leave no page to read.
- A selection adds no bar of its own: it puts the one-line quote strip on top of the talk bar, and the talk bar doesn't move, so the page and the selection handles don't jump. While the status line shows, the strip takes its place rather than stacking over it, and the status line comes back when the selection goes (artin, 2026-11-27, #proj-mobile:25b73c52).
- Give the strip no buttons but ×, which clears the selection. The talk bar is its Comment, and the system's own menu at the selection has Copy: a second Copy below it is the same action twice (Lagoon, 2026-11-25, #proj-mobile:388d92ed).
- The [toolbar for selected text](../../packages/ui/src/components/text-selection-toolbar/text-selection-toolbar.md#behavior), with Comment and ×, is for the layouts that have no talk bar ([Starting a comment](#starting-a-comment)). It leaves out Copy for the same reason.
- A document that takes no comment on a selection, as a product may decide for a page of its own, gets its comments from the talk bar alone; a selection there is the system's, for copying, and shows no strip.

### The list of comments

- Open the list from the bar's count, or from a link straight to it, as a bottom sheet with the same talk bar at its bottom, never a second box of its own: the whole document has one place to write.
- Never focus anything when the list opens. The keyboard comes up only when the person presses the talk bar or a discussion's Reply: a list opened to read, with a keyboard over half of it, can't be read (Lagoon, 2026-11-25, #proj-mobile:388d92ed).

### After sending

- Show one status line just above the talk bar while there is something to say about the person's comments. Draw it as a solid row, not a floating line: 36px high and as wide as the talk bar, on `layer-card`, with a `line-seam` above it and the talk bar's own top line below it, the author's avatar, then the author's name in bold and the sentence, and › at its end. Under it is the document, which can be any color, so a line with no background of its own can't be read over it.
- While the author is working, the avatar carries its working light, still, as in [Working agents](../people-and-agents/working-agents.md#motion): no moving dots.
- Show one sentence at a time, the first of these that is true:
  1. Drafts failed to load or to send: say so, with Retry.
  2. What the author is doing with what was sent:
     - "Bugen is working on it · Got your comment", when the author is an agent working on this document's comments. Say so only on a signal that it is, never guessed from typing: an agent spends most of the time reading and editing, not typing a message (Remy, 2026-11-25, #proj-mobile:388d92ed);
     - "Bugen replied", when the author answers with a reply and no change: the usual answer to a question;
     - and what the product adds for a change to the document, such as a new version.
  3. Unsent drafts: "2 unsent drafts · Send".
  4. "Sent to Bugen", while there is no signal that the author is working. It comes after unsent drafts because it can last until the document closes: above them, someone who sent one comment and kept another as a draft would never see "2 unsent drafts · Send" (Jasper, 2026-11-25, #proj-mobile:#366).
- Make the whole line a button only while it says what the author is doing, or that a comment was sent: it opens the list of comments at what it is about, the comment just sent, the author's reply or the change. For drafts and for Retry, only the action (Send, Retry) is a button: a button inside a button can't be pressed apart.
- Let the line go when what it says is over. "Sent to Bugen" becomes "working", "replied" or the product's change when that happens, and otherwise stays until the document closes. A reply, and the product's change, go once the line is pressed or the document closes. Drafts and their failure go when there are none left to send or retry.
- Keep the talk bar usable under it: the person can go on talking while the author works.
- Fold the line away while there is a selection, with the talk bar it sits on.

## Commenting on an Artifact

The Artifact viewer shows two kinds of page: an HTML page, which fills the viewer, and a Markdown document, which Raft renders itself. On both, people send a comment at once or save it as a draft and send their drafts together, and they never pick between the two before they start. The rules are xxchan's, from the final mockup (v8 of Artifact YL2pf8ML79U9jovzB5PhBF; 2026-11-04, #proj-workspace:1c7b5037). Where they differ from [Starting a comment](#starting-a-comment), they are the rule in the Artifact viewer. They are for the desktop layout. On a touch screen, at any width, an HTML page takes no selection and no picked elements, so it has no comment mode and no Pick elements ([Artifact page](../products/raft-chat/artifact.md#on-a-touch-screen)). On a phone the viewer also has no Comments split button, no bottom bar of drafts and no Save draft, and follows [On a phone](#on-a-phone).

- Selecting text shows Comment at once, with no comment mode to enter first. It is a button only as wide as its label, right after the end of the selection. Whether the comment goes out now or waits is chosen in the comment box, not here.
- Give the comment box two buttons: Send, which posts the comment and notifies the people it reaches, and Save draft, which keeps it on the page where only its author sees it. Once there are drafts, Save draft is the button Enter presses and ⌘Enter presses Send, so a batch isn't sent half-written.
- Write nothing under the comment box. Who Send notifies ("Notifies Judith (author)") is in Send's tooltip, and the box's placeholder already says to @ someone; a line under every box was read with every comment and said what the buttons already say.
- Keep the comment button in the viewer's header a split button, as it was: its main half enters and leaves comment mode, its ▾ opens the list of every comment, with their count. It shows no draft count: the bottom bar already counts the drafts, and two counts of one thing read as two things to do. A comment on the whole Artifact is still written in the box at the bottom of that list.
- Put the bottom bar along the bottom of the viewer with only these, in this order: Pick elements (on an HTML page only), Undo and Redo, Discard, and Send N ("Send 2"). Label Send with its count and nothing else, not "Drafts: 2 · Send together": the count is the only thing the label has to add.
- Show the bottom bar only while there are drafts or while the person is in comment mode, and hide it otherwise, so it never covers a page nobody is commenting on.
- Pick elements is on when comment mode starts on an HTML page: hovering outlines an element and names its type (`h1`, `p`), and a click opens the comment box beside it, for images, buttons and cards, which have no text to select. Turning it off returns to browsing, where selecting text still comments. A Markdown document has no elements to pick, so the bar has no Pick elements there.
- Send N sends the drafts at once, with no list and no confirmation (xxchan, 2026-11-04: "no need to confirm again after clicking Send 2"). To change or delete a draft, open it on the page. Discard asks in place before it throws the drafts away. Undo and Redo (⌘Z and ⇧⌘Z) step through changes to the drafts.
- On an HTML page, show a posted discussion as a marker at the end of its paragraph, with its authors' avatars and the count, drawn in the page ([A page that can't give up any width](#a-page-that-cant-give-up-any-width)), and a draft as a small dashed pin, whose text shows only when it is opened. The page fills the viewer, so nothing of Raft's stands beside it: no column of cards, no card with a draft's text hung beside its element.
- In a Markdown document, put discussions and drafts in the right-hand margin rail, each card level with its passage ([Rules](#rules)), and a draft's card says it is a draft only its author sees. Where the margin doesn't fit, it gives way to markers ([Wide and narrow](#wide-and-narrow)).
- A text or CSV file is neither kind of page: Raft draws it, and its comments are always markers beside it, never cards. Show a draft there as a `CommentMarker` of its own, level with the first line of its lines or rows: dashed and empty, with no avatars and no count, like a draft's pin on an HTML page, so a draft shows where it was written on every kind of file. Pressing it opens the draft beside it, or in a bottom sheet on a phone; while the list of comments is open, it goes to the draft's card there instead. Its lines or rows aren't highlighted. A reply draft has no marker: it shows under the replies in its discussion.
- Deleting a draft from the list of comments or from under the replies in a discussion takes no confirmation: only its author sees it, and the toast ("Draft deleted") has Undo, as anything taken out of a list does ([Confirming](./feedback.md#confirming)). Undo brings back that draft alone, where it was, whatever changed since; after the toast has gone, ⌘Z still brings it back, and so does the bottom bar's Undo while the bar is shown, until the viewer closes or Send N or Discard clears the history. Three deletes ask first: a draft with images, whose uploads go with it, so it can't be brought back; Delete in a draft's own view, the one its marker, pin or card opens, because the same view also opens from an HTML page's pin, which a page can trigger itself, and the view deletes the same way wherever it is opened from; and a posted comment, which is deleted for everyone.

### When a comment card closes

Every comment card in the Artifact viewer closes by one rule, set by whether it holds words, not by which card it is: a discussion's card, a card in the margin rail, a new comment's card, the comment box for the whole page and the reply box under a discussion's replies, on an HTML page, in a Markdown document and on an attached file's preview alike (Kirby, 2026-11-23, #proj-workspace:#385).

- Close an empty card on a press anywhere outside it, a press in the page included. An HTML page is a frame of its own, but to the person it is the same screen, and an empty card has nothing to lose.
- Keep a card with words in it open on a press outside it. It closes only with Esc or its ×, and Esc keeps the words as a draft: a press in the page is often only a look at the passage again, and words are never lost to it.
- Pressing a marker or a pin whose card is open closes that card; it doesn't open it again.
- Keep the find bar open on a press outside it, in the page included, since people press there to look at what it found. Esc closes it, also when focus is in the page.

## Related

- [Comment](../../packages/ui/src/components/comment/comment.md): the parts, the layout and its accessibility.
- [Conversation](./conversation.md): messages and threads, which are not comments.
- [Built from existing parts](../components/overview.md#file-viewer): the file viewer and its Comments action.
