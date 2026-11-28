---
title: Cards in messages
summary: How every card in a message and every item popover is drawn from one set of recipes — one frame with a 12px inset, two widths, a source row, a 2-line title, a row of state and details, and one row of at most two buttons at the bottom end; a card with a preview says its title once at the top and its details in one line at the foot — so changing one card changes them all; and how a card that asks for something lives and ends: its phases, who can act, an outcome with one tone each, the folded record line, one primary button and a 1.5s undo.
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

1. **The frame**: `MessageEmbed`, a `line-hairline` border, `radius-container` and `layer-card`, no shadow. A cover or an excerpt that runs to its top or bottom takes its inner corner ([Inside a frame](../foundations/shape.md#inside-a-frame)).
2. **The source row**: where the card comes from, the app's icon and name, then "·" and the host, under a hairline (`AppLinkCardHeader`).
3. **The body**, 12px from the frame's edges: an id line in Space Mono, then the title, then a row with the state and the details.
4. **The buttons**, on one row at the bottom end of the card.

A card that shows a preview of what it opens, such as an Artifact card, keeps the frame and the inset and orders its body differently: the title row, the preview, then one meta line ([A card with a preview](#a-card-with-a-preview)).

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

- Put the state under the title, in a neutral soft [Badge](../../packages/ui/src/components/badge/badge.md), then the details in `foreground-muted`, wrapping when they run out of room (`messageCard`'s `meta`). The state is the app's word for where the item stands, not one of Raft's status colors. One exception: on an app's link card, in a message or on hover, the badge's fill is the app's own color when the app sends one, and nothing else on the card is ([AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md#the-apps-color)).
- A card with a preview puts its details in one line at its foot instead, and its state and new-activity badge after its title ([A card with a preview](#a-card-with-a-preview)).
- [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) keeps its state at the end of its header, its status pixel and word: the card folds to its header once it is resolved, and the state has to stay in view then. Its state is not the app's word but Raft's own, one per phase and outcome, and its pixel takes the outcome's tone ([A card that asks for something](#a-card-that-asks-for-something)).

### A card with a preview

A card that shows a preview of what it opens, an Artifact card first, is compact: it names the item once and shows only enough to decide whether to open it. **A card in a conversation exists to help decide whether to open it; everything else is read after opening** (artin, 2026-11-28, #proj-mobile:8518431c). Before, an Artifact card on a 390px phone drew the document's start with its own `# heading`, then the same title again beside a 40px file tile and the version, then the channel's tag in that same channel, the author, the time and the comments: about 330px, close to half the screen, and the title twice. The rules below are sindresorhus's, with the version moved to the meta line and the two width-independent rules applied to the desktop too (Kirby); together they bring that card to about 190px.

- **Title row, preview, one meta line**, in that order. Nothing goes above the title.
- **The title appears once, at the top.** The title row is the item's type, then its title. The type is the chip for a type in a line of text (`FilePreviewBadge` with `placement="inline"`, [FilePreview](../../packages/ui/src/components/file-preview/file-preview.md)) with the label the 40px file tile had: MD, HTML, CSV, PDF. It stands before the title, centred on its first line, so the row is no taller than the title; an item with no type label keeps its 16px icon (an Artifact's is `ArtifactIcon` from `@botiverse/ricons`). The type helps decide whether to open it, a page to read or a table to sort, and a generic icon in its place said nothing: artin asked for it back when the first compact card dropped it (2026-11-28). The 40px tile itself stays gone: it took a third of the row's height in front of the title. Then the title, up to 2 lines (`messageCard().title()`), then the item's state and the new-activity badge, which wrap under the title before it gets narrower than 8rem ([Badge](../../packages/ui/src/components/badge/badge.md): "Updated · 2 new comments", one accent badge); Open in a new page last.
- **The preview never repeats the title.** When the document starts with a level-1 heading, the preview leaves it out, whatever it says, and starts from the body: the title row has just said it. A screenshot or a cover runs to the frame's sides between hairlines, cut from the top (the page's first screen); a text excerpt sits 12px in, like the title. With neither, the description, at most 2 lines; with none of them, no preview.
- **One meta line at the foot**, small and muted on one line (`messageCard().metaLine()`): author · time · comment count · version (`v3`; `v3 · latest v5` for a card pinned to an older one). The version is a detail, not part of the title: beside the title it took a badge's width from it, and on a phone a two-line title fits more words without it. The author's name gives way first; the comment count is the plain count and opens the comments, and the new-activity badge by the title says what is new.
- **The channel tag only elsewhere.** The tag that says where the item lives shows only when the card is in another conversation than its own. In its own channel it repeats the channel the reader is in. A server-wide or public item keeps its tag wherever it is: it says who can open it, which the conversation doesn't.
- **Below 768px** (the page shell's switch, [Two widths](#two-widths)), a text preview is at most 4 lines and an image or a page's screenshot at most 120px tall (192px wider up). The title once, the meta line and the channel tag hold at every width, the desktop's included.
- The facts of a kind (pages, rows × columns, size) and a description beside a preview aren't on the card: they are read after opening.
- The widths and the 12px inset are the family's ([One frame, one inset](#one-frame-one-inset), [Two widths](#two-widths)).

Link, action and forwarded cards follow the same order once the Artifact card has been compared on the web and in the App (#proj-mobile:#439, #440).

### Buttons

- Put the buttons on one row at the bottom end of the card (`messageCard`'s `actions`), at most two: the frameless one first, the bordered one last. A third action and every further one go in a More menu (⋯) to the left of the two; the card's author supplies that menu (a [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) on an icon button), and the row draws none of its own. Three buttons side by side don't fit a 400px card in most languages, and a second row of buttons reads as a second card.
- An action card's note (`MessageActionCardActionsNote`) is always a line of its own above the buttons, not beside them: in a 400px card a note beside two buttons had about 150px and pushed the confirm button onto a line of its own.
- When the row runs out of room, things give way in this order: a status line beside the buttons, such as an app's "Working…", goes onto a line of its own first; the buttons stay on one line whenever the card has room for them; only in a column narrower than the two buttons does the bordered one go under the frameless one, whole. A button is never truncated: at the narrowest the buttons wrap whole, as in a dialog's footer ([When a row runs out of room](./responsive.md#when-a-row-runs-out-of-room)), because a cut label can't be read. Put a status line beside the buttons in `messageCard`'s `actionGroup` around the buttons, so it is the line that wraps.
- Don't use the brand's primary button on a card: a card sits among people's words, and a pink button there shouts over them. The one that confirms is the bordered one, and it is the card's one primary button ([Buttons on a card that asks](#buttons-on-a-card-that-asks)).

### Web preview

An agent can send a page for people to look at while they keep talking, such as a preview of a site it built. The page opens beside the conversation, in the side area's place where an Artifact opens, and works the same way there.

**Where it comes from**

- **Only from a card an agent sends.** A card message's button with `open: "beside"` opens its page in the web preview; every other button, and every link in a message's text, opens a new tab as before. People did not ask for a preview of every link, and a control after every link in an agent's message full of links turns the text into a row of icons. A page sent as a card is one the agent chose to show (stdrc, 2026-11-10).
- **The button says where it opens.** It ends in the panel icon (`panel-right`) instead of ↗, and its accessible name says "opens beside the conversation". It is still a link to the page: a modified or middle click opens a new tab, as any link does.
- **One domain per address.** A card button shows its link's domain after its label. When several of a card's buttons open the same address (New tab and Open preview on one page), only the last of them shows it; the others show their label alone (Jasper). The same host twice in one row reads as two places, and its second copy takes the room the labels need. Every button keeps the domain in its accessible name.
- **When it can't open beside,** it opens a new tab, never nothing: with the web preview off, in a page Raft doesn't frame (Raft's own addresses), with no conversation beside it to open next to, or for an address with a user name or password in it. The mobile app has no web preview yet: there the button opens its page as any link does.

**The panel**

- It takes the Artifact's place in the side area: the one opened last of the two shows, and closing it gives the other back. It keeps that place's width memory, resize handle and Expand in the row; on a phone it covers the conversation as a page of its own (Back closes it, the system Back too).
- **Head:** the address, host as the title (bold), the rest as the description (muted); both truncate on their own and can be selected and copied. Then its own actions, Open in new tab (`arrow-up-right`), the width toggle and Refresh (`refresh-cw`), then the window controls, Expand and Close. The address shown is the one opened: the page is another site, so where the person navigates inside it can't be read.
- **Width is one button in the head,** not a segmented control under it, so the head stays one line (Jasper, 2026-11-10). Its icon and its name are the width it switches to: Phone width (`smartphone`), a 390px frame centred on `fill-subtle`, or Desktop width (`monitor`). A phone has no width button: the page is already the whole screen.
- **The way out is always on screen.** Many sites refuse to be shown inside another site (X-Frame-Options, CSP frame-ancestors); the frame then stays blank and the app can't tell. One quiet line at the foot says "Page not showing? Open in new tab", in `caption`, muted, with a muted text link, for every page.
- **An http:// page is never framed** (the browser blocks it as mixed content): an empty state says the page can't be shown here, with one button, Open in new tab; the button is the way out, so the cause needs no sentence of its own. (A card button only opens https pages today; the rule holds for anything that opens the panel.)
- **Focus** moves into the panel when it opens; Close and Escape close it and put focus back on the button that opened it.
- **A head that runs out of room:** Refresh steps out first, then the width button, then Open in new tab (the foot's line still opens one); Expand and Close always stay.

**Why it is safe to show**

The page runs in a sandboxed frame with only what an ordinary page needs (scripts, its own origin's storage, forms, popups that open as normal tabs, downloads), never top navigation, modals or any device permission (`allow=""`), no referrer, and in Chromium without the person's cookies (`credentialless`). It is another origin than Raft's, so it can never read or change Raft.

### Popovers

A popover belongs to the family of what it is about, not to the family of popovers. A popover about an app's item is the same card, floating: its own popover frame and shadow, the item card's 400px, and inside it the same parts from `messageCard`, the body, the title, the details and the buttons, with the same 12px inset. A reader who hovers a link and then sees its block card in a later message reads the same thing twice. Two popovers are about an item:

- the item card a link opens on hover ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md#item-card) `size="item"`);
- the question the same link asks, before the reader has allowed the app, whether to show its previews ([Popover](../../packages/ui/src/components/popover/popover.md) `size="item"`). It stands in for the item card the chip will open once allowed, so it looks like it, not like the other popovers (stdrc, 2026-11-10).

The trade-off is that these two sit 4px tighter than every other popover, which keeps 16px ([Popover](../../packages/ui/src/components/popover/popover.md#rules)): a popover with a field or a choice is a small step of its own, and a profile card is about a person, not an item, so both keep the popover's inset. One thing differs from a card in a message: a popover puts its source, the app and the host, in a caption under a hairline at the bottom (`messageCard`'s `sourceFooter`, PreviewCardFooter), not in a row at the top, so the title is the first thing under the pointer.

## A card that asks for something

Some cards ask a person for something: an approval, an answer, a confirmation, a sign-in. Such a card has a life: it waits, sometimes pauses while the channel changes, and ends one way or another, and it stays in the conversation as the record of how it ended. Before, every way it could end was squeezed into one state, so a denied or failed request showed as a green Done, a declined one as a grey Expired, and a withdrawn one as View only. Each card now carries three things the server works out and sends, and the client draws them as they come: its phase, how it ended, and what the person looking at it may do (Kirby and Tenny, 2026-11-23, Phase 0 of the v4 design for one card system in conversations). A client's clock only disables a button a moment early; it never decides a phase.

- **Phase**: the card is active (it waits for someone), its members are changing, it needs confirming again, or it is settled.
- **Outcome**: once it is settled, how it ended: done, denied, declined, expired, withdrawn, failed or unavailable. A settled card always has one; no outcome stands in for another.
- **Who can act**: whether the person looking can act on it, and if not, whom it waits on (`viewerAccess.canAct`, `viewerAccess.waitingOn`).

It is drawn on [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md): the state is the status pixel and word at the end of its header, and the record is the line under its title.

### Phases

| Phase | State label | Tone | The card |
| --- | --- | --- | --- |
| Active, and the person can act | None | — | Open, with its buttons |
| Active, and someone else must act | Waiting on {name} | Neutral | Open, with no buttons |
| Members changing | Members changing | Neutral | Open, its buttons disabled |
| Needs confirming again | Needs confirming again | Warning | Open: what changed in who will see it, and one button, Confirm |
| Settled | The outcome (below) | The outcome's | Folded to its header, with the record line |

- **A card the person can't act on stays open.** Don't fold it and don't write View only: everyone else in the channel needs to see what is asked and how far it has got, and "View only" says what the reader can't do instead of where the card stands. The label says whom it waits on, from `waitingOn`, by display name without @, or by role when it waits on anyone in one (Waiting on an admin), as a card names people everywhere ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md#content)). There are no buttons, not disabled ones: a button the reader can't use invites a press that does nothing. A question's options are its content, not its buttons, so other people see them, disabled ([Questions](./questions.md#rules)).
- **Members changing is the one phase that keeps disabled buttons.** The person on it can act, only not until the members settle, which takes seconds: the buttons stay where they will be pressed, so the card doesn't jump when they come back, and the label already says what it waits for. A card that waits on someone else has no buttons at all, because for that reader they never come back.
- **A label describes a state, never an internal term or an action.** The phase in which a channel's members change is shown as Members changing, not Frozen; the one after it as Needs confirming again, and the button that does it says Confirm. A label that names an action reads as a second button, and an internal word means nothing to the reader.
- **Needs confirming again is the one active phase with a tone:** it stays wrong until someone acts, as Needs action does for a computer ([Status](./status.md#one-chain-one-verdict)), and the person who can confirm should find it among neutral cards.


### How it ended

| Outcome | State label | Tone | The record line says |
| --- | --- | --- | --- |
| Done | Done | Success (lime) | Who, the result, when: "Approved by Martin · 10:42" |
| Denied | Denied | Neutral | Who denied it, when, and the reason they gave, in short |
| Declined | Declined | Neutral | Who declined it, that nothing changed, when |
| Expired | Expired | Neutral | When it expired, and that the agent can send it again if it is still needed |
| Withdrawn | Withdrawn | Neutral | Who withdrew it (the agent or person who sent it), when |
| Failed | Failed | Warning (orange) | What failed and the next step |
| Unavailable | Unavailable | Warning (orange) | That what it depends on is not available now |

- **Refusing is a decision, not an error.** Denied and Declined are neutral, told apart by their words: a person who said no did their part, and a red card would read as something that went wrong. Denied answers a request for permission; Declined turns down something prepared for the person to confirm.
- **No outcome is red.** Red means a consequence that can't be undone ([Color](../foundations/color.md#meanings-of-color)), and a card's outcome is a record, not a consequence about to happen. Failed and Unavailable are orange, the color of something that went wrong and interrupts; Failed is told from Unavailable by its word and its record line, which says the next step. A column of refusals stays neutral, so the one failure among them is the card that stands out.
- **Done is the success color, and only for what was done.** A denied, expired or failed card is never Done.
- **Expired and Withdrawn are neutral:** nothing happened, and nobody has anything to do. **Unavailable is a warning:** something it depends on stopped, which may come back. Only an agent's call (`agent:approve_call`) goes from Unavailable back to active, when the call is waiting again and no one has acted on it.
- A settled card folds; a failed one may stay open, as its kind sets, to show why it failed and the next step. A press that fails and can be tried again doesn't settle the card: show a toast and leave it as it was ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md#states)).


### The record line

- **The folded line carries no ✓, ✕ or → symbol.** The label already says how it ended; the line says who, when and what the result was, in words. A symbol beside the label says the outcome a second time, and an arrow or a cross reads differently in every language and to a screen reader.
- The time is the header's meta, at the end of the line, not text in it ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md#content)).
- The line is the server's (`summaryLine`, `settledBy`), so the card reads the same folded on every client without opening its details.

### Buttons on a card that asks

- **At most one primary button per card:** the one that does what the card asks. It is the bordered button, last in the row ([Buttons](#buttons)); everything else is frameless or in the More menu. Two buttons of the same weight leave the person to work out which one is the request.
- **Only an action that can't be undone is red, and only it asks first** ([Color](../foundations/color.md#meanings-of-color)): it opens a confirmation dialog whose confirm button is `danger`; the card's own button stays ink, because the warning belongs where the person commits ([Feedback](./feedback.md#confirming)).
- **Denying and declining can be undone, so they are neither.** Deny and Decline are ordinary frameless buttons, not red, and they ask nothing first: nothing has been done that a person would need to take back, and the agent can ask again.

- **The refusing button is Deny when the card asks for permission, Decline when it asks the person to confirm something prepared for them.** The button that agrees repeats the title's verb and object, as on every action card ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md#content)): "Allow access to #growth", not "Approve". The refusing one is a single word, because what it refuses is already in the title.

### Undo after an answer

- After a person answers a card, the host draws an undo bar in its place for **1.5 seconds**, always the same, not a range; then the answer is sent. Every card in every client gives the same window, so the hand learns it, and the agent waiting on the answer is held back no longer than that.
- It is the card's own bar, not a [Toast](../../packages/ui/src/components/toast/toast.md): a toast's Undo is for an action on a list and keeps its own time.

### Icons

The header icon says what kind of thing the card asks for, from the one table of meanings that cards, menus and settings share ([One meaning, one icon](../foundations/iconography.md#one-meaning-one-icon)). Two kinds of card that ask for different things don't share an icon.

## One place for the styles

The rules above are values in two recipes, and the components only use them:

- `messageEmbed`: the frame and its `size` (`item`, `content`).
- `messageCard`: `source` and its icon, name and host; `sourceFooter`, the source as a popover's caption; `body`; `eyebrow`; `title` and `heading` (the title's type alone, for a title that shares a row); `meta`; `metaLine`, a card with a preview's one line of details at its foot; `actions` and `actionRow`; `actionGroup`, the buttons when a status line shares their row; `inset`; `popover`, the item popover's width.

Both are exported from `@botiverse/raft-ui`, beside MessageEmbed, so an app's own card (an Artifact card, an audio card) takes the same parts: `messageCard().title()`, `messageCard().meta()`, and the width from `MessageEmbed size`.

`packages/ui/src/card-styles.test.ts` reads every component folder that builds on MessageEmbed, PreviewCard or these recipes, found by what its code uses rather than from a list, so a new card is read the day it is written. It fails on any class there that writes a card's radius, a width (`max-w-md`, `w-[440px]`), an inset of 8px or more (`p-2.5`, `px-4`, `px-[14px]`) or a title size (`text-headline`, `text-[17px]`) by hand, and names the file, the line and the class, with a message that points at these recipes. Its exceptions are listed by file and class, each with its reason: the profile card, a plain popover, MessageReplies' summary and the parts inside a card that aren't the card's (a permission tile, a property's label). To change how cards look, change the recipe; to add a card, build it on the recipe, and the test keeps it there.

## Wide and narrow

- Below 768px an item card takes the message's full width. A content card is already as wide as the text.
- Below 768px a card's text preview is at most 4 lines and its image at most 120px tall ([A card with a preview](#a-card-with-a-preview)).
- An item popover doesn't open on a phone: a tap opens the link ([App links](./navigation.md#app-links)).

## Related

- [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), [AppLinkCard](../../packages/ui/src/components/app-link-card/app-link-card.md), [PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md), [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), [MessageReplies](../../packages/ui/src/components/message-replies/message-replies.md)
- [Navigation: app links and block cards](./navigation.md#app-links)
- [Built from existing parts](../components/overview.md#built-from-existing-parts)
