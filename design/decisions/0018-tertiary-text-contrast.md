---
title: Tertiary text passes 4.5:1 on every surface
summary: `foreground-hint` is slightly darker in light mode and lighter in dark mode than the product's, so it passes 4.5:1 everywhere.
number: 0018
status: accepted
date: 2026-10-18
---

# 0018. Tertiary text passes 4.5:1 on every surface

## Context

The product's tertiary text is 60% ink in light mode and `#989895` in dark mode, which fails 4.5:1 on some tints and popups.

## Decision

`foreground-hint` is 62% ink in light mode and `#9e9e9b` in dark mode.

## Consequences

Tertiary text passes 4.5:1 on every surface, tint and popup, with no exceptions to remember.

## Related

- [Color](../foundations/color.md#contrast)
