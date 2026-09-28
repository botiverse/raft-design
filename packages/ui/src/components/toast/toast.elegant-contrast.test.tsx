/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
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

async function renderElegantToast(title: string, intent: "info" | "success" | "warning" | "error") {
  render(
    <ThemeProvider theme="elegant">
      <ToastProvider />
    </ThemeProvider>,
  );

  toast[intent](title, {
    description: "Secondary line stays readable on the HUD surface.",
  });

  return await waitFor(() => {
    const el = document.querySelector<HTMLElement>(
      `[data-slot="toast"][data-toast-type="${intent}"]`,
    );
    expect(el).not.toBeNull();
    expect(el?.className).toContain("bg-layer-hud/");
    return el as HTMLElement;
  });
}

test("elegant toast surface is opaque enough for AA text (bg-layer-hud/85)", async () => {
  const root = await renderElegantToast("Surface probe.", "success");

  expect(root.className).toContain("bg-layer-hud/85");
  expect(root.className).not.toContain("bg-layer-hud/50");
  expect(root.className).toContain("data-expanded:bg-layer-hud/85");
  expect(root.className).not.toContain("data-expanded:bg-layer-hud/54");
});

test("elegant toast keeps description at text-white/62 and raises Dismiss to text-white/70", async () => {
  const root = await renderElegantToast("Dismiss probe.", "info");

  const description = root.querySelector('[data-slot="toast-description"]');
  expect(description).not.toBeNull();
  expect((description as HTMLElement).className).toContain("text-white/62");

  const close = root.querySelector('[data-slot="toast-close"]');
  expect(close).not.toBeNull();
  expect((close as HTMLElement).className).toContain("text-white/70");
  expect((close as HTMLElement).className).not.toContain("text-white/52");
});

test("elegant info toast icon uses text-info", async () => {
  const root = await renderElegantToast("Icon probe info.", "info");
  expect(root.className).toContain("]:text-info");
  expect(root.className).not.toContain("]:text-white/85");
});

test("elegant success toast icon uses text-success", async () => {
  const root = await renderElegantToast("Icon probe success.", "success");
  expect(root.className).toContain("]:text-success");
  expect(root.className).not.toContain("]:text-white/85");
});

test("elegant warning toast icon uses text-warning", async () => {
  const root = await renderElegantToast("Icon probe warning.", "warning");
  expect(root.className).toContain("]:text-warning");
  expect(root.className).not.toContain("]:text-white/85");
});

test("elegant error toast icon uses the bare alias text-brutal-red (numbered ramp steps are not registered as utilities)", async () => {
  const root = await renderElegantToast("Icon probe error.", "error");
  expect(root.className).toContain("]:text-brutal-red");
  expect(root.className).not.toContain("]:text-white/85");
});
