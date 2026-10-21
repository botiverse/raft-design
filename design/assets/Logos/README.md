---
title: Logos
summary: The Raft logo and mark files, which background each is for, and how they are placed.
---

# Logos

The original SVGs from the Raft website, with the geometry copied exactly. Where the logo may appear is in [Brand](../../foundations/brand.md#logo).

| File | Use on | Colors |
| --- | --- | --- |
| `raft-logo.svg` | Light backgrounds | An ink outline; the inside of the letters and the mark is cream (the website's paper color, which is the desktop sidebar's `layer-sidebar` in the product) |
| `raft-logo-yellow.svg` | Dark backgrounds (the website's footer) | A yellow outline with an ink inside |
| `raft-mark.svg`, `raft-mark-yellow.svg` | The same two backgrounds | The mark alone, in the same two color schemes |

## Rules

- Use the lockup in the frame bar of sign-in and of the pages that create an account or a server. Use the mark alone above a sign-in form's title, on loading screens, in app icon sketches and where space is small.
- Don't put the mark on the frame of a working page: the frame shows your server (the workspace button on a phone's Home, the workspace button and strip in the web top bar).
- Change the file to change the colors. The SVGs have two colors and can't be recolored with CSS `color`.
- Put the mark straight on a yellow background, without a tile behind it.
- In code, use the exports of raft-ui: `RaftLogo` (the mark), `RaftWordmark` and `RaftLogoLockup`.
