import "./dialog.test.css";
import { afterAll, afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../alert-dialog/alert-dialog";
import { Button } from "../button/index";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogSheetBack,
  DialogTitle,
} from "./dialog";
import { DialogCommit, DialogSheetContent } from "./dialog-sheet";

// Dialog on a phone (dialog.md, "On a phone"): below 768px a dialog with
// several fields, a long list or steps (DialogSheetContent) is a sheet docked
// to the bottom, 90% of the screen tall. Its head is a pushed page's head: ×
// at the start, the title, the commit button at the end. It has no footer,
// and its body scrolls under the head. A confirmation (DialogContent) stays
// centred. Measured in a real browser at an iPhone's 390px.

const it = test.skipIf(typeof window === "undefined");

async function setWidth(width: number, height = 844) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The sheet slides up over 240ms; measure where it rests.
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setWidth(414, 896);
});

function CreateChannel({
  onSubmit,
  rows = 3,
  onOpenChange,
  formId,
}: {
  formId?: string;
  onSubmit?: () => void;
  rows?: number;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <ThemeProvider>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogClose />
          </DialogHeader>
          {/* The head is outside the form: in the sheet the commit button is
              tied back to it with the `form` attribute. */}
          <form
            id={formId}
            className="contents"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit?.();
            }}
          >
            <DialogBody data-testid="body" className="grid gap-4">
              {Array.from({ length: rows }, (_, index) => (
                <label key={index} className="grid gap-1">
                  Field {index + 1}
                  <input name={`field-${index}`} />
                </label>
              ))}
            </DialogBody>
            <DialogFooter data-testid="footer">
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              <DialogCommit type="submit" variant="primary">
                Create Channel
              </DialogCommit>
            </DialogFooter>
          </form>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>
  );
}

const popup = () => document.querySelector("[data-slot=dialog-content]") as HTMLElement;

it("docks to the bottom, full width, 90% of the screen tall", async () => {
  await setWidth(390);
  render(<CreateChannel />);
  await settle();
  const box = popup().getBoundingClientRect();
  expect(box.left).toBe(0);
  expect(box.width).toBe(390);
  expect(Math.round(box.bottom)).toBe(window.innerHeight);
  expect(box.height).toBeCloseTo(window.innerHeight * 0.9, 0);
  // The top corners are rounded, the bottom ones are not.
  const style = getComputedStyle(popup());
  expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0);
  expect(parseFloat(style.borderBottomLeftRadius)).toBe(0);
});

it("has a pushed page's head: × at the start, the title, the commit button at the end", async () => {
  await setWidth(390);
  render(<CreateChannel />);
  await settle();
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;
  const close = screen.getByRole("button", { name: "Close" });
  const title = screen.getByRole("heading", { name: "Create Channel" });
  const commit = screen.getByRole("button", { name: "Create Channel" });
  const headBox = head.getBoundingClientRect();
  expect(headBox.height).toBe(56);
  expect(headBox.top).toBe(popup().getBoundingClientRect().top);
  expect(head.contains(commit)).toBe(true);
  // × is first in the DOM, so every browser reads and tabs it first.
  expect(head.firstElementChild).toBe(close);
  const closeBox = close.getBoundingClientRect();
  const titleBox = title.getBoundingClientRect();
  const commitBox = commit.getBoundingClientRect();
  expect(closeBox.right).toBeLessThanOrEqual(titleBox.left);
  expect(titleBox.right).toBeLessThanOrEqual(commitBox.left);
  // The × icon box sits on the 16px margin; the filled button ends on it.
  const icon = close.querySelector("svg") as SVGElement;
  expect(Math.round(icon.getBoundingClientRect().left)).toBe(16);
  expect(Math.round(commitBox.right)).toBe(390 - 16);
  // The commit button is the footer's at size sm.
  expect(commitBox.height).toBeLessThan(40);
});

it("has no footer: × is Cancel", async () => {
  await setWidth(390);
  render(<CreateChannel />);
  await settle();
  const footer = screen.getByTestId("footer");
  expect(getComputedStyle(footer).display).toBe("none");
  expect(screen.queryByRole("button", { name: "Cancel" })).toBeNull();
});

