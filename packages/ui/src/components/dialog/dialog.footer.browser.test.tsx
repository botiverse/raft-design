import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/index";
import { TextLink } from "../text-link/index";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogFooterNote,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { DialogCommit, DialogSheetContent } from "./dialog-sheet";

// The dialog footer (dialog.md#the-footer): one row at the end, Cancel then
// the commit button, with a note or a link at the start, on a phone as on a
// desktop (stdrc, 2026-10-22). The start item goes above the buttons when
// both don't fit on the line. Only when the buttons themselves don't fit on
// one line do they stack full width, the commit button on top and Cancel
// under it; the note or the link stays first. The note is never cut: one line
// on a desktop, and on a phone it may wrap to 2 lines. The buttons never
// leave the footer's padding. Real layout only: jsdom has no boxes.

const it = test.skipIf(typeof window === "undefined");

async function context() {
  return import("vite-plus/test/browser/context");
}

async function viewport(width: number, touch = false) {
  const { cdp, page } = await context();
  await page.viewport(width, 800);
  // Turning touch emulation off leaves no fine pointer, so the touch case
  // runs last and afterAll resets it.
  if (touch) {
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

afterEach(cleanup);
afterAll(async () => {
  const { cdp, page } = await context();
  await page.viewport(1280, 720);
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

// A short note.
const NOTE = "Billed $8 per member monthly.";
// The longest note the rule allows, 40 characters: beside the buttons in a
// 640px (lg) dialog.
const NOTE_40 = "You'll be billed $8 for each new member.";
// One line on a phone.
const MEDIUM_NOTE = "You'll be billed $8 per member each month.";
// Too long to sit beside the buttons on a desktop; wraps to 2 lines on a phone.
const LONG_NOTE = "You'll be billed $8 per member each month, starting today.";
// Too long to sit beside Cancel in a 358px dialog on a phone.
const LONG_COMMIT = "Add Members and Send Invites";
const FOOTNOTE_LINE = 18;
const MARGIN = 20;

function renderDialog(
  start: "note" | "link" | "none",
  {
    note = NOTE,
    size = "lg",
    label = "Add Members",
    wrapCommit = false,
    close = false,
  }: {
    note?: string;
    size?: "lg" | "wide";
    label?: string;
    wrapCommit?: boolean;
    close?: boolean;
  } = {},
) {
  const commit = (
    <Button variant="primary" size="lg">
      {label}
    </Button>
  );
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent size={size}>
          <DialogHeader>
            <DialogTitle>Add 3 Members?</DialogTitle>
            {close ? <DialogClose /> : null}
          </DialogHeader>
          <DialogBody>
            <input aria-label="Before" />
          </DialogBody>
          <DialogFooter data-testid="footer">
            {start === "note" ? <DialogFooterNote>{note}</DialogFooterNote> : null}
            {start === "link" ? <TextLink>Learn About Pricing</TextLink> : null}
            <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
            {wrapCommit ? <span>{commit}</span> : commit}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  const box = (element: Element) => element.getBoundingClientRect();
  const footer = box(screen.getByTestId("footer"));
  return {
    box,
    inner: { left: footer.left + MARGIN, right: footer.right - MARGIN },
    cancel: box(screen.getByRole("button", { name: "Cancel" })),
    commit: box(screen.getByRole("button", { name: label })),
  };
}

type Box = { left: number; right: number };

/** Both buttons on one line at the end, at their own width. */
function expectRow(cancel: DOMRect, commit: DOMRect, inner: Box) {
  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(cancel.right).toBeLessThanOrEqual(commit.left);
  expect(commit.right).toBeCloseTo(inner.right, 0);
  expect(cancel.left).toBeGreaterThan(inner.left + 40);
}

/** The commit button on top, Cancel under it, both full width. */
function expectStack(cancel: DOMRect, commit: DOMRect, inner: Box) {
  expect(commit.bottom).toBeLessThanOrEqual(cancel.top);
  for (const button of [commit, cancel]) {
    expect(button.left).toBeCloseTo(inner.left, 0);
    expect(button.right).toBeCloseTo(inner.right, 0);
  }
}

function expectInside(boxes: Box[], inner: Box) {
  for (const box of boxes) {
    expect(box.left).toBeGreaterThanOrEqual(inner.left - 0.5);
    expect(box.right).toBeLessThanOrEqual(inner.right + 0.5);
  }
}

/** The note is one line, starts at the margin and is not cut. */
function expectWholeNote(note: HTMLElement, inner: Box, lines = 1) {
  const box = note.getBoundingClientRect();
  expect(box.height).toBeCloseTo(FOOTNOTE_LINE * lines, 0);
  expect(box.left).toBeCloseTo(inner.left, 0);
  expect(box.right).toBeLessThanOrEqual(inner.right + 0.5);
  expect(note.scrollWidth).toBeLessThanOrEqual(note.clientWidth);
  expect(getComputedStyle(note).textOverflow).not.toBe("ellipsis");
  expect(getComputedStyle(note).textAlign).toMatch(/^(start|left)$/);
}

function focusName() {
  const active = document.activeElement;
  return active?.getAttribute("aria-label") ?? active?.textContent ?? "";
}

/**
 * Tabs twice around the dialog's focus loop, forward or backward, from where
 * focus is, and checks that each control comes once a loop in markup order
 * (reversed going back) and that the trap wraps.
 */
async function expectFocusLoop(controls: string[], backward = false) {
  const { userEvent } = await context();
  const order = backward ? [...controls].reverse() : controls;
  // One step first, so the loop starts from where the keyboard's focus is.
  await userEvent.tab({ shift: backward });
  const from = order.indexOf(focusName());
  expect(from).toBeGreaterThanOrEqual(0);
  const seen: string[] = [];
  for (let i = 0; i < order.length * 2; i += 1) {
    await userEvent.tab({ shift: backward });
    seen.push(focusName());
  }
  expect(seen).toEqual(seen.map((_, i) => order[(from + 1 + i) % order.length]));
}

async function tabOrder(count: number) {
  const { userEvent } = await context();
  screen.getByRole("textbox", { name: "Before" }).focus();
  const names: string[] = [];
  for (let i = 0; i < count; i += 1) {
    await userEvent.tab();
    names.push(document.activeElement?.textContent ?? "");
  }
  return names;
}

it("on a desktop: one row at the end, Cancel then commit, the note at the start on one line", async () => {
  await viewport(1280);
  const { box, inner, cancel, commit } = renderDialog("note");
  const note = screen.getByText(NOTE);

  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(cancel.right).toBeLessThanOrEqual(commit.left);
  expect(commit.right).toBeCloseTo(inner.right, 0);
  expectWholeNote(note, inner);
  expect(box(note).top).toBeGreaterThanOrEqual(cancel.top);
  expect(box(note).right).toBeLessThanOrEqual(cancel.left);
});

it("on a desktop: a 40-character note sits beside the buttons, both inside the padding", async () => {
  await viewport(1280);
  const { inner, cancel, commit } = renderDialog("note", { note: NOTE_40 });

  const note = screen.getByText(NOTE_40);
  expectWholeNote(note, inner);
  expect(note.getBoundingClientRect().top).toBeGreaterThanOrEqual(cancel.top);
  expect(note.getBoundingClientRect().right).toBeLessThanOrEqual(cancel.left);
  expectInside([cancel, commit], inner);
  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(commit.right).toBeCloseTo(inner.right, 0);
});

it("on a desktop: a note too long to sit beside the buttons goes above them, whole", async () => {
  await viewport(1280);
  const { box, inner, cancel, commit } = renderDialog("note", { note: LONG_NOTE });
  const note = screen.getByText(LONG_NOTE);

  expectWholeNote(note, inner);
  expect(box(note).bottom).toBeLessThanOrEqual(cancel.top);
  expectInside([cancel, commit], inner);
  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(commit.right).toBeCloseTo(inner.right, 0);
});

it("on a desktop: a link sits at the start, the buttons stay at the end", async () => {
  await viewport(1280);
  const { box, inner, cancel, commit } = renderDialog("link");
  const link = box(screen.getByRole("button", { name: "Learn About Pricing" }));

  expect(link.left).toBeCloseTo(inner.left, 0);
  expect(link.right).toBeLessThan(cancel.left);
  expect(commit.right).toBeCloseTo(inner.right, 0);
  expect(await tabOrder(3)).toEqual(["Learn About Pricing", "Cancel", "Add Members"]);
});

it("on a phone: two short buttons stay one row at the end, as on a desktop", async () => {
  await viewport(390);
  const { inner, cancel, commit } = renderDialog("none");

  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(false);
  expectRow(cancel, commit, inner);
});

it("on a phone: a commit label too long for the row stacks, the commit button on top", async () => {
  await viewport(390);
  const { inner, cancel, commit } = renderDialog("none", { label: LONG_COMMIT });

  expectStack(cancel, commit, inner);
  // The markup stays Cancel then commit, and so does Tab: in the stack focus
  // goes up from Cancel to the commit button. No `reading-flow`.
  const footer = screen.getByTestId("footer");
  expect([...footer.children].map((child) => child.textContent)).toEqual(["Cancel", LONG_COMMIT]);
  expect(getComputedStyle(footer).flexDirection).toBe("column-reverse");
  expect(getComputedStyle(footer).getPropertyValue("reading-flow") || "normal").toBe("normal");
  expect(await tabOrder(2)).toEqual(["Cancel", LONG_COMMIT]);
});

it("stacked, with an ×: Tab and Shift+Tab reach every control once a loop, and wrap", async () => {
  await viewport(390);
  renderDialog("none", { label: LONG_COMMIT, close: true });
  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(true);
  const controls = ["Close", "Before", "Cancel", LONG_COMMIT];

  screen.getByRole("textbox", { name: "Before" }).focus();
  await expectFocusLoop(controls);
  screen.getByRole("textbox", { name: "Before" }).focus();
  await expectFocusLoop(controls, true);
});

it("a footer that lays itself out with className keeps its row while it fits", async () => {
  // The server setup step's footer: two links at the start, Next at the end.
  await viewport(320);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent className="max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Start your computer</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="footer" className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-footnote">
              <TextLink>Switch Server</TextLink>
              <TextLink>Server Settings</TextLink>
            </div>
            <Button variant="accent" size="lg">
              Next
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(false);
  const next = screen.getByRole("button", { name: "Next" }).getBoundingClientRect();
  const link = screen.getByRole("button", { name: "Server Settings" }).getBoundingClientRect();
  expect(link.top).toBeLessThan(next.bottom);
  expect(next.left).toBeGreaterThan(link.right);
});

it("a label that may truncate shrinks before anything stacks", async () => {
  await viewport(320);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome</DialogTitle>
          </DialogHeader>
          <DialogFooter
            data-testid="footer"
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center"
          >
            <span className="min-w-0 truncate">
              Don&apos;t remind me again, ever, on any device
            </span>
            <Button variant="primary" size="lg">
              Get Started
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const footer = screen.getByTestId("footer");
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expect(getComputedStyle(footer).alignItems).toBe("center");
});

it("on a phone: the stack goes back to one row when the footer is wide enough again", async () => {
  await viewport(390);
  renderDialog("none", { label: LONG_COMMIT });
  expect(screen.getByTestId("footer").hasAttribute("data-stacked")).toBe(true);

  await viewport(1280);
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const footer = screen.getByTestId("footer");
  const box = footer.getBoundingClientRect();
  const inner = { left: box.left + MARGIN, right: box.right - MARGIN };
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expectRow(
    screen.getByRole("button", { name: "Cancel" }).getBoundingClientRect(),
    screen.getByRole("button", { name: LONG_COMMIT }).getBoundingClientRect(),
    inner,
  );
});

it("on a phone: a note that doesn't fit beside the buttons goes above them; they stay one row", async () => {
  await viewport(390);
  const { box, inner, cancel, commit } = renderDialog("note", { note: MEDIUM_NOTE });
  const note = screen.getByText(MEDIUM_NOTE);

  expectWholeNote(note, inner);
  expect(box(note).bottom).toBeLessThanOrEqual(cancel.top);
  expectRow(cancel, commit, inner);
});

it("on a phone: a note, then a long commit label stacked on top of Cancel", async () => {
  await viewport(390);
  const { box, inner, cancel, commit } = renderDialog("note", {
    note: MEDIUM_NOTE,
    label: LONG_COMMIT,
  });
  const note = screen.getByText(MEDIUM_NOTE);

  expectWholeNote(note, inner);
  expect(box(note).bottom).toBeLessThanOrEqual(commit.top);
  expectStack(cancel, commit, inner);
});

it("on a phone: a stacked button inside a wrapper (a tooltip trigger) still fills the width", async () => {
  await viewport(390);
  const { inner, cancel, commit } = renderDialog("link", { label: LONG_COMMIT, wrapCommit: true });

  expectStack(cancel, commit, inner);
});

it("on a phone: the link stays first and left-aligned above the row, and Tab follows what is seen", async () => {
  await viewport(390);
  const { box, inner, cancel, commit } = renderDialog("link");
  const link = box(screen.getByRole("button", { name: "Learn About Pricing" }));

  // At 390px the link and the buttons don't fit on one line: the link goes
  // above them, and the buttons stay one row at the end.
  expect(link.left).toBeCloseTo(inner.left, 0);
  expect(link.bottom).toBeLessThanOrEqual(cancel.top);
  expectRow(cancel, commit, inner);
  expect(await tabOrder(3)).toEqual(["Learn About Pricing", "Cancel", "Add Members"]);
});

it("on a phone: a longer note wraps to 2 lines, start-aligned and not cut", async () => {
  await viewport(390);
  const { box, inner, cancel, commit } = renderDialog("note", { note: LONG_NOTE });
  const note = screen.getByText(LONG_NOTE);

  expectWholeNote(note, inner, 2);
  expect(box(note).bottom).toBeLessThanOrEqual(cancel.top);
  expectRow(cancel, commit, inner);
});

function renderSheet(start: "note" | "link") {
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent size="lg">
          <DialogHeader>
            <DialogClose />
            <DialogTitle>Add 3 Members</DialogTitle>
          </DialogHeader>
          <DialogBody data-testid="body">
            <input aria-label="Before" />
          </DialogBody>
          <DialogFooter data-testid="footer">
            {start === "note" ? <DialogFooterNote>{NOTE_40}</DialogFooterNote> : null}
            {start === "link" ? <TextLink>Learn About Pricing</TextLink> : null}
            <DialogClose render={<Button variant="ghost" size="lg" />}>Cancel</DialogClose>
            <DialogCommit variant="primary">Add Members</DialogCommit>
          </DialogFooter>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>,
  );
}

/** In a sheet the footer is hidden; the start item ends the body, left-aligned. */
function expectAtBodyEnd(item: HTMLElement) {
  const body = screen.getByTestId("body");
  const footer = screen.getByTestId("footer");
  expect(footer.hidden).toBe(true);
  expect(footer.getBoundingClientRect().height).toBe(0);
  expect(footer.hasAttribute("data-stacked")).toBe(false);
  expect(footer.querySelector("[data-stacked]")).toBeNull();
  expect(body.contains(item)).toBe(true);
  const input = screen.getByRole("textbox", { name: "Before" }).getBoundingClientRect();
  const box = item.getBoundingClientRect();
  expect(box.top).toBeGreaterThanOrEqual(input.bottom);
  const bodyBox = body.getBoundingClientRect();
  expect(box.left).toBeCloseTo(bodyBox.left + 16, 0);
  expect(box.height).toBeLessThanOrEqual(FOOTNOTE_LINE * 2 + 0.5);
  expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
}

it("in a phone sheet: the note moves to the end of the body and no footer shows", async () => {
  await viewport(375);
  renderSheet("note");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const note = screen.getByText(NOTE_40);
  expectAtBodyEnd(note);
  // The commit button is in the head.
  expect(
    screen.getByRole("button", { name: "Add Members" }).closest("[data-slot=dialog-header]"),
  ).not.toBeNull();
});

it("in a phone sheet: a leading link moves to the end of the body", async () => {
  await viewport(375);
  renderSheet("link");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expectAtBodyEnd(screen.getByRole("button", { name: "Learn About Pricing" }));
});

it("the same sheet on a desktop: the note stays in the footer beside the buttons", async () => {
  await viewport(1280);
  renderSheet("note");
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const note = screen.getByText(NOTE_40);
  const footer = screen.getByTestId("footer");
  expect(footer.hidden).toBe(false);
  expect(footer.contains(note)).toBe(true);
  const cancel = screen.getByRole("button", { name: "Cancel" }).getBoundingClientRect();
  expect(note.getBoundingClientRect().right).toBeLessThanOrEqual(cancel.left);
});

// Last: it turns on touch emulation, which afterAll turns off.
it("on a touch tablet: a 40-character note sits beside the buttons, both inside the padding", async () => {
  await viewport(820, true);
  const { inner, cancel, commit } = renderDialog("note", { note: NOTE_40 });

  const note = screen.getByText(NOTE_40);
  expectWholeNote(note, inner);
  expect(note.getBoundingClientRect().top).toBeGreaterThanOrEqual(cancel.top);
  expect(note.getBoundingClientRect().right).toBeLessThanOrEqual(cancel.left);
  expectInside([cancel, commit], inner);
  expect(cancel.top).toBeCloseTo(commit.top, 0);
  expect(commit.right).toBeCloseTo(inner.right, 0);
});
