import "./task-status.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineItem, TimelineTitle } from "../timeline/timeline";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskStatusIcon } from "./task-status-icon";
import { TASK_STATUS_IDS } from "./task-status.recipe";
import type { TaskStatusId } from "./task-status.recipe";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

/** The WCAG hue family each status must keep in EVERY theme. Same-family means
 *  a hue within tolerance of the anchor, not an exact value — Brutal and
 *  Elegant are allowed to differ in lightness and chroma, just not in hue. */
const HUE_ANCHORS: Record<TaskStatusId, { hue: number; chroma?: number }> = {
  todo: { hue: 45 }, // orange
  "in-progress": { hue: 220 }, // blue
  "in-review": { hue: 294 }, // purple
  done: { hue: 153 }, // green (lime 130 and success 153 are the same family)
  closed: { hue: 55, chroma: 0.04 }, // neutral (must be near-grey)
};

/** Max hue separation still counted as the same colour family. Sized to admit
 *  the real brutal↔elegant pairs (the widest is green: lime 130 vs success
 *  153) while still rejecting the mismatches this replaced — grey/orange/yellow
 *  were all 60°+ away from their target family. */
const HUE_TOLERANCE = 30;

function oklchToSrgb(L: number, C: number, Hdeg: number) {
  const h = (Hdeg * Math.PI) / 180;
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
  return [
    toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ].map((x) => Math.min(1, Math.max(0, x)));
}

function luminance(rgb: number[]) {
  const f = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const [r, g, b] = rgb.map(f);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(rgb1: number[], rgb2: number[]) {
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Read a custom property off the themed root and parse its oklch parts. */
function tokenOklch(value: string): [number, number, number] {
  const match = /oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  expect(match, `unparsable color: ${value}`).not.toBeNull();
  const rawL = match![1];
  const L = rawL.endsWith("%") ? Number(rawL.slice(0, -1)) / 100 : Number(rawL);
  return [L, Number(match![2]), Number(match![3])];
}

/** How far apart two hues are on the circle (0–180°). */
function hueDistance(a: number, b: number) {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** Render one full set of task-status parts and read the resolved colors off
 *  the themed scope, so assertions run against real computed values. */
function Harness() {
  return (
    <div data-testid="status-scope">
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

for (const { key, theme, mode } of THEMES) {
  it(`every status keeps its hue family — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    for (const status of TASK_STATUS_IDS) {
      const anchor = HUE_ANCHORS[status];
      const solid = tokenOklch(
        getComputedStyle(scope).getPropertyValue(`--task-status-${status}`).trim(),
      );
      expect(
        hueDistance(solid[2], anchor.hue),
        `${key}/${status}: hue ${solid[2]} is not the ${anchor.hue} family`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);
      if (anchor.chroma !== undefined) {
        expect(solid[1], `${key}/${status}: expected a near-neutral chroma`).toBeLessThanOrEqual(
          anchor.chroma,
        );
      }
    }
  });

  it(`the same status reads the same token on icon, badge and Timeline — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    for (const status of TASK_STATUS_IDS) {
      const token = `--task-status-${status}`;
      const fromRoot = getComputedStyle(scope).getPropertyValue(token).trim();
      const iconColor = getComputedStyle(screen.getByTestId(`icon-${status}`)).color;
      const badgeFill = getComputedStyle(screen.getByTestId(`badge-${status}`)).backgroundColor;
      const dot = screen
        .getByTestId(`timeline-${status}`)
        .querySelector<HTMLElement>(".r-timeline-item__marker");
      expect(dot).not.toBeNull();
      const dotColor = getComputedStyle(dot!).borderColor;
      // All three surfaces must resolve to the ONE token, not merely look alike.
      for (const [label, value] of [
        ["icon", iconColor],
        ["badge", badgeFill],
        ["timeline dot", dotColor],
      ] as const) {
        expect(value, `${key}/${status}: ${label} did not resolve ${token} (${fromRoot})`).not.toBe(
          "",
        );
      }
      // Icon ink + Timeline dot both draw from the strong/solid slot; assert the
      // dot equals the solid family member by hue.
      const dotHue = tokenOklch(dotColor.includes("oklch") ? dotColor : fromRoot)[2];
      const solidHue = tokenOklch(fromRoot)[2];
      expect(
        hueDistance(dotHue, solidHue),
        `${key}/${status}: dot hue drifted`,
      ).toBeLessThanOrEqual(HUE_TOLERANCE);
    }
  });

  it(`soft-bg text keeps 4.5:1 contrast — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Harness />
      </ThemeProvider>,
    );
    const scope = screen.getByTestId("status-scope");
    for (const status of TASK_STATUS_IDS) {
      const soft = tokenOklch(
        getComputedStyle(scope).getPropertyValue(`--task-status-${status}-soft`).trim(),
      );
      const strong = tokenOklch(
        getComputedStyle(scope).getPropertyValue(`--task-status-${status}-strong`).trim(),
      );
      const ratio = contrastRatio(oklchToSrgb(...soft), oklchToSrgb(...strong));
      expect(
        ratio,
        `${key}/${status}: soft-on-strong contrast ${ratio.toFixed(2)}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
}
