/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
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
 * only workaround was to abandon `render` and hand-build the button, which threw
 * away the built-in chrome as a side effect. Both Slock surfaces that hit this
 * had done exactly that (CreateAgentDialog, OverflowSheet).
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
// here rather than assumed from the other two, because covering some of the
// sites a rule touches and calling it the rule is the mistake I keep repeating.
// OverflowSheet in Slock is a live consumer of exactly this path.
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
 * three banded strips rather than one card (@cindyz, 2026-09-01).
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
