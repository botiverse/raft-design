import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import { MessageItemHeader, MessageItemSender, MessageItemTime } from "./message-item-header";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

// On a touch screen a tap can fire pointerenter (pointerType "touch") and
// leave the row in :hover. The header's fade under the toolbar
// (`--mi-toolbar-width`) shows under exactly the conditions the toolbar does,
// so a width left on the row never fades a header with no toolbar over it
// (message-item.md, "The hover toolbar").
// Touch is emulated through CDP. Chrome keeps a touch-only pointer once touch
// emulation has been on, so these tests live apart from the mouse ones
// (message-item-toolbar.width.browser.test.tsx).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function emulatePhone() {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  expect(matchMedia("(hover: hover)").matches, "a touch screen can't hover").toBe(false);
}

async function tap(element: Element) {
  const { cdp } = await import("vite-plus/test/browser/context");
  const rect = element.getBoundingClientRect();
  const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
  await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await new Promise((r) => setTimeout(r, 100));
}

it("a tap on a row leaves neither the toolbar nor a fade behind", async () => {
  await emulatePhone();
  render(
    <ThemeProvider>
      <div className="pt-6" style={{ width: 360 }}>
        <MessageItem data-testid="row">
          <MessageItemToolbar data-testid="toolbar">
            <MessageItemToolbarButton aria-label="Reply in Thread">
              <svg viewBox="0 0 24 24" />
            </MessageItemToolbarButton>
            <MessageItemToolbarButton aria-label="Save Message">
              <svg viewBox="0 0 24 24" />
            </MessageItemToolbarButton>
          </MessageItemToolbar>
          <MessageItemContent>
            <MessageItemHeader data-testid="header">
              <MessageItemSender>
                Release Coordinator for the Northstar Partner Workspace
              </MessageItemSender>
              <MessageItemTime>2:33 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody data-testid="body">
              v0.30.1 passed its smoke test on staging.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </div>
      <div data-testid="outside" style={{ height: 80 }} />
    </ThemeProvider>,
  );
  const row = screen.getByTestId("row");
  const toolbar = screen.getByTestId("toolbar");
  const header = screen.getByTestId("header");
  let enteredBy = "";
  row.addEventListener("pointerenter", (event) => (enteredBy = event.pointerType));

  await tap(screen.getByTestId("body"));
  // Whatever the tap wrote, the hover rules don't apply without hover: no
  // toolbar shows, so nothing fades.
  if (enteredBy) expect(enteredBy).toBe("touch");
  expect(getComputedStyle(toolbar).opacity).toBe("0");
  expect(getComputedStyle(header).maskImage).toBe("none");

  await tap(screen.getByTestId("outside"));
  expect(getComputedStyle(toolbar).opacity).toBe("0");
  expect(getComputedStyle(header).maskImage).toBe("none");
});
