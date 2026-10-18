---
title: Drawers and bottom sheets float with a seam and the soft shadow
summary: Drawers and bottom sheets have a seam edge and `shadow-float` instead of a 2px ink border and a hard shadow.
number: 0022
status: accepted
date: 2026-10-18
---

# 0022. Drawers and bottom sheets float with a seam and the soft shadow

## Context

The product code draws drawers and bottom sheets with a 2px ink border and a hard shadow.

## Decision

Drawers and bottom sheets have a `line-seam` edge and `shadow-float`, like every other popup. A modal drawer puts a scrim behind it ([0027](./0027-modal-drawer-scrim.md)).

## Consequences

Every floating surface uses the same shadow.

## Related

- [Elevation](../foundations/elevation.md)
- [Drawer](../../packages/ui/src/components/drawer/drawer.md)
