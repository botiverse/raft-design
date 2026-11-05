---
title: Sentence case for everything people click
summary: Buttons, menu items, tabs, links, tooltips, accessible names and task statuses use sentence case instead of Title Case, so all of Raft's text has one casing; names keep their capitals.
number: 0044
status: accepted
date: 2026-11-05
---

# 0044. Sentence case for everything people click

This replaces the Title Case part of [decision 0002](./0002-no-all-caps.md). Its rule against all caps stands.

## Context

[Decision 0002](./0002-no-all-caps.md) put every text in sentence case except clickable text, which kept the product's Title Case: Create Task, Mark All Read, Sign Out. Title Case came with a list of short words to keep lowercase (a, the, to, in, from…) and exceptions to that list (Sign In, Turn On), so a label took a rule to write and another to check. Menu items have grown long, such as Create Task from Message, and long labels in Title Case read awkwardly. Chinese has no case, so translators had one more thing to carry over. The lead (stdrc) decided to change the system on 2026-11-05 in #proj-raft-ui:10ce032d.

## Decision

- Everything people can click or that names an action is in sentence case: buttons, menu items, tabs and tab bar items, segmented controls, text links, the tooltips and accessible names (`aria-label`) of icon buttons, and a dialog or sheet title that repeats its button's label. Create Task becomes Create task, Mark All Read Mark all read, Create Task from Message Create task from message, View in Channel View in channel, Sign Out Sign out, Add Reaction Add reaction.
- A word has a capital inside a label exactly when it has one in the middle of a sentence. Names keep theirs, as [Writing](../content/writing.md#casing) lists them: Raft and its products, plans and features named as proper names (Agent Lounge, Stamp, Porthole, Raft Computer, Artifact, Pro), people, agents, servers, channels, third-party names (GitHub, Slack, Google) and acronyms.
- Only the destinations and views [Terminology](../content/terminology.md#places) lists, and the task statuses, are names among the product's own places: the product and the docs write them with a capital mid-sentence ("open Settings", "moved #25 to Done"), so they keep it in a label: Back to Home, Remove from Saved, Restore to Active, Move to Backlog, Mark as Done. The statuses are Backlog, Todo, In progress, Done and Closed; a status of more than one word is itself in sentence case (In progress, In review).
- Every other group heading, section and settings page is in sentence case: Direct messages, Joint channels, Plan & billing, IM bridges, MCP servers, AI providers, Release notes, Language & region, Server profile, Server settings.
- Roles, states, permission names and other nouns are lowercase inside a label, as mid-sentence ("only an owner or admin can…"): Invite members, Visible to guests, Mark as unread, Create agents. A label of a single word starts with a capital: Settings, Members, Owner, Admin.
- Titles that don't repeat a label, descriptions, empty states, event lines and other sentences are not part of this decision and don't change, except a status of more than one word, which takes its own spelling (moved #25 to In progress).

## Consequences

- The rules live in [Writing](../content/writing.md#casing) and [Typography](../foundations/typography.md#casing), with the examples in [Terminology](../content/terminology.md), [Accessibility](../foundations/accessibility.md#language-and-casing), the component docs and the docs' examples.
- Title Case's list of short words to keep lowercase is gone. One test, "a capital in the middle of a sentence", decides each word of a label, and Terminology decides which places are names: it gains Active (with Activity's other views) and Artifact.
- raft-ui's one built-in English label of more than one word, `AppShellSidebarTrigger`'s, reads Collapse sidebar and Expand sidebar.
- Product strings in Title Case are now the ones out of line ([Terminology](../content/terminology.md#where-the-product-isnt-consistent-yet)): fix them when you touch them.
- To undo it: put back Title Case and its short-word rule in Writing and Typography, and the labels in the examples and in `AppShellSidebarTrigger`. Nothing else depends on the casing.

## Alternatives considered

- **Keep Title Case for clickable text.** Casing told people what is a control, but at the cost of awkward long labels and a rule with exceptions that every writer and translator had to learn.
- **Destinations and statuses as ordinary words** (Remove from saved, Move to backlog). The product writes them as names mid-sentence ("moved #25 to Done"), so a label would spell them differently from the sentence beside it.
- **Multi-word sections and settings pages as names in Title Case** (Direct Messages, Plan & Billing). The docs wrote them that way only because of the old label rule, so the mid-sentence test would repeat it back, and a list of such names would never be complete; one rule for every place except the few Terminology lists is simpler.
- **Title Case for buttons only, sentence case for menu items.** Two casings for controls that often carry the same words, such as a button and the menu item for the same action.

## Related

- [Writing](../content/writing.md#casing)
- [Typography](../foundations/typography.md#casing)
- [Decision 0002](./0002-no-all-caps.md)
