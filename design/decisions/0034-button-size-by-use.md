---
title: A button's size follows its use
summary: Button sizes are set by use: 44px in footers and forms, 32px in rows, cards, banners, toolbars and panel headers, 52px for the sign-in call to action.
number: 0034
status: accepted
date: 2026-10-18
---

# 0034. A button's size follows its use

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. There were three sizes, and the only guidance was "rows and cards use the small one".

## Decision

Footers, forms and full-width actions at the bottom of a panel use 44px. Rows, cards, banners, toolbars and panel headers use 32px. The one full-width pink button on the sign-in page uses 52px.

## Consequences

The same use has the same size everywhere.

## Related

- [Button](../../packages/ui/src/components/button/button.md)
