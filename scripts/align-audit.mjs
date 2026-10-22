#!/usr/bin/env node
// Optical alignment audit (design/foundations/alignment.md#checking-alignment).
//
// Renders every docs composition alone (the iframe example route) on a desktop
// and on a phone, finds every row whose parts are meant to sit on one line, and
// measures each part's optical centre against the row's main text:
//
//   - text by the pixels of one flat letter (H, E, x, n ...) for its baseline,
//     cap height or x-height, the rest from the font's metrics: text in the main
//     text's face and size, or in a row without a fill laid out on the
//     baseline, by its baseline; smaller or other text by the middle of its
//     x-height (of its cap height when it has no lowercase), against the main
//     text's;
//   - an icon, a pixel or anything else without text by its ink, from the pixels
//     it draws (a screenshot with and without it);
//   - a shape with words in it (a badge, a filled button) by its box.
//
// The reference is the row's main text (its largest, then boldest, first run):
// its cap-height middle for icons and shapes. Chromium rounds a line box's
// ascent and descent to whole pixels and floors its half-leading, which moves
// letters up to 0.5px; that share is computed for every text and reported
// apart, and only the rest is flagged when it reaches 0.75px. Inline chips are
// also checked against the sentence's baseline.
//
// Usage (start the docs first: `pnpm dev`, or `pnpm exec vp dev` in apps/doc):
//   node scripts/align-audit.mjs [--base http://localhost:5173] [--out dir]
//        [--only substring] [--threshold 0.75] [--no-images] [--workers 4]
//        [--half-pixel-only]
// Writes report.md, results.json and one overlay PNG per flagged row.

import { createRequire } from "node:module";
import { readdirSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const BASE = opt("base", "http://localhost:5173");
const OUT = path.resolve(opt("out", path.join(root, "align-audit")));
const ONLY = opt("only", "");
const THRESHOLD = Number(opt("threshold", "0.75"));
const IMAGES = !args.includes("--no-images");
// Only list marks that land on a half pixel (fast: no screenshots).
const HALF_ONLY = args.includes("--half-pixel-only");

// The Playwright this repository pins.
const pnpmDir = path.join(root, "node_modules/.pnpm");
const pwDir = readdirSync(pnpmDir).find((d) => d.startsWith("playwright-core@"));
const { chromium } = createRequire(import.meta.url)(
  path.join(pnpmDir, pwDir, "node_modules/playwright-core"),
);

function compositions() {
  const modules = path.join(root, "apps/doc/src/modules");
  const keys = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".composition.tsx"))
        keys.push(path.relative(modules, full).replace(/\.composition\.tsx$/, ""));
    }
  };
  walk(modules);
  return keys.filter((k) => k.includes(ONLY)).sort();
}

const VIEWPORTS = [
  { name: "desktop", viewport: { width: 1280, height: 1800 }, isMobile: false, hasTouch: false },
  { name: "phone", viewport: { width: 390, height: 1800 }, isMobile: true, hasTouch: true },
];

// ---- In the page ----------------------------------------------------------

