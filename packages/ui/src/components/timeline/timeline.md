---
title: Timeline
summary: An ordered list of what happened — a task's history in task-status colors and plain words, or an agent's activity log in presence colors and Space Mono.
status: stable
aliases: [History]
category: content
related: [description-list, steps, status, tasks]
---

# Timeline

A Timeline lists what happened, in order. Each step is a status pixel on a hairline, with its title and its time. It has two uses: a task's History, in the colors of the task statuses and in plain words, and an agent's activity log, in the colors of the presence lights and in Space Mono.

```example
timeline/compositions/preview
```

## When to use

| Situation                                                                                                                              | Use                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| A task's History, collapsed under its properties in task details                                                                       | Timeline ([Composites](../../../../../design/patterns/composites.md#task-details))                                                        |
| What an agent did ([Hand-offs and approvals](../../../../../design/people-and-agents/handoffs-and-approvals.md#the-record-afterwards)) | Timeline, as an activity log                                                                                                              |
| The steps of a flow the person goes through                                                                                            | [Steps](../steps/steps.md)                                                                                                                |
| Facts about an item, not events                                                                                                        | [DescriptionList](../description-list/description-list.md)                                                                                |
| Messages and event lines in a conversation                                                                                             | [SystemMessage](../system-message/system-message.md) in the conversation ([Conversation](../../../../../design/patterns/conversation.md)) |

## Anatomy

- `Timeline`: the ordered list. Required.
- `TimelineItem`: one step, with its marker and the line to the next step. Required.
  - `TimelineTitle`: what happened. Required.
  - `TimelineContent`: a detail line in Space Mono: a commit, a file count. Optional.
  - `TimelineTime`: when, in Space Mono, at the right end of the first line. Optional.

## Variants

| Variant                                           | Use for                                                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task history: `taskStatus` on each item           | The pixel is the task's status after that step, in its `task-status-*` color                                                                                  |
| Activity log: `color` (or `variant`) on each item | The pixel takes the colors of the presence lights: `presence-busy` (yellow) while working, `presence-error` (orange) for an error, lime (`success`) when done |
| `icon` on an item                                 | An icon in place of the pixel, in the item's color, for a step that needs one                                                                                 |
| `itemPlacement="right"`                           | Markers on the right, text aligned to them                                                                                                                    |
| `horizontal`                                      | A short sequence of milestones in a row                                                                                                                       |

```example
timeline/compositions/icon
```

```example
timeline/compositions/placement
```

```example
timeline/compositions/horizontal
```

## Content

### Task history

- Write each title as who did what, with the name in bold: "**Bugen** claimed it", "**Bugen** moved it to In Review".
- Put the evidence in the detail line: "commit c41e09 · 4 files changed".

### Activity log

- Set the title and the detail in Space Mono: the log is what a machine wrote ([Typography](../../../../../design/foundations/typography.md#principles)).
- Mark a step done by a subagent with a `subagent` tag.
- Write only what the agent did. Don't show its prompts or its output.

## Accessibility

- `Timeline` renders a native `ol` and each `TimelineItem` an `li`, so the order and the number of steps are announced. raft-ui adds no Base UI primitive.
- The marker and the line are hidden from assistive technology. When the color carries meaning, say it in the title too: "moved it to In Review", "failed: CI".

## Rules

- Don't make a timeline clickable. To go to the object of a step, link that object in the title: the task, the commit, the file.
- Mark a step that failed in orange (`warning`, or `presence-error` in a log), not `danger`: red is only for consequences that cannot be undone ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
