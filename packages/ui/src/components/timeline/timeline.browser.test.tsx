import "./timeline.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { ResolvedThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineItem, TimelineTime, TimelineTitle } from "./timeline";
import type { TimelineSize } from "./timeline";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const MODES: readonly ResolvedThemeMode[] = ["light", "dark"];
const SIZES: readonly TimelineSize[] = ["sm", "md", "lg"];

/** The marker's rendered colors as one comparable string. */
function markerColors(itemTestId: string) {
  const marker = screen
    .getByTestId(itemTestId)
    .querySelector<HTMLElement>(".r-timeline-item__marker");
  expect(marker).not.toBeNull();
  const style = getComputedStyle(marker as HTMLElement);
  return `${style.borderColor}|${style.backgroundColor}`;
}

for (const mode of MODES) {
  it(`accent and default markers read as distinct colors — ${mode}`, () => {
    render(
      <ThemeProvider mode={mode}>
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

it("every size keeps the marker centered on the title line", () => {
  // Each size sets the axis offset from its own absolute line height, so pin
  // the point: the marker's center and the title's first line center coincide.
  for (const size of SIZES) {
    render(
      <Timeline size={size}>
        <TimelineItem data-testid="item">
          <TimelineTitle>In progress</TimelineTitle>
          <TimelineTime>09:00</TimelineTime>
        </TimelineItem>
        <TimelineItem>
          <TimelineTitle>Done</TimelineTitle>
        </TimelineItem>
      </Timeline>,
    );
    const marker = screen
      .getByTestId("item")
      .querySelector<HTMLElement>(".r-timeline-item__marker") as HTMLElement;
    const title = screen.getByText("In progress");
    const markerRect = marker.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const markerCenter = markerRect.top + markerRect.height / 2;
    const titleCenter = titleRect.top + titleRect.height / 2;
    expect(Math.abs(markerCenter - titleCenter), size).toBeLessThanOrEqual(1);
    cleanup();
  }
});
