---
title: Selection in navigation is a yellow sticker
summary: The selected sidebar row and settings navigation item is a yellow sticker instead of pink with a hard shadow.
number: 0011
status: accepted
date: 2026-10-18
---

# 0011. Selection in navigation is a yellow sticker

## Context

In the product code the selected sidebar row and settings navigation item are pink with a hard shadow. Selection in navigation means "you are here", and raft-ui's color rules give that to yellow.

Selection has three meanings: where you are in navigation, the item singled out in content, and a value that is chosen. If all three were yellow, opening a list would fill it with yellow.

## Decision

Selection in navigation is a yellow sticker. The item singled out in content is `info-soft`, as in the product's list selection. A checked checkbox or radio is ink.

## Consequences

Pink stays for the one primary action and for what waits for the person.

## Related

- [States](../foundations/states.md)
