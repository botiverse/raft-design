/**
 * @vitest-environment jsdom
 */
import { readFileSync } from "node:fs";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { toast, ToastProvider, ToastProgress } from "./toast";

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

test("toast command options apply contentClassName to the default toast content", async () => {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );

  toast.success("Removed from followers.", {
    contentClassName: "toast-action-only",
    dismissible: false,
    action: { label: "Undo" },
  });

  const toastTitle = await screen.findByText("Removed from followers.");
  await waitFor(() => {
    expect(toastTitle.closest('[data-slot="toast-content"]')?.className).toContain(
      "toast-action-only",
    );
  });
  expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Dismiss" })).toBeNull();
});

test("toast progress is opt-in and uses the command timeout duration", async () => {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );

  toast.success("Undo available.", {
    timeout: 5000,
    progress: true,
    action: { label: "Undo" },
  });

  await screen.findByText("Undo available.");
  const progress = document.querySelector<HTMLElement>('[data-slot="toast-progress"]');

  expect(progress).not.toBeNull();
  expect(progress?.style.getPropertyValue("--toast-progress-duration")).toBe("5000ms");
  // A bar along the toast's bottom edge, inset from its corners.
  expect(progress?.className.split(/\s+/)).toEqual(
    expect.arrayContaining(["absolute", "bottom-1.5", "inset-x-4"]),
  );
  expect(progress?.className).toContain("group-hover/toast:[animation-play-state:paused]");
  expect(progress?.className).toContain("group-focus-within/toast:[animation-play-state:paused]");
});

test("toast progress stays hidden without opt-in", async () => {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );

  toast.success("Plain toast.", { timeout: 5000 });

  await screen.findByText("Plain toast.");
  expect(document.querySelector('[data-slot="toast-progress"]')).toBeNull();
});

test("toast progress inherits the provider timeout when a command timeout is not set", async () => {
  render(
    <ThemeProvider>
      <ToastProvider timeout={3600} />
    </ThemeProvider>,
  );

  toast.info("Provider timed toast.", { progress: true });

  await screen.findByText("Provider timed toast.");
  const progress = document.querySelector<HTMLElement>('[data-slot="toast-progress"]');

  expect(progress).not.toBeNull();
  expect(progress?.style.getPropertyValue("--toast-progress-duration")).toBe("3600ms");
});

test("toast progress is not rendered for persistent toasts", async () => {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );

  toast.success("Persistent toast.", { timeout: 0, progress: true });

  await screen.findByText("Persistent toast.");
  expect(document.querySelector('[data-slot="toast-progress"]')).toBeNull();
});

test("ToastProgress exposes the reusable progress slot", () => {
  const { container } = render(
    <ThemeProvider>
      <ToastProgress duration={1200} className="custom-progress" />
    </ThemeProvider>,
  );

  const progress = container.querySelector<HTMLElement>('[data-slot="toast-progress"]');

  expect(progress).not.toBeNull();
  expect(progress?.getAttribute("aria-hidden")).toBe("true");
  expect(progress?.style.getPropertyValue("--toast-progress-duration")).toBe("1200ms");
  expect(progress?.className).toContain("custom-progress");
});

test("toast progress defines countdown keyframes with reduced-motion fallback", () => {
  const source = readFileSync(`${process.cwd()}/src/components/toast/toast.tsx`, "utf8");

  expect(source).toContain("@keyframes raft-toast-timeout-progress");
  expect(source).toContain("prefers-reduced-motion: reduce");
  expect(source).toContain('[data-slot="toast-progress"]');
});
