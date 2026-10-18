---
title: Pink is lighter than the product's pink
summary: The attention pink is lighter than the product code's pink, so that ink on it reaches the same contrast as the other sticker colors.
number: 0001
status: accepted
date: 2026-10-18
---

# 0001. Pink is lighter than the product's pink

## Context

The product code uses `#FE7DA8` for pink, one of its five base colors. Ink on it is 7.8:1, a step below ink on lavender, orange and cyan.

## Decision

The `attention` color is `#FF99C3`. Ink on it is 9.5:1, in the same range as the other sticker colors.

## Consequences

This overrides a decision the product's owner recorded in code. To return to the product's version, change only what this record names. Aligning the code with this record, or the other way around, changes only the value of pink.

## Related

- [Color](../foundations/color.md#meanings-of-color)
