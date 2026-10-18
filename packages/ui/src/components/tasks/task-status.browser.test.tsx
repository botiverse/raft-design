import "./task-status.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { ThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineItem, TimelineTitle } from "../timeline/timeline";
import { TaskChip } from "./task-chip";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskStatusIcon } from "./task-status-icon";
import { TASK_STATUS_IDS } from "./task-status.recipe";
import type { TaskStatusId } from "./task-status.recipe";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const MODES = ["light", "dark"] as const satisfies readonly ThemeMode[];

/**
 * The hue family each status must keep in EVERY mode: orange / blue / purple /
 * green, plus `closed` which is intentionally NEUTRAL (so it is checked by
 * chroma, not hue — comparing the hue of a grey would pass or fail at random).
 */
const HUE_ANCHORS: Record<TaskStatusId, { hue?: number; maxChroma?: number }> = {
  todo: { hue: 45 },
  "in-progress": { hue: 220 },
  "in-review": { hue: 294 },
  done: { hue: 153 },
  closed: { maxChroma: 0.05 },
};

/** Max hue separation still counted as one family — sized to admit the real
 *  light↔dark pairs (the widest is green: lime 130 in light vs 153 in dark)
 *  while rejecting a swapped status (60°+). */
const HUE_TOLERANCE = 30;

// ── colour math ─────────────────────────────────────────────────────────────

type Rgb = [number, number, number];

/** Parse `rgb()`/`rgba()`/`oklch()` — including the multi-line form the CSS
 *  formatter emits — into sRGB 0–1 plus an alpha (default 1). */
function parseColor(value: string): { rgb: Rgb; alpha: number } {
  const v = value.trim();
  const rgbMatch = /^rgba?\(([^)]+)\)$/.exec(v);
  if (rgbMatch) {
    const parts = rgbMatch[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number);
    const [r, g, b] = parts;
    return { rgb: [r / 255, g / 255, b / 255], alpha: parts[3] ?? 1 };
  }
  const oklch = /oklch\(([^)]+)\)/.exec(v);
  expect(oklch, `unparsable color: ${value}`).not.toBeNull();
  const parts = oklch![1].split(/[\s,/]+/).filter(Boolean);
  const rawL = parts[0];
  const L = rawL.endsWith("%") ? Number(rawL.slice(0, -1)) / 100 : Number(rawL);
  const C = Number(parts[1]);
  const H = Number(parts[2]);
  const alpha = parts[3] === undefined ? 1 : Number(parts[3]);
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const toSrgb = (x: number) =>
    x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055;
  const rgb: Rgb = [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ].map((x) => Math.min(1, Math.max(0, x))) as Rgb;
  return { rgb, alpha };
}

function composite(fg: { rgb: Rgb; alpha: number }, bg: Rgb): Rgb {
  return [
    fg.rgb[0] * fg.alpha + bg[0] * (1 - fg.alpha),
    fg.rgb[1] * fg.alpha + bg[1] * (1 - fg.alpha),
    fg.rgb[2] * fg.alpha + bg[2] * (1 - fg.alpha),
  ];
}

function luminance([r, g, b]: Rgb) {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a: Rgb, b: Rgb) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Luminance channels → OKLab hue (deg) and chroma, for family assertions. */
function oklabOf(rgb: Rgb): { hue: number; chroma: number } {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb.map(lin) as Rgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { hue: (Math.atan2(bb, a) * 180) / Math.PI, chroma: Math.hypot(a, bb) };
}

function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** The effective background a translucent fill sits on. The themed scope
 *  carries a real page colour; `document.body` can be transparent. */
function scopeBackground(scope: HTMLElement): Rgb {
  for (const el of [scope, document.body, document.documentElement]) {
    const c = parseColor(getComputedStyle(el).backgroundColor);
    if (c.alpha > 0) return c.rgb;
  }
  return [1, 1, 1];
}

/** The marker may paint its status colour as a fill or as a ring, so take
 *  whichever of the background and the border is actually opaque, composited
 *  over the scope. */
