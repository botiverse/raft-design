---
title: The focus ring is ink
summary: The focus ring is ink, not yellow.
number: 0015
status: accepted
date: 2026-10-18
---

# 0015. The focus ring is ink

## Context

raft-ui's prose said the focus ring was yellow. The product's `index.css` draws it in ink.

## Decision

`focus-ring` is a 2px gap in the surface color followed by 2px of ink, as in the product's `index.css`.

## Consequences

Focus is visible on the yellow frame and on yellow stickers, where a yellow ring would disappear.

## Related

- [Elevation](../foundations/elevation.md#focus-ring)
