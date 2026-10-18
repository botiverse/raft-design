---
title: In dark mode the frame is neutral, but the rail's selection stays yellow
summary: In dark mode the frame is a neutral dark, and the selected rail item is still a yellow sticker.
number: 0012
status: accepted
date: 2026-10-18
---

# 0012. In dark mode the frame is neutral, but the rail's selection stays yellow

## Context

The product's Elegant Dark theme doesn't use yellow: the selected rail item takes the content color. Dark mode exists to bring brightness down, and a full yellow frame would be the brightest thing on the screen; the product's dark theme uses no yellow at all.

## Decision

The dark frame is neutral. The selected rail item is a yellow sticker, as are the selected sidebar row and tab bar item, because it means "you are here", which is not part of the frame.

## Consequences

Selection looks the same in both modes and in every navigation component.

## Related

- [Dark mode](../foundations/dark-mode.md)
