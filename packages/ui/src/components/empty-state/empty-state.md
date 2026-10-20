---
title: EmptyState
summary: What a view shows when it has no content — a gray icon, a title, one sentence on why it is empty and what to do, and at most one button.
status: stable
aliases: [Empty, Blank slate]
layer: core
category: feedback
related: [skeleton, button, search]
---

# EmptyState

An empty state tells people why a view has no content and what to do next. It has one look everywhere: a gray icon with no frame, a gray title, one sentence, and at most one button. It is a conclusion ("there is nothing here"), so it never stands in for loading or a failure.

```example
empty-state/compositions/default
```

## When to use

| Situation                         | Use                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| There is nothing here yet         | EmptyState: why it is empty and how to make something appear                                                        |
| Filters or a search match nothing | EmptyState: which conditions are active, with Clear All                                                             |
| It is still loading               | [Skeleton](../skeleton/skeleton.md), not an empty state                                                             |
| It failed to load                 | An error at its scope, with Retry ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)) |

## Anatomy

- `EmptyState`: the centered root. Required.
- `EmptyStateContent`: groups the icon, title and description. Required.
- `EmptyStateIcon`: a Lucide icon, at 36px in `foreground-hint`. Required.
- `EmptyStateTitle`: the title, in `foreground-muted`. Required.
- `EmptyStateDescription`: one sentence, in `foreground-hint`. A link in it is 600 with no underline at rest and underlines in ink on hover ([Clickable text](../../../../../design/foundations/states.md#clickable-text)): the weight is what sets it apart from the grey sentence.
- `EmptyStateActions`: at most one button.

```example
empty-state/compositions/activity-inbox
```

## Content

- Write the title in sentence case and state the fact: "No tasks yet", "No tasks match these filters" ([Writing](../../../../../design/content/writing.md#voice)).
- For a view with nothing yet, say in the description how something gets here.
- For filters or a search with no results, name the conditions that are active, and label the button Clear All.

## Accessibility

- `EmptyStateIcon` is hidden from assistive technology (`aria-hidden`): the title says what is empty.
- When the empty state is the only content of a page or panel, render the title as a heading (`render`) at the level the page needs.

## Rules

- Put the empty state directly in the middle of the content area. Don't wrap it in a card, frame the icon or add a sticker: empty states are working pages ([Brand](../../../../../design/foundations/brand.md#how-much-brand)).
- Give it at most one button: a 32px ink-bordered button (`variant="default" size="sm"`), never pink.
- Keep it quiet. The empty state is a hint, not a heading: small, faint type that doesn't compete with the button people should press next.
