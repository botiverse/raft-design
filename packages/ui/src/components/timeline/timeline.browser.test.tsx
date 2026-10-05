import "./timeline.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import { Timeline, TimelineItem, TimelineTitle } from "./timeline";

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
