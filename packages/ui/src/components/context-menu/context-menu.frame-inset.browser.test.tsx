/**
 * The start and end frame insets are the corners of the window's top band,
 * not columns down its sides (design/patterns/page-structure.md#frame-insets).
 * On the macOS desktop app the traffic lights' corner is about 95px wide and
 * the title bar 28px tall: a context menu opened at x=15, well under the title
 * bar, opens at x=15, as on the web. When the corner bounded the whole height,
 * every popup opened near the left edge was pushed to x≈100, and on Windows
 * each one near the right edge 146px in. A menu opened in the bar itself still
 * keeps clear of the corner: its anchor is the point it opened at. Real
 * layout: only a browser places the popup.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/context-menu`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";
import type { ContextMenuContentProps } from "./context-menu";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  for (const side of ["top", "start", "end"]) {
    document.documentElement.style.removeProperty(`--raft-frame-inset-${side}`);
  }
  document.documentElement.removeAttribute("dir");
});

// As on a Mac: the traffic lights' corner 95px wide, the title bar 28px tall.
function setMacTitleBar() {
  const style = document.documentElement.style;
  style.setProperty("--raft-frame-inset-start", "95px");
  style.setProperty("--raft-frame-inset-top", "28px");
}

// As on Windows: three 46px caption buttons at the right end of a 44px bar.
function setWindowsTitleBar(side: "start" | "end" = "end") {
  const style = document.documentElement.style;
  style.setProperty(`--raft-frame-inset-${side}`, "138px");
  style.setProperty("--raft-frame-inset-top", "44px");
}

// The trigger covers the window, so a right-click opens the menu anywhere.
const WHOLE_WINDOW = { position: "fixed", inset: 0, display: "block" } as const;

type OpenOptions = Pick<ContextMenuContentProps, "collisionBoundary" | "portalProps">;

async function openAt(clientX: number, clientY: number, options: OpenOptions = {}) {
  render(
    <ContextMenu>
      <ContextMenuTrigger data-testid="area" style={WHOLE_WINDOW} />
      <ContextMenuContent {...options}>
        <ContextMenuItem>Copy</ContextMenuItem>
        <ContextMenuItem>Reply</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>,
  );
  fireEvent.contextMenu(screen.getByTestId("area"), { clientX, clientY, button: 2 });
  const popup = await waitFor(() => {
    const el = document.querySelector<HTMLElement>('[data-slot="context-menu-content"]');
    expect(el?.getAttribute("data-side")).toBeTruthy();
    return el!;
  });
  // Let Base UI settle the position it computes after the first frame.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return popup.getBoundingClientRect();
}

it("opens at the pointer near the left edge with no inset", async () => {
  const box = await openAt(15, 258);
  expect(box.left).toBeCloseTo(15, 0);
  expect(box.top).toBeCloseTo(258, 0);
});

it("opens at the pointer under the title bar, clear of the traffic lights' corner", async () => {
  setMacTitleBar();
  const box = await openAt(15, 258);
  expect(box.left).toBeCloseTo(15, 0);
  expect(box.top).toBeCloseTo(258, 0);
});

it("keeps only its own 8px from the left edge under the title bar", async () => {
  setMacTitleBar();
  const box = await openAt(2, 258);
  expect(box.left).toBeCloseTo(8, 0);
});

it("keeps only its own 8px from the right edge under Windows' caption buttons", async () => {
  setWindowsTitleBar();
  const box = await openAt(window.innerWidth - 20, 258);
  expect(window.innerWidth - box.right).toBeCloseTo(8, 0);
});

it("keeps only its own 8px from the right edge in right to left", async () => {
  document.documentElement.setAttribute("dir", "rtl");
  setWindowsTitleBar("start");
  const box = await openAt(window.innerWidth - 20, 258);
  expect(window.innerWidth - box.right).toBeCloseTo(8, 0);
});

it("keeps its own 8px in a portal container of its own", async () => {
  setMacTitleBar();
  const container = document.createElement("div");
  document.body.append(container);
  try {
    const box = await openAt(15, 258, { portalProps: { container } });
    expect(box.left).toBeCloseTo(15, 0);
  } finally {
    cleanup();
    container.remove();
  }
});

it("keeps its own 8px within a collisionBoundary of the caller's", async () => {
  setMacTitleBar();
  const box = await openAt(15, 258, { collisionBoundary: document.body });
  expect(box.left).toBeCloseTo(15, 0);
});

it("stays out of the caption buttons' corner when opened in the bar at its right end", async () => {
  setWindowsTitleBar();
  const box = await openAt(window.innerWidth - 150, 10);
  const inCornerColumns = box.right > window.innerWidth - 138;
  const inBand = box.top < 44;
  expect(inCornerColumns && inBand).toBe(false);
  expect(window.innerWidth - box.right).toBeGreaterThanOrEqual(138 + 8 - 0.5);
});

it("keeps 8px from the top band, which spans the window", async () => {
  setMacTitleBar();
  const box = await openAt(400, 10);
  expect(box.top).toBeGreaterThanOrEqual(28 + 8 - 0.5);
});