function collect() {
  const ctx = document.createElement("canvas").getContext("2d");
  const alphaCache = new Map();
  const alpha = (color) => {
    if (!color || color === "transparent") return 0;
    if (alphaCache.has(color)) return alphaCache.get(color);
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const a = ctx.getImageData(0, 0, 1, 1).data[3] / 255;
    alphaCache.set(color, a);
    return a;
  };
  const visible = (el) => {
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const isShape = (el) => {
    const cs = getComputedStyle(el);
    if (alpha(cs.backgroundColor) > 0.02 || cs.backgroundImage !== "none") return true;
    for (const side of ["Top", "Right", "Bottom", "Left"])
      if (parseFloat(cs[`border${side}Width`]) > 0 && alpha(cs[`border${side}Color`]) > 0.02)
        return true;
    return cs.boxShadow !== "none" && /inset/.test(cs.boxShadow);
  };
  const metricsCache = new Map();
  const metrics = (cs) => {
    const font = `${cs.fontStyle} ${cs.fontWeight} 1000px ${cs.fontFamily}`;
    if (!metricsCache.has(font)) {
      ctx.font = font;
      const x = ctx.measureText("x");
      const H = ctx.measureText("H");
      metricsCache.set(font, {
        x: x.actualBoundingBoxAscent / 1000,
        cap: H.actualBoundingBoxAscent / 1000,
        ascent: x.fontBoundingBoxAscent / 1000,
        descent: x.fontBoundingBoxDescent / 1000,
      });
    }
    return metricsCache.get(font);
  };
  const textNodes = (node) => {
    const out = [];
    const walk = (n) => {
      if (n.nodeType === 3) {
        if (n.textContent.trim() && visible(n.parentElement)) out.push(n);
      } else if (n.nodeType === 1 && visible(n) && n.tagName !== "svg") {
        for (const c of n.childNodes) walk(c);
      }
    };
    walk(node);
    return out;
  };
  const describeText = (t) => {
    const cs = getComputedStyle(t.parentElement);
    const size = parseFloat(cs.fontSize);
    const m = metrics(cs);
    const text = t.textContent;
    const first = text.search(/\S/);
    const range = document.createRange();
    range.setStart(t, first);
    range.setEnd(t, first + 1);
    const r = range.getClientRects()[0] ?? range.getBoundingClientRect();
    // The glyph's box is the font's content area. Chromium rounds the ascent
    // and the descent to whole pixels, and draws the baseline where the
    // rounded ascent ends.
    const ascent = Math.round(m.ascent * size);
    const rounded = Math.abs(r.height - ascent - Math.round(m.descent * size)) < 0.05;
    const baseline = rounded
      ? r.top + ascent
      : r.top + (r.height - (m.ascent + m.descent) * size) / 2 + m.ascent * size;
    const word = text.trim();
    const caps = !/\p{Ll}/u.test(word);
    // Chromium's share: it rounds the ascent and the descent to whole pixels
    // and floors the half-leading, so the baseline lands off where the font's
    // metrics put it in the line box (alignment.md#a-control-and-its-label).
    // Positive: the letters sit low.
    const L = cs.lineHeight === "normal" ? null : parseFloat(cs.lineHeight);
    const renderer =
      L === null
        ? 0
        : Math.floor((L - ascent - Math.round(m.descent * size)) / 2) +
          ascent -
          ((L - (m.ascent + m.descent) * size) / 2 + m.ascent * size);
    // A flat letter to read from the pixels: one that stands on the baseline
    // and reaches the cap height (or the x-height) without overshoot.
    const flatAt = (re) => {
      for (let i = 0; i < text.length; i++) if (re.test(text[i])) return i;
      return -1;
    };
    let flatIndex = flatAt(/[HEFILTNMKXZ]/);
    let flatKind = "cap";
    if (flatIndex < 0) {
      flatIndex = flatAt(/[xzvwnmru]/);
      flatKind = "x";
    }
    let flat = null;
    if (flatIndex >= 0) {
      const fr = document.createRange();
      fr.setStart(t, flatIndex);
      fr.setEnd(t, flatIndex + 1);
      const rect = fr.getClientRects()[0];
      if (rect && Math.abs(rect.top - r.top) < size) {
        t.parentElement.dataset.auditText ??= String(Math.random()).slice(2);
        flat = {
          kind: flatKind,
          left: rect.left,
          right: rect.right,
          parent: t.parentElement.dataset.auditText,
        };
      }
    }
    return {
      text: word.slice(0, 28),
      size,
      weight: Number(cs.fontWeight),
      mono: /mono/i.test(cs.fontFamily.split(",")[0]),
      baseline,
      capMid: baseline - (m.cap * size) / 2,
      xMid: baseline - (m.x * size) / 2,
      cap: m.cap * size,
      xHeight: m.x * size,
      renderer,
      flat,
      caps,
      left: r.left,
      right: r.right,
    };
  };
  const mainRun = (node) => {
    const runs = textNodes(node).map(describeText);
    if (!runs.length) return null;
    return runs.reduce((a, b) =>
      b.size > a.size + 0.01 || (Math.abs(b.size - a.size) < 0.01 && b.weight > a.weight) ? b : a,
    );
  };
  const label = (el) => {
    const slot = el.getAttribute?.("data-slot");
    const cls = (el.getAttribute?.("class") ?? "")
      .split(/\s+/)
      .filter(
        (c) =>
          !/^(hover|active|focus|data|aria|has|group|peer|motion|transition|duration|ease|outline|cursor|select|pointer)/.test(
            c,
          ),
      )
      .slice(0, 6)
      .join(".");
    return `${el.tagName?.toLowerCase()}${slot ? `[${slot}]` : ""}${cls ? `.${cls}` : ""}`;
  };

  let nextId = 0;
  const idOf = (el) => {
    if (!el.dataset.auditId) el.dataset.auditId = String(nextId++);
    return el.dataset.auditId;
  };

  // Turned: a sticker set at an angle has no horizontal line to sit on.
  const turned = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const t = getComputedStyle(e).transform;
      if (t !== "none") {
        const m = new DOMMatrixReadOnly(t);
        if (Math.abs(m.b) > 0.001 || Math.abs(m.c) > 0.001) return true;
      }
    }
    return false;
  };
  const lineHeight = (cs) =>
    cs.lineHeight === "normal" ? parseFloat(cs.fontSize) * 1.3 : parseFloat(cs.lineHeight);
  const lines = (node) => {
    const range = document.createRange();
    range.selectNodeContents(node);
    return new Set(
      [...range.getClientRects()].filter((r) => r.width > 0).map((r) => Math.round(r.top)),
    ).size;
  };

  const rows = [];
  // Marks that land on a half pixel of their line: a 9px light in an 18px
  // line, a 19px avatar in a 36px row. They blur at 1x and snap at 3x.
  const halfPixel = [];
  const isMark = (c) =>
    c.tagName === "svg" ||
    c.tagName === "IMG" ||
    c.matches(
      "[data-slot=status], [data-slot=avatar], [data-slot=task-status-icon], [data-slot=spinner]",
    );
  for (const el of document.querySelectorAll("body *")) {
    if (el.closest("svg") || !visible(el)) continue;
    const cs = getComputedStyle(el);
    const flexRow =
      /flex/.test(cs.display) &&
      cs.flexDirection.startsWith("row") &&
      cs.flexWrap !== "wrap-reverse";
    const gridRow = /grid/.test(cs.display);
    if (!flexRow && !gridRow) continue;
    const align = cs.alignItems;
    if (!/center|baseline/.test(align)) continue;
    if (turned(el)) continue;
    {
      const rowRect = el.getBoundingClientRect();
      const ecs = getComputedStyle(el);
      const contentTop = rowRect.top + parseFloat(ecs.borderTopWidth) + parseFloat(ecs.paddingTop);
      for (const c of el.children) {
        if (!visible(c)) continue;
        // The mark itself, or the one mark inside a slot that is not a line
        // of its own (a wrapper the size of the mark centres nothing).
        const mark = isMark(c)
          ? c
          : c.children.length === 1 && isMark(c.children[0])
            ? c.children[0]
            : null;
        if (!mark) continue;
        const m = mark.getBoundingClientRect();
        if (Math.abs(m.height - Math.round(m.height)) > 0.01) continue;
        const offset = m.top - contentTop;
        const frac = offset - Math.floor(offset);
        if (Math.abs(frac - 0.5) < 0.2) {
          halfPixel.push({
            row: label(el),
            mark: label(mark),
            size: m.height,
            line: rowRect.height,
            offset: Number(offset.toFixed(2)),
            slot: mark === c ? null : { desc: label(c), height: c.getBoundingClientRect().height },
          });
        }
      }
    }
    const items = [];
    for (const c of el.childNodes) {
      if (c.nodeType === 3) {
        if (c.textContent.trim())
          items.push({
            kind: "text",
            run: describeText(c),
            lines: lines(c),
            desc: `"${c.textContent.trim().slice(0, 20)}"`,
          });
        continue;
      }
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(c.tagName)) continue;
      if (c.nodeType !== 1 || !visible(c)) continue;
      const ccs = getComputedStyle(c);
      if (ccs.position === "absolute" || ccs.position === "fixed") continue;
      const r = c.getBoundingClientRect();
      // A column (a title over a description) is not a part of the row's line.
      if (c.tagName !== "svg" && /flex/.test(ccs.display) && /column/.test(ccs.flexDirection))
        continue;
      const run = c.tagName === "svg" ? null : mainRun(c);
      // A shape that fills the part (an avatar's fallback, a tile) makes it one.
      const filled =
        isShape(c) ||
        [...c.querySelectorAll("*")].some((d) => {
          const dr = d.getBoundingClientRect();
          return isShape(d) && dr.width >= r.width - 2 && dr.height >= r.height - 2;
        });
      if (filled && c !== el && (run === null || r.height <= 44)) {
        items.push({
          kind: "shape",
          top: r.top,
          bottom: r.bottom,
          desc: label(c),
          left: r.left,
          right: r.right,
          run,
        });
        continue;
      } else if (run) {
        // A block of several lines (a title over its description) is not one
        // line of a row.
        if (r.height > lineHeight(getComputedStyle(c)) * 1.6 && r.height > run.size * 2) continue;
        items.push({ kind: "text", run, lines: lines(c), desc: label(c) });
      } else {
        items.push({
          kind: "ink",
          id: idOf(c),
          desc: label(c),
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        });
      }
    }
    const texts = items.filter((i) => i.kind === "text");
    if (items.length < 2 || !texts.length) continue;
    const ref = texts.reduce((a, b) =>
      b.run.size > a.run.size + 0.01 ||
      (Math.abs(b.run.size - a.run.size) < 0.01 && b.run.weight > a.run.weight)
        ? b
        : a,
    );
    const r = el.getBoundingClientRect();
    if (r.height > 48) continue; // a block, not a line
    // Only what sits on the main text's line: in a wrapping row the rest moved
    // to another line.
    const top = ref.run.baseline - ref.run.size;
    const bottom = ref.run.baseline + ref.run.size * 0.35;
    const onLine = items.filter((i) => {
      if (i === ref) return true;
      if (i.kind === "text") return Math.abs(i.run.baseline - ref.run.baseline) < ref.run.size;
      return i.bottom > top && i.top < bottom && i.bottom - i.top <= 44;
    });
    if (onLine.length < 2) continue;
    items.length = 0;
    items.push(...onLine);
    rows.push({
      id: idOf(el),
      desc: label(el),
      align,
      filled: isShape(el),
      rect: { left: r.left, top: r.top, width: r.width, height: r.height },
      ref: items.indexOf(ref),
      items,
    });
  }

  // Inline chips keep the sentence's baseline.
  const inline = [];
  for (const el of document.querySelectorAll("p *, li *, td *, [data-slot=markdown] *")) {
    const cs = getComputedStyle(el);
    if (!/inline-(flex|block|grid)/.test(cs.display) || !visible(el) || el.closest("svg")) continue;
    const parent = el.parentElement;
    if (![...parent.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const run = mainRun(el);
    if (!run) continue;
    // A probe just before and just after the chip; at a wrap one of them lands
    // on the neighbouring line, so take the one on the chip's line.
    const probeAt = (before) => {
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
      parent.insertBefore(probe, before);
      const y = probe.getBoundingClientRect().top;
      probe.remove();
      return y;
    };
    const sentence = [probeAt(el), probeAt(el.nextSibling)].reduce((a, b) =>
      Math.abs(b - run.baseline) < Math.abs(a - run.baseline) ? b : a,
    );
    const r = el.getBoundingClientRect();
    inline.push({
      id: idOf(el),
      desc: label(el),
      text: run.text,
      deviation: run.baseline - sentence,
      rect: { left: r.left, top: r.top, width: r.width, height: r.height },
    });
  }
  return { rows, inline, halfPixel };
}

// Ink rows of an element from two screenshots, with and without it.
function inkFromShots([a, b, scale]) {
  return Promise.all(
    [a, b].map(async (b64) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const x = c.getContext("2d");
      x.drawImage(img, 0, 0);
      return x.getImageData(0, 0, c.width, c.height);
    }),
  ).then(([on, off]) => {
    // The largest change in each row of pixels, as a share of the largest
    // anywhere: a row half covered by an edge counts half, so the edges are
    // read to a fraction of a device pixel.
    const cover = [];
    for (let j = 0; j < on.height; j++) {
      let m = 0;
      for (let i = 0; i < on.width; i++) {
        const o = (j * on.width + i) * 4;
        m = Math.max(
          m,
          Math.abs(on.data[o] - off.data[o]) +
            Math.abs(on.data[o + 1] - off.data[o + 1]) +
            Math.abs(on.data[o + 2] - off.data[o + 2]),
        );
      }
      cover.push(m);
    }
    const max = Math.max(...cover);
    if (max < 60) return null;
    const n = cover.map((v) => v / max);
    const first = n.findIndex((v) => v > 0.05);
    const last = n.length - 1 - [...n].reverse().findIndex((v) => v > 0.05);
    return { top: (first + 1 - n[first]) / scale, bottom: (last + n[last]) / scale };
  });
}

