/**
 * PortalContainerProvider (popover.md, "Rendering in another window"): a part
 * of the app rendered into another document, here an iframe's, standing in
 * for an Electron window opened with `window.open("about:blank")`, gets its
 * overlays in that document. The page's React tree renders the iframe's
 * content with `createPortal`, as the app renders its second window. Every
 * overlay kind mounts in the iframe's document and none in the page's; a press
 * outside closes the ones that close on one; a `container` of the caller's
 * own still wins; an overlay opened inside another nests in that one's portal,
 * as without a provider; and a ToastProvider inside the subtree, on a manager
 * of its own, shows the toasts raised there (useToast) in that document.
 *
 * The presses are dispatched as events made by the iframe's window, the way
 * a press in it arrives: Base UI listens on the popup's own document.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "../components/alert-dialog";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "../components/combobox";
import { ComboboxSelect } from "../components/combobox-select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../components/context-menu";
import { Dialog, DialogContent, DialogTitle } from "../components/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "../components/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { Lightbox, LightboxContent } from "../components/lightbox";
import {
  NotificationCenter,
  NotificationCenterHeader,
  NotificationCenterPopup,
  NotificationCenterTitle,
  NotificationCenterTrigger,
} from "../components/notification-center";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "../components/preview-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";
import { createToastManager, toast, ToastProvider, useToast } from "../components/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { PortalContainerProvider, usePortalContainer } from "./portal-container";

const it = test.skipIf(typeof window === "undefined");

const frames: HTMLIFrameElement[] = [];

afterEach(() => {
  cleanup();
  toast.dismiss();
  for (const frame of frames.splice(0)) frame.remove();
});

/** Another document, laid out: an iframe's, with a body to render into. */
function otherDocument(): Document {
  const frame = document.createElement("iframe");
  frame.style.cssText = "position:fixed;top:0;left:0;width:800px;height:600px;border:0";
  document.body.append(frame);
  frames.push(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write("<!doctype html><html><head></head><body></body></html>");
  doc.close();
  return doc;
}

/** The app's second window: the page's tree renders it into `doc` with createPortal. */
function InOtherDocument({ doc, children }: { doc: Document; children: ReactNode }) {
  return createPortal(
    <PortalContainerProvider container={doc.body}>
      {children}
      <button type="button" data-testid="outside">
        Elsewhere
      </button>
    </PortalContainerProvider>,
    doc.body,
  );
}

const settle = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 40))),
  );

/** A press with the mouse on `target`, made by its own window as a real one is. */
function press(target: Element) {
  const view = target.ownerDocument.defaultView!;
  const init = {
    bubbles: true,
    cancelable: true,
    composed: true,
    button: 0,
    clientX: 4,
    clientY: 4,
  };
  const pointer = { ...init, pointerId: 1, pointerType: "mouse", isPrimary: true };
  target.dispatchEvent(new view.PointerEvent("pointerdown", { ...pointer, buttons: 1 }));
  target.dispatchEvent(new view.MouseEvent("mousedown", { ...init, buttons: 1 }));
  target.dispatchEvent(new view.PointerEvent("pointerup", { ...pointer, buttons: 0 }));
  target.dispatchEvent(new view.MouseEvent("mouseup", { ...init, buttons: 0 }));
  target.dispatchEvent(new view.MouseEvent("click", { ...init, buttons: 0 }));
}

/** Opens a context menu on `target` with a right press, from its own window. */
function openContextMenu(target: Element) {
  const view = target.ownerDocument.defaultView!;
  target.dispatchEvent(
    new view.MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      button: 2,
      clientX: 40,
      clientY: 40,
    }),
  );
}

const ITEMS = ["Alpha", "Beta"];
const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const NOOP = () => {};

type OverlayCase = {
  name: string;
  /** The popup's own part, by its `data-slot`. */
  slot: string;
  element: ReactNode;
  /** Opens it, for one that has no `defaultOpen`. */
  open?: (doc: Document) => void;
  /** Where a press closes it: the element outside it, or its scrim. Unset for one that doesn't close on a press outside. */
  outside?: string;
};

