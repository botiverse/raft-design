/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
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
 * The sibling `dialog.scroll-layer.test.tsx` and `banner.browser.test.tsx` guard
 * themselves with `skipIf(typeof window === "undefined")`, which means they run
 * only under `vp test --browser`. CI runs plain `vp run -r test`, so those files
 * currently skip there — 24 tests, verified locally. Anything asserted only in
 * that style would not actually be protecting these changes. So the facts below
 * are pinned as emitted classes and attributes, which execute everywhere; the
 * resolved-pixel versions belong in the browser file and are only as good as the
 * runner that executes it.
 */

function open(theme: "brutal" | "elegant", closeProps: Record<string, unknown> = {}) {
  return render(
    <ThemeProvider theme={theme}>
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
 * away the per-theme chrome as a side effect. Both Slock surfaces that hit this
 * had done exactly that (CreateAgentDialog, OverflowSheet).
 */
test("close: a caller's aria-label wins over the built-in English default", () => {
  open("elegant", { "aria-label": "关闭" });
  expect(screen.getByTestId("close").getAttribute("aria-label")).toBe("关闭");
});

test("close: with no aria-label it still falls back to English", () => {
  open("elegant");
  expect(screen.getByTestId("close").getAttribute("aria-label")).toBe("Close");
});

test("close: the override reaches AlertDialogClose too", () => {
  render(
    <ThemeProvider theme="elegant">
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
    <ThemeProvider theme="elegant">
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
 * Elegant header and footer sit on the body's surface.
 *
 * They carried `border-b`/`border-t` plus `bg-layer-inset`, a slightly different
 * tone from the content surface, so the dialog read as three banded strips
 * rather than one card (@cindyz, 2026-09-01).
 */
test("elegant: header and footer draw no divider and add no surface of their own", () => {
  open("elegant");
  for (const slot of ["header", "footer"] as const) {
    const cls = screen.getByTestId(slot).className;
    expect(cls, `${slot} must not draw a divider`).not.toMatch(/\bborder-[bt]\b/);
    expect(cls, `${slot} must not tint its own surface`).not.toMatch(/bg-layer-inset/);
  }
});

test("brutal: header and footer were already plain and stay that way", () => {
  open("brutal");
  for (const slot of ["header", "footer"] as const) {
    const cls = screen.getByTestId(slot).className;
    expect(cls).not.toMatch(/\bborder-[bt]\b/);
    expect(cls).not.toMatch(/bg-layer-inset/);
  }
});

/**
 * The elegant title has to outrank the field labels beneath it.
 *
 * It was `text-sm font-medium` — 14px/500 — while a Field label in the same
 * dialog is 14px/700. The heading was LIGHTER than the labels it presides over,
 * which inverts the hierarchy. `text-base` + `font-bold` reuses sizes already on
 * the elegant scale (16px from the input, 700 from the label) instead of
 * introducing a new step, and the uppercase tracking matches the labels' rather
 * than staying negative, which reads cramped in caps.
 */
test("elegant: the title is 16px/700 uppercase, not lighter than a field label", () => {
  open("elegant");
  const cls = screen.getByTestId("title").className;
  expect(cls).toMatch(/\btext-base\b/);
  expect(cls).toMatch(/\bfont-bold\b/);
  expect(cls).toMatch(/\buppercase\b/);
  expect(cls, "negative tracking reads cramped in caps").not.toMatch(/tracking-\[-/);
  expect(cls, "14px/500 was the inverted-hierarchy state").not.toMatch(/\btext-sm\b/);
  expect(cls).not.toMatch(/\bfont-medium\b/);
});

test("brutal: the title keeps its own treatment", () => {
  open("brutal");
  const cls = screen.getByTestId("title").className;
  expect(cls).toMatch(/\btext-lg\b/);
  expect(cls).toMatch(/\bfont-bold\b/);
  expect(cls).toMatch(/\buppercase\b/);
});
