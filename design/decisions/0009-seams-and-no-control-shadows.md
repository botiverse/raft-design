---
title: Regions are separated by a 45% ink seam, and controls have no shadow
summary: Lines between regions are 1px `line-seam` at 45% ink instead of 2px black, and only brand illustration has a hard shadow.
number: 0009
status: accepted
date: 2026-10-18
---

# 0009. Regions are separated by a 45% ink seam, and controls have no shadow

## Context

The product code separates regions with 2px solid black lines, and gives controls, cards, menus and dialogs hard shadows of 2px to 6px. Review (round 5) found the black lines too loud: they cut the screen into boxes.

A 15% hairline is only 1.4:1 on white and on yellow, so it nearly disappears on the frame. Between those extremes, 30% was still faint on yellow, 40% just under 3:1, and 50% started to look like a control's ink border. 45% is just over 3:1 on white, and on yellow it reads as a dark gold that sits with the yellow.

"Press here" is already said three ways: pink, the ink border, and at most one per screen. A shadow is a fourth signal; dark shadows don't show in dark mode, and a press that moves the control shakes what is next to it.

## Decision

Regions are separated by a 1px `line-seam` (45% ink). The ink border stays for "this is a control". Controls, cards, menus and dialogs have no hard shadow; only brand illustration has one (`shadow-sticker`), which makes it read more like a sticker.

## Consequences

Lines and shadows mean something again: a seam is a region boundary, an ink border is a control, and a shadow is something floating or a brand illustration.

## Related

- [Color](../foundations/color.md#lines)
- [Elevation](../foundations/elevation.md)
