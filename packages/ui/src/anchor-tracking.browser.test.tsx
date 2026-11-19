import "./components/select/select.test.css";
/**
 * Real-browser regression tests for popup anchor tracking, clipping visibility,
 * layout reflow, and frame insets (design/foundations/elevation.md#popups).
 *
 * Run: `cd packages/ui && pnpm exec vp test --run --browser.enabled --browser.headless src/anchor-tracking.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { SheetPopupBoundary } from "./lib/popup-boundary";
import { CoachMark, CoachMarkContent } from "./components/coach-mark";
import { ComboboxSelect } from "./components/combobox-select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/dropdown-menu";
import { MobileNavRoot } from "./components/mobile-nav/mobile-nav";
import {
  MobileNavServerItem,
  MobileNavServerPopover,
  MobileNavServerPopoverContent,
} from "./components/mobile-nav/mobile-nav-server";
import { PanelScrollViewport } from "./components/panel";
import { Popover, PopoverContent, PopoverTrigger } from "./components/popover";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "./components/preview-card";
import { ScrollArea } from "./components/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/tooltip";

const it = test.skipIf(typeof window === "undefined");

afterEach(() => {
  cleanup();
  for (const side of ["top", "start", "end"]) {
    document.documentElement.style.removeProperty(`--raft-frame-inset-${side}`);
  }
});

const NOOP = () => {};
const SCROLLER_FLEX_STYLE = { flex: 1, minHeight: 0 } as const;
const SELECT_TRIGGER_STYLE = { width: 100 } as const;
const HSTRIP_STYLE = { width: 180 } as const;
const HSTRIP_CONTENT_STYLE = { display: "flex", gap: 8, width: "max-content" } as const;
const HP_SCROLLER_STYLE = { height: 320, width: 500, marginTop: 100 } as const;
const COMBOBOX_ITEMS_AB = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];
const COMBOBOX_ITEMS_01 = [
  { value: "o0", label: "Option 0" },
  { value: "o1", label: "Option 1" },
];

const settle = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 40))),
  );

it("hides anchored popups when their trigger scrolls out of its clipping area and restores them on scroll back", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1000, 700);

  render(
    <ThemeProvider>
      <TooltipProvider>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <div style={{ height: 160, flexShrink: 0 }}>Header + Toolbar</div>
          <PanelScrollViewport
            orientation="both"
            style={SCROLLER_FLEX_STYLE}
            data-testid="scroller"
          >
            <div
              style={{
                height: 1400,
                paddingTop: 140,
                paddingLeft: 40,
                display: "flex",
                alignItems: "flex-start",
                gap: 36,
              }}
            >
              <PreviewCard open>
                <PreviewCardTrigger
                  render={
                    <button type="button" data-testid="pc-trig" style={{ width: 28, height: 28 }} />
                  }
                >
                  A
                </PreviewCardTrigger>
                <PreviewCardContent sideOffset={6}>
                  <div style={{ width: 220, height: 90 }}>Preview</div>
                </PreviewCardContent>
              </PreviewCard>

              <Tooltip open>
                <TooltipTrigger
                  render={
                    <button type="button" data-testid="tt-trig" style={{ width: 48, height: 28 }} />
                  }
                >
                  Disk
                </TooltipTrigger>
                <TooltipContent>40 GB free</TooltipContent>
              </Tooltip>

              <Popover open>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      data-testid="pop-trig"
                      style={{ width: 48, height: 28 }}
                    />
                  }
                >
                  Pop
                </PopoverTrigger>
                <PopoverContent>
                  <div style={{ width: 160, height: 60 }}>Popover</div>
                </PopoverContent>
              </Popover>

              <DropdownMenu open modal={false}>
                <DropdownMenuTrigger
                  render={
                    <button type="button" data-testid="dd-trig" style={{ width: 48, height: 28 }} />
                  }
                >
                  Menu
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Action</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Select open modal={false} value="a" onValueChange={NOOP}>
                <SelectTrigger data-testid="sel-trig" style={SELECT_TRIGGER_STYLE}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Alpha</SelectItem>
                </SelectContent>
              </Select>

              <ComboboxSelect
                open
                options={COMBOBOX_ITEMS_AB}
                value="a"
                onValueChange={NOOP}
                placeholder="Pick"
              />
            </div>
          </PanelScrollViewport>
        </div>
      </TooltipProvider>
    </ThemeProvider>,
  );

  await settle();
  await settle();

  const scroller = document.querySelector<HTMLElement>('[data-testid="scroller"]')!;
  const pcTrig = document.querySelector<HTMLElement>('[data-testid="pc-trig"]')!;
  const slots = [
    '[data-slot="preview-card-content"]',
    '[data-slot="tooltip-content"]',
    '[data-slot="popover-content"]',
    '[data-slot="dropdown-menu-content"]',
    '[data-slot="select-content"]',
    '[data-slot="combobox-select-popup"]',
  ];

  const popups = slots.map((sel) => {
    const el = document.querySelector<HTMLElement>(sel);
    expect(el, sel).not.toBeNull();
    return el!;
  });

  // Visible while triggers are inside the scrollport.
  for (const popup of popups) {
    expect(getComputedStyle(popup.parentElement!).visibility).toBe("visible");
  }
  // ComboboxSelect uses position: fixed like every other popup.
  expect(getComputedStyle(popups[5]!.parentElement!).position).toBe("fixed");

  // Follows vertical scroll inside the scrollport.
  const initialTop = pcTrig.getBoundingClientRect().top;
  const initialPopTop = popups[0]!.getBoundingClientRect().top;
  scroller.scrollTop = 60;
  await waitFor(() => {
    expect(pcTrig.getBoundingClientRect().top).toBeCloseTo(initialTop - 60, 0);
    expect(popups[0]!.getBoundingClientRect().top).toBeCloseTo(initialPopTop - 60, 0);
  });

  // Scrolls past the 160px header: Base UI marks data-anchor-hidden and every
  // positioner hides and disables pointer events.
  scroller.scrollTop = 260;
  await waitFor(() => {
    for (const popup of popups) {
      const pos = popup.parentElement!;
      expect(pos.hasAttribute("data-anchor-hidden")).toBe(true);
      expect(getComputedStyle(pos).visibility).toBe("hidden");
      expect(getComputedStyle(pos).pointerEvents).toBe("none");
    }
  });

  // Scrolling back into view restores visibility and tracking.
  scroller.scrollTop = 60;
  await waitFor(() => {
    for (const popup of popups) {
      const pos = popup.parentElement!;
      expect(pos.hasAttribute("data-anchor-hidden")).toBe(false);
      expect(getComputedStyle(pos).visibility).toBe("visible");
    }
  });
});

it("tracks horizontal scroll, side-panel Grid reflow, and window resize", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1000, 700);

  function Harness({ rightOpen }: { rightOpen: boolean }) {
    return (
      <ThemeProvider>
        <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
          <PanelScrollViewport orientation="both" style={SCROLLER_FLEX_STYLE}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: 12,
                padding: 20,
              }}
            >
              <div style={{ height: 120 }} />
              <div style={{ height: 120 }} />
              <div style={{ height: 120, display: "flex", alignItems: "center" }}>
                <ScrollArea
                  orientation="horizontal"
                  style={HSTRIP_STYLE}
                  contentStyle={HSTRIP_CONTENT_STYLE}
                  data-testid="hstrip"
                >
                  <div style={{ width: 60, height: 28, flexShrink: 0 }} />
                  <PreviewCard open>
                    <PreviewCardTrigger
                      render={
                        <button
                          type="button"
                          data-testid="slot"
                          style={{ width: 28, height: 28, flexShrink: 0 }}
                        />
                      }
                    >
                      A
                    </PreviewCardTrigger>
                    <PreviewCardContent sideOffset={6}>
                      <div style={{ width: 160, height: 60 }}>Agent</div>
                    </PreviewCardContent>
                  </PreviewCard>
                  <div style={{ width: 300, height: 28, flexShrink: 0 }} />
                </ScrollArea>
              </div>
            </div>
          </PanelScrollViewport>
          {rightOpen ? <div style={{ width: 420, flexShrink: 0 }} /> : null}
        </div>
      </ThemeProvider>
    );
  }

  const view = render(<Harness rightOpen={false} />);
  await settle();
  await settle();

  const hstrip = document.querySelector<HTMLElement>('[data-testid="hstrip"]')!;
  const slot = document.querySelector<HTMLElement>('[data-testid="slot"]')!;
  const popup = document.querySelector<HTMLElement>('[data-slot="preview-card-content"]')!;

  const expectAligned = async () => {
    await waitFor(() => {
      const tr = slot.getBoundingClientRect();
      const pr = popup.getBoundingClientRect();
      expect(pr.top - tr.bottom).toBeCloseTo(6, 0);
      const align = popup.getAttribute("data-align");
      if (align === "end") {
        expect(pr.right).toBeCloseTo(tr.right, 0);
      } else {
        expect(pr.left).toBeCloseTo(tr.left, 0);
      }
    });
  };

  await expectAligned();

  // Horizontal scroll inside the agent strip.
  hstrip.scrollLeft = 40;
  await expectAligned();

  // Opening a side panel wraps Card 3 onto Row 2 Col 1 without window.resize.
  view.rerender(<Harness rightOpen />);
  await expectAligned();

  // Resizing the window wraps Card 3 onto Row 3.
  await page.viewport(720, 700);
  await expectAligned();
});

it("CoachMark follows a ref anchor that swaps to a remounted element and respects frame insets", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1000, 700);
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");

  function Harness({ targetKey }: { targetKey: number }) {
    const ref = useRef<HTMLButtonElement | null>(null);
    return (
      <ThemeProvider>
        <div style={{ position: "fixed", top: 180, left: targetKey === 0 ? 120 : 880 }}>
          <button
            key={targetKey}
            ref={ref}
            type="button"
            data-testid="target"
            style={{ width: 40, height: 28 }}
          >
            Target
          </button>
          <CoachMark open anchor={ref} onDismiss={NOOP}>
            <CoachMarkContent>Coach body</CoachMarkContent>
          </CoachMark>
        </div>
      </ThemeProvider>
    );
  }

  const view = render(<Harness targetKey={0} />);
  await settle();
  await settle();

  const bubble = document.querySelector<HTMLElement>('[data-slot="coach-mark-content"]')!;
  const firstRect = document
    .querySelector<HTMLElement>('[data-testid="target"]')!
    .getBoundingClientRect();
  await waitFor(() => {
    expect(bubble.getBoundingClientRect().top - firstRect.bottom).toBeCloseTo(8, 0);
  });

  // Remount the keyed target near the right edge: the bubble moves to it and
  // stops 8px inside the 80px --raft-frame-inset-end (88px from window right).
  view.rerender(<Harness targetKey={1} />);
  await waitFor(() => {
    const targetRect = document
      .querySelector<HTMLElement>('[data-testid="target"]')!
      .getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    expect(bubble.parentElement!.hasAttribute("data-anchor-hidden")).toBe(false);
    expect(bubbleRect.top - targetRect.bottom).toBeCloseTo(8, 0);
    expect(window.innerWidth - bubbleRect.right).toBeCloseTo(88, 0);
  });
});

it("ComboboxSelect preserves SheetPopupBoundary when caller passes positionerProps.ref", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(500, 500);
  let callerRefNode: HTMLDivElement | null = null;

  // A combobox inside the sheet's HEAD must NOT be bounded under the head
  // (popup-boundary.tsx:179). That exemption requires sheetPopupBoundary to
  // receive the positioner element via `collision.ref` so `findPopupAnchor`
  // can see the trigger is inside `head`. If caller `positionerProps.ref`
  // clobbers `collision.ref`, `positioner` stays null and the list is wrongly
  // clamped beneath the head.
  function Harness() {
    const headRef = useRef<HTMLDivElement | null>(null);
    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const positionerProps = useMemo(
      () => ({
        side: "top" as const,
        ref: (node: HTMLDivElement | null) => {
          callerRefNode = node;
        },
      }),
      [],
    );
    return (
      <ThemeProvider>
        <div
          ref={surfaceRef}
          style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column" }}
        >
          <SheetPopupBoundary head={headRef} surface={surfaceRef}>
            <div
              ref={headRef}
              style={{ height: 220, paddingTop: 150, paddingLeft: 20, flexShrink: 0 }}
            >
              <ComboboxSelect
                open
                options={COMBOBOX_ITEMS_01}
                value="o0"
                onValueChange={NOOP}
                positionerProps={positionerProps}
              />
            </div>
            <div style={{ flex: 1 }}>Sheet body</div>
          </SheetPopupBoundary>
        </div>
      </ThemeProvider>
    );
  }

  render(<Harness />);
  await settle();
  await settle();

  const popup = document.querySelector<HTMLElement>('[data-slot="combobox-select-popup"]')!;
  await waitFor(() => {
    expect(callerRefNode).toBe(popup.parentElement);
    // Because the field is inside the sheet head, sheetPopupBoundary leaves it
    // unbounded so side="top" stays above the field instead of flipping below.
    expect(popup.getAttribute("data-side")).toBe("top");
  });
});

it("MobileNavServerPopoverContent stays 8px inside --raft-frame-inset-end", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 700);
  document.documentElement.style.setProperty("--raft-frame-inset-end", "80px");

  render(
    <ThemeProvider>
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0 }}>
        <MobileNavRoot aria-label="Primary">
          <MobileNavServerPopover defaultOpen>
            <MobileNavServerItem aria-label="Server">S</MobileNavServerItem>
            <MobileNavServerPopoverContent>
              <div style={{ height: 80 }}>Servers</div>
            </MobileNavServerPopoverContent>
          </MobileNavServerPopover>
        </MobileNavRoot>
      </div>
    </ThemeProvider>,
  );

  await waitFor(() => {
    const popup = document.querySelector<HTMLElement>(
      '[data-slot="mobile-nav-server-popover-content"]',
    );
    expect(popup).not.toBeNull();
    // 80px frame inset + 8px gap = 88px clear from the right edge of the window.
    expect(window.innerWidth - popup!.getBoundingClientRect().right).toBeCloseTo(88, 0);
  });
});

it("Popover supports hover-to-preview and click-to-pin past 500ms while tracking scroll", async () => {
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await page.viewport(1000, 700);
  await userEvent.unhover(document.body);

  function HoverPinCard() {
    const [mode, setMode] = useState<"closed" | "hover" | "pinned">("closed");
    const onOpenChange = useCallback(
      (next: boolean, details: { reason: string; cancel: () => void }) => {
        if (next) {
          setMode(details.reason === "trigger-hover" ? "hover" : "pinned");
          return;
        }
        if (mode === "hover" && details.reason === "trigger-press") {
          details.cancel();
          setMode("pinned");
          return;
        }
        if (mode === "pinned" && details.reason === "trigger-hover") {
          details.cancel();
          return;
        }
        setMode("closed");
      },
      [mode],
    );
    return (
      <ThemeProvider>
        <PanelScrollViewport style={HP_SCROLLER_STYLE} data-testid="hp-scroll">
          <div style={{ height: 900, paddingTop: 120, paddingLeft: 40 }}>
            <Popover open={mode !== "closed"} onOpenChange={onOpenChange}>
              <PopoverTrigger
                openOnHover={mode !== "pinned"}
                delay={0}
                closeDelay={80}
                render={<button type="button" data-testid="hp-trigger" />}
              >
                Usage 62%
              </PopoverTrigger>
              <PopoverContent>
                <div data-testid="hp-body" style={{ width: 200, height: 80 }}>
                  Mode: {mode}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </PanelScrollViewport>
      </ThemeProvider>
    );
  }

  render(<HoverPinCard />);
  const trigger = document.querySelector<HTMLElement>('[data-testid="hp-trigger"]')!;
  const scroller = document.querySelector<HTMLElement>('[data-testid="hp-scroll"]')!;

  await userEvent.hover(trigger);
  await waitFor(() => {
    expect(document.querySelector('[data-testid="hp-body"]')?.textContent).toBe("Mode: hover");
  });

  // Wait past Base UI's 500ms PATIENT_CLICK_THRESHOLD, then click to pin.
  await new Promise((resolve) => setTimeout(resolve, 560));
  await userEvent.click(trigger);
  await waitFor(() => {
    expect(document.querySelector('[data-testid="hp-body"]')?.textContent).toBe("Mode: pinned");
  });

  // Moving pointer away keeps the pinned popover open and tracking scroll.
  await userEvent.unhover(document.body);
  await settle();
  const body = document.querySelector<HTMLElement>('[data-testid="hp-body"]')!;
  const initialTop = body.getBoundingClientRect().top;
  scroller.scrollTop = 60;
  await waitFor(() => {
    expect(body.getBoundingClientRect().top).toBeCloseTo(initialTop - 60, 0);
  });

  // Scrolling the trigger out of the scrollport hides the pinned popover.
  scroller.scrollTop = 240;
  await waitFor(() => {
    const pos = body.closest('[data-slot="popover-content"]')!.parentElement!;
    expect(pos.hasAttribute("data-anchor-hidden")).toBe(true);
    expect(getComputedStyle(pos).visibility).toBe("hidden");
  });
});
