import "./fit-toolbar.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { act } from "@testing-library/react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import { FitToolbar, FitToolbarButton, FitToolbarGroup } from "./fit-toolbar";

// A toolbar rendered before its element is in the document (a section a
// side area renders into a host it attaches after its first commit, a
// portal that mounts later) keeps its one Tab stop once it is attached.
// Base UI's composite lists number only connected items, and attaching a
// subtree registers nothing again: before the fix every item kept
// tabIndex -1, the toolbar's and the radio group's, and Tab passed over it
// (slock #14149 remounted the toolbar after attach to get one). Real
// layout only.

const it = test.skipIf(typeof window === "undefined");

let root: Root | null = null;
let host: HTMLElement | null = null;
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
});

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.testid;
const byId = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const stops = () =>
  Array.from(byId("bar").querySelectorAll<HTMLElement>("button, [tabindex]")).filter(
    (node) => node.tabIndex >= 0 && node.getAttribute("aria-hidden") !== "true",
  );

function Scope({ withButton }: { withButton: boolean }) {
  const [value, setValue] = useState("all");
  return (
    <ThemeProvider mode="light">
      <button type="button" data-testid="before">
        Before
      </button>
      <div style={{ width: 600 }}>
        <FitToolbar aria-label="Tasks" className="gap-2" data-testid="bar">
          <FitToolbarGroup firstLine className="gap-2">
            <SegmentedControl value={value} onValueChange={setValue} aria-label="Whose tasks">
              <SegmentedControlItem value="all" data-testid="all">
                <SegmentedControlLabel>All</SegmentedControlLabel>
              </SegmentedControlItem>
              <SegmentedControlItem value="mine" data-testid="mine">
                <SegmentedControlLabel>For me</SegmentedControlLabel>
              </SegmentedControlItem>
            </SegmentedControl>
          </FitToolbarGroup>
          {withButton ? <FitToolbarButton data-testid="sort">Sort</FitToolbarButton> : null}
        </FitToolbar>
      </div>
      <button type="button" data-testid="after">
        After
      </button>
    </ThemeProvider>
  );
}

/**
 * Renders into a container that is not in the document, then attaches it,
 * with no render of its own: as a section placed after its first commit.
 * Returns the buttons it rendered while detached.
 */
async function renderDetachedThenAttach(ui: ReactNode) {
  host = document.createElement("div");
  root = createRoot(host);
  act(() => root!.render(ui));
  expect(byId("before")).toBeNull();
  const detached = Array.from(host.querySelectorAll("button"));
  expect(detached.length).toBeGreaterThan(0);
  await frame();
  document.body.append(host);
  await frame();
  await frame();
  return detached;
}

it("a scope-only toolbar rendered before it is attached gets its Tab stop once attached", async () => {
  const detached = await renderDetachedThenAttach(<Scope withButton={false} />);
  expect(stops().map((node) => node.dataset.testid)).toEqual(["all"]);
  // Not remounted: the same elements, so nothing the person did is lost.
  expect(Array.from(host!.querySelectorAll("button"))).toEqual(detached);
  const { userEvent } = await import("vite-plus/test/browser/context");
  byId("before").focus();
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("all");
  await userEvent.keyboard("{ArrowRight}");
  expect(focused()).toBe("mine");
  // Moving chose nothing; Space does.
  expect(byId("all").getAttribute("aria-checked")).toBe("true");
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("after");
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  expect(focused()).toBe("mine");
});

it("a toolbar with a scope and a button, rendered detached, is one Tab stop once attached", async () => {
  await renderDetachedThenAttach(<Scope withButton />);
  expect(stops()).toHaveLength(1);
  const { userEvent } = await import("vite-plus/test/browser/context");
  byId("before").focus();
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("all");
  await userEvent.keyboard("{ArrowRight}{ArrowRight}");
  expect(focused()).toBe("sort");
  expect(stops().map((node) => node.dataset.testid)).toEqual(["sort"]);
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("after");
});

it("a SegmentedControl outside a toolbar, rendered detached, holds its Tab stop once attached", async () => {
  function Alone() {
    const [value, setValue] = useState("mine");
    return (
      <ThemeProvider mode="light">
        <button type="button" data-testid="before">
          Before
        </button>
        <SegmentedControl value={value} onValueChange={setValue} aria-label="Whose tasks">
          <SegmentedControlItem value="all" data-testid="all">
            <SegmentedControlLabel>All</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="mine" data-testid="mine">
            <SegmentedControlLabel>For me</SegmentedControlLabel>
          </SegmentedControlItem>
        </SegmentedControl>
      </ThemeProvider>
    );
  }
  await renderDetachedThenAttach(<Alone />);
  expect(byId("mine").tabIndex).toBe(0);
  expect(byId("all").tabIndex).toBe(-1);
  const { userEvent } = await import("vite-plus/test/browser/context");
  byId("before").focus();
  await userEvent.keyboard("{Tab}");
  expect(focused()).toBe("mine");
});
