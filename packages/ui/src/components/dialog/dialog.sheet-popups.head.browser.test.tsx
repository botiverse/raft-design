import "./dialog.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import type { ReactNode } from "react";
import { SheetPopupBoundary } from "../../lib/popup-boundary";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerTitle } from "../drawer/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Lightbox, LightboxContent, LightboxTitle, LightboxToolbar } from "../lightbox/lightbox";
import { PanelHeader, PanelHeaderContent, PanelTitle } from "../panel/index";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { DialogSheetContent } from "./dialog-sheet";

// A sheet keeps the popups opened in it under its head (dialog.md, "Popups in
// a sheet"), but not the ones anchored IN the head: a tooltip, a menu or a
// popover on a head button opens upward as it is asked to, over the scrim,
// instead of being pushed down over the sheet's content. Nor the ones in a
// surface opened from the sheet: a lightbox over a sheet keeps to the window.
// And a `layer={1}` dialog whose scrim is given `layer: 1` too keeps its card
// above that scrim. Real layout, a phone's 390 x 844 unless said.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// A sheet slides in over 240ms; measure where it rests.
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

// As tall as the keyboard leaves a sheet on a phone.
const KEYBOARD_BOX = { top: "auto", height: 380 } as const;
const LAYER_1 = { layer: 1 } as const;

type Kind = "tooltip" | "menu" | "popover";

/** A head button with a popup that asks for the side above it. */
function HeadAction({ kind }: { kind: Kind }) {
  if (kind === "tooltip") {
    return (
      <Tooltip open>
        <TooltipTrigger data-testid="anchor">Share</TooltipTrigger>
        <TooltipContent data-testid="popup">Share this agent</TooltipContent>
      </Tooltip>
    );
  }
  if (kind === "menu") {
    return (
      <DropdownMenu open>
        <DropdownMenuTrigger data-testid="anchor">More</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="popup" side="top">
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuItem>Archive</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  return (
    <Popover open>
      <PopoverTrigger data-testid="anchor">Info</PopoverTrigger>
      <PopoverContent data-testid="popup" side="top">
        Agents run on a computer.
      </PopoverContent>
    </Popover>
  );
}

const Filler = () => <div style={{ height: 400 }} />;

function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

function PhoneSheet({ kind }: { kind: Kind }) {
  return (
    <Providers>
      <Dialog open>
        <DialogSheetContent data-testid="sheet" style={KEYBOARD_BOX}>
          <DialogHeader data-testid="head">
            <DialogTitle>Create Agent</DialogTitle>
            <DialogClose />
            <HeadAction kind={kind} />
          </DialogHeader>
          <DialogBody>
            <Filler />
          </DialogBody>
        </DialogSheetContent>
      </Dialog>
    </Providers>
  );
}

function BottomDrawer({ kind }: { kind: Kind }) {
  return (
    <Providers>
      <Drawer open>
        <DrawerContent data-testid="sheet">
          <DrawerHeader data-testid="head">
            <DrawerTitle>Create Agent</DrawerTitle>
            <div>
              <HeadAction kind={kind} />
            </div>
          </DrawerHeader>
          <DrawerBody>
            <Filler />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Providers>
  );
}

const OWN_SHEET = {
  top: "auto",
  bottom: 0,
  left: 0,
  width: "100%",
  maxWidth: "none",
  height: 380,
  translate: "none",
} as const;

/** A sheet an app draws itself, its head inside SheetPopupBoundary: the head is only a ref. */
function OwnSheet({ kind }: { kind: Kind }) {
  const head = useRef<HTMLDivElement | null>(null);
  return (
    <Providers>
      <Dialog open>
        <DialogContent data-testid="sheet" style={OWN_SHEET}>
          <SheetPopupBoundary head={head}>
            <PanelHeader ref={head} data-testid="head">
              <PanelHeaderContent>
                <PanelTitle render={<DialogTitle />}>Create Agent</PanelTitle>
              </PanelHeaderContent>
              <HeadAction kind={kind} />
            </PanelHeader>
            <ScrollArea className="min-h-0 flex-1" contentClassName="p-4">
              <Filler />
            </ScrollArea>
          </SheetPopupBoundary>
        </DialogContent>
      </Dialog>
    </Providers>
  );
}

/** The popup, once Base UI has placed it. */
async function placed() {
  const popup = await screen.findByTestId("popup");
  await waitFor(() => expect(popup.getBoundingClientRect().height).toBeGreaterThan(10));
  await settle();
  return popup;
}

/** The popup is above its anchor, as it asked, and drawn on top. */
function expectAbove(popup: HTMLElement) {
  const anchor = screen.getByTestId("anchor").getBoundingClientRect();
  const box = popup.getBoundingClientRect();
  expect(box.bottom, "the popup ends above its anchor").toBeLessThanOrEqual(anchor.top);
  // A tooltip takes no pointer, so no point of it can be hit.
  if (getComputedStyle(popup).pointerEvents === "none") return;
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(popup.contains(hit), "the popup is on top").toBe(true);
}

const SHEETS = [
  ["a phone sheet's head", PhoneSheet, 390, 844],
  ["a phone bottom sheet's head", BottomDrawer, 390, 844],
  ["a desktop bottom sheet's head, at 1280", BottomDrawer, 1280, 800],
  ["the head of an app's own sheet", OwnSheet, 390, 844],
] as const;

for (const [name, Sheet, width, height] of SHEETS) {
  for (const kind of ["tooltip", "menu", "popover"] as const) {
    it(`a ${kind} on a button in ${name} opens upward`, async () => {
      await setViewport(width, height);
      render(<Sheet kind={kind} />);
      await settle();
      expectAbove(await placed());
    });
  }
}

it("a tooltip in a lightbox opened from a phone sheet opens upward: the sheet under it bounds nothing", async () => {
  await setViewport(390, 844);
  render(
    <Providers>
      <Dialog open>
        <DialogSheetContent data-testid="sheet" style={KEYBOARD_BOX}>
          <DialogHeader data-testid="head">
            <DialogTitle>Create Agent</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <DialogBody>
            <Lightbox open>
              <LightboxContent aria-label="Report preview">
                <LightboxToolbar>
                  <LightboxTitle>report.pdf</LightboxTitle>
                </LightboxToolbar>
                {/* Above the sheet's head, which starts 380px from the bottom. */}
                <div style={{ marginTop: 200 }}>
                  <HeadAction kind="tooltip" />
                </div>
              </LightboxContent>
            </Lightbox>
          </DialogBody>
        </DialogSheetContent>
      </Dialog>
    </Providers>,
  );
  await settle();
  const popup = await placed();
  const head = screen.getByTestId("head").getBoundingClientRect();
  expect(screen.getByTestId("anchor").getBoundingClientRect().bottom).toBeLessThan(head.bottom);
  expectAbove(popup);
});

it("a layer={1} dialog whose scrim is given layer 1 too keeps its card above the scrim", async () => {
  await setViewport(390, 844);
  render(
    <ThemeProvider>
      <Dialog open>
        <DialogContent layer={1} overlay={LAYER_1} data-testid="card">
          <DialogTitle>Create Agent</DialogTitle>
          <button type="button" data-testid="action">
            Create
          </button>
        </DialogContent>
      </Dialog>
    </ThemeProvider>,
  );
  await settle();
  const card = screen.getByTestId("card");
  const box = screen.getByTestId("action").getBoundingClientRect();
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  expect(card.contains(hit), "a press on the card reaches the card").toBe(true);
  const portal = card.closest<HTMLElement>("[data-slot=dialog-portal]")!;
  expect(getComputedStyle(portal).zIndex).toBe("60");
});
