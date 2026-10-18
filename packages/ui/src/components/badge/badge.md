---
title: Badge
summary: A small label — above all the pink unread count and the yellow @ marker, plus soft-tinted and hairline labels.
status: stable
aliases: [unread count, mention marker, count]
category: status
related: [status, tasks, sidebar, app-rail, list-row]
---

# Badge

Badge is a small label. Its main job is the unread count: a pink sticker that says something waits for the person. When someone mentions the person, a yellow @ marker takes its place, because it is more specific. Other appearances of Badge make the soft-tinted and hairline labels that status chips and tags are built from ([Status](../status/status.md)).

## When to use

| Situation                                                                        | Use                                                                                                                                          |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Unread messages on a list row or a sidebar row; new thread replies; new activity | The unread count: `variant="accent"` (the `attention` color). In the sidebar, `SidebarItemCount` ([Sidebar](../sidebar/sidebar.md))          |
| Someone mentioned the person                                                     | The @ marker: `variant="primary"` (the `brand` color) with the `at-sign` icon. In the sidebar, `SidebarItemIndicator`                        |
| Unread items in a muted place                                                    | A gray number in Space Mono (`text-mono-meta`, `foreground-hint`), not a badge                                                               |
| Something waits, on a rail icon, a tab bar icon or the bell                      | The attention dot: one pink pixel ([Status](../status/status.md)), never a number                                                            |
| Where a task is, or how an agent is                                              | A status chip: `TaskStatusBadge` ([Tasks](../tasks/tasks.md)) or a soft Badge with a pixel ([Status](../status/status.md#agent-state-chips)) |
| This is an agent; where it runs                                                  | The `agent` tag and the runtime chip ([Status](../status/status.md#agent-tag))                                                               |

## Anatomy

- `Badge`: the label. It holds a number, a word, or an icon and a word.
- `Badge.Experimental`: a preset that reads Experimental, so every experimental surface shows the same label.

## Variants

| Appearance             | Use for                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `appearance="solid"`   | A sticker: a count or a mark that waits for the person, with an ink edge and ink type. The unread count and the @ marker |
| `appearance="soft"`    | A soft-tinted label with no border: status chips of agent states, the runtime chip                                       |
| `appearance="outline"` | A hairline label in Space Mono: the `agent` tag, a reply count beside a task chip                                        |

`variant` picks the color role. Choose it by what the color means, not by how it looks ([Meanings of color](../../../../../design/foundations/color.md#meanings-of-color)): on a count, `accent` is the pink of "to do" and `primary` the yellow of "you".

## States

- A Badge rendered as a button (`render={<button />}`) shows the pressed overlay on hover and press, and the shared disabled look ([States](../../../../../design/foundations/states.md)).
- The selected row never shows a count or an @ marker ([States](../../../../../design/foundations/states.md#usage)).

## Content

- Write the number alone, in Space Mono. Above 99, write 99+.
- Don't write a count in the @ marker: it says only that someone mentioned the person.

## Accessibility

Badge renders a `<span>` and wraps no Base UI primitive.

- Give a count or an @ marker with no words next to it `role="img"` and an `aria-label` that says what it means: "3 unread", "Mentions you".
- Give a Badge rendered as a button an `aria-label` that names its action ("Open thread replies") when its text doesn't.

## Rules

- Show at most one badge per row, in the same column as the time.
- When a row has both unread messages and a mention, show only the @ marker.
- Use the gray number for a muted place, never the pink sticker: the person chose not to be called by it.
- Put only the attention dot on rail and tab bar icons and on the bell, never a number.
