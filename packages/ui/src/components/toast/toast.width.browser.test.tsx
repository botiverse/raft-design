import "./toast.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  toast,
  ToastAction,
  ToastActions,
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

function InlineToasts() {
  const { toasts } = useToastManager();
  return toasts.map((t) => (
    <ToastRoot key={t.id} toast={t} layout="inline" data-testid="toast-row">
      <ToastContent>
        <ToastBody>
          <ToastTitle />
        </ToastBody>
        {t.actionProps?.children ? (
          <ToastActions>
            <ToastAction />
          </ToastActions>
        ) : null}
      </ToastContent>
    </ToastRoot>
  ));
}

it("the toast width token is 26rem", () => {
  render(
    <ThemeProvider>
      <div data-testid="probe" />
    </ThemeProvider>,
  );
  const value = getComputedStyle(screen.getByTestId("probe"))
    .getPropertyValue("--toast-width")
    .trim();
  expect(value).toBe("26rem");
});

// A short receipt, one that just fits and one that wraps: all three are the
// same width (toast-width, capped by the screen), never their text's.
it("toasts on screen together share one width, whatever their text", async () => {
  render(
    <ThemeProvider>
      <ToastProvider timeout={0} renderViewport={false}>
        <ToastViewport placement="bottom-center" data-testid="viewport">
          <InlineToasts />
        </ToastViewport>
      </ToastProvider>
    </ThemeProvider>,
  );
  const undo = { label: "Undo", onClick: () => {} };
  toast.success("Removed Mia from this task's followers.", { action: undo });
  toast.success("Removed Cody from this task's followers.", { action: undo });
  toast.success("Restored Cody as a follower.");
  await waitFor(() => expect(screen.getAllByTestId("toast-row")).toHaveLength(3));
  await waitFor(() => {
    const widths = screen.getAllByTestId("toast-row").map((el) => el.getBoundingClientRect().width);
    const viewport = screen.getByTestId("viewport").getBoundingClientRect().width;
    const expected = Math.min(26 * 16, window.innerWidth - 32);
    expect(viewport).toBeCloseTo(expected, 0);
    for (const width of widths) expect(width).toBeCloseTo(expected, 0);
  });
});
