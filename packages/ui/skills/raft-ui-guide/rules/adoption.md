---
name: adoption
description: "Adopting rUI in an existing project: inventory before changing, the order that prevents locally-correct/globally-wrong results, and what acceptance means beyond 'it renders'."
---

# Adopting rUI in an existing project

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

Report B1 (new primitive) and B2 (extract a generic layer from existing code, far
cheaper) separately.

Count what you are not converting. A migration that reports only its A bucket
reads as complete when it is not.

## Work in this order

```
tokens -> primitives -> composition -> layout
```

Jumping levels is what produces a screen where every control is individually
correct and the screen is wrong. Finish one level across the whole surface before
starting the next.

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

## Report what you had to read the source for

If you had to open `dist/index.d.mts`, a recipe, or a comment to learn a rule, that
rule is not documented. Record it and report it with the migration so it can land
in these guides.