it("submits its form from the head", async () => {
  await setWidth(390);
  const onSubmit = vi.fn();
  render(<CreateChannel formId="create-channel" onSubmit={onSubmit} />);
  await settle();
  const commit = screen.getByRole("button", { name: "Create Channel" }) as HTMLButtonElement;
  // Tied to its form by the form's id: it is still the form's default button.
  expect(commit.form?.id).toBe("create-channel");
  commit.click();
  expect(onSubmit).toHaveBeenCalledTimes(1);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(screen.getByRole("textbox", { name: "Field 1" }));
  await userEvent.keyboard("{Enter}");
  expect(onSubmit).toHaveBeenCalledTimes(2);
});

it("submits a form without an id on a click, without touching the form", async () => {
  await setWidth(390);
  const onSubmit = vi.fn();
  render(<CreateChannel onSubmit={onSubmit} />);
  await settle();
  screen.getByRole("button", { name: "Create Channel" }).click();
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(document.querySelector("form")?.id).toBe("");
});

it("keeps a dialog opened from the sheet its own: a normal head and its footer", async () => {
  await setWidth(390);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Dialog open>
              <DialogContent size="sm">
                <DialogHeader data-testid="inner-head">
                  <DialogTitle>Rename Section</DialogTitle>
                  <DialogClose aria-label="Close rename" />
                </DialogHeader>
                <DialogFooter data-testid="inner-footer">
                  <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                  <DialogCommit variant="primary">Rename</DialogCommit>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DialogBody>
          <DialogFooter>
            <DialogCommit variant="primary">Save</DialogCommit>
          </DialogFooter>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  const innerFooter = screen.getByTestId("inner-footer");
  expect(getComputedStyle(innerFooter).display).not.toBe("none");
  expect(innerFooter.contains(screen.getByRole("button", { name: "Rename" }))).toBe(true);
  expect(innerFooter.contains(screen.getByRole("button", { name: "Cancel" }))).toBe(true);
  const innerHead = screen.getByTestId("inner-head");
  expect(innerHead.hasAttribute("data-sheet")).toBe(false);
  expect(innerHead.getBoundingClientRect().height).not.toBe(56);
  // Its × stays at the end of its head.
  const innerClose = screen.getByRole("button", { name: "Close rename" });
  const innerTitle = screen.getByRole("heading", { name: "Rename Section" });
  expect(innerClose.getBoundingClientRect().left).toBeGreaterThan(
    innerTitle.getBoundingClientRect().right,
  );
  // The sheet's head keeps only its own commit.
  const sheetHead = document.querySelector("[data-slot=dialog-header][data-sheet]") as HTMLElement;
  // (The sheet below is inert while the dialog over it is open.)
  expect(sheetHead.contains(screen.getByRole("button", { name: "Save", hidden: true }))).toBe(true);
  expect(sheetHead.textContent).not.toContain("Rename");
});

it("scrolls its body under the head, on the 16px margin above the home indicator", async () => {
  await setWidth(390);
  render(<CreateChannel rows={30} />);
  await settle();
  const body = screen.getByTestId("body");
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;
  expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
  const style = getComputedStyle(body);
  expect(style.paddingLeft).toBe("16px");
  expect(style.paddingRight).toBe("16px");
  expect(parseFloat(style.paddingBottom)).toBeGreaterThanOrEqual(16);
  body.scrollTop = 400;
  expect(body.scrollTop).toBeGreaterThan(0);
  expect(head.getBoundingClientRect().top).toBe(popup().getBoundingClientRect().top);
  expect(Math.round(body.getBoundingClientRect().bottom)).toBe(window.innerHeight);
});

