#!/usr/bin/env node
// Manual export of the brand illustrations from the designer's Figma SVGs into
// design/assets/Illustrations; not part of package installation or build.
//
//   node packages/ui/scripts/export-illustrations.mjs /absolute/path/to/figma-svgs
//
// Figma exports each drawing as one square path per pixel group on its own
// non-integer grid (4.07px to 6.14px a cell, offset), over a full-size paper
// rectangle. This writes each drawing on its own grid instead: one cell is one
// viewBox unit, every edge on an integer, with shape-rendering="crispEdges".
//
// - The paper rectangle is dropped. Paper is kept where it covers something:
//   the cells the ink encloses (not reachable from outside the drawing), so
//   the halftone behind an illustration stays out of its shapes.
// - Each colour's cells are merged into rectangles (a run per row, grown down
//   while the rows below repeat it) and written as one path.
// - Every cell must be wholly ink or wholly not: a cell the source covers by
//   more than 5% and less than 95% stops the export, so a drawing never moves
//   by part of a pixel without someone deciding it.
//
// Two decisions are written down below: FIXES moves an edge that sits half a
// cell off the grid, and REDRAWN carries the drawings Figma has off any grid.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const INK = "#141111";
const PAPER = "#FFFAEF";
const outDir = fileURLToPath(new URL("../../../design/assets/Illustrations", import.meta.url));

// An edge half a cell off the grid, moved to the cell the drawing's own
// pattern puts it on.
const FIXES = {
  // The left monitor's stand: its hole ends and its right foot starts half a
  // cell right of the right monitor's (4.5 and 1.5 cells, not 4 and 2).
  // Moved to match the right monitor, which is on the grid.
  sync: [
    ["H68.531V151.524", "H65.5504V151.524"],
    ["H74.4849V145.566", "H71.5079V145.566"],
  ],
  // The arm's outline steps 1.5 cells at one row; the half cell is dropped so
  // the line stays one pixel thick and meets the row below at a corner, as it
  // does one row further down.
  "hand-off": [["H49.0432V75.6451", "H51.9281V75.6451"]],
};

// In Figma these two are not drawn on one grid: their blocks run from 6px to
// 11.7px in one drawing (the sparks are about 1.5 times the outline's cells),
// so no grid holds them without moving every block. They are redrawn here on
// one grid, symmetric as the originals are, with sparks one cell wide like
// the other eight: '#' is ink, '.' is not. Replace them with the designer's
// own version when there is one on a grid.
const REDRAWN = {
  award: [
    "..............#..............",
    "..............#..............",
    "..........#...#...#..........",
    "...........#..#..#...........",
    ".............................",
    "......###...........###......",
    ".....#...##.#####.##...#.....",
    "....#...#..#.....#..#...#....",
    "...#...#.##...#...##.#...#...",
    "###....##.#...#...#.##....###",
    "###......##.#####.##......###",
    "###.....#.#..###..#.#.....###",
    "###....#..#..#.#..#..#....###",
    "###.###....#.....#....###.###",
    ".###......#.#####.#......###.",
    "..........#..#.#..#..........",
    ".........#...#.#...#.........",
    ".........##.#...#.##.........",
    "...........#.....#...........",
  ],
  "fist-bump": [
    "..................#..................",
    "..................#..................",
    "............#.....#.....#............",
    ".............#.........#.............",
    "..............#.......#..............",
    "...............#.....#...............",
    ".....................................",
    ".....................................",
    ".........########...########.........",
    "#####..##.......##.##.......##..#####",
    "####.###.........#.#.........###.####",
    "####.#........#..#.#..#........#.####",
    "####.#......###..#.#..###......#.####",
    "####.#......#....#.#....#......#.####",
    "####.#......##...#.#...##......#.####",
    "####.###.....#####.#####.....###.####",
    ".####...#.......#...#.......#...####.",
    ".........##.....#...#.....##.........",
    "..........#######...#######..........",
  ],
};

