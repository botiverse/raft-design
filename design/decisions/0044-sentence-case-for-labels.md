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
- The task statuses are Backlog, Todo, In progress, Done and Closed.
- Names keep their capitals: Raft, and products and features that are proper names (Agent Lounge, Stamp, Porthole), people, servers, channels and third-party names (GitHub, Slack, Google). A label of a single word doesn't change: Settings, Members, Owner, Admin.
- Titles, group headings, descriptions and empty states were already in sentence case and don't change.

## Consequences

- The rules live in [Writing](../content/writing.md#casing) and [Typography](../foundations/typography.md#casing), with the examples in [Terminology](../content/terminology.md), [Accessibility](../foundations/accessibility.md#language-and-casing), the component docs and the docs' examples.
- Title Case's list of short words to keep lowercase is gone.
- raft-ui's one built-in English label of more than one word, `AppShellSidebarTrigger`'s, reads Collapse sidebar and Expand sidebar.
- Product strings in Title Case are now the ones out of line ([Terminology](../content/terminology.md#where-the-product-isnt-consistent-yet)): fix them when you touch them.
- To undo it: put back Title Case and its short-word rule in Writing and Typography, and the labels in the examples and in `AppShellSidebarTrigger`. Nothing else depends on the casing.

## Alternatives considered

- **Keep Title Case for clickable text.** Casing told people what is a control, but at the cost of awkward long labels and a rule with exceptions that every writer and translator had to learn.
- **Title Case for buttons only, sentence case for menu items.** Two casings for controls that often carry the same words, such as a button and the menu item for the same action.

## Related

- [Writing](../content/writing.md#casing)
- [Typography](../foundations/typography.md#casing)
- [Decision 0002](./0002-no-all-caps.md)
