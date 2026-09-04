/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { toast, ToastProvider } from "./toast";

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

afterEach(() => {
  toast.dismiss();
  cleanup();
});

// The close-button label ternary was inverted: default "Dismiss" text got no
// label while custom children were force-labelled "Dismiss toast", clobbering
// their own text as the accessible name. The default case now carries the
// label; custom children speak for themselves. Base UI keeps the button
// aria-hidden until the toast viewport expands, and dom-accessibility-api
// computes no name for aria-hidden nodes, so assert the emitted attribute.

test('the default close button carries a "Dismiss toast" label', async () => {
  render(
    <ThemeProvider theme="brutal">
      <ToastProvider />
    </ThemeProvider>,
  );

  toast.success("Saved.");

  await screen.findByText("Saved.");
  const close = document.querySelector('[data-slot="toast-close"]');
  expect(close?.getAttribute("aria-label")).toBe("Dismiss toast");
});
