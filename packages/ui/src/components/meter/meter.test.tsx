/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Meter, MeterHeader, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "./meter";
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

function indicatorWidth(meter: HTMLElement) {
  return meter.querySelector<HTMLElement>('[data-slot="meter-indicator"]')!.style.width;
}

const WARNING = "var(--warning";

describe("Meter", () => {
  it("is a meter named by its label, whose value is what is used", () => {
    const meter = renderMeter({ used: 62, valueText: "62% used · resets in 3h" });
    expect(meter.getAttribute("role")).toBe("meter");
    expect(meter.getAttribute("aria-valuenow")).toBe("62");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
    expect(screen.getByRole("meter", { name: "5-hour limit" })).toBe(meter);
  });

  it("fills with what is used", () => {
    expect(indicatorWidth(renderMeter({ used: 62, valueText: "62% used" }))).toBe("62%");
  });

  it("speaks and shows the same valueText", () => {
    const meter = renderMeter({ used: 62, valueText: "62% used · resets in 3h" });
    expect(meter.getAttribute("aria-valuetext")).toBe("62% used · resets in 3h");
    const value = meter.querySelector('[data-slot="meter-value"]')!;
    expect(value.textContent).toBe("62% used · resets in 3h");
  });

  it("is empty and info when nothing is used, with no warning and no complete color", () => {
    const meter = renderMeter({ used: 0, valueText: "0% used" });
    expect(meter.getAttribute("data-level")).toBe("normal");
    expect(meter.className).toContain("[--meter-indicator:var(--info)]");
    expect(meter.className).not.toContain(WARNING);
    expect(meter.className).not.toContain("success");
    expect(indicatorWidth(meter)).toBe("0%");
  });

  it("takes the warning color at 80% used by default", () => {
    const meter = renderMeter({ used: 80, valueText: "80% used · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("high");
    expect(meter.className).toContain("[--meter-indicator:var(--warning)]");
    expect(meter.className).toContain("[--meter-value:var(--warning-strong)]");
  });

  it("stays info just below warnAt", () => {
    const meter = renderMeter({ used: 79, valueText: "79% used · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("normal");
    expect(meter.className).not.toContain(WARNING);
  });

  it("takes warnAt as the share used", () => {
    expect(renderMeter({ used: 49, warnAt: 0.5, valueText: "x" }).getAttribute("data-level")).toBe(
      "normal",
    );
    cleanup();
    expect(renderMeter({ used: 50, warnAt: 0.5, valueText: "x" }).getAttribute("data-level")).toBe(
      "high",
    );
  });

  it("is used up at max: a full warning bar", () => {
    const meter = renderMeter({ used: 100, valueText: "Used up · resets in 3h" });
    expect(meter.getAttribute("data-level")).toBe("full");
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
    expect(meter.className).toContain("[--meter-indicator:var(--warning)]");
    expect(meter.className).not.toContain("danger");
    expect(indicatorWidth(meter)).toBe("100%");
  });

  it("clamps used and warnAt to the range", () => {
    const over = renderMeter({ used: 140, max: 100, valueText: "Used up" });
    expect(over.getAttribute("aria-valuenow")).toBe("100");
    expect(over.getAttribute("data-level")).toBe("full");
    cleanup();
    const under = renderMeter({ used: -5, max: 100, valueText: "0% used" });
    expect(under.getAttribute("aria-valuenow")).toBe("0");
    cleanup();
    const warnBelowZero = renderMeter({ used: 0, warnAt: -1, valueText: "0% used" });
    expect(warnBelowZero.getAttribute("data-level")).toBe("high");
  });

  it("works in the units of max", () => {
    const meter = renderMeter({ used: 4, max: 5, valueText: "4 of 5 hours used" });
    expect(meter.getAttribute("aria-valuenow")).toBe("4");
    expect(meter.getAttribute("data-level")).toBe("high");
    expect(indicatorWidth(meter)).toBe("80%");
  });

  // Tailwind's --color-* aliases are computed once on :root, so a meter inside
  // a nested .dark scope (the docs' dark previews) would keep the light colors.
  // The raw tokens are redefined in every theme scope.
  it("takes its colors from the theme tokens, not the :root --color-* aliases", () => {
    for (const used of [0, 90, 100]) {
      const meter = renderMeter({ used, valueText: "x" });
      expect(meter.className).not.toContain("var(--color-");
      const track = meter.querySelector('[data-slot="meter-track"]')!;
      expect(track.className).not.toContain("var(--color-");
      cleanup();
    }
  });
});
