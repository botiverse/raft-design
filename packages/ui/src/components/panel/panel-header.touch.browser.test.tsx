import "./panel-header.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelTitle,
} from "./panel-header";

// From 768px a head is one line by touch too: the count follows the name on
// its line. It used to stack on a touch tablet while a mouse got one line, so
// Tasks and Artifacts looked different on an iPad than on a laptop, and slock
// had started to override the layout page by page (xxchan, Kirby,
// #proj-workspace:dc3c9fc9). A phone keeps the count under the name.
// Measured in a real browser with touch emulated; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function context() {
  return await import("vite-plus/test/browser/context");
}

async function touchAt(width: number) {
  const { cdp, page } = await context();
  await page.viewport(width, 900);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
}

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

function head() {
  render(
    <ThemeProvider>
      <PanelHeader>
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle data-testid="title">Tasks</PanelTitle>
          </PanelHeading>
          <PanelMeta data-testid="meta">12 open</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>
    </ThemeProvider>,
  );
  return {
    title: screen.getByTestId("title").getBoundingClientRect(),
    meta: screen.getByTestId("meta").getBoundingClientRect(),
  };
}

it("by touch on a tablet (820px), the count follows the name on its line", async () => {
  await touchAt(820);
  const { title, meta } = head();
  expect(meta.left).toBeGreaterThanOrEqual(title.right);
  expect(meta.top).toBeLessThan(title.bottom);
});

it("CONTROL: by touch on a phone (390px), the count goes under the name", async () => {
  await touchAt(390);
  const { title, meta } = head();
  expect(meta.top).toBeGreaterThanOrEqual(title.bottom - 1);
});