function drawOverlay({ lines, box }) {
  const layer = document.createElement("div");
  layer.dataset.auditOverlay = "";
  layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647";
  for (const l of lines) {
    const d = document.createElement("div");
    d.style.cssText = `position:fixed;left:${l.left}px;top:${l.y - 1 / 6}px;width:${l.width}px;height:${1 / 3}px;background:${l.color}`;
    layer.append(d);
  }
  const frame = document.createElement("div");
  frame.style.cssText = `position:fixed;left:${box.left}px;top:${box.top}px;width:${box.width}px;height:${box.height}px;outline:1px dashed rgb(0 0 0 / 0.15)`;
  layer.append(frame);
  document.body.append(layer);
}

// ---- Driver ---------------------------------------------------------------

const FONT_CSS = `
@font-face { font-family: "Space Grotesk"; src: url("/__audit-fonts/SpaceGrotesk-Variable.woff2") format("woff2"); font-weight: 300 700; }
@font-face { font-family: "Space Mono"; src: url("/__audit-fonts/SpaceMono-Regular.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "Space Mono"; src: url("/__audit-fonts/SpaceMono-Bold.woff2") format("woff2"); font-weight: 700; }`;

async function main() {
  const keys = compositions();
  if (existsSync(OUT)) rmSync(OUT, { recursive: true });
  mkdirSync(path.join(OUT, "rows"), { recursive: true });
  const browser = await chromium.launch();
  const flags = [];
  const halves = [];
  let rowsChecked = 0;
  let inlineChecked = 0;
  let imageCount = 0;
  const jobs = VIEWPORTS.flatMap((vp) => keys.map((key) => ({ vp, key })));
  const WORKERS = Number(opt("workers", "4"));
  const worker = async (vp, queue) => {
    const context = await browser.newContext({
      ...vp,
      deviceScaleFactor: 3,
      reducedMotion: "reduce",
    });
    // The design's fonts from the repository, not from Google Fonts.
    await context.route(/fonts\.googleapis\.com/, (route) =>
      route.fulfill({ contentType: "text/css", body: FONT_CSS }),
    );
    await context.route(/\/__audit-fonts\//, (route) =>
      route.fulfill({
        path: path.join(root, "design/fonts", route.request().url().split("/").pop()),
      }),
    );
    const page = await context.newPage();
    for (let job = queue.shift(); job; job = queue.shift()) {
      const { key } = job;
      try {
        await page.goto(`${BASE}/iframe/example?path=${encodeURIComponent(key)}&mode=light`, {
          waitUntil: "load",
          timeout: 30000,
        });
        await page.addStyleTag({
          content:
            "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}",
        });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () => document.querySelector("[data-preview-theme], body *"),
          null,
          { timeout: 10000 },
        );
        await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(300);
        const { rows, inline, halfPixel } = await page.evaluate(collect);
        for (const h of halfPixel) halves.push({ key, viewport: vp.name, ...h });
        rowsChecked += rows.length;
        inlineChecked += inline.length;
        for (const row of HALF_ONLY ? [] : rows)
          try {
            // Ink of icons and other parts without text, from the pixels.
            for (const item of row.items) {
              if (item.kind !== "ink") continue;
              const handle = await page.$(`[data-audit-id="${item.id}"]`);
              if (!handle) continue;
              await handle.scrollIntoViewIfNeeded().catch(() => {});
              const box = await handle.boundingBox();
              if (!box || box.width < 1 || box.height < 1) continue;
              const clip = {
                x: Math.max(0, box.x - 2),
                y: Math.max(0, box.y - 2),
                width: box.width + 4,
                height: box.height + 4,
              };
              const on = (await page.screenshot({ clip })).toString("base64");
              await handle.evaluate((el) =>
                el.style.setProperty("visibility", "hidden", "important"),
              );
              const off = (await page.screenshot({ clip })).toString("base64");
              await handle.evaluate((el) => el.style.removeProperty("visibility"));
              const ink = await page.evaluate(inkFromShots, [on, off, 3]).catch(() => null);
              // Scrolling moved the page: express the ink in the row's frame.
              const rowBox = await page.$eval(
                `[data-audit-id="${row.id}"]`,
                (el) => el.getBoundingClientRect().top,
              );
              if (ink) {
                item.inkTop = clip.y + ink.top - rowBox + row.rect.top;
                item.inkBottom = clip.y + ink.bottom - rowBox + row.rect.top;
              }
            }
            // Text from its pixels: the flat letter alone, with and without its colour.
            await page
              .$eval(`[data-audit-id="${row.id}"]`, (el) => el.scrollIntoView({ block: "center" }))
              .catch(() => {});
            for (const item of row.items) {
              if (item.kind !== "text" || !item.run.flat) continue;
              const { flat: flatAtCollect } = item.run;
              const rowTop = await page.$eval(
                `[data-audit-id="${row.id}"]`,
                (el) => el.getBoundingClientRect().top,
              );
              // The page may have scrolled since the row was collected.
              const flat = {
                ...flatAtCollect,
                left:
                  flatAtCollect.left +
                  (await page.$eval(
                    `[data-audit-id="${row.id}"]`,
                    (el) => el.getBoundingClientRect().left,
                  )) -
                  row.rect.left,
              };
              const shift = rowTop - row.rect.top;
              const clip = {
                x: Math.max(0, flat.left),
                y: Math.max(0, rowTop - 6),
                width: Math.max(1, flat.right - flat.left),
                height: row.rect.height + 12,
              };
              if (rowTop + row.rect.height < 0 || flat.right <= 0) continue;
              const on = (await page.screenshot({ clip })).toString("base64");
              await page.$eval(`[data-audit-text="${flat.parent}"]`, (el) => {
                el.style.setProperty("color", "transparent", "important");
                el.style.setProperty("-webkit-text-fill-color", "transparent", "important");
              });
              const off = (await page.screenshot({ clip })).toString("base64");
              await page.$eval(`[data-audit-text="${flat.parent}"]`, (el) => {
                el.style.removeProperty("color");
                el.style.removeProperty("-webkit-text-fill-color");
              });
              const ink = await page.evaluate(inkFromShots, [on, off, 3]).catch(() => null);
              if (!ink) continue;
              const top = clip.y + ink.top - shift;
              const bottom = clip.y + ink.bottom - shift;
              const run = item.run;
              run.measured = "pixels";
              run.baseline = bottom;
              if (flat.kind === "cap") {
                run.capMid = (top + bottom) / 2;
                run.xMid = bottom - run.xHeight / 2;
              } else {
                run.xMid = (top + bottom) / 2;
                run.capMid = bottom - run.cap / 2;
              }
            }
            const ref = row.items[row.ref];
            const parts = [];
            for (const [index, item] of row.items.entries()) {
              if (index === row.ref) continue;
              let centre;
              let against;
              let how;
              if (item.kind === "text") {
                // Text in the same face and size is one line of text: it shares
                // the baseline. So does text of another size in a row laid out on
                // the baseline without a fill (a sender line). Anything else, a
                // smaller note in a chip or beside a label, centres its x-height.
                const sameType =
                  Math.abs(item.run.size - ref.run.size) < 0.5 && item.run.mono === ref.run.mono;
                if (sameType || (row.align === "baseline" && !row.filled)) {
                  centre = item.run.baseline;
                  against = ref.run.baseline;
                  how = "baseline";
                } else if (item.run.caps) {
                  // Capitals and figures have no x-height: their middle is the
                  // cap height's.
                  centre = item.run.capMid;
                  against = ref.run.capMid;
                  how = "cap-height middle";
                } else {
                  centre = item.run.xMid;
                  against = ref.run.xMid;
                  how = "x-height middle";
                }
              } else if (item.kind === "shape" && row.align === "baseline" && item.run) {
                // A badge in a line laid out on the baseline lines up by its
                // words (alignment.md#text-of-different-sizes-on-one-line).
                centre = item.run.baseline;
                against = ref.run.baseline;
                how = "baseline";
              } else if (item.kind === "shape") {
                centre = (item.top + item.bottom) / 2;
                against = ref.run.capMid;
                how = "box middle vs cap-height middle";
              } else {
                if (item.inkTop === undefined) continue;
                centre = (item.inkTop + item.inkBottom) / 2;
                against = ref.run.capMid;
                how = "ink middle vs cap-height middle";
              }
              const measured = centre - against;
              // What Chromium's rounding moved: the main text by its share, a
              // text part by its own. The rest is ours.
              // In a row laid out on the baseline the browser lines the baselines
              // up itself, so its rounding moves both texts alike.
              const renderer =
                how === "baseline" && row.align === "baseline"
                  ? 0
                  : (item.kind === "text" ? item.run.renderer : 0) - ref.run.renderer;
              parts.push({
                index,
                desc:
                  item.kind === "text"
                    ? `${item.desc} ${JSON.stringify(item.run.text)}`
                    : item.desc,
                kind: item.kind,
                centre,
                against,
                how,
                measured,
                renderer,
                deviation: measured - renderer,
              });
            }
            const worst = parts.reduce(
              (a, b) => (Math.abs(b.deviation) > Math.abs(a?.deviation ?? 0) ? b : a),
              null,
            );
            if (!worst || Math.abs(worst.deviation) < THRESHOLD) continue;
            const flag = {
              key,
              viewport: vp.name,
              row: row.desc,
              align: row.align,
              reference: `${ref.desc} ${JSON.stringify(ref.run.text)}`,
              parts: parts.filter((p) => Math.abs(p.deviation) >= THRESHOLD),
              deviation: worst.deviation,
            };
            if (IMAGES) {
              const handle = await page.$(`[data-audit-id="${row.id}"]`);
              await handle.scrollIntoViewIfNeeded().catch(() => {});
              const geo = await page.evaluate(
                ([id, items, refIndex, rect]) => {
                  const el = document.querySelector(`[data-audit-id="${id}"]`);
                  const r = el.getBoundingClientRect();
                  return {
                    dy: r.top - rect.top,
                    box: { left: r.left, top: r.top, width: r.width, height: r.height },
                  };
                },
                [row.id, row.items, row.ref, row.rect],
              );
              const lines = [
                {
                  left: geo.box.left - 6,
                  width: geo.box.width + 12,
                  y: flag.parts[0].against + geo.dy,
                  color: "rgb(37 99 235)",
                },
              ];
              for (const p of parts) {
                const item = row.items[p.index];
                const left = item.kind === "text" ? item.run.left : item.left;
                const right = item.kind === "text" ? item.run.right : item.right;
                lines.push({
                  left: left ?? geo.box.left,
                  width: Math.max(4, (right ?? left + 8) - (left ?? 0)),
                  y: p.centre + geo.dy,
                  color: Math.abs(p.deviation) >= THRESHOLD ? "rgb(220 38 38)" : "rgb(22 163 74)",
                });
              }
              await page.evaluate(drawOverlay, { lines, box: geo.box });
              const file = `rows/${String(imageCount++).padStart(4, "0")}-${key.replace(/\//g, "_")}-${vp.name}.png`;
              const pad = 8;
              await page.screenshot({
                path: path.join(OUT, file),
                clip: {
                  x: Math.max(0, geo.box.left - pad),
                  y: Math.max(0, geo.box.top - pad),
                  width: geo.box.width + pad * 2,
                  height: geo.box.height + pad * 2,
                },
              });
              await page.evaluate(() => document.querySelector("[data-audit-overlay]")?.remove());
              flag.image = file;
            }
            flags.push(flag);
          } catch (error) {
            process.stdout.write(
              `${vp.name} ${key}: row ${row.desc}: ${error.message.split("\n")[0]}\n`,
            );
          }
        for (const chip of inline) {
          if (Math.abs(chip.deviation) < THRESHOLD) continue;
          flags.push({
            key,
            viewport: vp.name,
            row: `${chip.desc} in a sentence`,
            align: "sentence baseline",
            reference: "the sentence's baseline",
            parts: [
              { desc: JSON.stringify(chip.text), how: "baseline", deviation: chip.deviation },
            ],
            deviation: chip.deviation,
          });
        }
        process.stdout.write(`${vp.name} ${key}: ${rows.length} rows\n`);
      } catch (error) {
        process.stdout.write(`${vp.name} ${key}: ERROR ${error.message.split("\n")[0]}\n`);
      }
    }
    await context.close();
  };
  // Each worker takes the next example for its own viewport.
  const queues = VIEWPORTS.map((vp) => jobs.filter((j) => j.vp === vp));
  await Promise.all(
    VIEWPORTS.flatMap((vp, i) =>
      Array.from({ length: Math.max(1, Math.floor(WORKERS / VIEWPORTS.length)) }, () =>
        worker(vp, queues[i]),
      ),
    ),
  );
  flags.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation));
  await browser.close();

  writeFileSync(
    path.join(OUT, "results.json"),
    JSON.stringify(
      { rowsChecked, inlineChecked, threshold: THRESHOLD, flags, halfPixel: halves },
      null,
      2,
    ),
  );
  writeFileSync(path.join(OUT, "report.md"), report(flags, rowsChecked, inlineChecked, halves));
  process.stdout.write(
    `\n${flags.length} flagged rows of ${rowsChecked} rows and ${inlineChecked} inline chips. ${path.join(OUT, "report.md")}\n`,
  );
}