it("does not close on a tap on the scrim above it", async () => {
  await setWidth(390);
  const onOpenChange = vi.fn();
  render(<CreateChannel onOpenChange={onOpenChange} />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  const scrim = document.querySelector("[data-slot=dialog-overlay]") as HTMLElement;
  await userEvent.click(scrim, { position: { x: 195, y: 20 } });
  expect(onOpenChange).not.toHaveBeenCalled();
});

it("keeps a confirmation centred on a phone", async () => {
  await setWidth(390);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Archive channel?</DialogTitle>
          </DialogHeader>
          <DialogFooter data-testid="footer">
            <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
            <Button variant="danger">Archive</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  const box = popup().getBoundingClientRect();
  expect(box.left).toBe(16);
  expect(box.right).toBe(390 - 16);
  expect(Math.abs(box.top + box.height / 2 - window.innerHeight / 2)).toBeLessThanOrEqual(1);
  expect(getComputedStyle(screen.getByTestId("footer")).display).not.toBe("none");
});

it("stays the centred dialog on a desktop: footer, × at the end", async () => {
  await setWidth(1280, 800);
  render(<CreateChannel />);
  await settle();
  const box = popup().getBoundingClientRect();
  expect(Math.abs(box.left + box.width / 2 - 640)).toBeLessThanOrEqual(1);
  expect(box.width).toBeLessThan(500);
  expect(popup().hasAttribute("data-sheet")).toBe(false);
  const footer = screen.getByTestId("footer");
  expect(getComputedStyle(footer).display).not.toBe("none");
  expect(footer.contains(screen.getByRole("button", { name: "Create Channel" }))).toBe(true);
  const close = screen.getByRole("button", { name: "Close" });
  const title = screen.getByRole("heading", { name: "Create Channel" });
  expect(close.getBoundingClientRect().left).toBeGreaterThan(title.getBoundingClientRect().left);
});

it("moves Next, then the last step's action, into the head of a flow of steps", async () => {
  await setWidth(390);
  function Steps() {
    const [step, setStep] = useState(1);
    const next = useCallback(() => setStep(2), []);
    const back = useCallback(() => setStep(1), []);
    return (
      <ThemeProvider>
        <Dialog open>
          <DialogSheetContent>
            <DialogHeader>
              {step === 2 ? <DialogSheetBack onClick={back} /> : null}
              <DialogTitle>Add Computer</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <DialogBody>Step {step}</DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
              {step === 1 ? (
                <DialogCommit variant="primary" onClick={next}>
                  Next
                </DialogCommit>
              ) : (
                <DialogCommit variant="primary">Connect</DialogCommit>
              )}
            </DialogFooter>
          </DialogSheetContent>
        </Dialog>
      </ThemeProvider>
    );
  }
  render(<Steps />);
  await settle();
  const head = document.querySelector("[data-slot=dialog-header]") as HTMLElement;
  const next = screen.getByRole("button", { name: "Next" });
  expect(head.contains(next)).toBe(true);
  next.click();
  await settle();
  expect(head.contains(screen.getByRole("button", { name: "Connect" }))).toBe(true);
  expect(screen.queryByRole("button", { name: "Next" })).toBeNull();
  // A later step starts the head with Back, where × was.
  const backButton = screen.getByRole("button", { name: "Back" });
  expect(head.firstElementChild).toBe(backButton);
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  backButton.click();
  await settle();
  expect(head.contains(screen.getByRole("button", { name: "Next" }))).toBe(true);
  expect(head.firstElementChild).toBe(screen.getByRole("button", { name: "Close" }));
});

it("draws no Back outside a sheet", async () => {
  await setWidth(1280, 800);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogSheetBack />
            <DialogTitle>Add Computer</DialogTitle>
            <DialogClose />
          </DialogHeader>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
});

it("a dialog opened from the sheet draws its own, lighter scrim", async () => {
  await setWidth(390);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <AlertDialog open>
              <AlertDialogContent>
                <AlertDialogTitle>Discard changes?</AlertDialogTitle>
              </AlertDialogContent>
            </AlertDialog>
          </DialogBody>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  const alphaOf = (element: Element) => {
    const color = getComputedStyle(element).backgroundColor;
    const match = color.match(/\/\s*([0-9.]+)\)|rgba\([^)]*,\s*([0-9.]+)\)/);
    return match ? Number(match[1] ?? match[2]) : 1;
  };
  const sheetScrim = document.querySelector("[data-slot=dialog-overlay]") as Element;
  const confirmScrim = document.querySelector("[data-slot=alert-dialog-overlay]") as Element;
  expect(alphaOf(sheetScrim)).toBeCloseTo(0.651, 2);
  expect(alphaOf(confirmScrim)).toBeCloseTo(0.4, 2);
  expect(
    popup().compareDocumentPosition(confirmScrim) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
