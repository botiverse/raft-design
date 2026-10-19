---
title: ComponentName
summary: One sentence that says what it is and when to use it.
status: stable
aliases: []
category: actions
related: []
---

<!--
Template for packages/ui/src/components/<component>/<component>.md.
Keep the sections in this order. Leave out a section that has nothing to say, except
"When to use" and, for anything interactive, "Accessibility".
Props and types are generated from the code: don't list them here.
-->

# ComponentName

<!-- One or two sentences: what it is, and the situation it is for. A reader who stops
here should choose correctly. -->

```example
component-name/compositions/preview
```

## When to use

<!-- A table when there are several situations. Name the alternative for each case where
this is the wrong choice. -->

| Situation | Use |
| --- | --- |
| … | ComponentName |
| … | [OtherComponent](../other-component/other-component.md) |

## Anatomy

<!-- The parts, in the order they appear, by their exported names. Say which are required.
One line each. -->

- `ComponentNameRoot`: …
- `ComponentNameTitle`: …

## Variants

<!-- One row per variant: what it is for, not what it looks like. Each one needs an
example. -->

| Variant | Use for |
| --- | --- |
| `variant="default"` | … |

```example
component-name/compositions/variants
```

## States

<!-- Only what differs from the shared interaction states in
design/foundations/states.md: loading, error, empty, selected… -->

## Behavior

<!-- What happens on open, close, overflow, resize, narrow screens. -->

## Content

<!-- Rules for the words inside this component: length, casing, what the label says.
Link to design/content/writing.md for the general rules. -->

## Accessibility

<!-- Semantics, keyboard, how the accessible name is provided, and what the caller must
add. Name the Base UI primitive; don't restate what it already does. -->

## Rules

<!-- Rules that belong to this component only. One imperative per bullet, with its
reason. -->

- …
