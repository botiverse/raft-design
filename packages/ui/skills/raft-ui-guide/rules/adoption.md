---
name: adoption
description: "Adopting rUI in an existing project: inventory before changing, the order that prevents locally-correct/globally-wrong results, and what acceptance means beyond 'it renders'."
---

# Adopting rUI in an existing project

## Contents

- Inventory before you change anything
- Work in this order
- Do not mix theme languages
- Acceptance is hierarchy, not rendering
- Write back what you had to read the source for

## Inventory before you change anything

Classify every hand-rolled control first. Do not read-and-replace file by file: you
will convert the easy ones, leave the hard ones, and end with a surface that is
half one system and half another.

| Bucket | Meaning                                                | Action                  |
| ------ | ------------------------------------------------------ | ----------------------- |
| A      | rUI has an equivalent                                  | Replace                 |
| B1     | rUI has no such primitive                              | Out of scope; report it |
| B2     | rUI has it only bound to a domain, no generic layer    | Out of scope; report it |
| C      | Must stay hand-rolled (example code, product-specific) | Leave, and say why      |

B1 and B2 are different requests. B1 is new work. B2 is extracting a general layer
from implementations that already exist, which is far cheaper — separate them or
the backlog looks heavier than it is.

Count what you are not converting. A migration that reports only its A bucket
reads as complete when it is not.

## Work in this order

```
tokens -> primitives -> composition -> layout
```

Jumping levels is what produces a screen where every control is individually
correct and the screen is wrong. Finish one level across the whole surface before
starting the next.

## Do not mix theme languages

A theme is a set, not a menu. `--theme-shadow-*` and the border, radius, and weight
conventions that go with it are designed together: Brutal's shadow is a hard offset
with no blur, sized for square corners. Put it on a rounded card and it reads as a
mistake, even though both values are valid tokens.

If a surface takes one family's shadow, it takes that family's corners and borders
too. Do not resolve this per element.

## Acceptance is hierarchy, not rendering

Checking that a screen renders, fits, and does not overflow does not test the thing
most likely to be wrong. For each surface, read it and answer:

- Which control is the primary action? If more than one answer is defensible, the
  hierarchy is wrong — see the action-group rule in [composition.md](./composition.md).
- Do controls at the same level look like the same kind of thing?
- Does any single element carry a treatment nothing else on the page shares?
- Do status colors track the value they report, or are they one color regardless?

Swapping a component is not finishing a design. The variant being individually
valid says nothing about whether the row it sits in is coherent.

## Write back what you had to read the source for

If you had to open `dist/index.d.mts`, a recipe, or a comment to learn a rule, that
rule is not documented. Record it as you go and land it in these guides. Otherwise
the next adopter reads the same source to learn the same thing.
