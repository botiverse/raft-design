import "./message-item.avatar-align.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { MessageItem } from "./message-item-root";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import { MessageItemHeader, MessageItemSender, MessageItemTime } from "./message-item-header";
import { MessageItemToolbar, MessageItemToolbarButton } from "./message-item-toolbar";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/**
 * A jump started from the keyboard moves focus to the message it located
 * (`tabIndex={-1}`, then `focus({ preventScroll: true })`,
 * design/foundations/states.md#located). The row shows the inset ring of an
 * edge-to-edge row, in ink and square, only after keyboard input, and never
 * the browser's own outline. Real CDP key presses and clicks, so the tracker
 * ThemeProvider installs sees what a person does.
 */

async function context() {
  const { userEvent } = await import("vite-plus/test/browser/context");
  return userEvent;
}

/** Waits out any box-shadow transition. */
const settle = () => new Promise((r) => setTimeout(r, 150));

/** The colour of the 2px inset layer of the element's box-shadow, or null. */
function insetRingColor(el: Element) {
  const layers = getComputedStyle(el).boxShadow.split(/,(?![^(]*\))/);
  const ring = layers.find((layer) => layer.trim().endsWith(" 0px 0px 0px 2px inset"));
  return ring ? ring.trim().replace(/ 0px 0px 0px 2px inset$/, "") : null;
}

function Timeline({ mode }: { mode: "light" | "dark" }) {
  return (
    <ThemeProvider mode={mode}>
      <div className="w-[640px] bg-layer-canvas">
        <button type="button" data-testid="before">
          Before
        </button>
        <span data-testid="ink" className="text-foreground">
          ink
        </span>
        <p data-testid="outside">Text that takes no focus</p>
        <MessageItem data-testid="row" tabIndex={-1}>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Atlas</MessageItemSender>
              <MessageItemTime dateTime="2026-10-22T14:20:00Z">2:20 PM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Please add the owner to the release review thread.</MessageItemBody>
          </MessageItemContent>
          <MessageItemToolbar data-testid="toolbar">
            <MessageItemToolbarButton aria-label="Reply in Thread">R</MessageItemToolbarButton>
          </MessageItemToolbar>
        </MessageItem>
      </div>
    </ThemeProvider>
  );
}

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a row focused after keyboard input shows the square ink inset ring, no outline, and its toolbar`, async () => {
    const userEvent = await context();
    render(<Timeline mode={mode} />);
    const row = screen.getByTestId("row");

    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(screen.getByTestId("before"));
    row.focus({ preventScroll: true });
    await settle();

    expect(document.activeElement).toBe(row);
    expect(row.matches(":focus-visible")).toBe(true);
    expect(insetRingColor(row), "inset ring in foreground").toBe(
      getComputedStyle(screen.getByTestId("ink")).color,
    );
    const style = getComputedStyle(row);
    expect(style.outlineStyle, "no browser outline").toBe("none");
    expect(style.borderTopLeftRadius, "an edge-to-edge row stays square").toBe("0px");
    // Focus inside the row shows the toolbar, so Tab reaches its actions.
    expect(getComputedStyle(screen.getByTestId("toolbar")).opacity).toBe("1");
  });

  it(`${mode}: a row focused after a click on plain text shows no ring and no outline, though it is :focus-visible`, async () => {
    // Guards the two halves of the class, not the ring itself. A click on text
    // that takes no focus leaves Chromium treating the next programmatic focus
    // as :focus-visible, so the browser would draw its outline (main fails
    // here on outlineStyle "auto") and an ungated ring would show; only
    // `outline-none` and the `keyboard:` variant keep the row quiet.
    const userEvent = await context();
    render(<Timeline mode={mode} />);
    const row = screen.getByTestId("row");

    await userEvent.click(screen.getByTestId("outside"));
    row.focus({ preventScroll: true });
    await settle();

    expect(document.activeElement).toBe(row);
    expect(row.matches(":focus-visible"), "Chromium still calls it focus-visible").toBe(true);
    expect(insetRingColor(row), "no inset ring after a pointer input").toBeNull();
    expect(getComputedStyle(row).outlineStyle, "no browser outline").toBe("none");
  });
}

it("a jump that lands more than a second after the key press still shows the ring", async () => {
  // slock reads the input when the jump is asked for and focuses the row once
  // it has loaded and scrolled into view, which can take a while; the ring
  // must not depend on the key press being recent. Fails on main: no ring.
  const userEvent = await context();
  render(<Timeline mode="light" />);
  const row = screen.getByTestId("row");

  await userEvent.keyboard("{Tab}");
  await new Promise((r) => setTimeout(r, 1200));
  row.focus({ preventScroll: true });
  await settle();

  expect(document.activeElement).toBe(row);
  expect(insetRingColor(row), "inset ring 1.2s after the key press").toBe(
    getComputedStyle(screen.getByTestId("ink")).color,
  );
  expect(getComputedStyle(row).outlineStyle).toBe("none");
});

it("the ring follows keyboard input again after a click", async () => {
  const userEvent = await context();
  render(<Timeline mode="light" />);
  const row = screen.getByTestId("row");

  await userEvent.click(screen.getByTestId("before"));
  row.focus({ preventScroll: true });
  await settle();
  expect(insetRingColor(row)).toBeNull();

  // Back to the button with Shift+Tab, then a keyboard-started jump.
  await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
  row.focus({ preventScroll: true });
  await settle();
  expect(insetRingColor(row)).not.toBeNull();
});
