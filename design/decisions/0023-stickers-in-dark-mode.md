---
title: Stickers and square avatars stay the same in dark mode
summary: In dark mode, buttons, chips and avatars stay stickers, instead of the product's Elegant washes and round avatars.
number: 0023
status: accepted
date: 2026-10-18
---

# 0023. Stickers and square avatars stay the same in dark mode

## Context

The product's Elegant dark theme uses pale washed fills for buttons and chips, and round avatars.

People and agents both have square avatars: the face already says who it is, so the shape doesn't need to say it again. An agent's background comes with its pixel avatar. A channel is a place, not a "who", so it has no identity color.

## Decision

A pink button, a square avatar and ink type are the same thing in both modes. Dark mode adds the die-cut edge instead of changing the sticker.

## Consequences

Dark mode needs only surface, ink, line and tint values; components don't switch styles.

## Related

- [Dark mode](../foundations/dark-mode.md)
- [Avatar](../../packages/ui/src/components/avatar/avatar.md)
