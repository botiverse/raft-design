/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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

test("toast command options apply contentClassName to the default toast content", async () => {
  render(
    <ThemeProvider theme="brutal">
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
