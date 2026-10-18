import "./steps.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { ResolvedThemeMode } from "../../lib/theme/theme-context";
import { Step, Steps } from "./steps";

const it = test.skipIf(typeof window === "undefined");
const noop = () => {};
afterEach(cleanup);

const MODES: readonly ResolvedThemeMode[] = ["light", "dark"];

async function withViewport(width: number, run: () => void) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 900);
  try {
    run();
  } finally {
    await page.viewport(1280, 900);
  }
}

function indicator(itemTestId: string) {
  return screen
    .getByTestId(itemTestId)
    .querySelector<HTMLElement>(".r-step__indicator") as HTMLElement;
}

function indicatorColors(itemTestId: string) {
  const style = getComputedStyle(indicator(itemTestId));
  return `${style.backgroundColor}|${style.borderColor}|${style.color}`;
}

function FourSteps({ mode = "light" }: { mode?: ResolvedThemeMode }) {
  return (
    <ThemeProvider mode={mode}>
      <Steps data-testid="steps" current={2}>
        <Step data-testid="step-1" description="Name and region" title="Create" />
        <Step data-testid="step-2" description="Pick the machine" title="Configure" />
        <Step data-testid="step-3" description="Invite your team" title="Share" />
        <Step data-testid="step-4" title="Launch" />
      </Steps>
    </ThemeProvider>
  );
}

for (const mode of MODES) {
  it(`finish, process and wait markers read as distinct colors — ${mode}`, () => {
    render(<FourSteps mode={mode} />);
    const finish = indicatorColors("step-1");
    const process = indicatorColors("step-2");
    const wait = indicatorColors("step-3");
    expect(new Set([finish, process, wait]).size).toBe(3);
  });
}

it("a row centers each title's first line on its marker", async () => {
  await withViewport(1280, () => {
    render(<FourSteps />);
    const marker = indicator("step-2").getBoundingClientRect();
    const title = screen.getByText("Configure").getBoundingClientRect();
    const lineHeight = Number.parseFloat(
      getComputedStyle(screen.getByText("Configure")).lineHeight,
    );
    const markerCenter = marker.top + marker.height / 2;
    const titleCenter = title.top + lineHeight / 2;
    expect(Math.abs(markerCenter - titleCenter)).toBeLessThanOrEqual(1);
  });
});

it("a row fits a 375px phone screen without overflowing", async () => {
  await withViewport(375, () => {
    render(
      <div style={{ width: 343 }}>
        <FourSteps />
      </div>,
    );
    const list = screen.getByTestId("steps");
    expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
    const listRect = list.getBoundingClientRect();
    for (const testId of ["step-1", "step-2", "step-3", "step-4"]) {
      const rect = screen.getByTestId(testId).getBoundingClientRect();
      expect(rect.right).toBeLessThanOrEqual(listRect.right + 0.5);
    }
    // The text moves under the marker on narrow screens.
    const marker = indicator("step-2").getBoundingClientRect();
    const title = screen.getByText("Configure").getBoundingClientRect();
    expect(title.top).toBeGreaterThanOrEqual(marker.bottom);
  });
});

it("a column runs the connector from one marker down toward the next", () => {
  render(
    <Steps current={1} vertical>
      <Step data-testid="step-1" description="Connect a machine" title="Add a machine" />
      <Step data-testid="step-2" title="Configure the agent" />
    </Steps>,
  );
  const connector = screen
    .getByTestId("step-1")
    .querySelector<HTMLElement>(".r-step__connector") as HTMLElement;
  const rect = connector.getBoundingClientRect();
  expect(rect.top).toBeGreaterThanOrEqual(indicator("step-1").getBoundingClientRect().bottom);
  expect(rect.bottom).toBeLessThanOrEqual(indicator("step-2").getBoundingClientRect().top);
  expect(rect.height).toBeGreaterThan(0);
});

it("a clickable step's button covers its marker", async () => {
  await withViewport(1280, () => {
    render(
      <Steps current={1} onUpdateCurrent={noop}>
        <Step data-testid="step-1" title="Account" />
        <Step data-testid="step-2" description="Name and avatar" title="Profile" />
      </Steps>,
    );
    const marker = indicator("step-2").getBoundingClientRect();
    const hit = document.elementFromPoint(
      marker.left + marker.width / 2,
      marker.top + marker.height / 2,
    );
    expect(hit).toBe(screen.getByRole("button", { name: "Profile" }));
  });
});
