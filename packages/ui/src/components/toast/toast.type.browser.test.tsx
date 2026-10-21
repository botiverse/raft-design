import "./toast.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { toast, ToastProvider } from "./toast";

// A toast's sentence is `text-callout` (typography.md): 14/22 on a desktop and
// 14/20 on a phone, for the title and the description alike, and the icon box
// is one line tall so the icon stays centred on the title's line. Desktop
// first: turning touch emulation off leaves Chromium at `pointer: none`.

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  toast.dismiss();
  cleanup();
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});

async function showToast() {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} />
    </ThemeProvider>,
  );
  toast.success("Message sent.", { description: "Martin will see it in #launch-week." });
  const title = await screen.findByText("Message sent.");
  const description = await screen.findByText("Martin will see it in #launch-week.");
  const content = title.closest<HTMLElement>('[data-slot="toast-content"]')!;
  const icon = content.querySelector<HTMLElement>('[data-slot="toast-icon"]')!;
  await waitFor(() => expect(icon.getBoundingClientRect().width).toBe(icon.offsetWidth));
  return { title, description, icon };
}

const type = (element: Element) => {
  const style = getComputedStyle(element);
  return `${style.fontSize}/${style.lineHeight}`;
};

for (const [name, setup, expected] of [
  [
    "desktop",
    async () => {
      const { page } = await import("vite-plus/test/browser/context");
      await page.viewport(1280, 800);
      expect(matchMedia("(pointer: fine)").matches).toBe(true);
    },
    "14px/22px",
  ],
  [
    "phone",
    async () => {
      const { cdp, page } = await import("vite-plus/test/browser/context");
      await page.viewport(390, 844);
      await cdp().send("Emulation.setEmulatedMedia", {
        features: [{ name: "pointer", value: "coarse" }],
      });
      await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      await expect.poll(() => matchMedia("(pointer: coarse)").matches).toBe(true);
    },
    "14px/20px",
  ],
] as const) {
  it(`${name}: a toast's title and description are text-callout, the icon on the title's line`, async () => {
    await setup();
    const { title, description, icon } = await showToast();
    expect(type(title)).toBe(expected);
    expect(type(description)).toBe(expected);
    const t = title.getBoundingClientRect();
    const i = icon.getBoundingClientRect();
    expect(i.height).toBe(t.height);
    expect(Math.abs(i.top + i.height / 2 - (t.top + t.height / 2))).toBeLessThanOrEqual(0.5);
  });
}
