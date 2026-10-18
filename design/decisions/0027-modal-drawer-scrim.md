---
title: A modal drawer slides in over a scrim
summary: A modal drawer slides in, and the rest of the page gets the same scrim as a dialog.
number: 0027
status: accepted
date: 2026-10-18
---

# 0027. A modal drawer slides in over a scrim

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. Drawers had no scrim, although nothing behind an open drawer can be clicked.

## Decision

A modal drawer slides in with `ease-slide`, and the rest of the page gets `layer-backdrop`. Of the overlays, only the drawer animates.

## Consequences

The scrim says that the page behind is not available. The slide shows where the drawer came from.

## Related

- [Drawer](../../packages/ui/src/components/drawer/drawer.md)
- [0022](./0022-floating-drawers-and-sheets.md)
