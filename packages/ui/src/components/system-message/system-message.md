---
title: SystemMessage
summary: An event line in a conversation — a date, a claim, a hand-off, a status change — set in Space Mono between hairlines, alone or collapsed into a group.
status: stable
aliases: [Event line]
category: content
related: [message-item, message-replies, timeline]
---

# SystemMessage

An event line: one centered line in the timeline that records something that happened, such as a date, "Bugen claimed #25" or a task moving to Done. It isn't a message: nobody wrote it, so it has no avatar or name. A run of event lines can collapse into one summary line.

```example
system-message/compositions/preview
```

## When to use

| Situation                                                                                    | Use                                            |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| A date in the timeline                                                                       | SystemMessage                                  |
| An action: someone claimed, handed off, finished or moved a task; joined or archived a place | SystemMessage                                  |
| Several event lines in a row                                                                 | `SystemMessageGroup`, collapsed to one summary |
| Something a person or an agent said                                                          | [MessageItem](../message-item/message-item.md) |
| An agent's full history of actions                                                           | [Timeline](../timeline/timeline.md)            |

Agents write their actions as event lines, not messages; see [Hand-offs and approvals](../../../../../design/people-and-agents/handoffs-and-approvals.md#event-lines).

## Anatomy

- `SystemMessage`: the line, with a hairline on each side.
- `SystemMessageTime`: when it happened. Optional.
- `SystemMessageContent`: what happened. Required.

A group adds:

- `SystemMessageGroup`: the collapsible group.
- `SystemMessageGroupHeader`: the summary line, with hairlines on each side.
- `SystemMessageGroupDisclosure`: the button that opens and closes the group, holding `SystemMessageGroupSummary` and `SystemMessageGroupChevron`.
- `SystemMessageGroupPanel`: the event lines inside.

## Variants

| Variant            | Use for                                               |
| ------------------ | ----------------------------------------------------- |
| A single line      | One event between messages                            |
| A group of updates | A run of task and system updates, summarized by count |

```example
system-message/compositions/grouped-updates
```

```example
system-message/compositions/grouped-generic
```

## Behavior

- A line keeps one line: its content truncates, and the full text is in its `title`.
- A single line keeps 12px above and below it; lines inside an open group sit closer together.
- The group's chevron turns when the group opens.

## Content

- Name who did it, the verb and the item: "Bugen claimed #25", "Wug → Martin · review #25", "Martin moved #25 to Done".
- Use teammate verbs and display names ([Writing](../../../../../design/foundations/writing.md#voice)).
- Don't start a line with an emoji: emoji are content, not icons ([Iconography](../../../../../design/foundations/iconography.md)).
- Summarize a group by count and kind, in sentence case: "3 updates: 2 task updates, 1 system message".

## Accessibility

- A single line is a plain `div`; it isn't interactive.
- Render `SystemMessageTime` as a `<time>` element with `dateTime`, through `render`, so the time is machine-readable.
- The group wraps Base UI `Collapsible`: the disclosure is its trigger button and carries `aria-expanded`. The summary text is its accessible name; the chevron is hidden.

## Rules

- Set event lines in Space Mono, `text-mono-meta`, in `foreground-hint`, centered between two `line-hairline` rules. Machines write them ([Typography](../../../../../design/foundations/typography.md)).
