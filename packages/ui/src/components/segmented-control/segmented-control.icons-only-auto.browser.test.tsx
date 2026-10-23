import "./segmented-control.test.css";
/**
 * `iconsOnlyBelow="auto"` and a CSS length: the control measures itself and
 * shows only its icons (`data-icons-only`) exactly when its labelled segments
 * don't fit the width it is given (`auto`), or when its row is narrower than
 * the length. Real layout, so only a browser measures it.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/segmented-control`
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { AtSign, CheckCheck, Inbox, Pin } from "lucide-react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TooltipProvider } from "../tooltip/tooltip";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "./segmented-control";
import type { SegmentedControlIconsOnlyBelow } from "./segmented-control";

const it = test.skipIf(typeof window === "undefined");
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Filters({
  iconsOnlyBelow = "auto",
  className,
  withIcons = true,
}: {
  iconsOnlyBelow?: SegmentedControlIconsOnlyBelow;
  className?: string;
  withIcons?: boolean;
}) {
  return (
    <SegmentedControl
      aria-label="Filter"
      defaultValue="all"
      iconsOnlyBelow={iconsOnlyBelow}
      className={className}
    >
      <SegmentedControlItem value="all">
        {withIcons && <Inbox />}
        <SegmentedControlLabel>All</SegmentedControlLabel>
        <SegmentedControlCount>12</SegmentedControlCount>
      </SegmentedControlItem>
      <SegmentedControlItem value="unread">
        <Inbox />
        <SegmentedControlLabel>Unread</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="mentions">
        <AtSign />
        <SegmentedControlLabel>Mentions</SegmentedControlLabel>
      </SegmentedControlItem>
      <SegmentedControlItem value="pinned">
        <Pin />
        <SegmentedControlLabel>Pinned</SegmentedControlLabel>
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

function track() {
  return screen.getByRole("radiogroup");
}

function row() {
  return screen.getByTestId("row");
}

function labels() {
  return Array.from(track().querySelectorAll("[data-slot=segmented-control-label]"));
}

function iconsOnly() {
  return labels().every((label) => label.getBoundingClientRect().width <= 1);
}

function labelled() {
  return labels().every((label) => label.getBoundingClientRect().width > 1);
}

async function frames(n = 3) {
  for (let i = 0; i < n; i++) await new Promise((r) => requestAnimationFrame(r));
}

/** The labelled track's width, measured in a row with room to spare. */
async function labelledWidth(): Promise<number> {
  row().style.width = "800px";
  await waitFor(() => expect(labelled()).toBe(true));
  return track().getBoundingClientRect().width;
}

it("auto: shows only the icons when the labels don't fit, and the labels again once they do", async () => {
  render(
    <Shell>
      <div data-testid="row" style={{ width: 800 }}>
        <Filters />
      </div>
    </Shell>,
  );
  const width = await labelledWidth();
  expect(track().hasAttribute("data-icons-only")).toBe(false);

  row().style.width = `${Math.ceil(width)}px`;
  await frames();
  expect(labelled()).toBe(true);

  row().style.width = `${Math.floor(width) - 2}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));
  expect(track().hasAttribute("data-icons-only")).toBe(true);
  for (const item of screen.getAllByRole("radio")) {
    expect(item.getBoundingClientRect().width).toBe(32);
  }
  // Labels stay the accessible names.
  expect(screen.getByRole("radio", { name: "Mentions" })).toBeTruthy();

  row().style.width = `${Math.ceil(width)}px`;
  await waitFor(() => expect(labelled()).toBe(true));
  expect(track().hasAttribute("data-icons-only")).toBe(false);
});

it("auto: doesn't come back to its labels until the labelled width fits (no flapping)", async () => {
  render(
    <Shell>
      <div data-testid="row" style={{ width: 800 }}>
        <Filters />
      </div>
    </Shell>,
  );
  const width = await labelledWidth();
  row().style.width = `${Math.floor(width) - 2}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));

  // What each frame paints (the measurement takes the attribute off and puts
  // it back before a frame, so only a real switch shows).
  const painted: boolean[] = [];
  let watching = true;
  const watch = () => {
    painted.push(track().hasAttribute("data-icons-only"));
    if (watching) requestAnimationFrame(watch);
  };
  requestAnimationFrame(watch);
  // Far wider than the icons need, still narrower than the labels.
  row().style.width = `${Math.floor(width) - 1}px`;
  await frames(5);
  row().style.width = `${Math.floor(width) - 3}px`;
  await frames(5);
  watching = false;
  expect(painted.length).toBeGreaterThan(5);
  expect(painted.every(Boolean)).toBe(true);
  expect(iconsOnly()).toBe(true);
});

it("auto: decides on the first frame, with no labelled flash", () => {
  render(
    <Shell>
      <div data-testid="row" style={{ width: 120 }}>
        <Filters />
      </div>
    </Shell>,
  );
  // No waiting: what render() leaves is what the first frame paints.
  expect(track().hasAttribute("data-icons-only")).toBe(true);
  expect(iconsOnly()).toBe(true);
});

