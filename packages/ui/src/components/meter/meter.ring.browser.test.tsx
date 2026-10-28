import "./meter.test.css";
/**
 * The ring's geometry in real layout: the box is an icon size, the band is an
 * eighth of it, the arc covers the share that is left starting at the top, a
 * child sits at the centre clear of the band, and the ring sits beside its
 * value in a row rather than stacked above it. jsdom has no layout, so only a
 * browser can see any of this.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/meter`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Meter, MeterRing, MeterValue } from "./meter";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function renderRing(size: "sm" | "md" | "lg", used: number) {
  render(
    <div style={{ width: 400 }}>
      <Meter aria-label="Weekly limit" used={used} valueText="Weekly · 63% left">
        <MeterRing size={size}>
          <svg data-testid="icon" viewBox="0 0 10 10" />
        </MeterRing>
        <MeterValue />
      </Meter>
    </div>,
  );
  const meter = screen.getByRole("meter");
  const ring = meter.querySelector<HTMLElement>('[data-slot="meter-ring"]')!;
  const indicator = meter.querySelector<SVGCircleElement>('[data-slot="meter-ring-indicator"]')!;
  const track = meter.querySelector<SVGCircleElement>('[data-slot="meter-ring-track"]')!;
  const value = meter.querySelector<HTMLElement>('[data-slot="meter-value"]')!;
  return { meter, ring, indicator, track, value, icon: screen.getByTestId("icon") };
}

const SIZES = [
  ["sm", 16, 2, 9],
  ["md", 20, 2.5, 11],
  ["lg", 24, 3, 14],
] as const;

for (const [size, box, band, icon] of SIZES) {
  it(`${size}: a ${box}px ring with a ${band}px band and a ${icon}px centre clear of it`, () => {
    const parts = renderRing(size, 37);
    const ringBox = parts.ring.getBoundingClientRect();
    expect(ringBox.width).toBe(box);
    expect(ringBox.height).toBe(box);

    const trackBox = parts.track.getBoundingClientRect();
    expect(trackBox.width).toBeCloseTo(box - band, 1);
    expect(Number(getComputedStyle(parts.track).strokeWidth.replace("px", ""))).toBe(band);

    const iconBox = parts.icon.getBoundingClientRect();
    expect(iconBox.width).toBe(icon);
    expect(iconBox.left - ringBox.left).toBeCloseTo((box - icon) / 2, 1);
    expect(iconBox.top - ringBox.top).toBeCloseTo((box - icon) / 2, 1);
    // The icon's corners stay inside the band's inner edge.
    const innerRadius = box / 2 - band;
    expect(Math.hypot(icon / 2, icon / 2)).toBeLessThanOrEqual(innerRadius + 1.5);
  });
}

it("the arc covers what is left, starting at the top", () => {
  const { indicator } = renderRing("md", 37);
  const length = indicator.getTotalLength();
  const dash = getComputedStyle(indicator).strokeDasharray.split(/[ ,]+/).map(parseFloat);
  // pathLength=100: the dash is the share left of the circle.
  expect(dash[0]).toBe(63);
  expect(length).toBeGreaterThan(0);
  // The svg is turned a quarter back, so the path's start (3 o'clock) is drawn at 12.
  const svg = indicator.ownerSVGElement!;
  const start = indicator.getPointAtLength(0);
  const point = svg.createSVGPoint();
  point.x = start.x;
  point.y = start.y;
  const screenPoint = point.matrixTransform(indicator.getScreenCTM()!);
  const box = svg.getBoundingClientRect();
  expect(screenPoint.x).toBeCloseTo(box.left + box.width / 2, 0);
  expect(screenPoint.y).toBeLessThan(box.top + box.height / 2 - 5);
});

it("sits beside its value in one row, centred on it", () => {
  const { meter, ring, value } = renderRing("md", 37);
  const ringBox = ring.getBoundingClientRect();
  const valueBox = value.getBoundingClientRect();
  expect(valueBox.left).toBeGreaterThanOrEqual(ringBox.right);
  const ringMiddle = ringBox.top + ringBox.height / 2;
  const valueMiddle = valueBox.top + valueBox.height / 2;
  expect(Math.abs(ringMiddle - valueMiddle)).toBeLessThanOrEqual(1);
  // The meter takes its content's width, not the row's.
  expect(meter.getBoundingClientRect().width).toBeLessThan(200);
});
