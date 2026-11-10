import "../dialog/dialog.test.css";
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "../select/select";
import { toast, ToastProvider } from "../toast/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxTitle,
  LightboxToolbar,
} from "./lightbox";
import type { LightboxProps } from "./lightbox";

// What opens inside a lightbox, and what a lightbox opens from
// (lightbox.md#popups-inside, #behavior). The lightbox's portal is a stacking
// context of its own at z-70, and Base UI portals every popup opened inside
// it into that portal: a popup's own z-50 then counts inside the lightbox, so
// it is drawn above the content. Before, they were drawn under the scrim, and
// a press on one landed on the scrim and closed the lightbox. Real layout and
// hit testing.

const it = test.skipIf(typeof window === "undefined");

const frames = async (count = 3) => {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

const browser = async () => (await import("vite-plus/test/browser/context")).userEvent;

afterEach(() => {
  toast.dismiss();
  cleanup();
});

type Modal = NonNullable<LightboxProps["modal"]>;

/** Whether `element` is drawn on top at its own center: a press there reaches it. */
function isOnTop(element: Element) {
  const box = element.getBoundingClientRect();
  const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
  return hit !== null && element.contains(hit);
}

/** Neither inert nor hidden from assistive technology. */
function expectReachable(element: Element) {
  expect(element.closest("[inert]")).toBeNull();
  expect(element.closest('[aria-hidden="true"]')).toBeNull();
}

function alphaOf(element: Element) {
  const color = getComputedStyle(element).backgroundColor;
  const match = color.match(/\/\s*([0-9.]+)\)|rgba\([^)]*,\s*([0-9.]+)\)/);
  return match ? Number(match[1] ?? match[2]) : 1;
}

const lightboxPortal = () => document.querySelector("[data-slot=lightbox-portal]");

function LightboxWith({
  modal = true,
  onOpenChange,
  children,
}: {
  modal?: Modal;
  onOpenChange?: LightboxProps["onOpenChange"];
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <div data-testid="page">Page</div>
      <Lightbox open modal={modal} onOpenChange={onOpenChange}>
        <LightboxContent data-testid="content" aria-label="Report preview">
          <LightboxToolbar>
            <LightboxTitle>report.pdf</LightboxTitle>
            <LightboxActions>
              {children}
              <LightboxClose aria-label="Close" render={<Button variant="ghost" size="icon-md" />}>
                X
              </LightboxClose>
            </LightboxActions>
          </LightboxToolbar>
        </LightboxContent>
      </Lightbox>
    </ThemeProvider>
  );
}

const comments = (
  <Popover>
    <PopoverTrigger render={<Button variant="ghost" size="md" />}>Comments</PopoverTrigger>
    <PopoverContent data-testid="popover">
      <Button variant="ghost" size="md">
        Resolve
      </Button>
    </PopoverContent>
  </Popover>
);

const runtime = (
  <Select defaultValue="Node">
    <SelectTrigger aria-label="Runtime">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectList>
        {["Node", "Deno", "Bun"].map((value) => (
          <SelectItem key={value} value={value}>
            <SelectItemText>{value}</SelectItemText>
          </SelectItem>
        ))}
      </SelectList>
    </SelectContent>
  </Select>
);

async function openComments() {
  const userEvent = await browser();
  await userEvent.click(screen.getByRole("button", { name: "Comments" }));
  const popover = await screen.findByTestId("popover");
  await frames();
  return popover;
}

