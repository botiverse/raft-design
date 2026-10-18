---
title: Status and runtime chips are soft tints with one pixel
summary: Status chips and runtime chips are soft tints with one pixel or icon, instead of saturated fills with an ink border.
number: 0017
status: accepted
date: 2026-10-18
---

# 0017. Status and runtime chips are soft tints with one pixel

## Context

The product code draws status chips and runtime chips as saturated fills with an ink border. A screen can hold a dozen of them.

## Decision

Status and runtime chips sit on a soft tint, with a square pixel or an icon carrying the saturated color.

## Consequences

The saturated color is only one pixel large, so a screen full of chips stays quiet.

## Related

- [Status](../../packages/ui/src/components/status/status.md)
