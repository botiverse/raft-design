---
title: Error text is a dark red that passes 4.5:1
summary: Error text uses `danger-strong`, a dark red at 6.1:1, instead of the product's brighter reds.
number: 0019
status: accepted
date: 2026-10-18
---

# 0019. Error text is a dark red that passes 4.5:1

## Context

The product's error text is `#F70720` in light mode and `#f97264` in dark mode: 4.2:1 and 2.8:1 on white. Text needs 4.5:1.

## Decision

Error text and an invalid input's border use `danger-strong` (`#b5321a`, 6.1:1). The delete button keeps `danger` (`#f97264`).

## Consequences

Error messages are readable; the delete button's color is unchanged.

## Related

- [Color](../foundations/color.md#text-and-icons)
