import "./list-row.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ListRow, ListRowBody, ListRowChevron, ListRowGroup, ListRowTitle } from "./list-row";

// An attached settings row has no top padding, so a one-line row that is
// itself a target (a chevron, a menu) would be 36px on a touch screen. It
// keeps the control height as its least: 44px on a phone and a touch screen,
// 34px with a mouse on a desktop, where it is that already. Still no
// hairline above it. A display-only attached row isn't a target and keeps
// its height. Measured in a real browser with touch emulated through CDP;
// jsdom has no media queries or layout. Touch emulation runs this file in a
// browser of its own (vite.config.ts).

const it = test.skipIf(typeof window === "undefined");

async function setCoarsePointer(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

async function viewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

beforeAll(async () => {
  if (typeof window === "undefined") return;
  await viewport(1280, 800);
});

afterEach(async () => {
  cleanup();
  if (typeof window !== "undefined") await setCoarsePointer(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  await viewport(414, 896);
});

/** Whether the row draws its hairline (see list-row.browser.test.tsx). */
function drawsRule(element: Element): boolean {
  const rule = getComputedStyle(element, "::before");
  return (
    rule.display !== "none" &&
    rule.content !== "none" &&
    rule.content !== "normal" &&
    Number.parseFloat(rule.borderTopWidth) > 0
  );
}

/** Tailwind rules are injected on demand: poll until the value settles. */
async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((resolve) => setTimeout(resolve, 50));
    next = read();
  }
  return next;
}

function renderRows() {
  render(
    <ThemeProvider>
      <div style={{ width: 360 }}>
        <ListRowGroup>
          <ListRow variant="plain" interactive={false} data-testid="owner">
            <ListRowBody>
              <ListRowTitle id="levels-title">Notification level</ListRowTitle>
            </ListRowBody>
          </ListRow>
          <ListRow variant="plain" attached aria-describedby="levels-title" data-testid="target">
            <ListRowBody>
              <ListRowTitle>#launch-week</ListRowTitle>
            </ListRowBody>
            <ListRowChevron />
          </ListRow>
          <ListRow
            variant="plain"
            interactive={false}
            attached
            role="group"
            aria-labelledby="levels-title"
            data-testid="display"
          >
            <ListRowBody>
              <ListRowTitle>All new messages</ListRowTitle>
            </ListRowBody>
          </ListRow>
        </ListRowGroup>
      </div>
    </ThemeProvider>,
  );
  const row = (id: string) => screen.getByTestId(id);
  const height = (id: string) => row(id).getBoundingClientRect().height;
  return { row, height };
}

function expectAttached(row: (id: string) => HTMLElement) {
  for (const id of ["target", "display"]) {
    expect(drawsRule(row(id)), `${id}: no hairline above an attached row`).toBe(false);
    expect(getComputedStyle(row(id)).paddingTop, `${id}: no top padding`).toBe("0px");
  }
}

it("with a mouse on a desktop an interactive attached row is the control height, 34px", async () => {
  const { row, height } = renderRows();
  await settled(() => getComputedStyle(row("target")).paddingBottom);
  expectAttached(row);
  expect(height("target")).toBe(34);
  expect(height("display")).toBe(34);
});

it("on a touch screen an interactive attached row is a 44px target; a display-only one keeps its height", async () => {
  await setCoarsePointer(true);
  const { row, height } = renderRows();
  await settled(() => getComputedStyle(row("target")).paddingBottom);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  expectAttached(row);
  expect(height("target")).toBeGreaterThanOrEqual(44);
  // 24px of title and the 12px inset under it: not a target, so not 44.
  expect(height("display")).toBe(36);
});

it("on a phone an interactive attached row is a 44px target", async () => {
  await viewport(390, 844);
  const { row, height } = renderRows();
  await settled(() => getComputedStyle(row("target")).paddingBottom);
  expectAttached(row);
  expect(height("target")).toBeGreaterThanOrEqual(44);
  expect(height("display")).toBe(36);
  await viewport(1280, 800);
});
