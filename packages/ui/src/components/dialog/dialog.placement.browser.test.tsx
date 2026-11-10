import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { CSSProperties } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Dialog, DialogBody, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import type { DialogContentProps } from "./dialog";
import { DialogSheetContent } from "./dialog-sheet";

// Where a dialog sits (dialog.md, "Behavior" and "On a phone"): in the middle
// by default; with placement="top" centred across, its top edge at
// --dialog-top (8vh without it), never past the window's bottom. On a phone a
// top dialog stays centred and moves up only while the on-screen keyboard is
// open. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

const frame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve)));
// A phone sheet slides up over 240ms; measure where it rests.
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

afterEach(() => {
  cleanup();
  lowerKeyboard();
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

/** Stands in for the on-screen keyboard: the visual viewport gets shorter
 *  than the window, which keeps its height. */
function raiseKeyboard(visibleHeight: number) {
  const viewport = window.visualViewport!;
  Object.defineProperty(viewport, "height", { configurable: true, get: () => visibleHeight });
  viewport.dispatchEvent(new Event("resize"));
}

function lowerKeyboard() {
  if (typeof window === "undefined") return;
  const viewport = window.visualViewport!;
  if (!Object.hasOwn(viewport, "height")) return;
  delete (viewport as { height?: number }).height;
  viewport.dispatchEvent(new Event("resize"));
}

function Card({
  rows = 1,
  sheet = false,
  ...props
}: DialogContentProps & { rows?: number; sheet?: boolean }) {
  const Content = sheet ? DialogSheetContent : DialogContent;
  return (
    <ThemeProvider>
      <Dialog open modal={false}>
        <Content data-testid="card" initialFocus={false} {...props}>
          <DialogHeader>
            <DialogTitle>Rename section</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <input aria-label="Name" />
            {Array.from({ length: rows }, (_, index) => (
              <p key={index} className="h-10">
                Line {index + 1}
              </p>
            ))}
          </DialogBody>
        </Content>
      </Dialog>
    </ThemeProvider>
  );
}

const card = () => screen.getByTestId("card");
const box = () => card().getBoundingClientRect();
const centreX = () => box().left + box().width / 2;
const at = (top: number) => ({ "--dialog-top": `${top}px` }) as CSSProperties;

it("center, the default, keeps the card in the middle with the classes it always had", async () => {
  await setViewport(1280, 800);
  const { unmount } = render(<Card />);
  await frame();
  const before = card().className;
  expect(card().hasAttribute("data-placement")).toBe(false);
  expect(card().hasAttribute("data-soft-keyboard")).toBe(false);
  expect(box().top).toBeCloseTo((800 - box().height) / 2, 0);
  expect(centreX()).toBeCloseTo(640, 0);
  unmount();

  render(<Card placement="center" />);
  await frame();
  expect(card().className).toBe(before);
  expect(card().hasAttribute("data-placement")).toBe(false);
});

it("top puts the card's top edge at --dialog-top, centred across", async () => {
  await setViewport(1280, 800);
  render(<Card placement="top" style={at(120)} />);
  await frame();
  expect(card().getAttribute("data-placement")).toBe("top");
  expect(box().top).toBeCloseTo(120, 0);
  expect(centreX()).toBeCloseTo(640, 0);
  expect(box().width).toBe(448);
});

it("top without --dialog-top sits 8vh from the window's top", async () => {
  await setViewport(1280, 800);
  render(<Card placement="top" />);
  await frame();
  expect(box().top).toBeCloseTo(64, 0);
});

it("top never runs past the window's bottom: the window less the top and 16px", async () => {
  await setViewport(1280, 800);
  render(<Card placement="top" style={at(200)} rows={40} />);
  await frame();
  expect(box().top).toBeCloseTo(200, 0);
  expect(box().height).toBeCloseTo(800 - 200 - 16, 0);
  expect(box().bottom).toBeCloseTo(784, 0);
});

it("DialogSheetContent takes the top placement on a desktop", async () => {
  await setViewport(1280, 800);
  render(<Card sheet placement="top" style={at(96)} />);
  await frame();
  expect(box().top).toBeCloseTo(96, 0);
  expect(centreX()).toBeCloseTo(640, 0);
});

it("on a phone, top stays centred, moves up while the keyboard is open, and returns when it closes", async () => {
  await setViewport(390, 844);
  render(<Card placement="top" />);
  await frame();
  const centred = (844 - box().height) / 2;
  expect(box().top).toBeCloseTo(centred, 0);

  screen.getByRole("textbox", { name: "Name" }).focus();
  raiseKeyboard(500);
  // 8vh of the 844px window, from the top of what the keyboard leaves visible.
  await expect.poll(() => box().top).toBeCloseTo(844 * 0.08, 0);
  expect(card().hasAttribute("data-soft-keyboard")).toBe(true);
  expect(centreX()).toBeCloseTo(195, 0);
  expect(box().bottom).toBeLessThanOrEqual(500 - 16 + 0.5);

  lowerKeyboard();
  await expect.poll(() => box().top).toBeCloseTo(centred, 0);
  expect(card().hasAttribute("data-soft-keyboard")).toBe(false);
});

it("on a phone, a tall top card fits above the keyboard", async () => {
  await setViewport(390, 844);
  render(<Card placement="top" rows={40} />);
  await frame();
  screen.getByRole("textbox", { name: "Name" }).focus();
  raiseKeyboard(500);
  await expect.poll(() => box().top).toBeCloseTo(844 * 0.08, 0);
  expect(box().bottom).toBeCloseTo(500 - 16, 0);
});

it("on a phone, a centred card doesn't move when the keyboard opens", async () => {
  await setViewport(390, 844);
  render(<Card />);
  await frame();
  const centred = box().top;
  screen.getByRole("textbox", { name: "Name" }).focus();
  raiseKeyboard(500);
  await settle();
  expect(box().top).toBe(centred);
  expect(card().hasAttribute("data-soft-keyboard")).toBe(false);
});

it("on a phone, a sheet ignores placement and fills what the keyboard leaves visible", async () => {
  await setViewport(390, 844);
  render(<Card sheet placement="top" />);
  await settle();
  expect(card().hasAttribute("data-placement")).toBe(false);
  expect(Math.round(box().bottom)).toBe(844);
  screen.getByRole("textbox", { name: "Name" }).focus();
  raiseKeyboard(500);
  await expect.poll(() => box().height).toBeCloseTo(500, 0);
  expect(box().top).toBeCloseTo(0, 0);
  expect(card().hasAttribute("data-soft-keyboard")).toBe(false);
});
