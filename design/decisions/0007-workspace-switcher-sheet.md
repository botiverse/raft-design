---
title: The phone workspace switcher is a bottom sheet
summary: On a phone, the workspace list rises from the bottom instead of opening as a popup next to the pill.
number: 0007
status: accepted
date: 2026-10-18
---

# 0007. The phone workspace switcher is a bottom sheet

## Context

The product code opens the workspace list as a popup anchored to the pill (`PopoverPopup`). Review asked for a sheet instead of a popup attached to the button.

## Decision

On a phone, the workspace pill opens a bottom sheet with the same content as the product's switcher menu.

## Consequences

The list is within reach of the thumb and has room for many workspaces. Desktop keeps a menu next to the rail tile.

## Related

- [Composites](../patterns/composites.md#switching-workspaces)
