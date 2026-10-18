---
title: Panel header icon buttons are 32px on desktop
summary: Desktop panel header icon buttons are 32px with an 18px icon and a 44px hit area; phones keep 44px.
number: 0031
status: accepted
date: 2026-10-18
---

# 0031. Panel header icon buttons are 32px on desktop

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. Panel header icon buttons were 44px with a 22px icon, which looked heavy next to a 17px title.

## Decision

On desktop, panel header icon buttons are 32px with an 18px icon, and their hit area stays 44px. On a phone they stay 44px, for the thumb.

## Consequences

Headers look lighter on desktop without smaller touch targets.

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md)
- [Button](../../packages/ui/src/components/button/button.md)