it("auto: a shrinking flex item beside a button switches on the width it is given", async () => {
  function Toolbar({ button }: { button: boolean }) {
    return (
      <Shell>
        <div
          data-testid="row"
          className="@container flex items-center justify-between gap-3 px-4"
          style={{ width: 800 }}
        >
          <Filters className="min-w-0" />
          {button && (
            <button type="button" className="h-8 shrink-0 whitespace-nowrap px-3">
              <CheckCheck className="inline size-4" /> Mark all read
            </button>
          )}
        </div>
      </Shell>
    );
  }
  const { rerender } = render(<Toolbar button />);
  const width = await labelledWidth();
  const button = screen.getByRole("button", { name: /Mark all read/ });
  const buttonWidth = button.getBoundingClientRect().width;
  const fits = Math.ceil(width + 12 + buttonWidth + 32) + 1;

  row().style.width = `${fits}px`;
  await frames();
  expect(labelled()).toBe(true);

  row().style.width = `${fits - 20}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));
  // The button keeps its place beside the icons; nothing overlaps.
  expect(track().getBoundingClientRect().right).toBeLessThanOrEqual(
    button.getBoundingClientRect().left,
  );

  row().style.width = `${fits}px`;
  await waitFor(() => expect(labelled()).toBe(true));

  // Icons only beside the button; the button goes and the row's width
  // doesn't change: the labels come back.
  row().style.width = `${fits - 20}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));
  rerender(<Toolbar button={false} />);
  await waitFor(() => expect(labelled()).toBe(true));
});

it("a CSS length: icons only when the @container row is narrower than it", async () => {
  function Row({ below }: { below: SegmentedControlIconsOnlyBelow }) {
    return (
      <Shell>
        <div data-testid="row" className="@container px-4" style={{ width: 800 }}>
          <div>
            <Filters iconsOnlyBelow={below} />
          </div>
        </div>
      </Shell>
    );
  }
  const { rerender } = render(<Row below="18.5rem" />);
  // 18.5rem is 296px; the container query measures the content box (inside px-4).
  row().style.width = `${296 + 32}px`;
  await frames();
  expect(labelled()).toBe(true);
  row().style.width = `${295 + 32}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));

  rerender(<Row below="250px" />);
  await waitFor(() => expect(labelled()).toBe(true));
  row().style.width = `${249 + 32}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));
});

it("presets stay container queries: no data-icons-only, no measured classes", async () => {
  render(
    <Shell>
      <div data-testid="row" className="@container" style={{ width: 300 }}>
        <Filters iconsOnlyBelow="sm" />
      </div>
    </Shell>,
  );
  await waitFor(() => expect(iconsOnly()).toBe(true));
  expect(track().hasAttribute("data-icons-only")).toBe(false);
  expect(track().className).not.toContain("data-icons-only");
  expect(track().className).toContain("@max-sm:**:data-[slot=segmented-control-label]:sr-only");
});

it("auto: names a collapsed segment in a tooltip, and its focus ring isn't clipped", async () => {
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  render(
    <Shell>
      <div data-testid="row" style={{ width: 200 }}>
        <Filters />
      </div>
    </Shell>,
  );
  expect(iconsOnly()).toBe(true);
  await page.getByRole("radio", { name: "Mentions" }).hover();
  await waitFor(() =>
    expect(document.querySelector("[data-slot=tooltip-content]")?.textContent).toBe("Mentions"),
  );
  await userEvent.keyboard("{Tab}");
  await frames();
  const focused = document.activeElement as HTMLElement;
  expect(focused.getAttribute("data-slot")).toBe("segmented-control-item");
  expect(getComputedStyle(focused).boxShadow).not.toBe("none");
  // The icons fit, so the track doesn't scroll and its overflow stays visible.
  expect(track().hasAttribute("data-overflowing")).toBe(false);
  expect(getComputedStyle(track()).overflowX).toBe("visible");
});

it("warns in development when a segment has no icon", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(
    <Shell>
      <div data-testid="row" style={{ width: 800 }}>
        <Filters withIcons={false} />
      </div>
    </Shell>,
  );
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("has a segment with no icon"));
});

it("data-icons-only lets a caller show an icon only while the segments show only their icons", async () => {
  render(
    <Shell>
      <div data-testid="row" style={{ width: 800 }}>
        <SegmentedControl aria-label="Filter" defaultValue="all" iconsOnlyBelow="auto">
          <SegmentedControlItem value="all">
            <Inbox data-testid="icon" className="hidden in-data-icons-only:block" />
            <SegmentedControlLabel>All</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="mentions">
            <AtSign className="hidden in-data-icons-only:block" />
            <SegmentedControlLabel>Mentions</SegmentedControlLabel>
          </SegmentedControlItem>
        </SegmentedControl>
      </div>
    </Shell>,
  );
  const icon = screen.getByTestId("icon");
  expect(labelled()).toBe(true);
  expect(icon.getBoundingClientRect().width).toBe(0);
  const width = track().getBoundingClientRect().width;
  row().style.width = `${Math.floor(width) - 2}px`;
  await waitFor(() => expect(iconsOnly()).toBe(true));
  expect(icon.getBoundingClientRect().width).toBe(16);
  row().style.width = `${Math.ceil(width)}px`;
  await waitFor(() => expect(labelled()).toBe(true));
  expect(icon.getBoundingClientRect().width).toBe(0);
});
