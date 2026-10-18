---
title: A chip next to a panel header's name sits in its own cell
summary: A chip beside the name in a panel header sits in its own cell on the name's line, centered by its shape.
number: 0039
status: accepted
date: 2026-10-18
---

# 0039. A chip next to a panel header's name sits in its own cell

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. The chip sat in the description line, was truncated with it, and was shifted up 1px to line up. Truncation cut off part of the chip's edge, and the name's letters were already on the line's center, so the 1px shift made it sit high.

## Decision

The chip is its own cell on the name's line, centered by its shape.

## Consequences

Chips are never cut off, and they align with the name.

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md)
- [Alignment](../foundations/alignment.md)
