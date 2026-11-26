import "./popover.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import {
  Popover,
  PopoverActions,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

// A popover taller than the room it has keeps its header and its actions and
// scrolls its body between them (popover.md › A long popover): the popup is a
// flex column capped at `--available-height`, and PopoverBody is a ScrollArea
// that shrinks. Before, the popup clipped what was past its cap, so the
// actions and the end of the body could not be reached.
// Revert to fail: popover.tsx, `content` without `flex flex-col`, or PopoverBody a plain div.

const it = test.skipIf(typeof window === "undefined");

const settle = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));
const rect = (element: Element) => element.getBoundingClientRect();

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

async function wheelOver(element: Element, deltaY: number) {
  const { cdp } = await import("vite-plus/test/browser/context");
  const outer = window.frameElement?.getBoundingClientRect() ?? { left: 0, top: 0 };
  const box = rect(element);
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseWheel",
    x: outer.left + box.left + box.width / 2,
    y: outer.top + box.top + box.height / 2,
    deltaX: 0,
    deltaY,
  });
  await settle(400);
}

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const READERS = Array.from({ length: 40 }, (_, index) => `Reader ${index + 1}`);

async function open(rows: readonly string[]) {
  await setViewport(1024, 480);
  render(
    <ThemeProvider mode="light">
      <div style={{ position: "fixed", top: 24, left: 24 }}>
        <Popover open>
          <PopoverTrigger>Read by</PopoverTrigger>
          <PopoverContent className="w-72" aria-label="Read by">
            <PopoverHeader data-testid="header">
              <PopoverTitle>Read by</PopoverTitle>
              <PopoverClose>Close</PopoverClose>
            </PopoverHeader>
            <PopoverSeparator />
            <PopoverBody data-testid="body">
              {rows.map((name) => (
                <p key={name} className="m-0">
                  {name}
                </p>
              ))}
            </PopoverBody>
            <PopoverActions data-testid="actions">
              <Button variant="outline">Copy names</Button>
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </div>
    </ThemeProvider>,
  );
  const popup = await waitFor(() => {
    const found = document.querySelector<HTMLElement>('[data-slot="popover-content"]');
    expect(found?.getAttribute("data-side")).toBeTruthy();
    return found!;
  });
  await settle();
  const get = (id: string) => document.querySelector<HTMLElement>(`[data-testid=${id}]`)!;
  return { popup, header: get("header"), body: get("body"), actions: get("actions") };
}

it("keeps the header and actions and scrolls the body between them", async () => {
  const { popup, header, body, actions } = await open(READERS);
  expect(rect(popup).bottom).toBeLessThanOrEqual(480);
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  expect(rect(header).top).toBeCloseTo(rect(popup).top, 0);
  expect(rect(actions).bottom).toBeCloseTo(rect(popup).bottom, 0);
  expect(rect(header).height).toBeGreaterThanOrEqual(44);

  const last = Array.from(body.querySelectorAll("p")).at(-1)!;
  expect(rect(last).top).toBeGreaterThan(rect(body).bottom);
  await wheelOver(body, 4000);
  expect(rect(last).bottom).toBeLessThanOrEqual(rect(body).bottom);
  // The header and actions didn't move.
  expect(rect(header).top).toBeCloseTo(rect(popup).top, 0);
  expect(rect(actions).bottom).toBeCloseTo(rect(popup).bottom, 0);
  // Overflowing, the body is a tab stop, so a keyboard can scroll it too.
  expect(body.tabIndex).toBe(0);
});

it("lays a short body out as before: 16px in, 12px above the actions", async () => {
  const { popup, body, actions } = await open(READERS.slice(0, 2));
  expect(body.scrollHeight).toBe(body.clientHeight);
  expect(body.tabIndex).toBe(-1);
  const first = body.querySelector("p")!;
  expect(rect(first).left - rect(popup).left).toBeCloseTo(16, 0);
  expect(rect(first).top - rect(body).top).toBeCloseTo(16, 0);
  const lastRow = Array.from(body.querySelectorAll("p")).at(-1)!;
  expect(rect(actions).top - rect(lastRow).bottom).toBeCloseTo(12, 0);
});
