import "./toast.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { toast, ToastProvider } from "./toast";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  toast.dismiss();
  cleanup();
});

// The leading mark lands on the same inset as the trailing action: the toast
// looks centred around its content (design/foundations/comfort.md, Edges).
it("the status pixel starts on the toast's inset, as far in as the action ends", async () => {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} />
    </ThemeProvider>,
  );
  toast.success("Removed Mia from this task's followers.", { action: { label: "Undo" } });
  const title = await screen.findByText("Removed Mia from this task's followers.");
  const content = title.closest<HTMLElement>('[data-slot="toast-content"]')!;
  const box = content.getBoundingClientRect();
  const icon = content.querySelector<HTMLElement>('[data-slot="toast-icon"]')!;
  const mark = icon.firstElementChild as HTMLElement;
  const action = screen.getByRole("button", { name: "Undo" });
  const leading = mark.getBoundingClientRect().left - box.left;
  const trailing = box.right - action.getBoundingClientRect().right;
  expect(Math.abs(leading - trailing)).toBeLessThanOrEqual(1);
  expect(icon.getBoundingClientRect().width).toBe(mark.getBoundingClientRect().width);
});