/** The polygons of a path's `d`: M, L, H, V, C (flattened) and Z, absolute. */
function polygons(d) {
  const tokens = d.match(/[A-Za-z]|-?[\d.]+(?:e-?\d+)?/g);
  const out = [];
  let current = null;
  let command;
  let x = 0;
  let y = 0;
  let i = 0;
  const next = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) {
      command = tokens[i++];
      if (command === "Z") current = null;
      else if (!/[MLHVC]/.test(command)) throw new Error(`Unsupported path command ${command}`);
      continue;
    }
    if (command === "M") {
      x = next();
      y = next();
      current = [[x, y]];
      out.push(current);
      command = "L";
      continue;
    }
    if (!current) {
      current = [[x, y]];
      out.push(current);
    }
    if (command === "L") {
      x = next();
      y = next();
      current.push([x, y]);
    } else if (command === "H") {
      x = next();
      current.push([x, y]);
    } else if (command === "V") {
      y = next();
      current.push([x, y]);
    } else {
      const [x1, y1, x2, y2, x3, y3] = [next(), next(), next(), next(), next(), next()];
      for (let k = 1; k <= 8; k++) {
        const t = k / 8;
        const u = 1 - t;
        current.push([
          u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
          u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
        ]);
      }
      x = x3;
      y = y3;
    }
  }
  return out;
}

/** Nonzero winding, SVG's default fill rule. */
function inside(edges, px, py) {
  let winding = 0;
  for (const [[ax, ay], [bx, by]] of edges) {
    const side = (bx - ax) * (py - ay) - (px - ax) * (by - ay);
    if (ay <= py) {
      if (by > py && side > 0) winding++;
    } else if (by <= py && side < 0) winding--;
  }
  return winding !== 0;
}

/**
 * The cell size: the largest distance between neighbouring edges that puts
 * nearly every edge on a whole number of cells from the first one (a smaller
 * divisor of the cell would fit as well, and halve every pixel).
 */
function pitch(xs, ys) {
  const lines = (values) =>
    [...new Set(values.map((v) => v.toFixed(2)))].map(Number).sort((a, b) => a - b);
  const [lx, ly] = [lines(xs), lines(ys)];
  const gaps = [lx, ly].flatMap((l) => l.slice(1).map((v, k) => v - l[k])).filter((g) => g > 3);
  const fits = (p) =>
    [lx, ly].every(
      (l) =>
        l.filter((v) => Math.abs((v - l[0]) / p - Math.round((v - l[0]) / p)) < 0.06).length >=
        0.97 * l.length,
    );
  const candidates = gaps.filter(fits).sort((a, b) => b - a);
  if (candidates.length === 0) throw new Error("no grid fits the drawing");
  const near = gaps.filter((g) => Math.abs(g - candidates[0]) < 0.05);
  return near.reduce((s, g) => s + g, 0) / near.length;
}

/** The drawing as rows of '#' (ink) and '.', from a Figma SVG. */
function gridFromFigma(name, svg) {
  for (const [from, to] of FIXES[name] ?? []) {
    if (!svg.includes(from)) throw new Error(`${name}: fix ${from} no longer matches the source`);
    svg = svg.replace(from, to);
  }
  const fills = [...svg.matchAll(/<(path|rect)\b[^>]*fill="([^"]+)"/g)].map((m) => m[2]);
  const other = fills.filter((fill) => fill.toUpperCase() !== INK && fill.toUpperCase() !== PAPER);
  if (other.length > 0)
    throw new Error(`${name}: colours other than ink and paper: ${other.join(", ")}`);
  const ink = [...svg.matchAll(/<path d="([^"]+)" fill="([^"]+)"/g)]
    .filter(([, , fill]) => fill.toUpperCase() === INK)
    .flatMap(([, d]) => polygons(d));
  const edges = ink.flatMap((poly) => poly.map((p, k) => [p, poly[(k + 1) % poly.length]]));
  const xs = ink.flat().map(([x]) => x);
  const ys = ink.flat().map(([, y]) => y);
  const cell = pitch(xs, ys);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const width = Math.round((Math.max(...xs) - x0) / cell);
  const height = Math.round((Math.max(...ys) - y0) / cell);
  const N = 8;
  const rows = [];
  for (let j = 0; j < height; j++) {
    let row = "";
    for (let i = 0; i < width; i++) {
      let hits = 0;
      for (let a = 0; a < N; a++)
        for (let b = 0; b < N; b++)
          if (inside(edges, x0 + (i + (a + 0.5) / N) * cell, y0 + (j + (b + 0.5) / N) * cell))
            hits++;
      const cover = hits / N / N;
      if (cover > 0.05 && cover < 0.95)
        throw new Error(
          `${name}: cell ${i},${j} is ${Math.round(cover * 100)}% ink; the drawing is off its ${cell.toFixed(3)}px grid there`,
        );
      row += cover >= 0.95 ? "#" : ".";
    }
    rows.push(row);
  }
  return rows;
}

