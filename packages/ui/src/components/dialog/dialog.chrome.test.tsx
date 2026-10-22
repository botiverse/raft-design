/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
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
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "../alert-dialog/alert-dialog";
import { Drawer, DrawerClose, DrawerContent } from "../drawer/drawer";
import { Button } from "../button/button";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

/**
 * jsdom, not the browser instance, on purpose.
 *
 * This package splits its tests deliberately: `dialog.scroll-layer.test.tsx` and
 * `banner.browser.test.tsx` are browser-mode files, guarded by
 * `skipIf(typeof window === "undefined")` so they run under `vp test --browser`,
 * while CI runs the node pool via `vp run -r test`. Everything asserted below is
 * an emitted class or attribute rather than a resolved pixel, so it belongs on
 * the node side and runs in CI. Resolved-geometry facts belong in the browser
 * files instead.
 */

function open(closeProps: Record<string, unknown> = {}) {
  return render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent data-testid="content">
          <DialogHeader data-testid="header">
            <DialogTitle data-testid="title">Create Agent</DialogTitle>
            <DialogClose data-testid="close" {...closeProps} />
          </DialogHeader>
          <DialogBody data-testid="body">Body</DialogBody>
          <DialogFooter data-testid="footer">
            <Button>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
}

/**
 * The close control's accessible name must be overridable.
 *
 * It was a hardcoded English "Close" on the Button this component builds
 * internally, and a label passed to DialogClose did NOT reach it — the render
 * element's own props win the merge, so callers had no way in. Consuming apps
 * therefore shipped an English label to screen readers in every locale, and the
 * only workaround was to abandon `render` and hand-build the button, which
 * threw away the built-in chrome as a side effect. Both Raft web app surfaces
 * that hit this had done exactly that (a create-agent dialog and an overflow
 * sheet).
 */
test("close: a caller's aria-label wins over the built-in English default", () => {
  open({ "aria-label": "关闭" });
  expect(screen.getByTestId("close").getAttribute("aria-label")).toBe("关闭");
});

test("close: with no aria-label it still falls back to English", () => {
  open();
  expect(screen.getByTestId("close").getAttribute("aria-label")).toBe("Close");
});

test("close: the override reaches AlertDialogClose too", () => {
  render(
    <ThemeProvider>
      <AlertDialog open>
        <AlertDialogContent>
          <AlertDialogClose data-testid="ac" aria-label="关闭" />
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("ac").getAttribute("aria-label")).toBe("关闭");
});

// DrawerClose carries the identical defect and an identical fix. It is driven
// here rather than assumed from the other two: covering some of the sites a
// rule touches does not cover the rule. The Raft web app's overflow sheet is a
// live consumer of exactly this path.
test("close: the override reaches DrawerClose too", () => {
  render(
    <ThemeProvider>
      <Drawer open>
        <DrawerContent>
          <DrawerClose data-testid="dc" aria-label="关闭" />
        </DrawerContent>
      </Drawer>
    </ThemeProvider>,
  );
  expect(screen.getByTestId("dc").getAttribute("aria-label")).toBe("关闭");
});

/**
 * Header and footer sit on the body's surface.
 *
 * An earlier treatment gave them `border-b`/`border-t` plus `bg-fill-muted`, a
 * slightly different tone from the content surface, so the dialog read as
 * three banded strips rather than one card.
 */
test("header and footer draw no divider and add no surface of their own", () => {
  open();
  for (const slot of ["header", "footer"] as const) {
    const cls = screen.getByTestId(slot).className;
    expect(cls, `${slot} must not draw a divider`).not.toMatch(/\bborder-[bt]\b/);
    expect(cls, `${slot} must not tint its own surface`).not.toMatch(/bg-fill-muted/);
  }
});

/**
 * The title has to outrank the field labels beneath it.
 *
 * An earlier title was `text-sm font-medium` — 14px/500 — while a Field label
 * in the same dialog was 14px/700: the heading was LIGHTER than the labels it
 * presides over, which inverts the hierarchy. The title is now the 17px
 * headline step at 700, above the 13px/600 field label.
 */
test("the title is the 17px headline at 700, not lighter than a field label", () => {
  open();
  const cls = screen.getByTestId("title").className;
  expect(cls).toMatch(/\btext-headline\b/);
  expect(cls).toMatch(/\bfont-bold\b/);
  expect(cls, "14px/500 was the inverted-hierarchy state").not.toMatch(/\btext-sm\b/);
  expect(cls).not.toMatch(/\bfont-medium\b/);
});

/**
 * A footer note fits beside the buttons only in a lg or wide dialog
 * (dialog.md#the-footer), so a development build warns when one is in a
 * sm or md dialog, the default included, but not when a className sets the
 * width instead.
 */
test.each([
  ["sm", undefined, true],
  [undefined, undefined, true],
  ["lg", undefined, false],
  ["wide", undefined, false],
  [undefined, "max-w-lg", false],
] as const)(
  "a DialogFooterNote in a %s dialog (className %s) warns: %s",
  (size, className, warns) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      render(
        <ThemeProvider>
          <Dialog open modal={false}>
            <DialogContent size={size} className={className}>
              <DialogTitle>Add 3 Members?</DialogTitle>
              <DialogFooter>
                <DialogFooterNote>Billed $8 per member monthly.</DialogFooterNote>
                <Button>Add Members</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ThemeProvider>,
      );
      const noteWarnings = warn.mock.calls.filter(([message]) =>
        String(message).includes("DialogFooterNote"),
      );
      expect(noteWarnings.length > 0).toBe(warns);
    } finally {
      warn.mockRestore();
    }
  },
);

test("an empty DialogFooterNote renders nothing, not an empty line", () => {
  render(
    <ThemeProvider>
      <Dialog open modal={false}>
        <DialogContent size="lg">
          <DialogTitle>Add 3 Members?</DialogTitle>
          <DialogFooter>
            <DialogFooterNote />
            <DialogFooterNote>{""}</DialogFooterNote>
            <Button>Add Members</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  expect(document.querySelector("[data-slot=dialog-footer-note]")).toBeNull();
});