const OVERLAYS: OverlayCase[] = [
  {
    name: "Popover",
    slot: "popover-content",
    outside: "[data-testid=outside]",
    element: (
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    ),
  },
  {
    name: "DropdownMenu",
    slot: "dropdown-menu-content",
    outside: "[data-testid=outside]",
    element: (
      <DropdownMenu defaultOpen modal={false}>
        <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
  {
    name: "ContextMenu",
    slot: "context-menu-content",
    outside: "[data-testid=outside]",
    open: (doc) => openContextMenu(doc.querySelector("[data-testid=context-target]")!),
    element: (
      <ContextMenu>
        <ContextMenuTrigger data-testid="context-target" style={{ width: 200, height: 120 }}>
          Right-click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    ),
  },
  {
    name: "Tooltip",
    slot: "tooltip-content",
    element: (
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger render={<button type="button" />}>Disk</TooltipTrigger>
          <TooltipContent>40 GB free</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    name: "PreviewCard",
    slot: "preview-card-content",
    element: (
      <PreviewCard open>
        <PreviewCardTrigger render={<button type="button" />}>A</PreviewCardTrigger>
        <PreviewCardContent>Preview</PreviewCardContent>
      </PreviewCard>
    ),
  },
  {
    name: "Select",
    slot: "select-content",
    outside: "[data-testid=outside]",
    element: (
      <Select defaultOpen modal={false} defaultValue="a">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">Alpha</SelectItem>
          <SelectItem value="b">Beta</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    name: "Combobox",
    slot: "combobox-content",
    outside: "[data-testid=outside]",
    element: (
      <Combobox defaultOpen items={ITEMS}>
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInputGroup>
            <ComboboxInput aria-label="Search" />
          </ComboboxInputGroup>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    ),
  },
  {
    name: "ComboboxSelect",
    slot: "combobox-select-popup",
    element: (
      <ComboboxSelect open options={OPTIONS} value="a" onValueChange={NOOP} placeholder="Pick" />
    ),
  },
  {
    name: "NotificationCenter",
    slot: "notification-center-popup",
    outside: "[data-testid=outside]",
    element: (
      <NotificationCenter defaultOpen>
        <NotificationCenterTrigger type="button" aria-label="Notifications" />
        <NotificationCenterPopup>
          <NotificationCenterHeader>
            <NotificationCenterTitle>Notifications</NotificationCenterTitle>
          </NotificationCenterHeader>
        </NotificationCenterPopup>
      </NotificationCenter>
    ),
  },
  {
    name: "Dialog",
    slot: "dialog-content",
    outside: "[data-slot=dialog-overlay]",
    element: (
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Share</DialogTitle>
        </DialogContent>
      </Dialog>
    ),
  },
  {
    name: "AlertDialog",
    slot: "alert-dialog-content",
    element: (
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogTitle>Delete the file?</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
  {
    name: "Drawer",
    slot: "drawer-popup",
    element: (
      <Drawer defaultOpen>
        <DrawerContent>
          <DrawerTitle>Filters</DrawerTitle>
        </DrawerContent>
      </Drawer>
    ),
  },
  {
    name: "Lightbox",
    slot: "lightbox-content",
    element: (
      <Lightbox defaultOpen>
        <LightboxContent aria-label="Report preview">Report</LightboxContent>
      </Lightbox>
    ),
  },
];

/** The popup by its slot, once it is in `doc`. */
async function popupIn(doc: Document, slot: string): Promise<HTMLElement> {
  return waitFor(() => {
    const popup = doc.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
    expect(popup, slot).not.toBeNull();
    return popup!;
  });
}

for (const overlay of OVERLAYS) {
  it(`${overlay.name} renders in the provider's document, not the page's`, async () => {
    const doc = otherDocument();
    render(<InOtherDocument doc={doc}>{overlay.element}</InOtherDocument>);
    await settle();
    overlay.open?.(doc);

    const popup = await popupIn(doc, overlay.slot);
    expect(popup.ownerDocument).toBe(doc);
    expect(document.querySelector(`[data-slot="${overlay.slot}"]`)).toBeNull();
    // Inside raft-ui's portal container, which is in the provider's container.
    const portal = popup.closest("[data-raft-ui-overlay]");
    expect(portal).not.toBeNull();
    expect(doc.body.contains(portal)).toBe(true);
    expect(document.querySelector("[data-raft-ui-overlay]")).toBeNull();
  });

  const outside = overlay.outside;
  if (outside) {
    it(`${overlay.name} closes on a press outside it in the provider's document`, async () => {
      const doc = otherDocument();
      render(<InOtherDocument doc={doc}>{overlay.element}</InOtherDocument>);
      await settle();
      overlay.open?.(doc);
      await popupIn(doc, overlay.slot);
      await settle();

      press(doc.querySelector(outside)!);
      await waitFor(() => {
        expect(doc.querySelector(`[data-slot="${overlay.slot}"]`)).toBeNull();
      });
    });
  }
}

it("without a provider an overlay still renders in the page's body", async () => {
  render(
    <Popover defaultOpen>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>Popover body</PopoverContent>
    </Popover>,
  );
  const popup = await popupIn(document, "popover-content");
  expect(popup.closest("[data-raft-ui-overlay]")?.parentElement).toBe(document.body);
});

it("a provider whose container is null makes overlays wait: nothing renders, in either document", async () => {
  const doc = otherDocument();
  render(
    createPortal(
      <PortalContainerProvider container={null}>
        <Popover defaultOpen>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Popover body</PopoverContent>
        </Popover>
      </PortalContainerProvider>,
      doc.body,
    ),
  );
  await settle();
  expect(doc.querySelector('[data-slot="popover-content"]')).toBeNull();
  expect(document.querySelector('[data-slot="popover-content"]')).toBeNull();
});

it("a container the caller passes wins over the provider's", async () => {
  const doc = otherDocument();
  // An element of the window's own, beside the provider's container (its body).
  const own = doc.createElement("div");
  own.setAttribute("data-testid", "own");
  doc.body.append(own);
  render(
    <InOtherDocument doc={doc}>
      <Popover defaultOpen>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent container={own}>Popover body</PopoverContent>
      </Popover>
      <Tooltip open>
        <TooltipTrigger render={<button type="button" />}>Disk</TooltipTrigger>
        <TooltipContent container={own}>40 GB free</TooltipContent>
      </Tooltip>
    </InOtherDocument>,
  );
  const popover = await popupIn(doc, "popover-content");
  const tooltip = await popupIn(doc, "tooltip-content");
  expect(popover.closest("[data-raft-ui-overlay]")?.parentElement).toBe(own);
  expect(tooltip.closest("[data-raft-ui-overlay]")?.parentElement).toBe(own);
});

it("an overlay opened inside another nests in that one's portal, in the provider's document", async () => {
  const doc = otherDocument();
  render(
    <InOtherDocument doc={doc}>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Share</DialogTitle>
          <Popover defaultOpen>
            <PopoverTrigger>People</PopoverTrigger>
            <PopoverContent>Popover body</PopoverContent>
          </Popover>
          <Tooltip open>
            <TooltipTrigger render={<button type="button" />}>Link</TooltipTrigger>
            <TooltipContent>Copy the link</TooltipContent>
          </Tooltip>
        </DialogContent>
      </Dialog>
    </InOtherDocument>,
  );
  const dialogPortal = (await popupIn(doc, "dialog-content")).closest("[data-raft-ui-overlay]");
  const popover = await popupIn(doc, "popover-content");
  const tooltip = await popupIn(doc, "tooltip-content");
  expect(dialogPortal?.contains(popover)).toBe(true);
  expect(dialogPortal?.contains(tooltip)).toBe(true);
});

it("usePortalContainer reads the provider's container, and undefined without one", () => {
  const seen: Array<HTMLElement | null | undefined> = [];
  function Probe() {
    seen.push(usePortalContainer());
    return null;
  }
  const doc = otherDocument();
  render(
    <>
      <Probe />
      <InOtherDocument doc={doc}>
        <Probe />
      </InOtherDocument>
    </>,
  );
  expect(seen).toContain(undefined);
  expect(seen).toContain(doc.body);
});

function RaiseToast({ title }: { title: string }) {
  const commands = useToast();
  return (
    <button type="button" data-testid="raise" onClick={() => commands.success(title)}>
      Save
    </button>
  );
}

function WindowToasts({ doc }: { doc: Document }) {
  const [manager] = useState(() => createToastManager());
  return (
    <InOtherDocument doc={doc}>
      <ToastProvider toastManager={manager} timeout={0}>
        <RaiseToast title="Saved in the window" />
      </ToastProvider>
    </InOtherDocument>
  );
}

it("a toast raised in the window shows in the window's provider; toast.* stays with the page's", async () => {
  const doc = otherDocument();
  render(
    <ToastProvider timeout={0}>
      <WindowToasts doc={doc} />
    </ToastProvider>,
  );
  await settle();

  doc.querySelector<HTMLElement>("[data-testid=raise]")!.click();
  await waitFor(() => {
    expect(doc.querySelector("[data-slot=toast]")?.textContent).toContain("Saved in the window");
  });
  expect(
    doc.querySelector("[data-slot=toast-viewport]")?.closest("[data-raft-ui-overlay]"),
  ).not.toBeNull();
  expect(document.body.textContent).not.toContain("Saved in the window");

  toast.info("Saved in the page");
  await waitFor(() => {
    expect(document.querySelector("[data-slot=toast]")?.textContent).toContain("Saved in the page");
  });
  expect(doc.body.textContent).not.toContain("Saved in the page");
});
