---
title: A segmented control's track fits its segments
summary: The segmented control's track hugs its segments, and fills the width only as the sole choice in a form.
number: 0033
status: accepted
date: 2026-10-18
---

# 0033. A segmented control's track fits its segments

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. The track's width was unspecified and it was often stretched, leaving an unused stretch of gray on its right.

## Decision

The track fits its segments. Only when it is the only choice in a form does it fill the width, with equal segments.

## Consequences

No empty track beside the segments.

## Related

- [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md)
