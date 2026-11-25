import "./panel-header.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Dialog, DialogTitle } from "../dialog/dialog";
import { DialogSheetContent } from "../dialog/dialog-sheet";
import { Drawer, DrawerContent } from "../drawer/drawer";
import {
  ConversationPanelContent,
  ConversationPanelFooter,
  ConversationPanelRoot,
} from "../conversation-panel/conversation-panel";
import {
  ThreadPanelContent,
  ThreadPanelFooter,
  ThreadPanelHeader,
  ThreadPanelRoot,
} from "../thread-panel/thread-panel";
import { Panel, PanelBody, PanelFooter } from "./panel";
import { PanelHeader, PanelTitle } from "./panel-header";

// A sheet is one `layer-popover` surface from the grab handle down, with only
// a `line-seam` under its head (drawer.md, "DrawerContent"). A Panel inside it
// paints the sheet's surface: its root, PanelHeader and PanelFooter, which
// beside the page paint `layer-canvas`. In dark mode canvas is darker than
// popover, and the head read as a band between the handle and the list
// (artin, 2026-11-25, #proj-workspace:f6de4a2b; slock #16883). Measured in
// dark mode, where the two differ, in a real browser at a phone's 390px.

const it = test.skipIf(typeof window === "undefined");

async function setViewport(width: number, height: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, height);
}

// A sheet slides in over 240ms.
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  await setViewport(414, 896);
});

function SheetPanel() {
  return (
    <Panel data-testid="panel">
      <PanelHeader data-testid="head">
        <PanelTitle>Comments</PanelTitle>
      </PanelHeader>
      <PanelBody>
        <p>A comment.</p>
      </PanelBody>
      <PanelFooter data-testid="foot">Reply</PanelFooter>
    </Panel>
  );
}

const background = (element: Element) => getComputedStyle(element).backgroundColor;
const parts = () => ["panel", "head", "foot"].map((id) => background(screen.getByTestId(id)));

/** The colours `layer-popover` and `layer-canvas` resolve to in dark mode. */
function darkSurfaces() {
  const probe = (className: string) => {
    const element = document.createElement("div");
    element.className = `dark ${className}`;
    document.body.append(element);
    const color = background(element);
    element.remove();
    return color;
  };
  return { popover: probe("bg-layer-popover"), canvas: probe("bg-layer-canvas") };
}

function Dark({ children }: { children: ReactNode }) {
  return <ThemeProvider mode="dark">{children}</ThemeProvider>;
}

it("in dark mode the two surfaces differ, so the tests below can tell them apart", async () => {
  await setViewport(390, 844);
  const { popover, canvas } = darkSurfaces();
  expect(popover).not.toBe(canvas);
});

it("inside a bottom sheet (DrawerContent) the panel, its head and its foot paint the sheet's popover", async () => {
  await setViewport(390, 844);
  render(
    <Dark>
      <Drawer open>
        <DrawerContent aria-label="Comments">
          <SheetPanel />
        </DrawerContent>
      </Drawer>
    </Dark>,
  );
  await settle();
  const sheet = background(document.querySelector("[data-slot=drawer-popup]") as Element);
  expect(sheet).toBe(darkSurfaces().popover);
  expect(parts()).toEqual([sheet, sheet, sheet]);
});

it("inside a dialog's phone sheet (DialogSheetContent) the panel paints the sheet's popover", async () => {
  await setViewport(390, 844);
  render(
    <Dark>
      <Dialog open>
        <DialogSheetContent>
          <DialogTitle className="sr-only">Comments</DialogTitle>
          <SheetPanel />
        </DialogSheetContent>
      </Dialog>
    </Dark>,
  );
  await settle();
  const sheet = background(document.querySelector("[data-slot=dialog-content]") as Element);
  expect(sheet).toBe(darkSurfaces().popover);
  expect(parts()).toEqual([sheet, sheet, sheet]);
});

it("beside the page the panel, its head and its foot keep the column's canvas", async () => {
  await setViewport(390, 844);
  render(
    <Dark>
      <SheetPanel />
    </Dark>,
  );
  const { canvas } = darkSurfaces();
  expect(parts()).toEqual([canvas, canvas, canvas]);
});

// A conversation in a sheet (Ottie's phone sheet) stays on canvas, its
// messages and composer drawn for it; only its head takes the sheet's surface
// (panel.md, Rules). Without the exception the composer became a popover band
// under a canvas list.
it("inside a bottom sheet a conversation keeps canvas, and only its head takes the sheet's popover", async () => {
  await setViewport(390, 844);
  render(
    <Dark>
      <Drawer open>
        <DrawerContent aria-label="Ottie">
          <ConversationPanelRoot data-testid="panel">
            <PanelHeader data-testid="head">
              <PanelTitle>Ottie</PanelTitle>
            </PanelHeader>
            <ConversationPanelContent>
              <p>A message.</p>
              <ConversationPanelFooter data-testid="foot">Composer</ConversationPanelFooter>
            </ConversationPanelContent>
          </ConversationPanelRoot>
        </DrawerContent>
      </Drawer>
    </Dark>,
  );
  await settle();
  const { popover, canvas } = darkSurfaces();
  expect(parts()).toEqual([canvas, popover, canvas]);
});

// A thread is a conversation too: in a sheet its root and footer keep canvas,
// and its head (ThreadPanelHeader, not a PanelHeader) takes the sheet's
// popover, like ConversationPanel's (panel.md, Rules).
it("inside a bottom sheet a thread keeps canvas, and only its head takes the sheet's popover", async () => {
  await setViewport(390, 844);
  render(
    <Dark>
      <Drawer open>
        <DrawerContent aria-label="Thread">
          <ThreadPanelRoot data-testid="panel">
            <ThreadPanelHeader data-testid="head">Thread</ThreadPanelHeader>
            <ThreadPanelContent>
              <p>A reply.</p>
            </ThreadPanelContent>
            <ThreadPanelFooter data-testid="foot">Composer</ThreadPanelFooter>
          </ThreadPanelRoot>
        </DrawerContent>
      </Drawer>
    </Dark>,
  );
  await settle();
  const { popover, canvas } = darkSurfaces();
  expect(parts()).toEqual([canvas, popover, canvas]);
});
