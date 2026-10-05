import "./timeline.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineContent, TimelineItem, TimelineTime, TimelineTitle } from "./timeline";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

/** The marker's rendered colors as one comparable string. */
function markerColors(itemTestId: string) {
  const marker = screen
    .getByTestId(itemTestId)
    .querySelector<HTMLElement>(".r-timeline-item__marker");
  expect(marker).not.toBeNull();
  const style = getComputedStyle(marker as HTMLElement);
  return `${style.borderColor}|${style.backgroundColor}`;
}

/** oklch → sRGB → WCAG relative luminance, for the contrast guard below. */
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

function parseOklch(value: string): [number, number, number] {
  const match = /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value);
  expect(match, `unparsable oklch: ${value}`).not.toBeNull();
  return [Number(match![1]), Number(match![2]), Number(match![3])];
}

// Josh's #353 review follow-up: the elegant-light accent pair is what the
// timeline accent marker reads (strong on soft); keep the ratio at WCAG AA.
it("elegant light: the accent pair stays at 4.5:1 or better", () => {
  render(
    <ThemeProvider theme="elegant" mode="light">
      <Timeline>
        <TimelineItem data-testid="item-accent" variant="accent">
          <TimelineTitle>In review</TimelineTitle>
        </TimelineItem>
      </Timeline>
    </ThemeProvider>,
  );
  const item = screen.getByTestId("item-accent");
  const style = getComputedStyle(item);
  const strong = parseOklch(style.getPropertyValue("--accent-strong").trim());
  const soft = parseOklch(style.getPropertyValue("--accent-soft").trim());
  const ratio = contrastRatio(oklchToSrgb(...strong), oklchToSrgb(...soft));
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});

for (const { key, theme, mode } of THEMES) {
  it(`accent and default markers read as distinct colors — ${key}`, () => {
    render(
      <ThemeProvider theme={theme} mode={mode}>
        <Timeline>
          <TimelineItem data-testid="item-default" variant="default">
            <TimelineTitle>Todo</TimelineTitle>
          </TimelineItem>
          <TimelineItem data-testid="item-accent" variant="accent">
            <TimelineTitle>In review</TimelineTitle>
          </TimelineItem>
        </Timeline>
      </ThemeProvider>,
    );
    expect(markerColors("item-accent")).not.toBe(markerColors("item-default"));
  });
}

it("the panel size reaches the compact record pitch (3 lines = 68px)", () => {
  render(
    <ThemeProvider theme="brutal">
      <Timeline size="sm">
        <TimelineItem data-testid="first">
          <TimelineTitle>In progress</TimelineTitle>
          <TimelineContent>Working on the migration</TimelineContent>
          <TimelineTime>09:00</TimelineTime>
        </TimelineItem>
        <TimelineItem>
          <TimelineTitle>Done</TimelineTitle>
        </TimelineItem>
      </Timeline>
    </ThemeProvider>,
  );
  const title = screen.getByText("In progress");
  const time = screen.getByText("09:00");
  // The compact line metrics behind the pitch.
  expect(getComputedStyle(title).lineHeight).toBe("16px");
  expect(getComputedStyle(title).marginBottom).toBe("2px");
  expect(getComputedStyle(time).marginTop).toBe("2px");
  const body = title.parentElement as HTMLElement;
  // title + content + time (16×3) + two 2px inner gaps + the 16px item gap.
  expect(Math.round(body.getBoundingClientRect().height)).toBe(68);
});

it("the panel size keeps the marker centered on the title line", () => {
  // The sm block replaces the axis-offset formula, so pin its point: the
  // marker's center and the title's first line center must coincide.
  for (const theme of ["brutal", "elegant"] as const) {
    render(
      <ThemeProvider theme={theme}>
        <Timeline size="sm">
          <TimelineItem data-testid="item">
            <TimelineTitle>In progress</TimelineTitle>
            <TimelineTime>09:00</TimelineTime>
          </TimelineItem>
          <TimelineItem>
            <TimelineTitle>Done</TimelineTitle>
          </TimelineItem>
        </Timeline>
      </ThemeProvider>,
    );
    const marker = screen
      .getByTestId("item")
      .querySelector<HTMLElement>(".r-timeline-item__marker") as HTMLElement;
    const title = screen.getByText("In progress");
    const markerRect = marker.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const markerCenter = markerRect.top + markerRect.height / 2;
    const titleCenter = titleRect.top + titleRect.height / 2;
    expect(Math.abs(markerCenter - titleCenter)).toBeLessThanOrEqual(1);
    cleanup();
  }
});

it("the panel size renders at the compact spec (16px rows, 12px title and marker)", () => {
  render(
    <ThemeProvider theme="brutal">
      <Timeline data-testid="timeline" size="sm">
        <TimelineItem data-testid="item">
          <TimelineTitle>Deploy</TimelineTitle>
        </TimelineItem>
        <TimelineItem>
          <TimelineTitle>Verify</TimelineTitle>
        </TimelineItem>
      </Timeline>
      ,
    </ThemeProvider>,
  );
  const marker = screen
    .getByTestId("item")
    .querySelector<HTMLElement>(".r-timeline-item__marker") as HTMLElement;
  expect(Math.round(marker.getBoundingClientRect().width)).toBe(12);
  expect(Math.round(marker.getBoundingClientRect().height)).toBe(12);
  const title = screen.getByText("Deploy");
  expect(getComputedStyle(title).fontSize).toBe("12px");
  const body = title.parentElement as HTMLElement;
  expect(getComputedStyle(body).paddingBottom).toBe("16px");
});
