import "./web-top-bar.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup } from "@testing-library/react";
import { Avatars, renderBar } from "./web-top-bar.test-fixture";

// The web top bar on a touch screen from 768px
// (design/patterns/page-structure.md#the-web-top-bar): 48px (36px frame items
// with 6px above and below), the start on the 57px rail's 40px items (8px), the
// bell's icon box on the 20px column margin. Touch is emulated through CDP, so
// this file runs in a browser of its own (packages/ui/vite.config.ts).

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
});

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
}

for (const [width, height] of [
  [1024, 1366],
  [768, 1024],
]) {
  it(`is 48px with its start on the rail's items and its end on 20px at ${width}px`, async () => {
    await setViewport(width, height);
    const { bar, workspace, railItem, bellIcon, search } = renderBar({
      start: width > 768 ? <Avatars count={3} prefix="strip" /> : null,
    });
    expect(bar.height).toBe(48);
    expect(workspace.height).toBe(36);
    expect(workspace.top - bar.top).toBe(5.5);
    expect(bar.bottom - 1 - workspace.bottom).toBe(5.5);
    expect(railItem.left).toBe(8);
    expect(workspace.left).toBe(railItem.left);
    expect(bar.right - bellIcon.right).toBe(20);
    expect(search.left + search.width / 2).toBeCloseTo(innerWidth / 2, 1);
  });
}
