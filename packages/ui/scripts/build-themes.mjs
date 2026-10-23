#!/usr/bin/env node
// Generates src/themes.css from src/themes.json and the Agents sprites in
// design/assets/Agents.
//
//   node scripts/build-themes.mjs           write src/themes.css
//   node scripts/build-themes.mjs --check   exit 1 if src/themes.css is stale
//
// A theme is chosen with `data-theme` on the element that carries the mode
// class (`.light` / `.dark`; the app puts both on <html>). It overrides
// foundation tokens for that mode only: the frame (rail, top bar), its
// surfaces and, for Boring Gray, the brand. Semantic colours (primary, unread,
// status) never change. A theme with `decor` also sets the frame decorations
// (--frame-decor-top, --frame-decor-rail); `data-theme-decor="off"` on the
// same element turns them off and keeps the colours.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const themesPath = path.join(packageDir, "src/themes.json");
const cssPath = path.join(packageDir, "src/themes.css");
const spritesDir = path.join(packageDir, "../../design/assets/Agents");

/**
 * An Agents sprite's 8×8 drawing, without its <svg> wrapper. The sources draw
 * one 1×1 square per pixel; each colour's pixels are merged into one
 * rectangle per horizontal run, which draws the same pixels in far fewer bytes.
 */
function spriteBody(name) {
  const svg = readFileSync(path.join(spritesDir, `${name}.svg`), "utf8");
  const paths = [...svg.matchAll(/<path fill="([^"]+)" d="([^"]+)"/g)];
  if (paths.length === 0) throw new Error(`design/assets/Agents/${name}.svg has no pixel paths`);
  return paths
    .map(([, fill, d]) => {
      const rows = new Map();
      for (const [, x, y] of d.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
        if (!rows.has(+y)) rows.set(+y, []);
        rows.get(+y).push(+x);
      }
      let runs = "";
      for (const [y, xs] of [...rows].sort((a, b) => a[0] - b[0])) {
        xs.sort((a, b) => a - b);
        for (let i = 0; i < xs.length;) {
          let j = i;
          while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
          const n = j - i + 1;
          runs += `M${xs[i]} ${y}h${n}v1h-${n}z`;
          i = j + 1;
        }
      }
      return `<path fill='${fill}' d='${runs}'/>`;
    })
    .join("");
}

function place(name, x, y, scale) {
  return `<g transform='translate(${x} ${y}) scale(${scale})'>${spriteBody(name)}</g>`;
}

function tile(width, height, content) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' shape-rendering='crispEdges'>${content}</svg>`;
  // Single-quoted attributes inside a double-quoted url(): only these need escaping.
  return `url("data:image/svg+xml,${svg.replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E")}")`;
}

// The top bar's cluster: five sprites at 24px and 16px, alternating heights,
// in a 190×48 strip (the bar is 48px high).
const TOP = {
  width: 190,
  height: 48,
  x: [0, 38, 80, 118, 160],
  y: [12, 4, 14, 6, 12],
  scale: [3, 2, 3, 2, 3],
};
// The rail's column: four sprites in a 48×112 strip above the rail's foot.
const RAIL = {
  width: 48,
  height: 112,
  at: [
    [12, 0, 3],
    [0, 34, 2],
    [24, 52, 3],
    [4, 86, 3],
  ],
};

function topDecor(names) {
  if (names.length !== TOP.x.length) throw new Error(`top decor needs ${TOP.x.length} sprites`);
  return tile(
    TOP.width,
    TOP.height,
    names.map((name, i) => place(name, TOP.x[i], TOP.y[i], TOP.scale[i])).join(""),
  );
}

function railDecor(names) {
  if (names.length !== RAIL.at.length)
    throw new Error(`rail decor needs ${RAIL.at.length} sprites`);
  return tile(RAIL.width, RAIL.height, names.map((name, i) => place(name, ...RAIL.at[i])).join(""));
}

function declarations(tokens, decor, indent) {
  const lines = Object.entries(tokens).map(
    ([property, value]) => `${indent}${property}: ${value};`,
  );
  if (decor) {
    lines.push(`${indent}--theme-decor-top: ${topDecor(decor.top)};`);
    lines.push(`${indent}--theme-decor-rail: ${railDecor(decor.rail)};`);
  }
  return lines.join("\n");
}

const HEADER = `/* Generated from themes.json by scripts/build-themes.mjs. Do not edit this
   file; edit themes.json and run \`vp run @botiverse/raft-ui#build:themes\`.

   Themes (design/foundations/themes.md): import after foundation.css and put
   data-theme="<id>" on the element with the mode class. Without data-theme
   the app is Raft Yellow, the foundation itself. */
`;

const BASE = `/* The frame decorations components draw (AppRail; the app's top bar via
   bg-frame-decor-top). none unless the theme has decor and it is on. */
:root,
.light,
.dark {
  --frame-decor-top: var(--theme-decor-top, none);
  --frame-decor-rail: var(--theme-decor-rail, none);
}

:is(:root, .light, .dark)[data-theme-decor="off"] {
  --frame-decor-top: none;
  --frame-decor-rail: none;
}
`;

export function renderThemes(source) {
  const blocks = [HEADER, BASE];
  for (const [id, theme] of Object.entries(source.themes)) {
    const sel = `[data-theme="${id}"]`;
    const decor = theme.decor;
    // The light decorations serve both modes unless the dark ones differ.
    const darkDecor =
      decor && JSON.stringify(decor.dark) !== JSON.stringify(decor.light) ? decor.dark : null;
    const shared = decor
      ? `:is(:root, .light, .dark)${sel} {\n${declarations({}, decor.light, "  ")}\n}\n\n`
      : "";
    blocks.push(`/* ${theme.name} */
${shared}.light${sel},
:root:not(.light):not(.dark)${sel} {
${declarations(theme.light, null, "  ")}
}

.dark${sel} {
${declarations(theme.dark, darkDecor, "  ")}
}

@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.dark)${sel} {
${declarations(theme.dark, darkDecor, "    ")}
  }
}
`);
  }
  return blocks.join("\n");
}

function main(argv) {
  const css = renderThemes(JSON.parse(readFileSync(themesPath, "utf8")));
  if (argv.includes("--check")) {
    if (readFileSync(cssPath, "utf8") !== css) {
      console.error(
        "src/themes.css is out of date with src/themes.json. Run `vp run @botiverse/raft-ui#build:themes`.",
      );
      process.exit(1);
    }
    return;
  }
  writeFileSync(cssPath, css);
}

if (import.meta.url === `file://${process.argv[1]}`) main(process.argv.slice(2));
