---
title: Fonts
summary: Where the font files come from, which version each is, and how the Space Mono files were made from the upstream fonts.
---

# Fonts

The font files of the Raft Design System. The deployed site loads Space Grotesk and Space Mono from Google Fonts (`packages/ui/src/fonts.css`); these files are for what must not depend on Google: the vcase goldens (`apps/doc/vcase.config.mjs`), the browser tests and `scripts/align-audit.mjs`. So each file should be the face Google Fonts serves for the latin subset, and change when Google's does. The license is in [`OFL.txt`](./OFL.txt).

| File                          | Version | Source                                     |
| ----------------------------- | ------- | ------------------------------------------ |
| `SpaceGrotesk-Variable.woff2` | 2.000   | Latin subset; its source was not recorded  |
| `SpaceMono-Regular.woff2`     | 1.003   | google/fonts `ofl/spacemono`, subset below |
| `SpaceMono-Bold.woff2`        | 1.003   | google/fonts `ofl/spacemono`, subset below |

## Space Mono

From `ofl/spacemono/SpaceMono-Regular.ttf` and `SpaceMono-Bold.ttf` in [google/fonts](https://github.com/google/fonts/tree/06bfe0d62a98375cb09c942fa18e68bd32cff057/ofl/spacemono) at commit `06bfe0d62a98375cb09c942fa18e68bd32cff057` (the TTFs last changed in `fa55d0564c2bc8e1e308be751a699673a723b9a9`, "Space Mono: Version 1.003"; `METADATA.pb` names googlefonts/spacemono at `329858c2c4dbd3476f972a4ae00624b018cf4b81`). Name ID 5 is `Version 1.003; ttfautohint (v1.8.4.7-5d5b)`.

Each TTF is cut to the code points of the latin file Google Fonts serves for Space Mono (`fonts.gstatic.com/s/spacemono/v17`), with fontTools 4.68.0:

```sh
fonttools subset SpaceMono-Regular.ttf \
  --unicodes="U+0020-007E,U+00A0-00AC,U+00AE-00FF,U+0102,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2044,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215" \
  --name-IDs=0,1,2,3,4,5,6,14 --notdef-outline --glyph-names --no-prune-codepage-ranges \
  --flavor=woff2 --output-file=SpaceMono-Regular.woff2
```

The same for Bold. The default layout features keep what Google's file has: GSUB `ccmp`, `dnom`, `frac`, `numr`, GPOS `mark`, `mkmk` and GDEF; the hinting stays. Read with fontTools, every table of the result is the same as in Google's file (the same 259 glyphs, outlines, hinting, metrics, cmap and layout), except `head.checkSumAdjustment`.

To update: take the TTFs from a newer google/fonts commit, read the code points of Google's latin file (`fontTools.ttLib.TTFont(file).getBestCmap()`), run the command again, and update this page.
