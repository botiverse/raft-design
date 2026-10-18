/**
 * @vitest-environment jsdom
 *
 * The trigger wraps whatever button the caller renders, so it must not
 * repaint that button's hover. A trigger-level hover background used to win
 * the tailwind-merge over the rendered Button's own hover: a primary trigger
 * turned near-white under the pointer, i.e. every time it was clicked (Artea,
 * slock #proj-frontend:52311f41, thread "…" menu).
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { DropdownMenu, DropdownMenuTrigger } from "./dropdown-menu";

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

const hoverBackgrounds = (element: HTMLElement) =>
  [...element.classList].filter((name) => /^(dark:)?hover:bg-/.test(name)).sort();

describe("DropdownMenuTrigger", () => {
  test.each(["primary", "outline", "ghost"] as const satisfies readonly ButtonProps["variant"][])(
    "keeps the rendered %s Button's own hover background",
    (variant) => {
      render(
        <ThemeProvider defaultMode="light">
          <Button variant={variant} data-testid="plain">
            x
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant={variant} data-testid="trigger" />}>
              x
            </DropdownMenuTrigger>
          </DropdownMenu>
        </ThemeProvider>,
      );

      expect(hoverBackgrounds(screen.getByTestId("trigger"))).toEqual(
        hoverBackgrounds(screen.getByTestId("plain")),
      );
    },
  );
});
