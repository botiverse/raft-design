import "./meter.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Meter, MeterIndicator, MeterTrack } from "./meter";
import type { MeterProps } from "./meter";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function renderMeter(props: Omit<MeterProps, "children" | "valueText">) {
  render(
    <div style={{ width: "400px" }}>
      <Meter aria-label="5-hour limit" valueText="x" {...props}>
        <MeterTrack data-testid="track">
          <MeterIndicator data-testid="indicator" />
        </MeterTrack>
      </Meter>
      <div data-testid="info" style={{ background: "var(--info)" }} />
      <div data-testid="warning" style={{ background: "var(--warning)" }} />
      <div data-testid="fill-muted" style={{ background: "var(--fill-muted)" }} />
    </div>,
  );
  const track = screen.getByTestId("track");
  const indicator = screen.getByTestId("indicator");
  return {
    share: indicator.getBoundingClientRect().width / track.getBoundingClientRect().width,
    fill: getComputedStyle(indicator).backgroundColor,
    trackColor: getComputedStyle(track).backgroundColor,
  };
}

function token(name: string) {
  return getComputedStyle(screen.getByTestId(name)).backgroundColor;
}

it("fills the track with the share used, in the info color", () => {
  const { share, fill } = renderMeter({ used: 62 });
  expect(share).toBeCloseTo(0.62, 2);
  expect(fill).toBe(token("info"));
});

it("fills in the warning color from 80% used", () => {
  const { share, fill } = renderMeter({ used: 88 });
  expect(share).toBeCloseTo(0.88, 2);
  expect(fill).toBe(token("warning"));
});

it("is a full warning bar on the plain track when used up", () => {
  const { share, fill, trackColor } = renderMeter({ used: 100 });
  expect(share).toBeCloseTo(1, 2);
  expect(fill).toBe(token("warning"));
  expect(trackColor).toBe(token("fill-muted"));
});

it("is an empty track when nothing is used", () => {
  const { share } = renderMeter({ used: 0 });
  expect(share).toBe(0);
});
