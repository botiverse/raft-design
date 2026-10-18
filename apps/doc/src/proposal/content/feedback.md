---
title: Feedback
summary: How to tell people what happened, what is loading and what went wrong, and which component carries each message.
placeholder: true
---

# Feedback

People need to know whether their action worked, what the screen is waiting for, and what to do when something fails. Each of these has one component; pick by when the message must be read, not by how urgent it feels.

## When it applies

Any message about the state of the product: results of an action, loading, empty content, errors. Messages written by people or agents are [Conversation](#), not feedback.

## Choosing a component

| The message                          | Read when             | Use                                            |
| ------------------------------------ | --------------------- | ---------------------------------------------- |
| Something must be read before acting | Before the next step  | [Banner](/proposal/components/banner)          |
| An action just finished              | Glance, then gone     | [Toast](/proposal/components/toast)            |
| There is nothing here yet            | Arriving at the place | [EmptyState](/proposal/components/empty-state) |
| The layout is known, the data is not | While loading         | [Skeleton](/proposal/components/skeleton)      |
| How long is unknown                  | While loading         | [Spinner](/proposal/components/spinner)        |
| The percentage is known              | While loading         | [Progress](/proposal/components/progress)      |
| A field has a wrong value            | Next to the field     | [Field](/proposal/components/field) error text |

## Structure

A banner sits inside the content it is about, under the header of the panel it affects.

```example
banner/compositions/default
```

An empty state says why the place is empty and what to do next, with at most one button.

```example
empty-state/compositions/default
```

Loading indicators are passive: none of them uses pink.

```example
skeleton/compositions/basic
```

## Rules

- Errors and empty states are plain and actionable. Humor belongs only in onboarding and success messages.
- Problems are orange; red is only for consequences that cannot be undone.
- Toasts and tooltips are neutral dark surfaces, not colored.
- A failure says why it failed and what to do: "Upload failed: the file is over 25 MB. Compress it or share a link."

## Wide and narrow

- On a phone, toasts sit above the tab bar; on desktop, bottom left of the main area.
- A banner spans the panel on both; it never floats.

## Related

- [Color](/proposal/foundations/color): the signal colors.
- Decision: why the live agent activity bar was removed.
