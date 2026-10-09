/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
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

async function renderToast(title: string, options?: Parameters<typeof toast.success>[1]) {
  render(
    <ThemeProvider theme="brutal">
      <ToastProvider />
    </ThemeProvider>,
  );
  toast.success(title, options);
  const titleNode = await screen.findByText(title);
  const content = titleNode.closest<HTMLElement>('[data-slot="toast-content"]');
  expect(content, "toast content element must exist").not.toBeNull();
  return content!;
}

/**
 * The default toast's content layout used to read the composed parts with
 * ancestor `:has()` (`:has([data-slot=toast-description]) > [data-slot=toast-body]`).
 * That shape makes Chromium recalculate the whole page on unrelated mutations
 * (measured at ~55ms per text-node change on a 300-message channel, #133).
 * DefaultToastItem now writes `data-has-icon` / `data-has-description` /
 * `data-has-actions` at render time and the content rules key off those.
 */
test("default toast marks icon/actions present and description absent", async () => {
  const content = await renderToast("Saved");
  expect(content.hasAttribute("data-has-icon")).toBe(true);
  expect(content.hasAttribute("data-has-actions")).toBe(true);
  expect(content.hasAttribute("data-has-description")).toBe(false);
  expect(content.className).toContain(
    "[&:not([data-has-description])>[data-slot=toast-body]:only-child]:justify-self-center",
  );
  expect(content.className).not.toContain(
    ":not(:has([data-slot=toast-description]))>[data-slot=toast-body]",
  );
});

test("a description flips data-has-description and the self-start rule keys off it", async () => {
  const content = await renderToast("Saved", { description: "Secondary line." });
  expect(content.hasAttribute("data-has-description")).toBe(true);
  expect(content.className).toContain(
    "[&[data-has-description]_[data-slot=toast-body]]:self-start",
  );
});

test("a title-only toast (no icon, no close, no description) carries the title-only state", async () => {
  const content = await renderToast("Saved", { dismissible: false, icon: false });
  expect(content.hasAttribute("data-has-icon")).toBe(false);
  expect(content.hasAttribute("data-has-actions")).toBe(false);
  expect(content.hasAttribute("data-has-description")).toBe(false);
  expect(content.className).toContain(
    "[&:not([data-has-icon]):not([data-has-actions]):not([data-has-description])]:min-h-(--toast-title-only-min-h,2.25rem)",
  );
});
