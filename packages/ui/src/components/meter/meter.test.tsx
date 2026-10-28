/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import {
  Meter,
  MeterHeader,
  MeterIndicator,
  MeterLabel,
  MeterRing,
  MeterTrack,
  MeterValue,
} from "./meter";
import type { MeterProps } from "./meter";

afterEach(() => {
  cleanup();
});

function renderMeter(props: Omit<MeterProps, "children">) {
  render(
    <Meter {...props}>
      <MeterHeader>
        <MeterLabel>5-hour limit</MeterLabel>
        <MeterValue />
      </MeterHeader>
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>,
  );
  return screen.getByRole("meter");
}

const WARNING = "var(--warning";

describe("Meter", () => {
  it("is a meter named by its label, whose value is what is left", () => {
    const meter = renderMeter({ used: 62, valueText: "38% left · resets in 3h" });
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("38");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(screen.getByRole("meter", { name: "5-hour limit" })).toBe(meter);
  });

  it("speaks and shows the same valueText", () => {
    const meter = renderMeter({ used: 62, valueText: "38% left · resets in 3h" });
    expect(meter.getAttribute("aria-valuetext")).toBe("38% left · resets in 3h");
    const value = meter.querySelector('[data-slot="meter-value"]')!;
    expect(value.textContent).toBe("38% left · resets in 3h");
  });

  it("stays info when nothing is used: the bar is full, with no warning and no complete color", () => {
    const meter = renderMeter({ used: 0, valueText: "100% left" });
    expect(meter.getAttribute("data-level")).toBe("plenty");
    expect(meter.className).toContain("[--meter-indicator:var(--info)]");
    expect(meter.className).not.toContain(WARNING);
    expect(meter.className).not.toContain("success");
    const indicator = meter.querySelector<HTMLElement>('[data-slot="meter-indicator"]')!;
    expect(indicator.style.width).toBe("100%");
  });

  it("takes the warning color when what is left is at or below low", () => {
    const meter = renderMeter({ used: 80, low: 20, valueText: "20% left · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("low");
    expect(meter.className).toContain("[--meter-indicator:var(--warning)]");
  });

  it("stays info just above low", () => {
    const meter = renderMeter({ used: 79, low: 20, valueText: "21% left · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("plenty");
    expect(meter.className).not.toContain(WARNING);
  });

  it("is used up at max: an empty bar on a warning track with a warning edge", () => {
    const meter = renderMeter({ used: 100, valueText: "Used up · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("empty");
    expect(meter.getAttribute("aria-valuenow")).toBe("0");
    expect(meter.className).toContain("[--meter-track-edge:var(--warning)]");
    const indicator = meter.querySelector<HTMLElement>('[data-slot="meter-indicator"]')!;
    expect(indicator.style.width).toBe("0%");
  });

  it("clamps used and low to the range", () => {
    const over = renderMeter({ used: 140, max: 100, valueText: "Used up" });
    expect(over.getAttribute("aria-valuenow")).toBe("0");
    expect(over.getAttribute("data-level")).toBe("empty");
    cleanup();
    const lowAboveMax = renderMeter({ used: 0, max: 100, low: 500, valueText: "100% left" });
    expect(lowAboveMax.getAttribute("data-level")).toBe("low");
  });

  it("works in the units of max", () => {
    const meter = renderMeter({ used: 4, max: 5, valueText: "1 hour left" });
    expect(meter.getAttribute("aria-valuenow")).toBe("1");
    expect(meter.getAttribute("data-level")).toBe("low");
  });

  // Tailwind's --color-* aliases are computed once on :root, so a meter inside
  // a nested .dark scope (the docs' dark previews) would keep the light colors.
  // The raw tokens are redefined in every theme scope.
  it("takes its colors from the theme tokens, not the :root --color-* aliases", () => {
    for (const used of [0, 90, 100]) {
      const meter = renderMeter({ used, valueText: "x" });
      expect(meter.className).not.toContain("var(--color-");
      cleanup();
    }
  });
});

function renderRing(props: Omit<MeterProps, "children">, ring?: { size?: "sm" | "md" | "lg" }) {
  render(
    <Meter aria-label="Weekly limit" {...props}>
      <MeterRing size={ring?.size}>
        <svg data-testid="icon" />
      </MeterRing>
      <MeterValue />
    </Meter>,
  );
  return screen.getByRole("meter", { name: "Weekly limit" });
}

describe("MeterRing", () => {
  it("is the same meter as the bar: what is left, and the valueText spoken and shown", () => {
    const meter = renderRing({ used: 37, valueText: "Weekly · 63% left" });
    expect(meter.getAttribute("aria-valuenow")).toBe("63");
    expect(meter.getAttribute("aria-valuetext")).toBe("Weekly · 63% left");
    expect(meter.querySelector('[data-slot="meter-value"]')!.textContent).toBe("Weekly · 63% left");
    expect(meter.querySelector('[data-slot="meter-ring-shape"]')!.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("draws what is left as the share of the circle", () => {
    const arc = (used: number) => {
      const meter = renderRing({ used, valueText: "x" });
      const value = meter
        .querySelector('[data-slot="meter-ring-indicator"]')!
        .getAttribute("stroke-dasharray");
      cleanup();
      return value;
    };
    expect(arc(0)).toBe("100 100");
    expect(arc(37)).toBe("63 100");
    expect(arc(100)).toBe("0 100");
  });

  it("takes the bar's levels and colors", () => {
    const low = renderRing({ used: 85, valueText: "15% left" });
    expect(low.getAttribute("data-level")).toBe("low");
    expect(low.className).toContain("[--meter-indicator:var(--warning)]");
    cleanup();
    const empty = renderRing({ used: 100, valueText: "Used up" });
    expect(empty.getAttribute("data-level")).toBe("empty");
    expect(empty.className).toContain("[--meter-track-edge:var(--warning)]");
  });

  it("holds a child at its centre", () => {
    const meter = renderRing({ used: 37, valueText: "x" });
    const centre = meter.querySelector('[data-slot="meter-ring-centre"]')!;
    expect(centre.contains(screen.getByTestId("icon"))).toBe(true);
  });

  it("matches the icon sizes", () => {
    for (const [size, box] of [
      ["sm", "16"],
      ["md", "20"],
      ["lg", "24"],
    ] as const) {
      const meter = renderRing({ used: 0, valueText: "x" }, { size });
      const shape = meter.querySelector('[data-slot="meter-ring-shape"]')!;
      expect(shape.getAttribute("viewBox")).toBe(`0 0 ${box} ${box}`);
      cleanup();
    }
  });
});
