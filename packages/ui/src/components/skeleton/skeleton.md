---
title: Skeleton
summary: A gray placeholder in the shape of the content that is loading, for lists, cards and panels whose layout is known.
status: stable
aliases: [Placeholder]
category: feedback
related: [spinner, progress, empty-state]
---

# Skeleton

A skeleton holds the place of content that is still loading: square blocks where avatars and tiles will be, bars where text will be. Use it when a list, card or panel loads for the first time and its layout is known. Which loading indicator fits which wait is in [Choosing a component](../../../../../design/patterns/choosing-components.md#waiting).

```example
skeleton/compositions/preview
```

## When to use

| Situation                                                  | Use                                                                                            |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| The layout of what is loading is known                     | Skeleton                                                                                       |
| The wait has no layout to hold, or happens in a small area | [Spinner](../spinner/spinner.md)                                                               |
| The percentage is known                                    | [Progress](../progress/progress.md)                                                            |
| Loading finished and there is nothing                      | [EmptyState](../empty-state/empty-state.md)                                                    |
| Loading failed                                             | An error at its scope ([Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)) |

## Variants

| Variant            | Use for                                                                         |
| ------------------ | ------------------------------------------------------------------------------- |
| `variant="line"`   | A line of text                                                                  |
| `variant="block"`  | A thumbnail, card or any other block; size it with `className`                  |
| `variant="circle"` | An avatar or tile. Despite its name it is square, like the avatar it stands for |

```example
skeleton/compositions/basic
```

## Accessibility

- `Skeleton` is `aria-hidden`. Mark the region that is loading with `aria-busy="true"` until the content arrives, so assistive technology doesn't read an empty region as empty.

## Rules

- Give the skeleton the shape of the content it stands for: square for avatars and tiles, bars for text. The size rule and the rule against swapping placeholders are in [Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed).
