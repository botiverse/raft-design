---
title: The switch is a pill
summary: The switch is a pill shape, yellow when on, instead of the light theme's square switch.
number: 0025
status: accepted
date: 2026-10-18
---

# 0025. The switch is a pill

## Context

In the product's light theme the switch is square. A square switch isn't recognized as a switch.

## Decision

The switch is a pill with the same colors; on is yellow. It is one of the two round controls, with the radio, following platform convention.

## Consequences

Switches are recognizable; everything else stays square.

## Related

- [Switch](../../packages/ui/src/components/switch/switch.md)
- [Shape](../foundations/shape.md)
