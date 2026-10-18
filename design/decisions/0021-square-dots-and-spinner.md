---
title: Dots and the spinner are square pixels
summary: Presence lights, attention dots and the loading spinner are square pixels instead of round dots and rings.
number: 0021
status: accepted
date: 2026-10-18
---

# 0021. Dots and the spinner are square pixels

## Context

The product code draws round dots and a ring spinner.

## Decision

Every dot is a square pixel, and the spinner is made of pixels (principle 6, "square is Raft").

## Consequences

Round stays only for switches and radios.

## Related

- [Shape](../foundations/shape.md)
- [Spinner](../../packages/ui/src/components/spinner/spinner.md)
