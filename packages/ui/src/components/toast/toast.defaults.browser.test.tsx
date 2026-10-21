import "./toast.test.css";
import { afterAll, afterEach, beforeEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  createToastManager,
  toast,
  ToastBody,
  ToastContent,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "./toast";

// The toast rules (design/patterns/actions-and-closing.md#toasts) as the
// component's defaults: a toast shows at the top center, under the page's
// header (`--toast-viewport-top`), one at a time, with no Dismiss, and swipes
// away up, the way it came.

const it = test.skipIf(typeof window === "undefined");

const HEADER_BOTTOM = 56;

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

beforeEach(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(() => {
  toast.dismiss();
  cleanup();
  document.documentElement.style.removeProperty("--toast-viewport-top");
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
});

function renderProvider(props: Parameters<typeof ToastProvider>[0] = {}) {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} {...props} />
    </ThemeProvider>,
  );
}

const toastOf = (title: HTMLElement) => title.closest<HTMLElement>('[data-slot="toast"]')!;

it("shows the toast at the top center, 16px under the offset the app sets", async () => {
  document.documentElement.style.setProperty("--toast-viewport-top", `${HEADER_BOTTOM}px`);
  renderProvider();
  toast.success("Channel settings saved.");
  const title = await screen.findByText("Channel settings saved.");
  const root = toastOf(title);
  await waitFor(() => expect(root.hasAttribute("data-starting-style")).toBe(false));
  await waitFor(() => expect(root.getBoundingClientRect().top).toBeCloseTo(HEADER_BOTTOM + 16, 0));
  const box = root.getBoundingClientRect();
  expect(Math.abs(box.left + box.width / 2 - window.innerWidth / 2)).toBeLessThanOrEqual(0.5);
});

it("without an offset, the toast sits 16px from the top of the window", async () => {
  renderProvider();
  toast.success("Channel settings saved.");
  const root = toastOf(await screen.findByText("Channel settings saved."));
  await waitFor(() => expect(root.getBoundingClientRect().top).toBeCloseTo(16, 0));
});

it("a later toast replaces the earlier one, which doesn't come back", async () => {
  renderProvider();
  toast.success("Channel settings saved.");
  await screen.findByText("Channel settings saved.");
  const second = toast.info("Wug no longer follows this thread.");
  await screen.findByText("Wug no longer follows this thread.");
  await waitFor(() => expect(screen.queryByText("Channel settings saved.")).toBeNull());
  toast.dismiss(second);
  await waitFor(() => expect(document.querySelector('[data-slot="toast"]')).toBeNull());
});

it("a hand-built toast list replaces too", async () => {
  const manager = createToastManager();
  function List() {
    const { toasts } = useToastManager();
    return toasts.map((item) => (
      <ToastRoot key={item.id} toast={item}>
        <ToastContent>
          <ToastBody>
            <ToastTitle />
          </ToastBody>
        </ToastContent>
      </ToastRoot>
    ));
  }
  render(
    <ThemeProvider>
      <ToastProvider toastManager={manager} timeout={0} renderViewport={false}>
        <ToastViewport>
          <List />
        </ToastViewport>
      </ToastProvider>
    </ThemeProvider>,
  );
  manager.add({ title: "Link copied." });
  await screen.findByText("Link copied.");
  manager.add({ title: "Moved to #design." });
  await screen.findByText("Moved to #design.");
  await waitFor(() => expect(screen.queryByText("Link copied.")).toBeNull());
});

it("shows no Dismiss by default, even with an action", async () => {
  renderProvider();
  toast.success("Moved to #design.", { action: { label: "View" } });
  const root = toastOf(await screen.findByText("Moved to #design."));
  expect(root.querySelector('[data-slot="toast-action"]')).not.toBeNull();
  expect(root.querySelector('[data-slot="toast-close"]')).toBeNull();
  expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
});

async function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function swipe(root: HTMLElement, dy: number) {
  const box = root.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  await touch("touchStart", x, y);
  for (let step = 1; step <= 8; step++) {
    await touch("touchMove", x, y + (dy * step) / 8);
    await wait(16);
  }
  await touch("touchEnd", x, y + dy);
}

for (const [name, dy, closes] of [
  ["up closes it", -60, true],
  ["down doesn't", 60, false],
] as const) {
  it(`on a phone, a swipe ${name}`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(390, 844);
    await (
      await cdp()
    ).send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
    document.documentElement.style.setProperty("--toast-viewport-top", `${HEADER_BOTTOM}px`);
    renderProvider();
    toast.success("Channel settings saved.");
    const root = toastOf(await screen.findByText("Channel settings saved."));
    await waitFor(() => expect(root.hasAttribute("data-starting-style")).toBe(false));
    await swipe(root, dy);
    if (closes) {
      await waitFor(() => expect(root.getAttribute("data-swipe-direction")).toBe("up"));
      await waitFor(() => expect(screen.queryByText("Channel settings saved.")).toBeNull());
    } else {
      await wait(400);
      expect(screen.queryByText("Channel settings saved.")).not.toBeNull();
    }
  });
}