describe("popups opened inside a lightbox", () => {
  for (const modal of [true, "trap-focus"] as const) {
    it(`modal=${String(modal)}: a popover is drawn above it and a press in it keeps it open`, async () => {
      const onOpenChange = vi.fn();
      render(
        <LightboxWith modal={modal} onOpenChange={onOpenChange}>
          {comments}
        </LightboxWith>,
      );
      await screen.findByTestId("content");
      const popover = await openComments();

      expect(lightboxPortal()?.contains(popover)).toBe(true);
      expectReachable(popover);
      const resolve = screen.getByRole("button", { name: "Resolve" });
      expect(isOnTop(resolve)).toBe(true);

      await (await browser()).click(resolve);
      await frames();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByTestId("content").isConnected).toBe(true);
    });
  }

  it("a tooltip is painted above the content, not only placed in the lightbox", async () => {
    render(
      <LightboxWith>
        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" size="icon-md" />}>D</TooltipTrigger>
          <TooltipContent>Download</TooltipContent>
        </Tooltip>
      </LightboxWith>,
    );
    await screen.findByTestId("content");
    const userEvent = await browser();
    await userEvent.unhover(document.body);
    await userEvent.hover(screen.getByRole("button", { name: "D" }));
    const tooltip = await screen.findByText("Download");
    await frames();
    expect(lightboxPortal()?.contains(tooltip)).toBe(true);
    // A tooltip takes no pointer, which hit testing skips: give it the pointer
    // for the test only, so elementFromPoint reports what is painted on top.
    const positioner = tooltip.closest("[data-slot=tooltip-positioner]") ?? tooltip;
    for (const element of [positioner, tooltip] as HTMLElement[]) {
      element.style.pointerEvents = "auto";
    }
    expect(isOnTop(tooltip)).toBe(true);
    await userEvent.unhover(document.body);
  });

  it("a select's list is drawn above it and choosing keeps it open", async () => {
    const onOpenChange = vi.fn();
    render(<LightboxWith onOpenChange={onOpenChange}>{runtime}</LightboxWith>);
    await screen.findByTestId("content");
    const userEvent = await browser();
    await userEvent.click(screen.getByRole("combobox", { name: "Runtime" }));
    const bun = await screen.findByRole("option", { name: "Bun" });
    await frames();
    expect(lightboxPortal()?.contains(bun)).toBe(true);
    expect(isOnTop(bun)).toBe(true);
    await userEvent.click(bun);
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Runtime" }).textContent).toContain("Bun"),
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("a menu's submenu is drawn above it and its item runs", async () => {
    const onOpenChange = vi.fn();
    const onArchive = vi.fn();
    render(
      <LightboxWith onOpenChange={onOpenChange}>
        <DropdownMenu>
          <DropdownMenuTrigger>More</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuSubmenu>
              <DropdownMenuSubmenuTrigger>Move to</DropdownMenuSubmenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenuSubmenu>
          </DropdownMenuContent>
        </DropdownMenu>
      </LightboxWith>,
    );
    await screen.findByTestId("content");
    const userEvent = await browser();
    await userEvent.click(screen.getByRole("button", { name: "More" }));
    const moveTo = await screen.findByRole("menuitem", { name: "Move to" });
    await frames();
    expect(isOnTop(moveTo)).toBe(true);
    await userEvent.click(moveTo);
    const archive = await screen.findByRole("menuitem", { name: "Archive" });
    await frames();
    expect(lightboxPortal()?.contains(archive)).toBe(true);
    expect(isOnTop(archive)).toBe(true);
    await userEvent.click(archive);
    await waitFor(() => expect(onArchive).toHaveBeenCalledTimes(1));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("Esc closes only the popup, and the next Esc the lightbox", async () => {
    const onOpenChange = vi.fn();
    render(
      <LightboxWith modal="trap-focus" onOpenChange={onOpenChange}>
        {comments}
      </LightboxWith>,
    );
    await screen.findByTestId("content");
    await openComments();
    const userEvent = await browser();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("popover")).toBeNull());
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything()));
  });

  it("keeps focus trapped and the page hidden with a popup open", async () => {
    render(<LightboxWith modal="trap-focus">{comments}</LightboxWith>);
    await screen.findByTestId("content");
    const popover = await openComments();
    expect(screen.getByTestId("page").closest('[aria-hidden="true"]')).not.toBeNull();
    expectReachable(popover);
    expectReachable(screen.getByTestId("content"));
    const userEvent = await browser();
    for (let i = 0; i < 6; i += 1) {
      await userEvent.keyboard("{Tab}");
      expect(lightboxPortal()?.contains(document.activeElement)).toBe(true);
    }
  });
});

