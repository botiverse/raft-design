/**
 * @vitest-environment jsdom
 *
 * Per file rather than by config: neither a `vitest.config.ts` in this package
 * nor a `test` key in its vite-plus config is picked up by the current runner.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

// `size="inline"` exists so an action that sits inside a line of text stops
// taking a box from the size scale. These assert the DECLARED properties that
// produce that, not measured geometry: jsdom performs no layout, so a height
// assertion would read 0 and pass on nothing, and this repo does not permit
// browser validation without same-turn authorization.

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

const cls = () => screen.getByRole("button").className;

test("inline takes no fixed height from the size scale", () => {
  render(
    <Button variant="link" size="inline">
      Retry
    </Button>,
  );
  expect(cls()).toContain("h-auto");
  expect(cls()).toMatch(/\bleading-\[inherit\]/);
  // No `h-<n>` from the scale survived the merge.
  expect(cls()).not.toMatch(/\bh-\d/);
  // ...and no border either. @Dozy caught that removing the height class alone
  // was not enough: with `h-auto` the box is content + border, so the Button's
  // own border (`border-[1.5px]`, `border-2` before it) still adds to the
  // line-height and rebuilds the button box this size exists to remove. The
  // original test excluded only `h-<n>`, so the real bad shape stayed green.
  expect(cls()).toContain("border-0");
  expect(cls()).not.toMatch(/\bborder-(?:[1-9]|\[[\d.]+px\])(?=\s|$)/);
});

test("CONTROL: a sized button DOES carry a fixed height", () => {
  // Without this the assertion above could pass because no size class is ever
  // emitted, rather than because `inline` removed it.
  render(
    <Button variant="link" size="sm">
      Retry
    </Button>,
  );
  expect(cls()).toMatch(/\bh-\d/);
  expect(cls()).not.toContain("h-auto");
});

test("inline declares no font-size, so it takes the surrounding text's", () => {
  // Every other size pins one (`sm` is text-xs, `md` is text-sm). Inheriting is
  // the whole point: an inline action is a word in a sentence.
  render(
    <Button variant="link" size="inline">
      Retry
    </Button>,
  );
  expect(cls()).not.toMatch(/\btext-(xs|sm|base|lg|\[)/);
});

test("it is still a real button: disabled is honoured", () => {
  render(
    <Button variant="link" size="inline" disabled>
      Retry
    </Button>,
  );
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});

test("it is still a real button: loading is announced and content hidden", () => {
  render(
    <Button variant="link" size="inline" loading loadingLabel="Checking">
      Retry
    </Button>,
  );
  // Behaviour, not the internal data attribute: while loading the control must
  // refuse activation and must announce itself.
  const button = screen.getByRole("button") as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  expect(screen.queryByLabelText("Checking")).not.toBeNull();
});

test("it is still focusable by keyboard", () => {
  render(
    <Button variant="link" size="inline">
      Retry
    </Button>,
  );
  const button = screen.getByRole("button");
  button.focus();
  expect(document.activeElement).toBe(button);
});

test("inside a ThemeProvider: inline takes no box height from the button scale or its border", () => {
  render(
    <ThemeProvider>
      <Button variant="link" size="inline">
        Retry
      </Button>
    </ThemeProvider>,
  );
  const c = cls();
  expect(c).toContain("h-auto");
  expect(c).not.toMatch(/\bh-\d/);
  expect(c).toContain("border-0");
  expect(c).not.toMatch(/\bborder-(?:[1-9]|\[[\d.]+px\])(?=\s|$)/);
});

test("CONTROL inside a ThemeProvider: a sized button still carries both", () => {
  render(
    <ThemeProvider>
      <Button variant="link" size="sm">
        Retry
      </Button>
    </ThemeProvider>,
  );
  // Proves the assertions above discriminate rather than passing because the
  // Button never emits a height or border in the first place.
  const c = cls();
  expect(c).toMatch(/\bh-\d/);
  expect(c).toMatch(/\bborder-(?:[1-9]|\[[\d.]+px\])(?=\s|$)/);
});
