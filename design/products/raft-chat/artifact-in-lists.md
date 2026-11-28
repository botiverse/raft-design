---
title: Raft Chat — An Artifact in a card or a list
summary: Which facts about an Artifact each place that shows one as a card or a row shows, and why — seven kinds of information, each drawn the same way everywhere, chosen per place by the question it answers.
---

# Raft Chat — An Artifact in a card or a list

An Artifact shows up in many places besides its own page: as a card under a message, a tile on the Artifacts home page, an Activity row, a search hit, a row in Linked from, the Forward dialog's preview. Each place answers a different question, so each shows a different selection of what there is to say about the Artifact. What stays the same everywhere is how each kind of information looks and reads: the same fact is the same part, from the same component, wherever it appears (xxchan, 2026-11-28, #proj-mobile:#440). Consistency is the same fact drawn the same way, not every place drawing every fact.

Before, each place had grown its own selection and its own drawing: a message card said its channel's name inside that channel and "v3" on every card, the home page's rows said the version nowhere, the files panel said it always, and the type was a 40px tile in one place, a line icon in another and nothing in a third.

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
| Artifacts home page, tile and row | Which of mine, and where? | Yes | Yes | Author; no time on a tile | Yes | Settled, dimmed | Yes | No |
| Activity | What happened? | Yes, after the event | No | The event's actor and time | The event is the news | No | Yes | No |
| Search | Is this the one I mean? | Yes | The matched snippet | Yes | No | No | Yes | No |
| Linked from | Who talks about it? | No: the page is about it | No | The message's | No | No | The message's channel | No |
| The opened Artifact | — | The tab | The page itself | The details | The notices | The details | The details | Always, in the head |

Why each cell is what it is:

- **Identity everywhere, once.** The type helps decide whether to open it, a page to read or a table to sort (artin asked for it back, 2026-11-28); the title said twice took room and read as two things. Linked from leaves it out: it is on the Artifact's own page, which has just said it.
- **The content picture where the decision is made on what it says**: under a message and on the home page. A search hit shows the snippet that matched instead, which is why it was found. Activity shows the event, not the content.
- **News only where it is for the reader**: a message card and the home page carry it; Activity's row is the news; a search hit and a preview are not about what is new to someone.
- **Location only where the list mixes places**: the home page, search and Activity. In a conversation, a card under a message or that channel's own panel, the place is the one the reader is in, or is read after opening; the message around the card says why it is there (xxchan). The server-wide or public pill is location too ("who can see it"), so it leaves the message card with the channel tag (Remy, 2026-11-28); Share and the details say it.
- **Version only when it matters**: when what is shown is an older version and a newer one exists, both numbers, so the reader knows they will open an old one. "v3" alone doesn't help decide anything. The home page always lists the latest, so it never says a version. The opened Artifact names its version always: there the version is what changes when the author has done what was asked ([Artifact page](./artifact.md#the-head)).

## Rules

- Draw each kind with its part (the table above), never a place's own markup for it: a fact that looks different in two places reads as two facts.
- Choose what a place shows by its question (the table above), and write the reason beside a place that differs from it.
- Say the title once, at the top, after the type chip; an item whose type has no label keeps the 16px `ArtifactIcon`.
- Leave out a leading level-1 heading from an excerpt that sits under the title.
- Put who, when, the comment count and an older version on one small line at the foot, between dots; the author's name gives way first.
- Say the version only as `v2 · latest v4`, and only when the shown version is older than the latest.
- Say where the Artifact lives only in a place that lists Artifacts from many places.
- A preview of what will be sent is the card that will be sent, inert, without the reader's news.

The card under a message is drawn by [Cards in messages](../../patterns/cards-in-messages.md#a-card-with-a-preview); the opened Artifact by [Artifact page](./artifact.md).

## Differences from the shared patterns

- **The home page's cover keeps the heading.** A tile's cover is a picture of the page, at its scale, so it keeps a leading level-1 heading as the page shows it; the excerpt under a message's title leaves it out, since the title row has just said it.
- **No time on a home tile.** The home page groups tiles by date, so the group's heading already says when; the list row, which can be sorted otherwise, keeps it.

The places other than the card under a message move onto these parts one at a time, each in its own change, starting with the home page; until then they keep their own drawing (#proj-mobile:#440).
