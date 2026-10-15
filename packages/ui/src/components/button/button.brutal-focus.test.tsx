/**
 * @vitest-environment jsdom
 *
 * The Brutal theme must expose a visible keyboard focus indicator. jsdom does
 * not paint focus rings, so this test pins the declared focus-visible contract
 * and separately proves that the rendered control can receive focus.
 */
import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "./button";

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

describe("Button Brutal keyboard focus", () => {
  test("declares a visible two-pixel black focus outline", () => {
    render(
      <ThemeProvider theme="brutal">
        <Button>Action</Button>
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "Action" });
    button.focus();

    expect(document.activeElement).toBe(button);
    expect(button.className).toContain("focus-visible:outline-2");
    expect(button.className).toContain("focus-visible:outline-solid");
    expect(button.className).toContain("focus-visible:outline-offset-2");
    expect(button.className).toContain("focus-visible:outline-black");
    expect(button.className).not.toContain("focus-visible:outline-transparent");
  });

  test("CONTROL: Elegant keeps its ring contract instead of the Brutal outline", () => {
    render(
      <ThemeProvider theme="elegant">
        <Button>Action</Button>
      </ThemeProvider>,
    );

    const className = screen.getByRole("button", { name: "Action" }).className;
    expect(className).toContain("focus-visible:ring-2");
    expect(className).not.toContain("focus-visible:outline-black");
  });
});
