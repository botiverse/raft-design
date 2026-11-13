// What is written directly in a DrawerBody keeps its height when the body scrolls (drawer.md,
// Behavior). The body is a flex column, and a flex item of a fixed height shrinks to its content
// before its container overflows: 80 rows of 52px came out 24px tall, squashed, instead of the
// body scrolling. The recipe gives the body's children `shrink-0` at no specificity, so a class on
// a child (`flex-1`, `shrink`) still lets an inner scroller shrink.
//
// Revert to fail: drawer.recipe.ts, `[:where(&)>*]:shrink-0` on `body` (the sheet and the native
// side body) and on `bodyScroll` (the side body with `unstable_scrollArea`). Without `:where()`
// (`*:shrink-0`) the inner scroller test fails: the rule then outranks the child's `flex-1`.
import "../dialog/dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps, ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "./index";

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The drawer slides in, and a ScrollArea measures in the next frame.
const settle = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

function Scene({
  side = false,
  children,
  ...body
}: { side?: boolean; children: ReactNode } & ComponentProps<typeof DrawerBody>) {
  return (
    <ThemeProvider>
      <Drawer open swipeDirection={side ? "right" : "down"}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Channels</DrawerTitle>
          </DrawerHeader>
          <DrawerBody data-testid="body" {...body}>
            {children}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

const rows = Array.from({ length: 80 }, (_, index) => (
  <div key={index} data-testid={`row-${index}`} className="flex h-13 items-center">
    # channel-{index + 1}
  </div>
));

const BODIES = [
  ["a bottom sheet", { side: false }],
  ["a side drawer", { side: true }],
  ["a side drawer with unstable_scrollArea", { side: true, unstable_scrollArea: true }],
] as const;

it.each(BODIES)(
  "in %s, rows of a fixed height keep it and the body scrolls",
  async (_name, props) => {
    await setViewport(390, 844);
    render(<Scene {...props}>{rows}</Scene>);
    await settle();
    const body = screen.getByTestId("body");
    for (const index of [0, 40, 79]) {
      expect(
        screen.getByTestId(`row-${index}`).getBoundingClientRect().height,
        `row ${index}`,
      ).toBe(52);
    }
    expect(body.scrollHeight).toBeGreaterThan(80 * 52);
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
    body.scrollTop = body.scrollHeight;
    expect(body.scrollTop).toBeGreaterThan(0);
  },
);

it.each(BODIES)(
  "in %s, a child with flex-1 still shrinks: an inner scroller scrolls, not the body",
  async (_name, props) => {
    await setViewport(390, 844);
    render(
      <Scene {...props}>
        <p data-testid="lead">Pick a channel.</p>
        <ScrollArea data-testid="inner" className="min-h-0 flex-1">
          {rows}
        </ScrollArea>
      </Scene>,
    );
    await settle();
    const body = screen.getByTestId("body");
    const inner = screen.getByTestId("inner");
    expect(body.scrollHeight).toBe(body.clientHeight);
    expect(inner.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      body.getBoundingClientRect().bottom,
    );
    expect(inner.scrollHeight).toBeGreaterThan(inner.clientHeight);
  },
);
