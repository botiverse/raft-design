import "./steps.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import { Step, Steps } from "./steps";

const it = test.skipIf(typeof window === "undefined");
const noop = () => {};
afterEach(cleanup);

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

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

function FourSteps({ theme, mode }: { theme: Theme; mode?: ThemeMode }) {
  return (
    <ThemeProvider theme={theme} mode={mode}>
      <Steps data-testid="steps" current={2}>
        <Step data-testid="step-1" description="Name and region" title="Create" />
        <Step data-testid="step-2" description="Pick the machine" title="Configure" />
        <Step data-testid="step-3" description="Invite your team" title="Share" />
        <Step data-testid="step-4" title="Launch" />
      </Steps>
    </ThemeProvider>
  );
}

for (const { key, theme, mode } of THEMES) {
  it(`finish, process and wait markers read as distinct colors — ${key}`, () => {
    render(<FourSteps theme={theme} mode={mode} />);
    const finish = indicatorColors("step-1");
    const process = indicatorColors("step-2");
    const wait = indicatorColors("step-3");
    expect(new Set([finish, process, wait]).size).toBe(3);
  });
}

it("a row centers each title's first line on its marker", async () => {
  await withViewport(1280, () => {
    for (const theme of ["brutal", "elegant"] as const) {
      render(<FourSteps theme={theme} />);
      const marker = indicator("step-2").getBoundingClientRect();
      const title = screen.getByText("Configure").getBoundingClientRect();
      const lineHeight = Number.parseFloat(
        getComputedStyle(screen.getByText("Configure")).lineHeight,
      );
      const markerCenter = marker.top + marker.height / 2;
      const titleCenter = title.top + lineHeight / 2;
      expect(Math.abs(markerCenter - titleCenter)).toBeLessThanOrEqual(1);
      cleanup();
    }
  });
});

it("a row's connector follows the title and runs on to the next marker, however wide the description", async () => {
  await withViewport(1280, () => {
    for (const width of [640, 1100]) {
      for (const theme of ["brutal", "elegant"] as const) {
        render(
          <div style={{ width }}>
            <FourSteps theme={theme} />
          </div>,
        );
        for (const [from, to, title] of [
          ["step-1", "step-2", "Create"],
          ["step-2", "step-3", "Configure"],
          ["step-3", "step-4", "Share"],
        ] as const) {
          const marker = indicator(from).getBoundingClientRect();
          const next = indicator(to).getBoundingClientRect();
          const titleRect = screen.getByText(title).getBoundingClientRect();
          const connector = screen
            .getByTestId(from)
            .querySelector(".r-step__connector")!
            .getBoundingClientRect();
          expect(connector.left - titleRect.right).toBeLessThanOrEqual(12.5);
          expect(next.left - connector.right).toBeLessThanOrEqual(12.5);
          // Longer than the description's overhang would leave it beside the whole text.
          expect(connector.width).toBeGreaterThan(48);
          expect(
            Math.abs(connector.top + connector.height / 2 - (marker.top + marker.height / 2)),
          ).toBeLessThanOrEqual(1);
        }
        cleanup();
      }
    }
  });
});

it("a row fits a 375px phone screen without overflowing", async () => {
  await withViewport(375, () => {
    for (const theme of ["brutal", "elegant"] as const) {
      render(
        <div style={{ width: 343 }}>
          <FourSteps theme={theme} />
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
      cleanup();
    }
  });
});

it("a column runs the connector from one marker down toward the next", () => {
  render(
    <ThemeProvider theme="brutal">
      <Steps current={1} vertical>
        <Step data-testid="step-1" description="Connect a machine" title="Add a machine" />
        <Step data-testid="step-2" title="Configure the agent" />
      </Steps>
    </ThemeProvider>,
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
      <ThemeProvider theme="brutal">
        <Steps current={1} onUpdateCurrent={noop}>
          <Step data-testid="step-1" title="Account" />
          <Step data-testid="step-2" description="Name and avatar" title="Profile" />
        </Steps>
      </ThemeProvider>,
    );
    const marker = indicator("step-2").getBoundingClientRect();
    const hit = document.elementFromPoint(
      marker.left + marker.width / 2,
      marker.top + marker.height / 2,
    );
    expect(hit).toBe(screen.getByRole("button", { name: "Profile" }));
  });
});
