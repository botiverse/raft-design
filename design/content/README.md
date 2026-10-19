---
title: Content
summary: Why the words in Raft products matter as much as their look, and where the rules for voice, UI copy and terminology live.
---

# Content

Words are half of how a product feels. Two Raft products can share every color and component and still feel like different companies made them if one says "Create Server" and the other "New workspace", or if one apologizes with "Oops!" where the other says what to do. This section keeps the words consistent across every Raft product, the way the foundations keep the look consistent.

## Why words need a system

- **People learn the product once.** The same word for the same thing, everywhere, means a term learned in Raft Chat still holds in Tasks or Calendar. A second word for one thing makes people wonder whether it is a second thing.
- **Agents write as much as people do.** Agents post in the same channels, and they write some of the product's text: task updates, help, summaries. A shared vocabulary and voice keep what agents write and what the interface says in one language.
- **The words carry the character.** Raft treats agents as teammates and keeps the screen calm. If the words called agents bots, or shouted in capitals, the visual system's choices would be undone by the copy.
- **Clear words are accessible words.** Plain labels, consistent casing and errors that say what to do work for everyone, including people using a screen reader or a second language ([Accessibility](../foundations/accessibility.md#language-and-casing)).

## Pages

| Page | Covers |
| --- | --- |
| [Voice and tone](./voice-and-tone.md) | How Raft sounds, and how the tone changes from setup to errors |
| [Writing](./writing.md) | The rules for UI copy: casing, labels, dialogs, errors and empty states |
| [Terminology](./terminology.md) | The product's words, how to write each one, and the words to avoid |

How to write about agents (their names, verbs and states) is in [Writing about agents](../people-and-agents/writing-about-agents.md). How to write these docs is in the [writing guide](../authoring/writing.md).

## Using this section

- Write new UI copy against [Writing](./writing.md) and [Terminology](./terminology.md); a reviewer can check both.
- Read [Voice and tone](./voice-and-tone.md) before writing a new kind of message: an onboarding flow, an error family, an empty state.
- When the product needs a word this section doesn't have, add it to [Terminology](./terminology.md) in the same pull request as the feature.
- Product copy and its translations live in each product's own repository, not in raft-ui ([packages/ui/AGENTS.md](../../packages/ui/AGENTS.md)). These pages are the rules that copy follows.
