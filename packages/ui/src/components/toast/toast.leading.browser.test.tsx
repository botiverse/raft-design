import "./toast.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar } from "../avatar/avatar";
import { toast, ToastProvider } from "./toast";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  toast.dismiss();
  cleanup();
});

function center(rect: DOMRect) {
  return rect.top + rect.height / 2;
}

async function showLeadingToast(title: string, description?: string) {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} />
    </ThemeProvider>,
  );
  toast.info(title, {
    description,
    leading: <Avatar size="xs" type="agent" data-testid="leading-avatar" />,
  });
  const titleNode = await screen.findByText(title);
  const avatar = await screen.findByTestId("leading-avatar");
  const content = titleNode.closest<HTMLElement>('[data-slot="toast-content"]')!;
  // Measure after the enter transition: it scales the toast from 0.98.
  await waitFor(() => {
    expect(avatar.getBoundingClientRect().width).toBe(avatar.offsetWidth);
  });
  return { titleNode, avatar, content };
}

// An xs avatar (19px) in the 20px ToastIcon box keeps its own size, and its
// placeholder glyph keeps the avatar's xs scale instead of ToastIcon's 16px
// svg rule.
it("a leading avatar keeps its xs size and glyph inside ToastIcon", async () => {
  const { avatar } = await showLeadingToast("Bugen finished reviewing #25.");
  const rect = avatar.getBoundingClientRect();
  expect(rect.width).toBe(19);
  expect(rect.height).toBe(19);

  const glyph = avatar.querySelector("svg")!;
  expect(glyph.getBoundingClientRect().width).toBe(12);
});

// Title-only: the avatar sits on the title's line, centred with it, at the
// content's leading padding.
it("a leading avatar is centred on a single-line title", async () => {
  const { titleNode, avatar, content } = await showLeadingToast("Bugen finished reviewing #25.");
  const a = avatar.getBoundingClientRect();
  const t = titleNode.getBoundingClientRect();
  expect(Math.abs(center(a) - center(t))).toBeLessThanOrEqual(0.5);

  const c = content.getBoundingClientRect();
  expect(a.left - c.left).toBeGreaterThanOrEqual(16);
  expect(a.left - c.left).toBeLessThanOrEqual(17);
  expect(a.right).toBeLessThan(t.left);
});

// With a description the icon column goes to the top, so the avatar stays
// on the title's line instead of drifting to the middle of two lines.
it("with a description a leading avatar stays on the title line", async () => {
  const { titleNode, avatar } = await showLeadingToast(
    "Bugen finished reviewing #25.",
    "Two comments need your reply.",
  );
  const a = avatar.getBoundingClientRect();
  const t = titleNode.getBoundingClientRect();
  expect(Math.abs(center(a) - center(t))).toBeLessThanOrEqual(0.5);
});
