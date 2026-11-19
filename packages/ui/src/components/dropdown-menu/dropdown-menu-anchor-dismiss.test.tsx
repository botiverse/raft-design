/**
 * @vitest-environment jsdom
 *
 * A test environment with no layout (jsdom: every viewport size is 0) must
 * not dismiss a menu as "its trigger left view", even when the test stubs
 * element sizes. Base UI marks `data-anchor-hidden` on mount there, and the
 * anchor-dismiss guard used to skip only when neither the viewport nor the
 * anchor had a size: a test that stubbed `getBoundingClientRect` (slock's
 * conversation header tests do, to fold actions into ⋯) gave the trigger a
 * size, so the menu closed as it opened and its items could not be chosen.
 * A real browser always has a viewport.
 */
import { afterEach, beforeEach, expect, test } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

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

const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "getBoundingClientRect");

beforeEach(() => {
  HTMLElement.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 160,
      bottom: 40,
      width: 160,
      height: 40,
      toJSON: () => ({}),
    } as DOMRect;
  };
});

afterEach(() => {
  if (original) Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", original);
  else delete (HTMLElement.prototype as { getBoundingClientRect?: unknown }).getBoundingClientRect;
  cleanup();
});

let chosen = 0;
const choose = () => {
  chosen += 1;
};

test("with element sizes stubbed but no viewport, an opened menu stays open and its item can be chosen", async () => {
  chosen = 0;
  render(
    <ThemeProvider defaultMode="light">
      <DropdownMenu>
        <DropdownMenuTrigger data-testid="trigger">More</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="menu">
          <DropdownMenuItem data-testid="item" onClick={choose}>
            Search
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ThemeProvider>,
  );
  expect(document.documentElement.clientWidth).toBe(0);
  fireEvent.click(screen.getByTestId("trigger"));
  // Let the positioner mount, Base UI mark it, and the dismiss check run.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
  expect(screen.getByTestId("trigger").getAttribute("aria-expanded")).toBe("true");
  fireEvent.click(screen.getByTestId("item"));
  expect(chosen).toBe(1);
});
