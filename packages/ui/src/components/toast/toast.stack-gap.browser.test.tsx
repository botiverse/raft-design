import "./toast.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  toast,
  ToastBody,
  ToastContent,
  ToastProvider,
  ToastRoot,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from "./toast";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  toast.dismiss();
  cleanup();
});

// A product that lists its toasts in the viewport (layout="inline") instead
// of the default stack.
function InlineToasts() {
  const { toasts } = useToastManager();
  return toasts.map((t) => (
    <ToastRoot key={t.id} toast={t} layout="inline" data-testid="toast-row">
      <ToastContent>
        <ToastBody>
          <ToastTitle />
        </ToastBody>
      </ToastContent>
    </ToastRoot>
  ));
}

it("the stack gap token is 8px", () => {
  render(
    <ThemeProvider>
      <div data-testid="probe" />
    </ThemeProvider>,
  );
  const value = getComputedStyle(screen.getByTestId("probe"))
    .getPropertyValue("--toast-stack-gap")
    .trim();
  expect(value).toBe("8px");
});

// Two toasts up at once (an Undo's result over the toast it undid) keep the
// stack gap between them: they never touch or overlap.
it("inline toasts in a viewport are the stack gap apart", async () => {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} renderViewport={false}>
        <ToastViewport placement="bottom-center">
          <InlineToasts />
        </ToastViewport>
      </ToastProvider>
    </ThemeProvider>,
  );
  toast.success("Removed Cody from this thread's followers.");
  toast.success("Restored Cody as a follower.");
  await waitFor(() => expect(screen.getAllByTestId("toast-row")).toHaveLength(2));
  // Measure after the enter transition: it scales the toast from 0.97.
  await waitFor(() => {
    const [first, second] = screen
      .getAllByTestId("toast-row")
      .map((el) => el.getBoundingClientRect());
    expect(second!.top - first!.bottom).toBeCloseTo(8, 0);
  });
});