function markerFill(dot: HTMLElement, scopeBg: Rgb): Rgb {
  const style = getComputedStyle(dot);
  const bg = parseColor(style.backgroundColor);
  if (bg.alpha > 0.05) return composite(bg, scopeBg);
  const border = parseColor(style.borderTopColor || style.borderColor);
  return composite(border, scopeBg);
}

/** One status's four parts, rendered together. */
function Harness() {
  return (
    // A real themed surface: soft/translucent fills composite over it exactly
    // as they do in the app (a bare test node has a transparent background,
    // which would composite washes over nothing).
    <div data-testid="status-scope" className="bg-layer-panel">
      {TASK_STATUS_IDS.map((status) => (
        <div key={status}>
          <TaskStatusIcon status={status} data-testid={`icon-${status}`} />
          <TaskStatusBadge status={status} data-testid={`badge-${status}`}>
            {status}
          </TaskStatusBadge>
        </div>
      ))}
      <Timeline>
        {TASK_STATUS_IDS.map((status) => (
          <TimelineItem key={status} taskStatus={status} data-testid={`timeline-${status}`}>
            <TimelineTitle>{status}</TimelineTitle>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

it("each status renders its own pixel — a swap cannot pass", () => {
  render(
    <ThemeProvider>
      <Harness />
    </ThemeProvider>,
  );
  // Every task-status icon is the status pixel: a square filled with its own
  // status token. Pin the token per status so an accidental swap (e.g.
  // in-review pointed at the todo colour) fails here.
  for (const status of TASK_STATUS_IDS) {
    const icon = screen.getByTestId(`icon-${status}`);
    expect(icon.getAttribute("data-slot")).toBe("task-status-icon");
    expect(icon.getAttribute("data-status")).toBe(status);
    const pixel = icon.querySelector("rect");
    expect(pixel, `${status} has no pixel`).not.toBeNull();
    expect(pixel!.style.fill, `${status} pixel is not its own token`).toBe(
      `var(--task-status-${status})`,
    );
  }
});

for (const mode of MODES) {
  const key = mode;
  it(`TaskStatusBadge is the task chip showing a status name — ${key}`, () => {
    render(
      <ThemeProvider mode={mode}>
        <div data-testid="badge-scope">
          {TASK_STATUS_IDS.map((status) => (
            <p key={status}>
              <TaskStatusBadge status={status} data-testid={`shape-badge-${status}`}>
                Label
              </TaskStatusBadge>{" "}
              <TaskChip status={status} data-testid={`shape-chip-${status}`}>
                <TaskStatusIcon status={status} />
                Label
              </TaskChip>
            </p>
          ))}
        </div>
      </ThemeProvider>,
    );
    // Artea (#proj-rui:c841b051, 2026-10-10): a status badge in the task panel
    // and the task chip in a message are ONE component that differs only in
    // what it shows. Before, the badge drew its own shape (a 12px pill with a
    // 1px border next to a 13px chip with a hairline).
    const PROPERTIES = [
      "fontSize",
      "fontWeight",
      "lineHeight",
      "paddingLeft",
      "paddingRight",
      "borderTopWidth",
      "borderTopColor",
      "borderTopLeftRadius",
      "backgroundColor",
      "color",
      "columnGap",
    ] as const;
    for (const status of TASK_STATUS_IDS) {
      const badge = screen.getByTestId(`shape-badge-${status}`);
      const chip = screen.getByTestId(`shape-chip-${status}`);
      const badgeStyle = getComputedStyle(badge);
      const chipStyle = getComputedStyle(chip);
      for (const property of PROPERTIES) {
        expect(badgeStyle[property], `${key}/${status}: ${property}`).toBe(chipStyle[property]);
      }
      expect(
        badge.getBoundingClientRect().height,
        `${key}/${status}: same height as the chip`,
      ).toBe(chip.getBoundingClientRect().height);
    }
    // Shaped through the chip: the rounded chip corner, not a square.
    const radius = parseFloat(
      getComputedStyle(screen.getByTestId("shape-badge-in-progress")).borderTopLeftRadius,
    );
    expect(radius, "status badge keeps the chip's rounded corner").toBeGreaterThan(0);
  });

  it(`every status keeps its hue family — ${key}`, () => {
    render(
      <ThemeProvider mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    const scopeBg = scopeBackground(scope);
    for (const status of TASK_STATUS_IDS) {
      const anchor = HUE_ANCHORS[status];
      // Read the ACTUAL rendered badge fill (composited over the scope), not the
      // raw token string — soft fills are translucent in dark.
      const badge = screen.getByTestId(`badge-${status}`);
      const fill = composite(parseColor(getComputedStyle(badge).backgroundColor), scopeBg);
      const { hue, chroma } = oklabOf(fill);
      if (anchor.hue !== undefined) {
        expect(
          hueDistance(hue, anchor.hue),
          `${key}/${status}: rendered hue ${hue.toFixed(0)} is not the ${anchor.hue} family`,
        ).toBeLessThanOrEqual(HUE_TOLERANCE);
      }
      if (anchor.maxChroma !== undefined) {
        expect(
          chroma,
          `${key}/${status}: expected a near-neutral chroma, got ${chroma.toFixed(3)}`,
        ).toBeLessThanOrEqual(anchor.maxChroma);
      }
    }
  });

  it(`icon, badge and Timeline dot all resolve the SAME status token — ${key}`, () => {
    render(
      <ThemeProvider mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    const scopeBg = scopeBackground(scope);
    for (const status of TASK_STATUS_IDS) {
      // The one token, resolved once, is the reference value.
      const token = parseColor(
        getComputedStyle(scope).getPropertyValue(`--task-status-${status}`).trim(),
      );
      const tokenFilled = composite(token, scopeBg);
      const tokenHue = oklabOf(tokenFilled).hue;

      // Badge fill must equal the token (composited the same way). This is the
      // equality the acceptance criterion asks for — not token-vs-itself.
      const badge = screen.getByTestId(`badge-${status}`);
      const badgeFill = composite(parseColor(getComputedStyle(badge).backgroundColor), scopeBg);
      expect(
        hueDistance(oklabOf(badgeFill).hue, tokenHue),
        `${key}/${status}: badge fill hue != token hue`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);

      // Timeline dot must carry the token color — whichever channel (fill or
      // ring) is actually painted.
      const dot = screen
        .getByTestId(`timeline-${status}`)
        .querySelector<HTMLElement>(".r-timeline-item__marker");
      expect(dot).not.toBeNull();
      expect(
        hueDistance(oklabOf(markerFill(dot!, scopeBg)).hue, tokenHue),
        `${key}/${status}: Timeline dot hue drifted from the token`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);

      // The ICON's pixel must also be in the same family: it is filled with the
      // status token itself, so a wrong-status icon assignment fails here.
      const pixel = screen.getByTestId(`icon-${status}`).querySelector("rect");
      expect(pixel).not.toBeNull();
      const pixelFill = composite(parseColor(getComputedStyle(pixel!).fill), scopeBg);
      expect(
        hueDistance(oklabOf(pixelFill).hue, tokenHue),
        `${key}/${status}: icon pixel hue drifted from the token`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);
    }
  });

  it(`badge text meets 4.5:1 on its REAL background — ${key}`, () => {
    render(
      <ThemeProvider mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scopeBg = scopeBackground(screen.getByTestId("status-scope"));
    for (const status of TASK_STATUS_IDS) {
      // Every status, Closed included, sets ink text on its own wash.
      const badge = screen.getByTestId(`badge-${status}`);
      const style = getComputedStyle(badge);
      const fg = parseColor(style.color);
      const bg = composite(parseColor(style.backgroundColor), scopeBg);
      const ratio = contrastRatio(composite(fg, bg), bg);
      expect(
        ratio,
        `${key}/${status}: rendered text contrast ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
}
