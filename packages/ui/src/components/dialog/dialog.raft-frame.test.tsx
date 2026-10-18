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
    <ThemeProvider theme="raft">
      <Dialog open>
        <DialogContent data-testid="content">
          <DialogTitle>Log out</DialogTitle>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  const content = screen.getByTestId("content").className.split(/\s+/);
  expect(content).toContain("transition-none");
  expect(content).toContain("data-starting-style:opacity-100");
  expect(content).not.toContain("data-starting-style:opacity-0");
  const overlay = document.querySelector('[data-slot="dialog-overlay"]');
  expect(overlay?.className.split(/\s+/)).toContain("bg-layer-backdrop");
  expect(overlay?.className.split(/\s+/)).toContain("transition-none");
});

test("DialogSurface is the raft dialog frame for an app-owned modal", () => {
  render(
    <ThemeProvider theme="raft">
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