function report(flags, rowsChecked, inlineChecked, halves) {
  const byComponent = new Map();
  for (const f of flags) {
    const component = f.key.split("/")[0];
    if (!byComponent.has(component)) byComponent.set(component, []);
    byComponent.get(component).push(f);
  }
  const groups = [...byComponent.entries()].sort(
    (a, b) =>
      Math.max(...b[1].map((f) => Math.abs(f.deviation))) -
      Math.max(...a[1].map((f) => Math.abs(f.deviation))),
  );
  const lines = [
    "# Optical alignment audit",
    "",
    `${rowsChecked} rows and ${inlineChecked} inline chips checked; ${flags.length} rows have a part ${THRESHOLD}px or more off the row's main text, after taking out what Chromium's line-box rounding moved. Deviation is in CSS pixels, positive when the part sits low.`,
    "",
    "| Component | Flagged rows | Worst |",
    "| --- | --- | --- |",
    ...groups.map(
      ([c, fs]) =>
        `| ${c} | ${fs.length} | ${Math.max(...fs.map((f) => Math.abs(f.deviation))).toFixed(2)}px |`,
    ),
    "",
  ];
  for (const [component, fs] of groups) {
    lines.push(`## ${component}`, "");
    for (const f of fs.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))) {
      lines.push(
        `### ${f.deviation > 0 ? "+" : ""}${f.deviation.toFixed(2)}px · ${f.key} · ${f.viewport}`,
        "",
      );
      lines.push(`- Row: \`${f.row}\` (${f.align})`, `- Reference: ${f.reference}`);
      const fmt = (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}px`;
      for (const p of f.parts)
        lines.push(
          `- \`${p.desc}\`: ${fmt(p.deviation)} (${p.how})${p.renderer === undefined ? "" : `; measured ${fmt(p.measured)}, of which Chromium's line-box rounding ${fmt(p.renderer)}`}`,
        );
      if (f.image) lines.push("", `![](${f.image})`);
      lines.push("");
    }
  }
  // Marks on a half pixel, one line per kind of row and mark.
  const kinds = new Map();
  for (const h of halves) {
    const k = `${h.row} | ${h.mark} | ${h.size}px in ${h.slot ? `a ${h.slot.height}px slot in ` : ""}a ${h.line}px line`;
    if (!kinds.has(k)) kinds.set(k, new Set());
    kinds.get(k).add(`${h.key} (${h.viewport})`);
  }
  lines.push(
    "## Marks on a half pixel",
    "",
    `${kinds.size} kinds of mark sit a half pixel off their line, centred in a box whose size differs from theirs by an odd number of pixels.`,
    "",
  );
  for (const [k, where] of [...kinds].sort())
    lines.push(
      `- \`${k}\`: ${[...where].slice(0, 4).join(", ")}${where.size > 4 ? ` and ${where.size - 4} more` : ""}`,
    );
  return lines.join("\n");
}

await main();
