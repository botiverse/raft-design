---
title: Toasts and tooltips are neutral dark
summary: Toasts and tooltips use the neutral dark `layer-hud` instead of yellow with a black border.
number: 0010
status: accepted
date: 2026-10-18
---

# 0010. Toasts and tooltips are neutral dark

## Context

In the product's light theme, toasts and tooltips are yellow with a black border. raft-ui's color rules give yellow to hints and interactive expression, give pink to core actions, and forbid yellow buttons. This system narrows that: yellow only says "you" (where you are, what you selected, what calls you, what you searched for, your workspace). A notice is an aside (round 5 review). The product's Elegant theme already used a dark HUD.

## Decision

Toasts and tooltips use `layer-hud` with `foreground-on-hud` text. No button is yellow.

## Consequences

Yellow keeps one meaning. Notices don't compete with selection.

## Related

- [Toast](../../packages/ui/src/components/toast/toast.md)
- [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md)
