---
title: Status
summary: The square status pixel — a presence light, an attention dot or a status color beside a word — and the status chips, agent tag and runtime chip built with it.
status: stable
aliases:
  [StatusChip, status chip, StatusDot, presence light, attention dot, runtime chip, agent tag]
layer: core
category: data-display
related: [badge, tasks, avatar, task-card]
---

# Status

Status is the square pixel of a status color. On its own it is a presence light or an attention dot; beside a word it is a status chip, a soft tint with a pixel and a word that says where something is or how an agent is. Task status chips are `TaskStatusBadge` ([Tasks](../tasks/tasks.md)); this doc covers the pixel, the chips for agent states, and the two small chips that go with an agent's name: the `agent` tag and the runtime chip.

```example
status/compositions/default
```

## When to use

| Situation                                                                           | Use                                                                                                                               |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Where a task is: on a card, in properties, in details                               | `TaskStatusBadge` ([Tasks](../tasks/tasks.md))                                                                                    |
| A task mentioned in running text                                                    | `TaskChip` ([Tasks](../tasks/tasks.md))                                                                                           |
| How an agent or a person is, on its avatar                                          | The presence light, `AvatarBadge` ([Avatar](../avatar/avatar.md))                                                                 |
| How an agent is, written out: a profile card, properties                            | An agent state chip                                                                                                               |
| A status color beside a word: a group heading, a navigation subtitle, an event line | Status                                                                                                                            |
| Something waits, on an icon with no room for a number                               | The attention dot: Status with `variant="accent"`                                                                                 |
| An agent has read the message that mentions it                                      | Not a light: a lime check, `MessageReferenceReadMark` ([MessageItem](../message-item/message-item.md#read-receipts-on-a-mention)) |
| A count                                                                             | [Badge](../badge/badge.md)                                                                                                        |
| This is an agent                                                                    | The `agent` tag                                                                                                                   |
| What an agent runs on                                                               | The runtime chip                                                                                                                  |

## Anatomy

- `Status`: the pixel, with an ink edge. `presence` draws one of the five presence lights; `variant` draws a color role. `size` sets the pixel.

## Sizes

- **A status light beside text has one size, 10px** (`md`, the default) with a 1.5px ink edge: in a badge, a panel header, a sidebar row, a list row. Don't pass a size there. 10px is 7px of color, more than the 6px it takes to tell green from yellow from orange, plus two 1.5px ink edges, and about the cap height of the 14px text beside it.
- **The light is even because its rows are.** Every line and box it sits in is an even number of pixels (lines of 16px to 24px, 20px and 22px chips, 36px rows), so an even light has the same space above and below it and lands on a whole pixel. The 9px light it replaced had half a pixel left over, and a screen can't split it: the light was drawn with one more device pixel above it than below, 0.5px below the center on a 1x screen and 0.17px on a 3x one. Decided by stdrc on 2026-10-22, replacing the 9px of [#670](https://github.com/botiverse/raft-design/pull/670). The same 10px is every light and dot that sits beside text: the task status pixel, the attention dot of an unread row, a notice or an action card's status, the timeline's marker. None of them is 9px.
- **A light on an avatar follows the avatar**, not the text: `AvatarBadge` sizes it from 6px to 20px with the avatar ([Avatar](../avatar/avatar.md)), at about a third of it, on its corner rather than centered in a row. Its 9px on a 27px avatar is that scale, not the light beside text, and stays.
- When the light leads a line of text it is centered on the first line ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)). Badge and PanelActivity place a `Status` in them this way and hold it at 10px whatever size it was given; elsewhere, give it `className="lead-dot"`.
- A notice (a toast, a banner, a panel notice) never uses a status light to say what kind of notice it is (success, info, warning, error); it leads with its intent's icon, or an avatar when it is about someone ([Banner](../banner/banner.md#variants), [Toast](../toast/toast.md#variants)). One square mark must not carry several meanings, and a status light keeps its own, the ones in [When to use](#when-to-use): whether an agent, a person or a computer is working or online, a task's status, and the square attention dot that marks something waiting or unread. A notice about one of those things may still show that thing's light inside it.
- `xs`, `sm` and `lg` (6px, 8px and 11px) are not for a light beside text. `sm` is the attention dot on an icon's corner (a rail item, a page button in the server popover).

## Variants

### Presence lights

| `presence` | Word           |
| ---------- | -------------- |
| `online`   | Online         |
| `busy`     | Working        |
| `error`    | Error          |
| `offline`  | Offline        |
| `external` | External agent |

Their colors, and the five task status colors, are in [Color](../../../../../design/foundations/color.md#statuses).

### Agent state chips

An agent state chip is a soft [Badge](../badge/badge.md) holding a Status with its `presence` and the word from the table above. The tint is the soft step of the light's color: `brand-soft` for Working, and the `*-soft` tint of the same family for the others ([Soft tints](../../../../../design/foundations/color.md#soft-tints)).

### Agent tag

The `agent` tag follows an agent's name and holds the word `agent`. It is an outline [Badge](../badge/badge.md): Space Mono, `foreground-muted`, with a hairline border. With a `users` icon in place of the word, the same tag shows a member count.

### Runtime chip

The runtime chip names what an agent runs on: Claude Code, Codex. It is Space Mono in ink on `info-soft`, with a `cpu` icon. raft-ui has no part for it yet.

## Content

- Pair every status color with a word. Write the word in Title Case: In Progress, Working.
- Set IDs inside a chip in Space Mono: `#25`.

## Accessibility

Status renders a `<span>` and wraps no Base UI primitive.

- Hide a pixel from assistive technology when its word is next to it (`aria-hidden`).
- Give a pixel with no word next to it, such as an attention dot on a tab or a rail item, `role="img"` and an `aria-label` that says what it means.

## Rules

- Keep saturated color to the size of the pixel. On a chip the rest is a soft tint, a highlight without a border: a screen can hold a dozen chips.
- Make every chip 22px high with `radius-chip`, so chips line up in a row; Badge and TaskChip already do.
- Put a new state into one of the five task statuses or the five presence lights; don't invent a color. "Stuck" is an agent error. "Needs you" is an attention dot and an action button, not a status ([Tasks](../../../../../design/patterns/tasks.md#rules)).
- Don't set a custom `--status-color`: every status color has a fixed meaning.
- Never animate a status: a working agent is a still light ([Motion](../../../../../design/foundations/motion.md)).
