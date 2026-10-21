import "../../lib/row-hover.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { over, parseOklch, deltaE, settled, token, wcag } from "../../lib/row-hover.test-colors";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../context-menu";
import { MessageItem, MessageItemBody, MessageItemContent } from ".";

// On a phone there is no hover: a message pressed and held opens its menu,
// and the row's fill is the only sign of which message that menu acts on.
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

// A message with its menu open (states.md#row-hover): on a phone there is no
// hover, so the row's fill is the only sign of which message the menu acts
// on. It takes fill-row-open, a clear step (3 or more) off the canvas, still
// under info-soft so it never reads as selected.
for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a message pressed and held on a phone is marked with fill-row-open`, async () => {
    await emulatePhone();
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <div className="bg-layer-canvas p-2">
            <ContextMenu>
              <ContextMenuTrigger render={<MessageItem data-testid="message" />}>
                <MessageItemContent>
                  <MessageItemBody>Which message is this menu for?</MessageItemBody>
                </MessageItemContent>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>Copy text</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </ThemeProvider>,
    );
    const scope = getByTestId("scope");
    const el = getByTestId("message");
    expect(getComputedStyle(el).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    await longPress(el);
    expect(el.hasAttribute("data-popup-open"), "the long press opened the menu").toBe(true);
    const fill = await settled(() => getComputedStyle(el).backgroundColor);
    expect(fill, `${mode}: the open message's fill`).toBe(token(scope, "fill-row-open"));

    const surface = parseOklch(token(scope, "layer-canvas"));
    const open = over(parseOklch(fill), surface);
    const step = deltaE(open, surface);
    expect(
      step,
      `${mode}: the open message is ${step.toFixed(2)} off the canvas`,
    ).toBeGreaterThanOrEqual(3);
    const selected = deltaE(over(parseOklch(token(scope, "info-soft")), surface), surface);
    expect(step, `${mode}: lighter than info-soft (${selected.toFixed(2)})`).toBeLessThan(selected);
    const hintOnOpen = over(parseOklch(token(scope, "foreground-hint")), open);
    expect(wcag(hintOnOpen, open), `${mode}: hint text on the open message`).toBeGreaterThanOrEqual(
      4.5,
    );
  });
}
