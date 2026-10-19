---
title: Headers and the rail are 56px, with a square top-left corner
summary: Headers are 56px high and the icons-only rail is 56px wide plus a 1px seam, so the top-left corner stays a 56px square.
number: 0005
status: accepted
date: 2026-10-18
---

# 0005. Headers and the rail are 56px, with a square top-left corner

## Context

The product's brutal theme had 62px headers and a 64px rail, including a 2px border. Review found the rail too wide. The product's owner pinned a rule in code that the top-left cell, which holds the workspace, is always square, whatever else changes; a UI test (`leftrail-square-slot`) enforces it. The product's Elegant theme already used 56px for both.

## Decision

The rail is 56px wide plus a 1px `line-seam`, and every header (rail, sidebar, panel, drawer, phone top bar row) is 56px high, so the top-left corner is a 56px square and the seams under the headers line up.

## Consequences

Narrowing the rail means every header shrinks with it. A labeled rail would need 68px to fit names such as Computers, which would make its top-left corner 68×56 and break the square-corner test. The product ships the icons-only rail ([Open questions](./open-questions.md#settled-by-the-product)).

## Related

- [Spacing](../foundations/spacing.md#heights)
- [AppRail](../../packages/ui/src/components/app-rail/app-rail.md)
