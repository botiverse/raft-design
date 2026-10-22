import "../dialog/dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";

// A confirmation's footer matches DialogFooter's: one row at the end, Cancel
// then the commit button, on a phone as on a desktop (stdrc, 2026-10-22). Only
// when the row doesn't fit on one line do the buttons stack full width, the
// commit button on top. Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

afterEach(cleanup);
afterAll(async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 720);
});

const MARGIN = 20;

// Too long to sit beside Cancel in a 358px confirmation on a phone.
const LONG = "Delete Task and All Its Comments Forever";

function renderConfirm(label = "Delete Task") {
  render(
    <ThemeProvider>
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>This cannot be undone.</AlertDialogBody>
          <AlertDialogFooter data-testid="footer">
            <AlertDialogCancel size="lg">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="danger" size="lg">
              {label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>,
  );
  const box = (element: Element) => element.getBoundingClientRect();
  const footer = box(screen.getByTestId("footer"));
  return {
    inner: { left: footer.left + MARGIN, right: footer.right - MARGIN },
    cancel: box(screen.getByRole("button", { name: "Cancel" })),
    commit: box(screen.getByRole("button", { name: label })),
  };
}

it("on a desktop: one row at the end, Cancel then the commit button", async () => {
  await viewport(1280);
  const { inner, cancel, commit } = renderConfirm();

  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(cancel.right).toBeLessThanOrEqual(commit.left);
  expect(commit.right).toBeCloseTo(inner.right, 0);
});

it("on a phone: two short buttons stay one row at the end", async () => {
  await viewport(390);
  const { inner, cancel, commit } = renderConfirm();

  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(false);
  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(cancel.right).toBeLessThanOrEqual(commit.left);
  expect(commit.right).toBeCloseTo(inner.right, 0);
  expect(cancel.left).toBeGreaterThan(inner.left + 40);
});

it("on a phone: a label too long for the row stacks full width, the commit button on top", async () => {
  await viewport(390);
  const { inner, cancel, commit } = renderConfirm(LONG);

  expect(commit.bottom).toBeLessThanOrEqual(cancel.top);
  for (const button of [cancel, commit]) {
    expect(button.left).toBeCloseTo(inner.left, 0);
    expect(button.right).toBeCloseTo(inner.right, 0);
  }
  const [first, second] = screen.getAllByRole("button");
  expect([first?.textContent, second?.textContent]).toEqual(["Cancel", LONG]);
});

it("stacked: Tab and Shift+Tab reach both buttons once a loop, and wrap", async () => {
  await viewport(390);
  renderConfirm(LONG);
  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(true);
  const { userEvent } = await import("vite-plus/test/browser/context");
  const name = () => document.activeElement?.textContent ?? "";

  for (const shift of [false, true]) {
    screen.getByRole("button", { name: "Cancel" }).focus();
    const seen: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      await userEvent.tab({ shift });
      seen.push(name());
    }
    // Two buttons: each step moves to the other one, both ways.
    expect(seen).toEqual([LONG, "Cancel", LONG, "Cancel"]);
  }
});
