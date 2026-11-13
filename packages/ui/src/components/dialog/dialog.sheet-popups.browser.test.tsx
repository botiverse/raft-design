import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useMemo, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { SheetPopupBoundary } from "../../lib/popup-boundary";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../combobox/combobox";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "../drawer/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../select/select";
import { PanelHeader, PanelHeaderContent, PanelTitle } from "../panel/index";
import { ScrollArea } from "../scroll-area/scroll-area";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { DialogSheetContent } from "./dialog-sheet";

// A popup opened in a sheet stays in the sheet, under its head, while one
// side of its field has room for it (dialog.md, "Popups in a sheet";
// drawer.md#behavior). Base UI's default collision
// boundary is the window, so in a sheet shortened by the on-screen keyboard a
// select list flipped upward over the head and past the sheet's top edge.
// Measured in a real browser at an iPhone's 390 x 844.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// The sheet slides up over 240ms; measure where it rests.
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

const OPTIONS = Array.from({ length: 12 }, (_, index) => `Option ${index + 1}`);

type Container = RefObject<HTMLElement | null>;

function Picker({ label, container }: { label: string; container?: Container }) {
  const portalProps = useMemo(() => (container ? { container } : undefined), [container]);
  return (
    <Select defaultValue="Option 1">
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent data-testid={`${label}-list`} portalProps={portalProps}>
        <SelectList>
          {OPTIONS.map((option) => (
            <SelectItem key={option} value={option}>
              <SelectItemText>{option}</SelectItemText>
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </Select>
  );
}

function Search({ label, container }: { label: string; container?: Container }) {
  const portalProps = useMemo(() => (container ? { container } : undefined), [container]);
  return (
    <Combobox items={OPTIONS}>
      <ComboboxControl>
        <ComboboxInput aria-label={label} />
      </ComboboxControl>
      <ComboboxContent data-testid={`${label}-list`} portalProps={portalProps}>
        <ComboboxList>
          {(option: string) => (
            <ComboboxItem key={option} value={option}>
              {option}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** A form taller than the sheet: a field at the top, two in the middle, one at the end. */
function Fields({ container }: { container?: Container }) {
  return (
    <>
      <Picker label="First" container={container} />
      <div style={{ height: 40 }} />
      <Search label="Second" container={container} />
      <div style={{ height: 40 }} />
      <Picker label="Third" container={container} />
      <div style={{ height: 40 }} />
      <Picker label="Last" container={container} />
    </>
  );
}

// As tall as the keyboard leaves a sheet on a phone (useSheetKeyboardBox sets
// the same box): a list that opens upward has the head, not room, above it.
const KEYBOARD_BOX = { top: "auto", height: 380 } as const;

function SheetForm({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogSheetContent data-testid="sheet" style={KEYBOARD_BOX}>
          <DialogHeader data-testid="head">
            <DialogTitle>Create Agent</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody data-testid="body">{children}</DialogBody>
        </DialogSheetContent>
      </Dialog>
    </ThemeProvider>
  );
}

// DialogContent docked to the bottom as a sheet of the app's own.
const OWN_SHEET = {
  top: "auto",
  bottom: 0,
  left: 0,
  width: "100%",
  maxWidth: "none",
  height: 380,
  translate: "none",
} as const;

/**
 * A sheet an app draws itself: a sticky PanelHeader over a ScrollArea, its
 * lists portaled into the form inside the ScrollArea. The area is a stacking
 * context of its own, so a list that reaches the head is drawn under it.
 */
function OwnSheetForm() {
  const head = useRef<HTMLDivElement | null>(null);
  const form = useRef<HTMLFormElement | null>(null);
  return (
    <ThemeProvider>
      <Dialog open>
        <DialogContent data-testid="sheet" style={OWN_SHEET}>
          <SheetPopupBoundary head={head}>
            <PanelHeader ref={head} data-testid="head">
              <PanelHeaderContent>
                <PanelTitle render={<DialogTitle />}>Create Agent</PanelTitle>
              </PanelHeaderContent>
            </PanelHeader>
            <ScrollArea className="min-h-0 flex-1" contentClassName="p-4">
              <form ref={form}>
                <Fields container={form} />
              </form>
            </ScrollArea>
          </SheetPopupBoundary>
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}

function DrawerForm({ children, fill }: { children: ReactNode; fill: number }) {
  return (
    <ThemeProvider>
      <Drawer open>
        <DrawerContent data-testid="sheet">
          <DrawerHeader data-testid="head">
            <DrawerTitle>Create Agent</DrawerTitle>
          </DrawerHeader>
          <DrawerBody data-testid="body">
            <div style={{ height: fill }} />
            {children}
            <div style={{ height: 120 }} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ThemeProvider>
  );
}

async function open(label: string) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  const trigger = screen.getByRole("combobox", { name: label });
  trigger.scrollIntoView({ block: "nearest" });
  await userEvent.click(trigger);
  const list = await screen.findByTestId(`${label}-list`);
  // Base UI places the popup a frame or two after it mounts.
  await waitFor(() => expect(list.getBoundingClientRect().height).toBeGreaterThan(40));
  await settle();
  return list;
}

async function close() {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
}

/** The sheet's area under its head, in window coordinates. */
function areaUnderHead() {
  const head = screen.getByTestId("head").getBoundingClientRect();
  const sheet = screen.getByTestId("sheet").getBoundingClientRect();
  return { top: head.bottom, bottom: sheet.bottom, left: sheet.left, right: sheet.right };
}

/** The list is inside the sheet under its head, and its first and middle rows can be pressed. */
function expectInSheet(list: HTMLElement) {
  const area = areaUnderHead();
  const box = list.getBoundingClientRect();
  expect(box.top, "the list starts under the head").toBeGreaterThanOrEqual(area.top);
  expect(box.bottom, "the list ends inside the sheet").toBeLessThanOrEqual(area.bottom);
  expect(box.left).toBeGreaterThanOrEqual(area.left);
  expect(box.right).toBeLessThanOrEqual(area.right);
  const x = box.left + box.width / 2;
  for (const y of [box.top + 12, box.top + box.height / 2]) {
    const hit = document.elementFromPoint(x, y);
    expect(list.contains(hit), `the list is on top at y=${Math.round(y)}`).toBe(true);
  }
}

for (const label of ["First", "Second", "Third", "Last"]) {
  it(`a phone sheet keeps the ${label.toLowerCase()} field's list under its head`, async () => {
    await setViewport(390, 844);
    render(
      <SheetForm>
        <Fields />
      </SheetForm>,
    );
    await screen.findByRole("dialog");
    await settle();
    expectInSheet(await open(label));
    await close();
  });
}

it("a bottom sheet keeps a list under its head", async () => {
  await setViewport(390, 844);
  render(
    <DrawerForm fill={160}>
      <Picker label="Field" />
    </DrawerForm>,
  );
  await screen.findByRole("dialog");
  await settle();
  expect(screen.getByTestId("body").getBoundingClientRect().height).toBeGreaterThanOrEqual(320);
  expectInSheet(await open("Field"));
  await close();
});

for (const label of ["First", "Second", "Third", "Last"]) {
  it(`an app's own sheet keeps the ${label.toLowerCase()} field's list, portaled into its scrolling body, under its head`, async () => {
    await setViewport(390, 844);
    render(<OwnSheetForm />);
    await screen.findByRole("dialog");
    await settle();
    const list = await open(label);
    expect(screen.getByTestId("sheet").contains(list)).toBe(true);
    expectInSheet(list);
    await close();
  });
}

// A list needs about four rows (150px) on one side of its field. With less
// both above and below it, the sheet stops bounding the list, which would
// show a row or two there, and it opens over the head at its full height.
function expectOverHead(list: HTMLElement, field: HTMLElement) {
  const area = areaUnderHead();
  const fieldBox = field.getBoundingClientRect();
  expect(fieldBox.top - area.top, "room above the field").toBeLessThan(150);
  expect(area.bottom - fieldBox.bottom, "room below the field").toBeLessThan(150);
  const box = list.getBoundingClientRect();
  expect(box.height).toBeGreaterThanOrEqual(256);
  expect(box.top).toBeLessThan(area.top);
  const x = box.left + box.width / 2;
  for (const y of [box.top + 12, box.top + box.height / 2]) {
    expect(list.contains(document.elementFromPoint(x, y)), `on top at y=${Math.round(y)}`).toBe(
      true,
    );
  }
}

it("a short bottom sheet, under four rows on either side of the field: the list opens over the head, at its full height", async () => {
  await setViewport(390, 844);
  render(
    <DrawerForm fill={12}>
      <Picker label="Field" />
    </DrawerForm>,
  );
  await screen.findByRole("dialog");
  await settle();
  const list = await open("Field");
  expectOverHead(list, screen.getByRole("combobox", { name: "Field", hidden: true }));
  await close();
});

// The keyboard is emulated by shortening the sheet to 380px, as
// useSheetKeyboardBox does: 324px under the head, the field in the middle of it.
it("a field in the middle of a phone sheet the keyboard has shortened, under four rows on either side: the list opens over the head", async () => {
  await setViewport(390, 844);
  render(
    <SheetForm>
      <div style={{ height: 120 }} />
      <Picker label="Field" />
    </SheetForm>,
  );
  await screen.findByRole("dialog");
  await settle();
  const list = await open("Field");
  expectOverHead(list, screen.getByRole("combobox", { name: "Field", hidden: true }));
  await close();
});

// A dialog at layer={1} (opened from another React tree, over a dialog it
// can't nest in) had its card and scrim at z-dialog-layer (60); a list opened
// from it is portaled beside them at z-popup (50) and was drawn under both.
it("a list opened from a layer={1} dialog is drawn over its card and its scrim", async () => {
  await setViewport(390, 844);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent layer={1} data-testid="sheet">
          <DialogTitle>Create Agent</DialogTitle>
          <Picker label="Field" />
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  const portal = screen.getByTestId("sheet").closest<HTMLElement>("[data-slot=dialog-portal]")!;
  expect(getComputedStyle(portal).zIndex).toBe("60");

  const list = await open("Field");
  const box = list.getBoundingClientRect();
  const x = box.left + box.width / 2;
  for (const y of [box.top + 12, box.top + box.height / 2, box.bottom - 12]) {
    expect(list.contains(document.elementFromPoint(x, y)), `on top at y=${Math.round(y)}`).toBe(
      true,
    );
  }
  await close();
});