describe("a dialog opened inside a lightbox", () => {
  function Nested({
    onLightbox,
    onDialog,
  }: {
    onLightbox: LightboxProps["onOpenChange"];
    onDialog: () => void;
  }) {
    return (
      <LightboxWith onOpenChange={onLightbox}>
        <Dialog open onOpenChange={onDialog}>
          <DialogContent data-testid="dialog">
            <DialogTitle>Share report.pdf</DialogTitle>
            {comments}
            {runtime}
          </DialogContent>
        </Dialog>
      </LightboxWith>
    );
  }

  it("stacks on the lightbox with the nested scrim, and its popups work", async () => {
    const onLightbox = vi.fn();
    const onDialog = vi.fn();
    render(<Nested onLightbox={onLightbox} onDialog={onDialog} />);
    const dialog = await screen.findByTestId("dialog");
    await frames();

    // One scrim each: the lightbox's full one, the dialog's nested one.
    const overlay = document.querySelector("[data-slot=dialog-overlay]") as Element;
    expect(overlay.hasAttribute("data-nested")).toBe(true);
    expect(alphaOf(overlay)).toBeCloseTo(0.4, 2);
    expect(isOnTop(screen.getByRole("heading", { name: "Share report.pdf" }))).toBe(true);
    expect(lightboxPortal()?.contains(dialog)).toBe(true);

    const popover = await openComments();
    expect(isOnTop(screen.getByRole("button", { name: "Resolve" }))).toBe(true);
    expectReachable(popover);
    const userEvent = await browser();
    await userEvent.click(screen.getByRole("button", { name: "Resolve" }));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByTestId("popover")).toBeNull());
    expect(screen.getByTestId("dialog").isConnected).toBe(true);

    await userEvent.click(screen.getByRole("combobox", { name: "Runtime" }));
    const bun = await screen.findByRole("option", { name: "Bun" });
    await frames();
    expect(isOnTop(bun)).toBe(true);
    await userEvent.click(bun);
    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Runtime" }).textContent).toContain("Bun"),
    );

    expect(onDialog).not.toHaveBeenCalled();
    expect(onLightbox).not.toHaveBeenCalled();
  });
});

describe("a lightbox opened from a dialog", () => {
  it("has its own nested scrim, and a press beside the file closes only the lightbox", async () => {
    const onDialog = vi.fn();
    function FromDialog() {
      const [open, setOpen] = useState(true);
      return (
        <ThemeProvider>
          <Dialog open onOpenChange={onDialog}>
            <DialogContent data-testid="dialog">
              <DialogTitle>Attachments</DialogTitle>
              <Lightbox open={open} onOpenChange={setOpen}>
                <LightboxContent data-testid="content" aria-label="Preview">
                  <LightboxClose aria-label="Close">X</LightboxClose>
                </LightboxContent>
              </Lightbox>
            </DialogContent>
          </Dialog>
        </ThemeProvider>
      );
    }
    render(<FromDialog />);
    await screen.findByTestId("content");
    await frames();

    const backdrop = document.querySelector("[data-slot=lightbox-backdrop]");
    expect(backdrop, "the lightbox draws its scrim").not.toBeNull();
    expect(backdrop!.hasAttribute("data-nested")).toBe(true);
    expect(alphaOf(backdrop!)).toBeCloseTo(0.4, 2);
    // The dialog sits in the middle of the window, under the lightbox's scrim.
    const box = screen.getByTestId("dialog").getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    expect(hit).toBe(backdrop);

    await (await browser()).click(backdrop!);
    await waitFor(() => expect(screen.queryByTestId("content")).toBeNull());
    expect(onDialog).not.toHaveBeenCalled();
    expect(screen.getByTestId("dialog").isConnected).toBe(true);
  });
});

it("a popup outside any lightbox still portals to the body", async () => {
  render(<ThemeProvider>{comments}</ThemeProvider>);
  const popover = await openComments();
  const portal = popover.closest("[data-base-ui-portal]");
  expect(portal?.parentElement).toBe(document.body);
  expect(isOnTop(screen.getByRole("button", { name: "Resolve" }))).toBe(true);
});

const copyLink = () => {
  toast.success("Link copied.");
};

it("a toast fired from inside a lightbox is drawn above it", async () => {
  function WithToast() {
    const [open, setOpen] = useState(false);
    return (
      <ThemeProvider>
        <ToastProvider timeout={0}>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Lightbox open={open} onOpenChange={setOpen}>
            <LightboxContent data-testid="content" aria-label="Preview">
              <LightboxToolbar>
                <LightboxActions>
                  <Button variant="ghost" size="md" onClick={copyLink}>
                    Copy link
                  </Button>
                </LightboxActions>
              </LightboxToolbar>
            </LightboxContent>
          </Lightbox>
        </ToastProvider>
      </ThemeProvider>
    );
  }
  render(<WithToast />);
  const userEvent = await browser();
  // The toast layer is in the page before the lightbox opens, so at equal z
  // the lightbox, later in the page, would be drawn over it.
  await userEvent.click(screen.getByRole("button", { name: "Open" }));
  await screen.findByTestId("content");
  await userEvent.click(screen.getByRole("button", { name: "Copy link" }));
  const title = await screen.findByText("Link copied.");
  await frames(5);
  expect(isOnTop(title)).toBe(true);
});
