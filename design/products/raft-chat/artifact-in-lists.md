---
title: Raft Chat — An Artifact in a card or a list
summary: Which facts about an Artifact each place that shows one as a card or a row shows, and why — seven kinds of information, each drawn the same way everywhere, chosen per place by the question it answers.
---

# Raft Chat — An Artifact in a card or a list

An Artifact shows up in many places besides its own page: as a card under a message, a link's hover card, a tile on the Artifacts home page, an Activity row, a search hit, a row in Linked from, a row in a channel's Files or among the Artifacts opened lately, the Forward and share preview. Each place answers a different question, so each shows a different selection of what there is to say about the Artifact. What stays the same everywhere is how each kind of information looks and reads: the same fact is the same part, from the same component, wherever it appears (xxchan, 2026-11-28, #proj-mobile:#440). Consistency is the same fact drawn the same way, not every place drawing every fact.

Without one rule each place grows its own selection and drawing: a channel's name on a card inside that channel, a version on every card in one place and nowhere in the next, the type a 40px tile in one place and a line icon in another.

## Structure

What there is to say about an Artifact, in seven kinds:

| | Kind | What it is | Drawn as (raft-ui, slock web) |
| --- | --- | --- | --- |
| 1 | Identity | Its type and its title | The type chip (`FilePreviewBadge` `placement="inline"`: MD, HTML, CSV) before the title, said once (`ArtifactTitleLine`) |
| 2 | Content picture | The start of its text, its screenshot or cover | The excerpt (`ArtifactCardExcerpt`), without a leading level-1 heading; the screenshot cut from the top |
| 3 | Who and when | Its author, and when it last changed | Name · time, small and muted (`ArtifactMetaLine`, `messageCard().metaLine()`) |
| 4 | News for me | New comments, a new version, a mention of me | One accent [Badge](../../../packages/ui/src/components/badge/badge.md) after the title: "Updated · 2 new comments" |
| 5 | State | Settled | The Settled tag after the title |
| 6 | Location | Where it lives: a conversation, the whole server, public | The place in words with its icon (`#growth`, a lock, a DM's person, the globe) |
| 7 | Version | Which version is shown, when it isn't the latest | `v2 · latest v4` at the end of the meta line; the latest says nothing |

Each place shows what answers its question:

| Place | Its question | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Card under a message | Open this or not? | Yes | Yes | Yes | Yes | Settled | No | Only when behind |
| Forward and share preview | What will they get? | As the card | As the card | As the card | No: not the reader's news | As the card | No | As the card |
| A link's hover card | What is this link? | Yes | The description, or the start of its text | Who changed it, when | No | No | No | Only when behind |
| Artifacts home page, tile and row | Which of mine, and where? | Yes | Yes | Author; no time on a tile | Yes | Settled, dimmed | Yes | No |
| Activity | What happened? | Yes, after the event | No | The event's actor and time | The event is the news | No | Yes | No |
| Search | Is this the one I mean? | Yes, the title marked where it matched | No: search reads titles only | No | No | No | Yes | No |
| A channel's Files section | Which of this channel's? | Yes | No | When it changed | No | No | No: it is this channel | No: always the latest |
| Opened lately, Pinned, the pin picker, "Saved as Artifact" | Which one, here? | Yes | No | When it was opened or changed; Pinned also who; "Saved as Artifact" neither | No | No | No: it is this conversation | No: they open the latest |
| Linked from, its documents | Which other Artifacts link here? | Yes | No | Author, when | No | No | Yes | No |
| Linked from, its discussions | Who talks about it? | No: the page is about it | No | The message's | No | No | The message's channel | No |
| The opened Artifact | — | The tab | The page itself | The details | The notices | The details | The details | Always, in the head |

Why each cell is what it is:

- **Identity everywhere, once.** The type helps decide whether to open it, a page to read or a table to sort (artin asked for it back, 2026-11-28); the title said twice took room and read as two things. Linked from's discussions leave it out: they are on the Artifact's own page, which has just said it; its documents are other Artifacts, so they say theirs.
- **The content picture where the decision is made on what it says**: under a message, in a link's hover card (its description or the start of its text, as the card would show) and on the home page. A search hit is found by its title, as search reads nothing else, so the marked title is the whole match. Activity shows the event, not the content.
- **Who and when where people pick among many**: the message card, to judge whether it is fresh, and the home page, whose list mixes authors; a home tile leaves the time to its date group. A search hit is found by what it says and where it lives, so it leaves them out.
- **News only where it is for the reader**: a message card and the home page carry it; Activity's row is the news; a search hit and a preview are not about what is new to someone.
- **Location only where the list mixes places**: the home page, search, Activity and Linked from's documents. A link's hover card is a card in a conversation, so it leaves the place out as the card does. In a conversation, a card under a message or that channel's own panel, the place is the one the reader is in, or is read after opening; the message around the card says why it is there (xxchan). The server-wide or public pill is location too ("who can see it"), so it leaves the message card with the channel tag (Remy, 2026-11-28); Share and the details say it.
- **Version only when it matters**: when what is shown is an older version and a newer one exists, both numbers, so the reader knows they will open an old one. "v3" alone doesn't help decide anything. The home page, a channel's Files, the Artifacts opened lately, Pinned, the pin picker and "Saved as Artifact" all open the latest, so they never say a version. The opened Artifact names its version always: there the version is what changes when the author has done what was asked ([Artifact page](./artifact.md#the-head)).

## Rules

- Draw each kind with its part (the table above), not a place's own markup for it: a fact that looks different in two places reads as two facts. A row in a list of other things draws it as that list does (below).
- Choose what a place shows by its question (the table above), and write the reason beside a place that differs from it.
- In a card, a home page row or a Linked from document, say the title once, at the top, after the type chip; an item whose type has no label keeps the 16px `ArtifactIcon`.
- Leave out a leading level-1 heading from an excerpt that sits under the title.
- Put who, where (only where the rule below allows), when, the comment count and an older version on one small line at the foot, between dots; the author's name and the place give way first.
- Say the version only as `v2 · latest v4`, and only when the shown version is older than the latest.
- Say where the Artifact lives only in a place that lists Artifacts from many places.
- Show a preview of what will be sent as the card that will be sent, inert, without the reader's news.

The card under a message is drawn by [Cards in messages](../../patterns/cards-in-messages.md#a-card-with-a-preview); the opened Artifact by [Artifact page](./artifact.md).

## Differences from the shared patterns

- **The home page's cover keeps the heading.** A tile's cover is a picture of the page, at its scale, so it keeps a leading level-1 heading as the page shows it; the excerpt under a message's title leaves it out, since the title row has just said it.
- **No time on a home tile.** The home page groups tiles by date, so the group's heading already says when; the list row, which can be sorted otherwise, keeps it.
- **A row in a list of other things keeps that list's look.** Activity, search, a channel's Files, Pinned, the Artifacts opened lately and the pin picker list Artifacts among conversations, people and files, or in a compact list whose rows each start with an icon: there the type is an icon in the row's icon slot (the kind's, or the Artifact icon where the row doesn't know the kind), and the place and time read as their neighbors' do. A type chip in the title would make the Artifact the one row with two leading marks. The "Saved as Artifact" line under an attachment does the same, as the line of text it is.
- **A link's hover card is the App link card's layout.** It stands in for any App's item, so it keeps that card's parts: the type is the first of its details, after the title.

The card under a message, the Forward and share previews, the home page's tiles and rows, and Linked from's documents draw from these parts (#proj-mobile:#440); the rows above keep their lists' look.
