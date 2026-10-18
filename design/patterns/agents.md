---
title: Agents
summary: How an agent is shown — who it is, its state, the work it is doing, what it finished and what it needs — and where working agents appear.
---

# Agents

Agents and people are equals in Raft: they use the same messages, the same square avatars and the same list rows. An agent is recognized by its pixel face and its name. What it is doing is written where it already appears, not in a separate live bar.

## When it applies

Anywhere an agent appears: lists, conversations, profiles, task views. The colors of presence lights are in [Color](../foundations/color.md#statuses).

## Structure

| To show | Use |
| --- | --- |
| This is an agent | The pixel avatar ([Avatar](../../packages/ui/src/components/avatar/avatar.md)), and the `agent` tag after the name. A runtime chip names what it runs on: Claude Code, Codex ([Status](../../packages/ui/src/components/status/status.md)) |
| Its state | The presence light on the avatar; a status chip when it has to be written out |
| It is working | Where it already appears: a still yellow light on its avatar, the second line of its row, its status line in the conversation, and one summary line at the top of the page; see [Where working agents appear](#where-working-agents-appear) |
| It finished | A message with the evidence strip (CI, commit, snapshot); the task's status follows |
| It claims or hands off work | An event line: Bugen claimed #25; Wug → Martin · review #25 ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)) |
| It needs a person's approval | An action card in the conversation ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)), also listed in Activity |
| It failed | An orange light; its row and its status line say why. A problem that affects the whole workspace (a computer offline) goes to the notification center |
| What it did | The activity log in a [Timeline](../../packages/ui/src/components/timeline/timeline.md), in Space Mono |
| It isn't on one of this workspace's computers | A cyan light, and the runtime chip says where it runs |

## Rules

- Use the same message, avatar and list row for agents and people. On a profile or detail page, list agents and people as [ListRow](../../packages/ui/src/components/list-row/list-row.md) rows in an inset group.
- Write an agent's actions as event lines, not messages.
- Don't show a typing indicator for agents, and don't make lights blink or breathe: with a dozen agents on one screen, the movement would get in the way of reading.
- Don't call agents "AI" or "bot" ([Writing](../foundations/writing.md#voice)), and don't mark them with sparkle icons ([Iconography](../foundations/iconography.md)).

### Where working agents appear

People want to know three things: whether anyone is working, who, and on what. A glance should answer the first two; the third is in the place where the work happens.

| Place | What it shows |
| --- | --- |
| Under the title of a phone's top-level page | The summary: an avatar stack, "2 agents working" and a chevron. It opens Working now as a bottom sheet |
| The desktop sidebar header, and a phone top-level page without a large title | The short summary: an avatar stack and the count, with the full sentence as its accessible name. It opens the same list, next to the avatar stack on desktop |
| The agent's row | On a phone, the second line becomes what it is doing (live, in ink), and the time becomes how long it has been working. In the desktop sidebar, the runtime is replaced by what it is doing |
| The place it works in | The top bar subtitle of a channel or similar page: an avatar stack and "2 agents working · 5 members" |
| The conversation | The yellow light on its avatar, and a status line under its name |
| Working now | One row per working agent: what it is doing (with the task number) and for how long. Selecting a row goes to where it works |

- Say what the agent is doing, with the task number: "Editing Flow.tsx · #25". Don't write "Processing…".
- Show at most 3 faces in the avatar stack, at 19px, each overlapping the one before by 5px. Give the rest only in words ("5 agents working").
- Hide the summary line when no one is working. Don't write "0".
- Change the stack and the text with the motion in [Motion](../foundations/motion.md#usage): the faces slide and fade, the text is replaced.
- When an agent fails, switch its light to orange and write the reason in its row. A problem that affects the whole workspace goes to the notification center.
- When an agent finishes, take it out of the summary. It posts a message with the evidence, and its row shows its last message again.
- Don't add a live bar above the tab bar or at the bottom of the sidebar. It takes the best spot on the screen and changes all the time, usually about something other than what the person is looking at; see [the decision record](../decisions/).

## Related

- [Tasks](./tasks.md): how claimed work is tracked.
- [Conversation](./conversation.md): messages, event lines and action cards.
- [Feedback](./feedback.md): where errors go, by scope.
