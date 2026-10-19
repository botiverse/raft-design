import "./dialog.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../alert-dialog/alert-dialog";
import { Drawer, DrawerContent, DrawerTitle } from "../drawer/drawer";
import { Dialog, DialogContent, DialogTitle } from "./dialog";

// Every modal surface puts a scrim directly under itself. One opened from
// another (a dialog from a sheet, a confirm from a dialog) gets the lighter
// nested scrim, so the surface below steps back without the page going black.
// Base UI draws no backdrop for a nested dialog on its own, which left a white
// dialog on an undimmed white sheet. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function alphaOf(element: Element | null) {
  expect(element, "the scrim must be in the page").not.toBeNull();
  const color = getComputedStyle(element as Element).backgroundColor;
  const match = color.match(/\/\s*([0-9.]+)\)|rgba\([^)]*,\s*([0-9.]+)\)/);
  return match ? Number(match[1] ?? match[2]) : 1;
}

const scrims = (slot: string) => document.querySelectorAll(`[data-slot=${slot}]`);

it("a dialog alone has the full scrim", async () => {
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent>
          <DialogTitle>Rename</DialogTitle>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(scrims("dialog-overlay")).toHaveLength(1);
  expect(alphaOf(scrims("dialog-overlay")[0])).toBeCloseTo(0.651, 2);
});

it("a dialog opened from a sheet has its own, lighter scrim over the sheet", async () => {
  render(
    <ThemeProvider>
      <Drawer open swipeDirection="right">
        <DrawerContent>
          <DrawerTitle>Channel settings</DrawerTitle>
          <Dialog open>
            <DialogContent>
              <DialogTitle>Archive channel?</DialogTitle>
            </DialogContent>
          </Dialog>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(scrims("drawer-overlay")).toHaveLength(1);
  const nested = scrims("dialog-overlay");
  expect(nested).toHaveLength(1);
  expect(alphaOf(nested[0])).toBeCloseTo(0.4, 2);
  // It sits between the sheet and the dialog.
  const sheet = document.querySelector("[data-slot=drawer-popup]") as Element;
  expect(sheet.compareDocumentPosition(nested[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});

it("a confirm opened from a dialog has the lighter scrim too", async () => {
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <AlertDialog open>
            <AlertDialogContent>
              <AlertDialogTitle>Discard changes?</AlertDialogTitle>
            </AlertDialogContent>
          </AlertDialog>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(alphaOf(scrims("dialog-overlay")[0])).toBeCloseTo(0.651, 2);
  const nested = scrims("alert-dialog-overlay");
  expect(nested).toHaveLength(1);
  expect(alphaOf(nested[0])).toBeCloseTo(0.4, 2);
});
