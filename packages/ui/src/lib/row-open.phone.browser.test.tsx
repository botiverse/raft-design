import "./row-hover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme/theme-provider";
import { over, parseOklch, deltaE, settled, token, wcag } from "./row-hover.test-colors";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../components/context-menu";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";
import { MessageItem, MessageItemBody, MessageItemContent } from "../components/message-item";

// On a phone there is no hover: a row pressed and held opens its menu, and
// the row's fill is the only sign of which row that menu acts on.
// Measured in a real browser with touch emulated through CDP. Chrome keeps a
// touch-only pointer once touch emulation has been on (turning it off doesn't
// bring `(hover: hover)` back), so these tests live apart from the mouse ones.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function emulatePhone() {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  expect(matchMedia("(hover: hover)").matches, "a touch screen can't hover").toBe(false);
}

// Press and hold with a finger until the context menu opens.
async function longPress(element: Element) {
  const { cdp } = await import("vite-plus/test/browser/context");
  const rect = element.getBoundingClientRect();
  const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  for (let i = 0; i < 40 && !element.hasAttribute("data-popup-open"); i += 1) {
    await new Promise((r) => setTimeout(r, 50));
  }
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

// A row with its menu open (states.md#hover-and-press): on a phone there is
// no hover, so the row's fill is the only sign of which row the menu acts on.
// Every row takes fill-subtle, a visible step (2 or more) off its surface,
// still under info-soft and brand-soft so it never reads as selected.
const rows = [
  {
    name: "message",
    surface: "layer-canvas",
    backdrop: "bg-layer-canvas p-2",
    trigger: <MessageItem data-testid="row" />,
    content: (
      <MessageItemContent>
        <MessageItemBody>Which message is this menu for?</MessageItemBody>
      </MessageItemContent>
    ),
  },
  {
    name: "sidebar item",
    surface: "layer-sidebar",
    backdrop: "bg-layer-sidebar p-2",
    trigger: <SidebarItem data-testid="row" />,
    content: <SidebarItemTitle>launch-week</SidebarItemTitle>,
  },
] as const;

for (const mode of ["light", "dark"] as const) {
  for (const row of rows) {
    it(`${mode}: a ${row.name} pressed and held on a phone is marked with fill-subtle`, async () => {
      await emulatePhone();
      const { getByTestId } = render(
        <ThemeProvider>
          <div className={mode} data-testid="scope">
            <div className={row.backdrop}>
              <ContextMenu>
                <ContextMenuTrigger render={row.trigger}>{row.content}</ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Copy link</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
        </ThemeProvider>,
      );
      const scope = getByTestId("scope");
      const el = getByTestId("row");
      expect(getComputedStyle(el).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      await longPress(el);
      expect(el.hasAttribute("data-popup-open"), "the long press opened the menu").toBe(true);
      const fill = await settled(() => getComputedStyle(el).backgroundColor);
      expect(fill, `${mode}: the open ${row.name}'s fill`).toBe(token(scope, "fill-subtle"));

      const surface = parseOklch(token(scope, row.surface));
      const open = over(parseOklch(fill), surface);
      const step = deltaE(open, surface);
      expect(step, `${mode}: ${step.toFixed(2)} off ${row.surface}`).toBeGreaterThanOrEqual(2);
      for (const selection of ["info-soft", "brand-soft"]) {
        const selected = deltaE(over(parseOklch(token(scope, selection)), surface), surface);
        expect(step, `${mode}: under ${selection} (${selected.toFixed(2)})`).toBeLessThan(selected);
      }
      const hintOnOpen = over(parseOklch(token(scope, "foreground-hint")), open);
      expect(wcag(hintOnOpen, open), `${mode}: hint text`).toBeGreaterThanOrEqual(4.5);
    });
  }
}
