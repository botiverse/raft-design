---
title: Spinner
summary: The pixel spinner, four square pixels lit in turn, for a wait of unknown length with no layout to hold.
status: stable
aliases: [Loading, Pixel spinner, Loader]
layer: core
category: feedback
related: [skeleton, progress, button]
---

# Spinner

The pixel spinner is four square pixels that light up in turn. Use it while something loads for an unknown time and there is no layout to hold, such as a small area or a menu that fetches its items. Which loading indicator fits which wait is in [Choosing a component](../../../../../design/components/overview.md#waiting).

```example
spinner/compositions/default
```

## When to use

| Situation                              | Use                                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| Unknown duration, no layout to hold    | Spinner                                                    |
| The layout of what is loading is known | [Skeleton](../skeleton/skeleton.md)                        |
| The percentage is known                | [Progress](../progress/progress.md)                        |
| A button started the wait              | The button's loading state ([Button](../button/button.md)) |

## Variants

- `size` scales the pixels: `xs` is 9.5px across, `sm` (the default) 12px, `md` 14px and `lg` 19px. Pick it by [Size](#size).
- The spinner takes the color of the text around it. `variant="inverse"` sets it in the inverse foreground, for a surface of the opposite lightness.

### Size

A loading indicator matches what it stands in for: it holds the place of what will appear, so it takes that thing's size, and the line beside it takes that thing's type.

| What it stands in for                                                                | Size                                                                                                                                                                                                          | The line beside it                                                                                                                                 |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| An icon in a line of text: a reference's, an attachment row's                        | The icon's size: `xs` for a 14px icon, `sm` for 16px, `md` for 18px, `lg` for 22px, so the pixels cover what the icon's strokes did. It sits in the text's line box, so the line keeps the text's line height | None, or the text's own style                                                                                                                      |
| The content of a panel or a list: a conversation, a profile, the next page of a list | `md` or `lg`, centered in the space the content will fill                                                                                                                                                     | `text-callout` or `text-body` in `foreground-muted`, never `text-caption` or `foreground-hint`: until the content arrives, the line is the content |
| Media: an image or a preview that is loading or uploading                            | `md`, in its default color, on `layer-veil`                                                                                                                                                                   | None                                                                                                                                               |

- Over media, the spinner sits on a `layer-veil` cover and keeps its default color: the veil is the page's own color at 80%, so the ink that reads on the page reads on it, in both modes ([Surfaces](../../../../../design/foundations/color.md#surfaces)).
- Don't make a placeholder small to make the wait look minor: a 9.5px spinner and a hint-colored caption in the middle of an empty panel read as an empty panel, and the person waits without knowing anything is happening.

## Loading screen

When the app is starting and nothing is on screen yet, a loading screen shows the pixel loader in place of the spinner: the agents' pixel sprites light up in turn next to the Raft mark. A loading screen is a brand page, so it may show the logo ([Brand](../../../../../design/foundations/brand.md#logo)). The pixel loader is a composition in the docs, not a raft-ui export.

```example
spinner/compositions/pixel-loader
```

## Behavior

- Show the spinner only after the wait passes 1 second, so a fast load doesn't flash it. raft-ui doesn't delay it for you: a spinner often sits inline or in a button, where starting at once is right. A list skeleton, which is only for a slow load, does wait 1 second by default ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)).
- Remove it the moment the wait ends.
- With `prefers-reduced-motion`, the pixels stop and the first one stays lit ([Motion](../../../../../design/foundations/motion.md#principles)).

## Content

- Put a short line next to the spinner that says what is loading: "Loading messages", not "Loading…" ([Writing](../../../../../design/content/writing.md)).

## Accessibility

- `Spinner` renders `role="status"` with the accessible name "Loading". Pass an `aria-label` that names what is loading.

## Rules

- Never draw the spinner as a ring or round dots. Every dot in Raft is a square pixel ([Shape](../../../../../design/foundations/shape.md)).
- Use the spinner only for loading, never as a status: a working agent is a still light, not a spinner ([Motion](../../../../../design/foundations/motion.md#principles)).
