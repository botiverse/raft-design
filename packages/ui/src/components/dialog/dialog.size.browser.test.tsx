import "./dialog.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../alert-dialog/alert-dialog";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

// The four sizes step by content (dialog.md#variants): sm 400 a decision, at
// AlertDialog's width; md 448 a small task; lg 640 content that needs width;
// wide 896 a sectioned form. On a narrow screen each is the window less a 16px
// margin on each side. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const sizes = ["sm", "md", "lg", "wide"] as const;

async function renderAt(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
  render(
    <ThemeProvider>
      {sizes.map((size) => (
        <Dialog key={size} open modal={false}>
          <DialogContent size={size} data-testid={size}>
            <DialogTitle>{size}</DialogTitle>
          </DialogContent>
        </Dialog>
      ))}
      <AlertDialog open>
        <AlertDialogContent data-testid="alert">
          <AlertDialogTitle>Delete</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

const widthOf = (testId: string) => screen.getByTestId(testId).getBoundingClientRect().width;

it("each size has its width on a desktop, and sm is AlertDialog's", async () => {
  await renderAt(1280);
  expect(widthOf("sm")).toBe(400);
  expect(widthOf("md")).toBe(448);
  expect(widthOf("lg")).toBe(640);
  expect(widthOf("wide")).toBe(896);
  expect(widthOf("alert")).toBe(widthOf("sm"));
});

it("on a 390px phone every size is the window less 32px", async () => {
  await renderAt(390);
  for (const size of sizes) expect(widthOf(size), size).toBe(358);
  expect(widthOf("alert")).toBe(358);
});
