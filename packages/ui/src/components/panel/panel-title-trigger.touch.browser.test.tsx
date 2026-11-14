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
import { PanelTitleTrigger } from "./panel-title-trigger";

// A PanelTitleTrigger by touch. On a phone the head is two lines, so the
// trigger is drawn as tall as the title's line, or it would push the
// PanelMeta onto the head's bottom edge, and its ::after reaches the 44px tap
// target. On a touch screen from 768px the head is one line and the trigger
// is the 44px bar button. In both, the title starts where a plain PanelTitle
// does. Measured in a real browser with touch emulated; jsdom has no layout.

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

function renderHead(kind: "plain" | "trigger") {
  render(
    <ThemeProvider>
      {/* Room above the head: on a phone the hit area reaches 2px past its top. */}
      <div style={{ height: "20px" }} />
      <PanelHeader data-testid="head">
        <PanelHeaderContent>
          <PanelHeading>
            {kind === "plain" ? (
              <PanelTitle data-testid="title">Q3 launch plan</PanelTitle>
            ) : (
              <PanelTitleTrigger data-testid="trigger">Q3 launch plan</PanelTitleTrigger>
            )}
          </PanelHeading>
          <PanelMeta data-testid="meta">Artifact · #launch-week</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>
    </ThemeProvider>,
  );
  const button = kind === "plain" ? null : screen.getByTestId("trigger");
  const text =
    button?.querySelector<HTMLElement>("[data-slot=panel-title-trigger-label]") ??
    screen.getByTestId("title");
  return {
    head: screen.getByTestId("head").getBoundingClientRect(),
    text: text.getBoundingClientRect(),
    meta: screen.getByTestId("meta").getBoundingClientRect(),
    button,
  };
}

function both() {
  const plain = renderHead("plain");
  cleanup();
  return { plain, trigger: renderHead("trigger") };
}

it("on a phone (390px) the title and the PanelMeta under it stay where a plain title puts them, in a 56px head", async () => {
  await touchAt(390);
  const { plain, trigger } = both();
  expect(Math.abs(trigger.text.left - plain.text.left)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(trigger.text.top - plain.text.top)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(trigger.meta.top - plain.meta.top)).toBeLessThanOrEqual(0.5);
  expect(trigger.meta.top).toBeGreaterThanOrEqual(trigger.text.bottom - 1);
  expect(plain.head.height).toBe(56);
  expect(trigger.head.height).toBe(56);
});

it("on a phone (390px) the trigger is as tall as the title's line and its tap target is 44px", async () => {
  await touchAt(390);
  const { plain, trigger } = both();
  const button = trigger.button!;
  const box = button.getBoundingClientRect();
  expect(box.height).toBe(plain.text.height);
  const after = getComputedStyle(button, "::after");
  expect(after.position).toBe("absolute");
  const hit = box.height - Number.parseFloat(after.top) - Number.parseFloat(after.bottom);
  expect(hit).toBeCloseTo(44, 1);
  const x = box.left + box.width / 2;
  const middle = box.top + box.height / 2;
  for (const offset of [-21, 0, 21]) {
    expect(button.contains(document.elementFromPoint(x, middle + offset))).toBe(true);
  }
});

it("on a touch tablet (820px) the trigger is the 44px bar button on a one-line head, its title where a plain one is", async () => {
  await touchAt(820);
  const { plain, trigger } = both();
  expect(trigger.button!.getBoundingClientRect().height).toBe(44);
  expect(Math.abs(trigger.text.left - plain.text.left)).toBeLessThanOrEqual(0.5);
  expect(Math.abs(trigger.text.top - plain.text.top)).toBeLessThanOrEqual(0.5);
  expect(trigger.meta.top).toBeLessThan(trigger.text.bottom);
  expect(trigger.head.height).toBe(plain.head.height);
});

it("by touch the trigger takes 27.5px more room than a plain title", async () => {
  await touchAt(390);
  const { plain, trigger } = both();
  const room = trigger.button!.getBoundingClientRect().right - trigger.text.left;
  expect(room - plain.text.width).toBeCloseTo(27.5, 1);
});
