---
title: Tabs are selected with a yellow sticker by default
summary: The selected tab is a yellow sticker by default; the product's underline is drawn as an alternative.
number: 0013
status: accepted
date: 2026-10-18
---

# 0013. Tabs are selected with a yellow sticker by default

## Context

The product code marks the selected tab with an underline.

## Decision

The default selected tab is a yellow sticker, the same "you are here" as sidebar rows and segmented controls. The underline version (ink text and a 2px ink line) is also drawn.

## Consequences

The product ships the sticker tab, so the choice is settled ([Open questions](./open-questions.md#settled-by-the-product)). The underline stays a variant.

## Related

- [Tabs](../../packages/ui/src/components/tabs/tabs.md)
