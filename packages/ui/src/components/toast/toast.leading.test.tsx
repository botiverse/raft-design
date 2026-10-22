/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar } from "../avatar/avatar";
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

async function iconOf(title: string) {
  // An error toast is also announced in a live region, so match the title.
  const titleNode = await screen.findByText(title, { selector: '[data-slot="toast-title"]' });
  const content = titleNode.closest<HTMLElement>('[data-slot="toast-content"]');
  expect(content, "toast content element must exist").not.toBeNull();
  return content!.querySelector<HTMLElement>('[data-slot="toast-icon"]');
}

function renderProvider() {
  render(
    <ThemeProvider>
      <ToastProvider />
    </ThemeProvider>,
  );
}

test("leading renders in ToastIcon, hidden from assistive technology, in place of the intent icon", async () => {
  renderProvider();
  toast.info("Bugen finished reviewing #25.", {
    leading: <Avatar size="xs" type="agent" data-testid="leading-avatar" />,
  });

  const icon = await iconOf("Bugen finished reviewing #25.");
  expect(icon).not.toBeNull();
  expect(icon!.getAttribute("aria-hidden")).toBe("true");
  expect(icon!.contains(screen.getByTestId("leading-avatar"))).toBe(true);
  expect(icon!.querySelector(".lucide-info")).toBeNull();
  expect(icon!.parentElement!.hasAttribute("data-has-icon")).toBe(true);
});

test("leading shows even when icon is false", async () => {
  renderProvider();
  toast.success("Mira joined #design.", {
    icon: false,
    leading: <Avatar size="xs" type="human" data-testid="leading-avatar" />,
  });

  const icon = await iconOf("Mira joined #design.");
  expect(icon?.contains(screen.getByTestId("leading-avatar"))).toBe(true);
});

// A notice leads with its intent's icon, never a status light that says
// what kind of notice it is (status.md#sizes).
test.each([
  ["success", "lucide-circle-check"],
  ["info", "lucide-info"],
  ["warning", "lucide-triangle-alert"],
  ["error", "lucide-triangle-alert"],
] as const)("a %s toast leads with its icon, not a status light", async (intent, icon) => {
  renderProvider();
  toast[intent](`A ${intent} toast.`);
  const slot = await iconOf(`A ${intent} toast.`);
  expect(slot!.querySelector(`svg.${icon}`)?.getAttribute("aria-hidden")).toBe("true");
  expect(slot!.querySelector('[data-slot="status"]')).toBeNull();
});

test("without leading the icon slot renders the intent icon exactly as before", async () => {
  renderProvider();
  toast.info("3 links copied.");
  const plain = await iconOf("3 links copied.");
  const plainHtml = plain!.outerHTML;
  expect(plain!.hasAttribute("aria-hidden")).toBe(false);
  expect(plain!.querySelector("svg.lucide-info")).not.toBeNull();
  toast.dismiss();
  cleanup();

  for (const leading of [undefined, null, false] as const) {
    renderProvider();
    toast.info("3 links copied.", { leading });
    const icon = await iconOf("3 links copied.");
    expect(icon!.outerHTML).toBe(plainHtml);
    toast.dismiss();
    cleanup();
  }
});

test("icon false without leading still drops the icon slot", async () => {
  renderProvider();
  toast.info("Saved.", { icon: false });
  expect(await iconOf("Saved.")).toBeNull();
});
