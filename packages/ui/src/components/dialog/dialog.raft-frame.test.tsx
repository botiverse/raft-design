/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Dialog, DialogContent, DialogSurface, DialogTitle } from "./dialog";

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

test("a raft dialog dims the page and appears without motion", () => {
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent data-testid="content">
          <DialogTitle>Log out</DialogTitle>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  // No motion: nothing transitions, and nothing starts or ends faded or scaled.
  const moves = (name: string) =>
    (name.startsWith("transition") && name !== "transition-none") ||
    name.startsWith("animate-") ||
    /^data-(starting|ending)-style:(opacity-0|scale-\[)/.test(name);
  const content = screen.getByTestId("content").className.split(/\s+/);
  expect(content.filter(moves)).toEqual([]);
  const overlay = document.querySelector('[data-slot="dialog-overlay"]');
  const overlayClasses = overlay?.className.split(/\s+/) ?? [];
  expect(overlayClasses).toContain("bg-layer-backdrop");
  expect(overlayClasses.filter(moves)).toEqual([]);
});

test("DialogSurface is the raft dialog frame for an app-owned modal", () => {
  render(
    <ThemeProvider>
      <DialogSurface data-testid="surface">Search</DialogSurface>
    </ThemeProvider>,
  );
  const surface = screen.getByTestId("surface");
  expect(surface.getAttribute("data-slot")).toBe("dialog-surface");
  const classes = surface.className.split(/\s+/);
  for (const name of [
    "rounded-dialog",
    "bg-layer-popover",
    "shadow-raft-float",
    "ring-line-seam",
  ]) {
    expect(classes).toContain(name);
  }
  expect(classes.some((name) => name.startsWith("transition-") && name !== "transition-none")).toBe(
    false,
  );
});
