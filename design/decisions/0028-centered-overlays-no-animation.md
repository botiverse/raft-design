---
title: Centered overlays have a scrim and no animation
summary: Dialogs, confirmations, search, task details and large forms all get a scrim and appear without animation.
number: 0028
status: accepted
date: 2026-10-18
---

# 0028. Centered overlays have a scrim and no animation

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. Dialogs faded and scaled in over 150ms; the search popup didn't dim the page and had its own opening animation.

## Decision

Every centered overlay (dialog, confirmation, search, task details, large form) gets `layer-backdrop` and no open or close animation.

## Consequences

One rule for all centered overlays: they are already in place and don't need to come from anywhere. Adding animation later is a deliberate change with its own record.

## Related

- [Motion](../foundations/motion.md#usage)
- [Choosing a component](../components/overview.md#overlays)
