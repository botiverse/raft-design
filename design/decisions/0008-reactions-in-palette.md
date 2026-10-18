---
title: The drawn reactions use the system's palette
summary: The 7 drawn quick reactions keep their subjects and shapes but take their colors from the palette, with square white highlights.
number: 0008
status: accepted
date: 2026-10-18
---

# 0008. The drawn reactions use the system's palette

## Context

The product draws its own 7 quick reactions (`packages/web/assets/reactions`). They include sage green, light steel blue and cream curved highlights, which are not in the palette.

## Decision

The same 7 reactions, in the same order and shapes, are recolored from the palette: the thumb's cuff is cyan, the check mark lime, and the confetti adds pink and cyan; yellow, orange, red and lavender stay. Highlights are white square pixels. In dark mode they get the die-cut edge.

## Consequences

Reactions speak the same language as stickers and pixel avatars, and every color is readable in both modes.

## Related

- [Brand](../foundations/brand.md#reactions)
