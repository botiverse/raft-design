---
title: The icon buttons at both ends of a phone top bar mirror each other
summary: The Back button and the right-hand icon buttons of a phone top bar sit 3px from the screen edge, mirrored, and Back uses arrow-left.
number: 0035
status: accepted
date: 2026-10-18
---

# 0035. The icon buttons at both ends of a phone top bar mirror each other

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. The right icon box sat at 16px; Back used a chevron shifted 7px left so its tip landed at 16px. Review found Back too close to the edge and out of balance with the right side. Aligning by each icon's ink moves the buttons, because icons have different amounts of space inside their box (an arrow, a gear and a vertical ellipsis differ by up to 9px). A chevron's ink fills only the middle of its box and needs its own shift; an arrow fills the box like other icons.

## Decision

Both ends mirror each other: each button is 3px from the screen edge, with its icon box 14px from the edge. Back uses arrow-left, as in the product.

## Consequences

Icon centers at both ends are symmetric, and the ink of common icons lands near 16px.

## Related

- [Alignment](../foundations/alignment.md#top-bar-icon-buttons)
