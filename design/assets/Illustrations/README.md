---
title: Brand illustrations
summary: The ten two-color pixel illustrations drawn for Raft, the grid they are on, how they were taken from Figma, and how to render them.
---

# Brand illustrations

Ten pixel illustrations a designer drew for Raft, of people and agents working together. Each is an SVG on its own grid of square cells, one cell to one viewBox unit with every edge on a whole number, in two colors: ink (`#141111`) and the cream paper (`#FFFAEF`) inside the shapes. Where they may appear is in [Brand](../../foundations/brand.md#how-much-brand); in code they are [BrandIllustration](../../../packages/ui/src/components/brand-illustration/brand-illustration.md), which draws them in tokens.

| File | Shows | Grid (cells) |
| --- | --- | --- |
| `fist-bump.svg` | Two fists bumping | 37 × 19 |
| `hand-off.svg` | A hand passing a checked card to another | 38 × 21 |
| `award.svg` | Two hands holding up a medal | 29 × 19 |
| `deliver.svg` | A finished piece handed over | 39 × 25 |
| `raft.svg` | A raft with two oars: all in the same boat | 37 × 20 |
| `task-collab.svg` | One task card split into three | 37 × 25 |
| `review.svg` | A report under a magnifier with a check | 29 × 27 |
| `shared-data.svg` | A chart on a screen, shared to two laptops | 36 × 29 |
| `sync.svg` | A document passing between two screens | 38 × 24 |
| `idea.svg` | A light bulb lighting up | 14 × 24 |

## From Figma

`packages/ui/scripts/export-illustrations.mjs` writes these files from the Figma export (Figma frame 44:171692). Figma draws each one on a grid of its own, from 4.07px to 6.14px a cell and offset, over a paper rectangle the size of the frame. The script:

- Puts each drawing on its own grid, one cell to one unit, and checks that every cell of the source is wholly ink or wholly not, so nothing moves by part of a pixel.
- Drops the frame-sized paper rectangle and keeps paper only in the cells the ink encloses: there it covers what is behind the drawing, such as the halftone of the brand pane; outside the shapes the pane shows through.
- Merges each color's cells into rectangles in one path, with `shape-rendering="crispEdges"`.

Six drawings come out cell for cell. Four needed a decision, written in the script:

- `sync`: the left monitor's stand was half a cell off the grid; it now matches the right monitor's.
- `hand-off`: one step of the arm's outline was a cell and a half; the half cell is dropped so the line stays one pixel thick.
- `award` and `fist-bump`: Figma has them on no single grid (their blocks run from 6px to 11.7px, and the sparks are about 1.5 times the outline's cells). They are redrawn on one grid, symmetric as the originals, with sparks one cell wide like the others. Replace them when the designer draws them on a grid.

## Rules

- Draw a new illustration on a grid of square cells, in ink and paper only, with an ink outline and paper inside the shapes, and sparks one cell wide. Add it here, then run `vp run @botiverse/raft-ui#build:illustrations`.
- Render a cell at 4px or 8px, a multiple of 4: a whole number of device pixels at every common pixel ratio, so the pixels stay even ([BrandIllustration](../../../packages/ui/src/components/brand-illustration/brand-illustration.md#sizes)).
- Change the file to change the drawing, not the component. raft-ui draws the two colors from tokens and doesn't use the colors of the files.
