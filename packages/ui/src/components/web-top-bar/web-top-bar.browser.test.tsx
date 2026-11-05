import "./web-top-bar.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup } from "@testing-library/react";
import type { CSSProperties } from "react";
import { Avatars, renderBar } from "./web-top-bar.test-fixture";

// The web top bar with a mouse (design/patterns/page-structure.md#the-web-top-bar):
// 44px, the start on the rail's items, the search field on the window's center
// line and the bell's icon box on the 16px column margin. Measured in a real
// browser; jsdom has no layout or media queries.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function setViewport(width: number, height = 900) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
}

for (const width of [1440, 1024, 768]) {
  it(`is 44px with its start on the rail's items and its end on 16px at ${width}px`, async () => {
    await setViewport(width);
    const { bar, workspace, railItem, bellIcon } = renderBar();
    expect(bar.height).toBe(44);
    expect(workspace.height).toBe(34);
    // Centered over the seam, as in every header: (44 - 1 - 34) / 2 above and below.
    expect(workspace.top - bar.top).toBe(4.5);
    expect(bar.bottom - 1 - workspace.bottom).toBe(4.5);
    expect(railItem.left).toBe(6);
    expect(workspace.left).toBe(railItem.left);
    expect(bar.right - bellIcon.right).toBe(16);
  });

  it(`centers the search field on the window at ${width}px`, async () => {
    await setViewport(width);
    const { search } = renderBar({
      start: width > 768 ? <Avatars count={3} prefix="strip" /> : null,
    });
    expect(search.left + search.width / 2).toBeCloseTo(innerWidth / 2, 1);
  });
}

it("keeps the search field on the window's center with a frame inset at one end", async () => {
  await setViewport(1440);
  const { search, workspace, bar, bellIcon } = renderBar({
    style: { "--raft-frame-inset-start": "72px" } as CSSProperties,
  });
  expect(workspace.left).toBe(72 + 6);
  expect(bar.right - bellIcon.right).toBe(16);
  expect(search.left + search.width / 2).toBeCloseTo(innerWidth / 2, 1);
});

it("keeps the 44px in a short window, and the start on the short rail's items", async () => {
  await setViewport(1280, 560);
  const { bar, workspace, railItem } = renderBar();
  expect(bar.height).toBe(44);
  expect(workspace.left).toBe(railItem.left);
});

// At 768px the search field keeps its 360px and each side has (768 - 360) / 2
// = 204px. A side holding more moves the field toward the other side; the
// field never covers it.
it("doesn't overlap the two sides at 768px with the product's content", async () => {
  await setViewport(768);
  const { start, center, end, search, bar } = renderBar({
    start: <Avatars count={4} prefix="strip" />,
    end: <Avatars count={3} prefix="working" />,
  });
  expect(search.width).toBe(360);
  expect(start.right).toBeLessThanOrEqual(center.left);
  expect(search.left).toBeGreaterThanOrEqual(start.right);
  expect(center.right).toBeLessThanOrEqual(end.left);
  expect(end.right).toBeLessThanOrEqual(bar.right);
  expect(search.left + search.width / 2).toBeGreaterThan(innerWidth / 2);
});

it("moves the search field away from a side wider than half, never over it", async () => {
  await setViewport(768);
  const { start, center, end, search, bar } = renderBar({
    start: <div style={{ width: 360, flexShrink: 0 }} />,
  });
  expect(start.right).toBeLessThanOrEqual(center.left);
  expect(center.right).toBeLessThanOrEqual(end.left);
  expect(search.width).toBeLessThan(360);
  expect(search.width).toBeGreaterThanOrEqual(160);
  expect(end.right).toBeLessThanOrEqual(bar.right);
});
