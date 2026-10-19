---
title: RaftLogo
summary: The Raft mark, wordmark and lockup as inline SVGs, for brand pages such as sign-in, creating an account or a workspace, and loading screens.
status: stable
aliases: [Logo, RaftWordmark, RaftLogoLockup, Raft mark]
layer: core
category: identity
related: [avatar, icon-tile]
---

# RaftLogo

raft-ui exports the Raft logo as three inline SVGs: `RaftLogo` (the mark), `RaftWordmark` (the word RAFT) and `RaftLogoLockup` (the two together). They are the website's artwork, copied exactly. Where the logo may appear, and which colors go on which background, is in [Brand](../../../../../design/foundations/brand.md#logo); the source files and their colors are in [Logos](../../../../../design/assets/Logos/README.md).

```example
logo/logo
```

## When to use

Where the logo may appear is in [Brand](../../../../../design/foundations/brand.md#logo) and [Logos](../../../../../design/assets/Logos/README.md#rules). Once it may appear, pick the export by what it shows:

| Situation                      | Use                                                                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| The mark alone                 | `RaftLogo`                                                                                                                     |
| The word alone                 | `RaftWordmark`                                                                                                                 |
| The mark and the word together | `RaftLogoLockup`                                                                                                               |
| The frame of a working page    | Not the logo: the workspace pill or the rail's workspace tile ([Brand](../../../../../design/foundations/brand.md#principles)) |

## Anatomy

- `RaftLogo`: the mark alone.
- `RaftWordmark`: the letters alone.
- `RaftLogoLockup`: the mark, then the letters.

Each one is an `svg` that keeps its proportions. Set its height with a class and leave the width `auto`. The exports draw the light-background colors of `raft-logo.svg`: an ink outline with a cream inside. raft-ui has no export of the yellow version for dark backgrounds.

## Accessibility

- The SVGs have no name of their own. When the logo stands alone, give it `role="img"` and `aria-label="Raft"`.
- When visible text next to it already says Raft, hide the logo with `aria-hidden`.
