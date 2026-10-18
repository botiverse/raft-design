/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  toast,
  ToastBody,
  ToastContent,
  ToastDescription,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  useToastManager,
} from "./toast";

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
    <ThemeProvider>
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
 * (measured at ~55ms per text-node change on a 300-message channel, #386).
 * `ToastContent` now measures the rendered DOM after layout and reflects
 * `data-has-icon` / `data-has-description` / `data-has-actions` onto itself.
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

/**
 * Hand-written compositions render through their own list; both cases below are
 * exactly where a children-scan would disagree with the old `:has()`:
 * a part wrapped in another component is still found through the DOM, and a
 * `<ToastDescription />` that renders nothing (no description on the toast)
 * does not count.
 */
function ManualToastList({ wrapDescription = false }: { wrapDescription?: boolean }) {
  const { toasts } = useToastManager();
  const WrappedDescription = () => <ToastDescription />;
  return toasts.map((toastObject) => (
    <ToastRoot key={toastObject.id} toast={toastObject}>
      <ToastContent data-testid="manual-content">
        <ToastBody>
          <ToastTitle />
          {wrapDescription ? <WrappedDescription /> : <ToastDescription />}
        </ToastBody>
      </ToastContent>
    </ToastRoot>
  ));
}

async function renderManualToast(
  title: string,
  options: Parameters<typeof toast.success>[1],
  wrapDescription = false,
) {
  render(
    <ThemeProvider>
      <ToastProvider renderViewport={false}>
        <ManualToastList wrapDescription={wrapDescription} />
      </ToastProvider>
    </ThemeProvider>,
  );
  act(() => {
    toast.success(title, options);
  });
  return await screen.findByTestId("manual-content");
}

test("manual composition: a wrapped description is detected through the DOM", async () => {
  const content = await renderManualToast("Wrapped", { description: "Present." }, true);
  expect(content.hasAttribute("data-has-description")).toBe(true);
});

test("manual composition: a description part that renders nothing does not count", async () => {
  const content = await renderManualToast("No description", undefined);
  expect(content.hasAttribute("data-has-description")).toBe(false);
});
