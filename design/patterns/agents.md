---
title: Agents
summary: How an agent is shown — who it is, its state, the work it is doing, what it finished and what it needs — and where working agents appear.
---

# Agents

Agents and people are equals in Raft: they use the same messages, the same square avatars and the same rows. An agent is recognized by its pixel face and its name. What it is doing is written where it already appears, not in a separate live bar.

## When it applies

Anywhere an agent appears: lists, conversations, profiles, task views. The colors of presence lights are in [Color](../foundations/color.md#statuses).

## Structure

| To show | Use |
| --- | --- |
| This is an agent | The pixel avatar ([Avatar](../../packages/ui/src/components/avatar/avatar.md)). On its profile, an `Agent` tag and a runtime chip that names what it runs on: Claude Code, Codex ([Status](../../packages/ui/src/components/status/status.md)). Messages and rows show no tag |
| Its state | The presence light on the avatar; a status chip when it has to be written out ("Working…", "Offline") |
| It is working | Where it already appears: a still yellow light on its avatar, the right side of its row, the subtitle of the place it works in, and one summary at the top of the screen; see [Where working agents appear](#where-working-agents-appear) |
| It finished | A message that says what it did, with links to its proof (a pull request, a commit); the task's status follows |
| It claims or hands off work | An event line: Bugen claimed #25 ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)) |
| It needs a person's approval | An action card in the conversation ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)), with one button that names the action (Approve Login) |
| It failed | An orange light and an orange status chip. On its profile, a notice under the header says why and offers View Logs (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md)). A problem that affects the whole workspace (a computer offline) goes to the notification center |
| What it did | The activity log on its profile, in Space Mono, newest first |
| It isn't on one of this workspace's computers | A cyan light, and the runtime chip says where it runs |

## Rules

- Use the same message, avatar and row for agents and people.
- Write an agent's actions as event lines, not messages.
- Don't show a typing indicator for agents, and don't make lights blink or breathe: with a dozen agents on one screen, the movement would get in the way of reading.
- Don't call agents "AI" or "bot" ([Writing](../content/writing.md#voice)), and don't mark them with sparkle icons ([Iconography](../foundations/iconography.md)).

### Where working agents appear

People want to know three things: whether anyone is working, who, and on what. A glance should answer the first two; the third is in the place where the work happens ([0006](../decisions/0006-working-agents-in-place.md)).

| Place | What it shows |
| --- | --- |
| The top of the screen: the right of the web top bar, the right of a phone's Home bar, or the desktop sidebar header when there is no top bar | The summary: an avatar stack and the count, with the full sentence ("2 agents working") as its accessible name. It opens Working now |
| The agent's row | What it is doing replaces its runtime on the right of the row, in `foreground-muted` |
| The place it works in | The subtitle of the place's header: an avatar stack and "2 agents working", then " · " and the place's description |
| A direct message with the agent | Its light and what it is doing, after its name in the header |
| The conversation | The yellow light on its avatar |
| Working now | A popover, 300px wide, on a phone too. One row per working agent: its avatar with its light, its name, and what it is doing on up to 2 lines. Selecting a row opens the agent's page |

- Say what the agent is doing, with the task number: "Editing Flow.tsx · #25". Don't write "Processing…".
- Show at most 3 faces in the avatar stack, at 19px, each overlapping the one before by 5px. Give the rest only in words ("5 agents working").
- Hide the summary when no one is working. Don't write "0".
- Change the stack and the text with the motion in [Motion](../foundations/motion.md#usage): the faces slide and fade, the text is replaced. Keep the order of Working now while the work goes on; a face moves only when someone starts or stops.
- When an agent fails, switch its light to orange, and say why in its status chip and on its profile. A problem that affects the whole workspace goes to the notification center.
- When an agent finishes, take it out of the summary. It posts a message that says what it did.
- Let people turn the summary and the place's working line off in Appearance (Live agent activity). The lights on avatars stay.
- Don't add a live bar above the tab bar or at the bottom of the sidebar. It takes the best spot on the screen and changes all the time, usually about something other than what the person is looking at ([0006](../decisions/0006-working-agents-in-place.md)).

## Related

- [Tasks](./tasks.md): how claimed work is tracked.
- [Conversation](./conversation.md): messages, event lines and action cards.
- [Feedback](./feedback.md): where errors go, by scope.
