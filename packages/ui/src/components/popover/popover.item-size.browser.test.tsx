/**
 * A popover about an item (`size="item"`, popover.md#about-an-item) is the
 * item card's 400px, and never wider than the room the positioner leaves it:
 * on a 375px phone, the screen less the collision padding on each side, so
 * neither its edge nor its buttons run off the screen. Real layout: only a
 * browser places the popup and sets --available-width.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/popover/popover.item-size.browser.test.tsx`
 */
import "./popover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import {
  Popover,
  PopoverActions,
  PopoverBody,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

function renderConsent() {
  render(
    <ThemeProvider>
      <div style={{ position: "fixed", top: 120, left: 24 }}>
        <Popover open>
          <PopoverTrigger>stamp.build/botiverse/slock/pull/10451</PopoverTrigger>
          <PopoverContent size="item">
            <PopoverBody>
              <PopoverTitle>Show previews from Stamp?</PopoverTitle>
              <PopoverDescription>
                Stamp links in this server will show the item they point to.
              </PopoverDescription>
            </PopoverBody>
            <PopoverActions>
              <Button variant="ghost">Open link</Button>
              <Button variant="outline">Show previews</Button>
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </div>
    </ThemeProvider>,
  );
}

async function popup() {
  const el = await waitFor(() => {
    const found = document.querySelector<HTMLElement>('[data-slot="popover-content"]');
    expect(found?.getAttribute("data-side")).toBeTruthy();
    return found!;
  });
  // Let Base UI settle the position and size it computes after the first frame.
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  return el;
}

it("is the item card's 400px where the window has room", async () => {
  await viewport(1280);
  renderConsent();
  expect((await popup()).getBoundingClientRect().width).toBe(400);
});

it("on a 375px phone stays inside the screen, its buttons whole", async () => {
  await viewport(375);
  renderConsent();
  const el = await popup();
  const box = el.getBoundingClientRect();
  expect(box.width).toBeLessThan(375);
  expect(box.left).toBeGreaterThanOrEqual(0);
  expect(box.right).toBeLessThanOrEqual(375);
  for (const button of el.querySelectorAll<HTMLElement>('[data-slot="button"]')) {
    const b = button.getBoundingClientRect();
    expect(b.left).toBeGreaterThanOrEqual(box.left);
    expect(b.right).toBeLessThanOrEqual(box.right);
    expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth);
  }
});