/** Paper: the cells that are not ink and can't be reached from outside. */
function paperOf(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const outside = rows.map((r) => [...r].map(() => false));
  const stack = [];
  for (let i = 0; i < w; i++) stack.push([i, 0], [i, h - 1]);
  for (let j = 0; j < h; j++) stack.push([0, j], [w - 1, j]);
  while (stack.length) {
    const [i, j] = stack.pop();
    if (i < 0 || j < 0 || i >= w || j >= h || outside[j][i] || rows[j][i] === "#") continue;
    outside[j][i] = true;
    stack.push([i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]);
  }
  return rows.map((r, j) =>
    [...r].map((c, i) => (c !== "#" && !outside[j][i] ? "#" : ".")).join(""),
  );
}

/** One path's `d` for the '#' cells, merged into rectangles. */
function pathData(rows) {
  const taken = rows.map((r) => [...r].map((c) => c !== "#"));
  let d = "";
  for (let j = 0; j < rows.length; j++) {
    for (let i = 0; i < rows[j].length; i++) {
      if (taken[j][i]) continue;
      let w = 1;
      while (i + w < rows[j].length && !taken[j][i + w]) w++;
      let h = 1;
      while (
        j + h < rows.length &&
        Array.from({ length: w }, (_, k) => !taken[j + h][i + k]).every(Boolean) &&
        (i + w === rows[j].length || taken[j + h][i + w]) &&
        (i === 0 || taken[j + h][i - 1])
      )
        h++;
      for (let b = 0; b < h; b++) for (let a = 0; a < w; a++) taken[j + b][i + a] = true;
      d += `M${i} ${j}h${w}v${h}h-${w}z`;
    }
  }
  return d;
}

function writeSvg(name, rows) {
  const width = rows[0].length;
  const height = rows.length;
  if (rows.some((r) => r.length !== width)) throw new Error(`${name}: rows of different widths`);
  const paper = pathData(paperOf(rows));
  const ink = pathData(rows);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width * 4}" height="${height * 4}" shape-rendering="crispEdges">` +
    (paper ? `<path fill="${PAPER}" d="${paper}"/>` : "") +
    `<path fill="${INK}" d="${ink}"/></svg>\n`;
  writeFileSync(path.join(outDir, `${name}.svg`), svg);
  return { width, height };
}

const source = process.argv[2];
if (!source)
  throw new Error("Pass the folder holding the Figma SVGs (award.svg, deliver.svg, ...)");
for (const file of readdirSync(source)
  .filter((f) => f.endsWith(".svg"))
  .sort()) {
  const name = file.slice(0, -4);
  const rows = REDRAWN[name] ?? gridFromFigma(name, readFileSync(path.join(source, file), "utf8"));
  const { width, height } = writeSvg(name, rows);
  console.log(`${name}: ${width}x${height} cells${REDRAWN[name] ? " (redrawn)" : ""}`);
}
