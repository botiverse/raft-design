---
title: The tab bar's selection wraps only the icon
summary: On the phone tab bar, the yellow selection sticker wraps only the icon of the selected item, not the whole cell.
number: 0003
status: accepted
date: 2026-10-18
---

# 0003. The tab bar's selection wraps only the icon

## Context

In the product code the whole cell of the selected tab turns yellow, with an icon and a label (only the label on short screens). A yellow cell at the bottom of the screen reads as a second frame.

## Decision

Tab bar items show an icon and a label. The yellow sticker wraps only the icon of the selected item.

## Consequences

This overrides a decision the product's owner recorded in code. To return to the product's version, change only what this record names. The sticker uses half as much color as the full cell, and the selection is still visible at a glance.

## Related

- [MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)
