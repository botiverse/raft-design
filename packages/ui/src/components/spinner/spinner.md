---
title: Spinner
summary: The pixel spinner, four square pixels lit in turn, for a wait of unknown length with no layout to hold.
status: stable
aliases: [Loading, Pixel spinner, Loader]
category: feedback
related: [skeleton, progress, button]
---

# Spinner

The pixel spinner is four square pixels that light up in turn. Use it while something loads for an unknown time and there is no layout to hold, such as a small area or a menu that fetches its items. Which loading indicator fits which wait is in [Choosing a component](../../../../../design/patterns/choosing-components.md#waiting).

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

- `size` scales the pixels from `xs` to `lg`. Match it to the text or icons next to it.
- The spinner takes the color of the text around it. `variant="inverse"` sets it in the inverse foreground, for a surface of the opposite lightness.

## Loading screen

When the app is starting and nothing is on screen yet, a loading screen shows the pixel loader in place of the spinner: the agents' pixel sprites light up in turn next to the Raft mark. A loading screen is a brand page, so it may show the logo ([Brand](../../../../../design/foundations/brand.md#logo)). The pixel loader is a composition in the docs, not a raft-ui export.

```example
spinner/compositions/pixel-loader
```

## Behavior

- Show the spinner only after the wait passes 1 second, so a fast load doesn't flash it. raft-ui doesn't delay it for you.
- Remove it the moment the wait ends.
- With `prefers-reduced-motion`, the pixels stop and the first one stays lit ([Motion](../../../../../design/foundations/motion.md#principles)).

## Content

- Put a short line next to the spinner that says what is loading: "Loading messages", not "Loading…" ([Writing](../../../../../design/foundations/writing.md)).

## Accessibility

- `Spinner` renders `role="status"` with the accessible name "Loading". Pass an `aria-label` that names what is loading.

## Rules

- Never draw the spinner as a ring or round dots. Every dot in Raft is a square pixel ([Shape](../../../../../design/foundations/shape.md)).
- Use the spinner only for loading, never as a status: a working agent is a still light, not a spinner ([Motion](../../../../../design/foundations/motion.md#principles)).
