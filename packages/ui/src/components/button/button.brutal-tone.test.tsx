/**
 * @vitest-environment jsdom
 *
 * Brutal tone coverage for the slock ui/Button tone table (task #75):
 * every slock `tone` maps to one RUI `variant`, and each variant must keep
 * its exact brutal compound class. Changing a mapping (or dropping the
 * compound) turns the matching assertion red.
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// jsdom ships no matchMedia; ThemeProvider reads it for system-theme detection.
if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as never;
}

afterEach(cleanup);

/** slock tone → RUI variant → class that must appear on the brutal root. */
const TONE_MAP: ReadonlyArray<readonly [slockTone: string, variant: string, brutalClass: string]> =
  [
    ["white", "default", "bg-layer-panel"],
    ["yellow", "primary", "bg-brutal-yellow"],
    ["pink", "accent", "bg-brutal-pink"],
    ["cyan", "information", "bg-brutal-cyan"],
    ["orange", "warning", "bg-brutal-orange"],
    ["red", "danger", "bg-brutal-red"],
    ["stone", "muted", "bg-brutal-stone"],
    ["lime", "success", "bg-brutal-lime"],
  ];

describe("brutal tone coverage (slock ui/Button tone table)", () => {
  for (const [slockTone, variant, brutalClass] of TONE_MAP) {
    test(`tone="${slockTone}" → variant="${variant}" keeps ${brutalClass} under brutal`, () => {
      render(
        <ThemeProvider theme="brutal">
          <Button variant={variant as never}>Action</Button>
        </ThemeProvider>,
      );
      const cls = screen.getByRole("button", { name: "Action" }).className;
      expect(cls).toContain(brutalClass);
      // Every brutal compound shares the slock shell's text color token.
      expect(cls).toContain("text-foreground-strong");
    });
  }

  test("brutal root chrome matches the slock shell shape (border-2 + hard shadow + motion)", () => {
    render(
      <ThemeProvider theme="brutal">
        <Button variant="accent">Action</Button>
      </ThemeProvider>,
    );
    const cls = screen.getByRole("button", { name: "Action" }).className;
    expect(cls).toContain("border-2");
    expect(cls).toContain("font-bold");
    expect(cls).toContain("shadow-raft-sm");
    expect(cls).toContain("hover:-translate-y-px");
    expect(cls).toContain("active:translate-px");
  });

  test("CONTROL: elegant does NOT get brutal tone classes", () => {
    // Without this the loop above could pass because every variant always
    // carries the brutal class regardless of theme.
    render(
      <ThemeProvider theme="elegant">
        <Button variant="accent">Action</Button>
      </ThemeProvider>,
    );
    const cls = screen.getByRole("button", { name: "Action" }).className;
    expect(cls).not.toContain("bg-brutal-pink");
    // Elegant reads the accent tone through the soft pair (task #623).
    expect(cls).toContain("bg-accent-soft");
  });
});
