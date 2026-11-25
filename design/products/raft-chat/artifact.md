---
title: Raft Chat — Artifact page
summary: An Artifact opened on a phone — content first under a head of five controls, its details and Linked from, its ⋯, and the talk bar that tells its author what to change.
---

# Raft Chat — Artifact page

An Artifact opens on a phone as a pushed page over the place it was opened from, and the Artifact is what fills it: a short head, the content, and the talk bar at the bottom, which is how people tell its author what to change without leaving the page. The shared rules for writing comments on a phone are in [Comments](../../patterns/comments.md#on-a-phone); this page holds what Raft Chat's Artifact page puts where. A tablet, a split view and the apps' desktop mode show the desktop viewer, with its own head and no talk bar ([Title bars](../../patterns/title-bars.md#an-object-in-its-own-window) for its own window); a tablet used by touch keeps its markers at any width and follows [On a touch screen](#on-a-touch-screen).

The design is Kirby's, reviewed by Remy (the web) and Lagoon (the apps), and approved by xxchan (2026-11-25, #proj-mobile:#366, #proj-mobile:388d92ed). Before it, the head held seven controls on a 390px screen and cut the title to its first letters, and writing about the whole page meant finding a small icon in the head and then a box at the end of a list that covered the page.

## Structure

From top to bottom:

1. **The head**: Back, the title, the version tag, Share and ⋯ ([The head](#the-head)).
2. **The notices** at the top of the content, only when they apply: an older version is showing, a version failed to load, or a new version is out while the person is in the middle of something ([The talk bar](#the-talk-bar)).
3. **The content**, with its comment markers.
4. **The status line**, while there is something to say about the person's comments: a solid row with the author's avatar, the name in bold, the sentence and › ([The talk bar](#the-talk-bar)).
5. **The talk bar**: the number of comments, and "Tell Bugen what to change…".

## Rules

### The head

- Put five controls in the head, in this order: Back, the title, the version tag, Share and ⋯. Nothing else, so the title has room.
  - Back closes the page, as on every pushed page; the system's Back does too.
  - The title, with the green dot while someone else is looking at it, opens the details ([The details](#the-details)).
  - The version tag ("v3") opens the version history sheet, for a reader on this server once there are 2 versions or more. It stays in the head because it is what changes when the author has done what was asked: v3 becomes v4.
  - Share is an icon alone and opens the share sheet. It stays where it is on every object and on desktop, since people find Share by its place (xxchan, 2026-11-25, #proj-mobile:388d92ed).
  - ⋯ holds everything used now and then ([The menu](#the-menu)).
- What the head used to hold goes here instead:

| Was in the head | Now |
| --- | --- |
| Comments, with their count | The count at the start of the talk bar; the bar itself writes |
| Comment mode | Nothing: a phone has no comment mode ([Comments](../../patterns/comments.md#one-bar-at-a-time)) |
| Linked from N | A row of the details |
| Settled ✓ | The details' Status row, which already says it |
| Open in browser | Nothing: the talk bar meets the need it served ([Navigation](../../patterns/navigation.md#where-raft-isnt-signed-in)) |
| The bottom bar of drafts (Undo, Redo, Discard, Send N) | The status line ("2 drafts · Send") and the list's Your drafts |

### The details

- Open the details from the title. They hold, in order: Status (with Settle or Unsettle), Who can see it, Linked from N ›, Version (the latest and Version history ›), Who's seen it, and the Artifacts recently opened in this conversation.
- Leave out an Original message row: the original message is the first entry of Linked from ([Linked from](#linked-from)), and a row of its own said it twice.
- On desktop the head keeps its "Linked from N" chip beside the version, so the desktop details only lose the Original message row and gain no Linked from row (Remy, Kirby, 2026-11-25, #proj-mobile:388d92ed).

### Linked from

- List the messages that link to the Artifact, and count the original message, the one it was posted with, as one of them: it is a message about the Artifact too.
- Put the original message first, always, with an "Original message" badge, however old it is and even when it is older than the messages the list loads. It is where the Artifact came from, the first thing people look for, and first it is never folded away under the rows the list shows before Show all (Remy, Kirby, 2026-11-25, #proj-mobile:388d92ed).
- Count it in N: "Linked from 3" lists 3 entries, the original message among them.
- On a phone, open the list from the details' Linked from N ›, as a bottom sheet. The strip that ends the content of an HTML page, a Markdown page, a PDF or a file with no preview is not on a phone: the bottom of the screen is the talk bar's. The block under a CSV file, a text file or an image stays, since it scrolls with the content.

### The menu

- Group the items of ⋯, in this order: Copy link, Download, Follow or Unfollow (and Fork in Raft for a reader from another server); Version history, Files; Report a display problem, Desktop mode; Rename, Settle, Delete; Report abuse last, for a reader from another server. Each item shows only to the people it applies to.
- Put Desktop mode next to Report a display problem, not first: both are about how the page shows, and neither is what people open ⋯ for most.
- Don't offer Find in page on a phone. It opens with ⌘F on desktop only; on a phone it is little used, and the keyboard and scrolling inside a frame make it costly (Remy, Kirby, 2026-11-25, #proj-mobile:388d92ed).
- Don't offer Open in browser, in the menu or the head ([Navigation](../../patterns/navigation.md#where-raft-isnt-signed-in)).

### The talk bar

- Make what the talk bar sends a comment on the whole Artifact. It notifies the author; an agent that made the Artifact is woken by it and starts on it at once.
- Write the author's name in its placeholder: "Tell Bugen what to change…". When the author is a person, write "Comment on this Artifact…", and the status line never says the author is working.
- The status line follows [After sending](../../patterns/comments.md#after-sending), one sentence at a time, in its order. A draft that failed to load says so there, rather than in the head: drafts belong to writing.
- Say "Bugen is working on it · Got your comment" while the server says the author agent is working on this Artifact's comments: it tells everyone viewing the Artifact when the comment wakes the agent, clears it when the agent publishes, replies or finishes, and lets it expire by itself if none of those comes. Whether the agent is typing in a conversation says nothing about this: it types only when it is about to post. Without that, and when there are no unsent drafts, say "Sent to Bugen", which becomes "Bugen is working on it", "Bugen replied" or "Bugen published v4" when that happens, and otherwise stays until the page closes.
- When Bugen publishes, the page moves to the new version by itself, so the person sees the change they asked for without pressing anything; the version tag reads v4, and the status line says "Bugen published v4", with what changed when Bugen said so. Pressing it opens the comments at Bugen's reply, or the new version when there is no reply. It doesn't move while the person is in the middle of something (typing, focus in a field, a card, a selection or the versions sheet open) or has picked a version: then the notice at the top of the content offers the newest version instead.
- When Bugen replies without a new version, say "Bugen replied"; pressing it opens the comments at the reply.
- "Bugen published v4" and "Bugen replied" go once the line is pressed or the page closes.
- A reader of a public Artifact from another server can't comment, so the page has no talk bar for them; Fork in Raft is in ⋯.

### On a touch screen

- An Artifact's HTML page, a page Raft draws in a frame of its own, takes no text selection, no picked elements and no long-press callout on a touch screen, at any width (`-webkit-touch-callout: none`): its own buttons and sliders need the touches, and handles inside a frame fight them (xxchan, 2026-11-25, #proj-workspace:4c25e3ec). So it has no comment mode and no Pick elements there, on a touch tablet too, as staging has it (`ArtifactReviewContext.tsx`, `ArtifactReviewParts.tsx`).
- On a phone, comments on it come from the talk bar. On a touch tablet, which lays out as on a desktop and has no talk bar, the page's markers still show and open their discussions, and a comment on the whole Artifact is written in the list of comments.
- A Markdown document Raft renders itself keeps its selection on a touch screen, with the toolbar for selected text ([Comments](../../patterns/comments.md#starting-a-comment)).

### In the native app

- On Android the app shrinks the page's view by the keyboard or the navigation bar, whichever is taller, so the talk bar and the reply box follow the view's bottom edge and add no offset of their own: adding the visual viewport's offset as well left a second gap over the keyboard (Lagoon, 2026-11-25, #proj-mobile:388d92ed).
- On iOS the view keeps its height, so the web places the reply box by the visual viewport, and the talk bar sits above the bottom safe area.
- Opening the page straight onto its comments, from a message or a notification, opens the same list with the talk bar at its bottom, focused on nothing.
- Desktop mode, from ⋯, and the app's wide layouts (a tablet, a split view, where the app draws the head itself) show the desktop viewer with no talk bar. The talk bar is a phone's; scaled into a desktop layout it would be a thin strip.
