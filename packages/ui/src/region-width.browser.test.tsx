import "./lead-marks.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import {
  ActivityInboxSelectionCount,
  ActivityInboxSelectionToolbar,
} from "./components/activity-inbox";
import { Button } from "./components/button";
import { CodeBlockPre } from "./components/code-block";
import {
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
} from "./components/description-list";
import { ListRow, ListRowBody, ListRowMeta, ListRowTitle, ListRowTop } from "./components/list-row";
import {
  MessageActionCard,
  MessageActionCardContent,
  MessageActionCardProperties,
  MessageActionCardProperty,
  MessageActionCardPropertyLabel,
  MessageActionCardPropertyValue,
} from "./components/message-action-card";
import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryRow,
} from "./components/message-attachment";
import {
  MessageForwardedBundleGallery,
  MessageForwardedBundleGalleryTile,
} from "./components/message-forwarded-bundle";
import { SegmentedControl, SegmentedControlItem } from "./components/segmented-control";
import { Step, Steps } from "./components/steps";
import {
  TasksPanelRoot,
  TasksPanelToolbar,
  TasksPanelToolbarFilters,
  TasksPanelToolbarNewTask,
  TasksPanelToolbarView,
} from "./components/tasks";

// Layout switches on the width of the region a component sits in, not the
// window's (design/patterns/responsive.md#switch-on-the-regions-width). Every
// test here keeps a 1280px window and only narrows the region: before, each of
// these components laid itself out for the window and broke in a narrow panel.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
});

function Region({ width, children }: { width: number; children: ReactNode }) {
  return (
    <ThemeProvider>
      <div data-testid="region" style={{ width }}>
        {children}
      </div>
    </ThemeProvider>
  );
}

const rect = (el: Element) => el.getBoundingClientRect();
const bySlot = (slot: string) => document.querySelector<HTMLElement>(`[data-slot=${slot}]`)!;

function FourSteps() {
  return (
    <Steps current={1}>
      <Step title="Create" description="Name and region" />
      <Step title="Configure" description="Pick the machine" />
      <Step title="Share" />
      <Step title="Launch" />
    </Steps>
  );
}

it("steps stack their text under the marker in a 400px region on a wide window", () => {
  render(
    <Region width={400}>
      <FourSteps />
    </Region>,
  );
  const marker = screen.getByText("Configure").closest("[data-slot=step]")!;
  const indicator = rect(marker.querySelector("[data-slot=step-indicator]")!);
  expect(rect(screen.getByText("Configure")).top).toBeGreaterThanOrEqual(indicator.bottom);
  const list = bySlot("steps");
  expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
});

it("steps keep their titles beside the marker in a wide region", () => {
  render(
    <Region width={900}>
      <FourSteps />
    </Region>,
  );
  const step = screen.getByText("Configure").closest("[data-slot=step]")!;
  const indicator = rect(step.querySelector("[data-slot=step-indicator]")!);
  expect(rect(screen.getByText("Configure")).left).toBeGreaterThanOrEqual(indicator.right);
});

// A value of a known width, so the switch doesn't depend on the font.
function Value({ id, width }: { id?: string; width: number }) {
  return <span data-testid={id} style={{ display: "inline-block", width, height: 16 }} />;
}

function Facts({ valueWidth = 120 }: { valueWidth?: number }) {
  return (
    <DescriptionList direction="horizontal">
      <DescriptionItem>
        <DescriptionTerm>Status</DescriptionTerm>
        <DescriptionDetails data-testid="value">
          <Value width={valueWidth} />
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Assignee</DescriptionTerm>
        <DescriptionDetails data-testid="second">Jasper</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

const beside = (label: string, value: string) =>
  rect(screen.getByTestId(value)).left > rect(screen.getByText(label)).right;
const above = (label: string, value: string) => {
  const term = rect(screen.getByText(label));
  const details = rect(screen.getByTestId(value));
  return details.top >= term.bottom - 0.5 && Math.abs(details.left - term.left) <= 0.5;
};

it("a horizontal description list keeps short values beside their labels in a 300px panel", () => {
  // 300 less the 88px label column and the 16px gap leaves 196px: room for a
  // 120px value. A fixed 384px switch stacked a profile's Role and Computer
  // in a 370px panel (Artea, 2026-11-08).
  render(
    <Region width={300}>
      <Facts />
    </Region>,
  );
  expect(beside("Status", "value")).toBe(true);
  expect(beside("Assignee", "second")).toBe(true);
});

it("a horizontal description list puts every label above its value once one value doesn't fit beside it", () => {
  // 220px doesn't fit in the 196px beside the labels, and does on its own line.
  render(
    <Region width={300}>
      <Facts valueWidth={220} />
    </Region>,
  );
  expect(above("Status", "value")).toBe(true);
  // The whole list switches, the fact that fits included.
  expect(above("Assignee", "second")).toBe(true);
});

it("a horizontal description list stacks when the value column would be narrower than a label may be", () => {
  // 240 less 88 and 16 leaves 136px, under the 160px a label may take.
  render(
    <Region width={240}>
      <Facts valueWidth={40} />
    </Region>,
  );
  expect(above("Status", "value")).toBe(true);
});

it("a paragraph that wraps either way doesn't stack a horizontal description list", () => {
  render(
    <Region width={400}>
      <DescriptionList direction="horizontal">
        <DescriptionItem>
          <DescriptionTerm>Role</DescriptionTerm>
          <DescriptionDetails data-testid="value">Member</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Description</DescriptionTerm>
          <DescriptionDetails data-testid="about">
            {"Owns how written docs are shaped and kept current. ".repeat(4)}
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </Region>,
  );
  expect(beside("Role", "value")).toBe(true);
  expect(beside("Description", "about")).toBe(true);
});

it("a horizontal description list switches again when its region resizes or its value changes", async () => {
  const { rerender } = render(
    <Region width={300}>
      <Facts valueWidth={220} />
    </Region>,
  );
  expect(above("Status", "value")).toBe(true);
  screen.getByTestId("region").style.width = "500px";
  await waitFor(() => expect(beside("Status", "value")).toBe(true));
  screen.getByTestId("region").style.width = "300px";
  await waitFor(() => expect(above("Status", "value")).toBe(true));
  rerender(
    <Region width={300}>
      <Facts valueWidth={120} />
    </Region>,
  );
  await waitFor(() => expect(beside("Status", "value")).toBe(true));
});

function Card({ valueWidth }: { valueWidth: number }) {
  return (
    <MessageActionCard>
      <MessageActionCardContent>
        <MessageActionCardProperties>
          <MessageActionCardProperty>
            <MessageActionCardPropertyLabel>Channel</MessageActionCardPropertyLabel>
            <MessageActionCardPropertyValue data-testid="value">
              <Value width={valueWidth} />
            </MessageActionCardPropertyValue>
          </MessageActionCardProperty>
        </MessageActionCardProperties>
      </MessageActionCardContent>
    </MessageActionCard>
  );
}

it("an action card's properties stack only when a value doesn't fit beside its label", () => {
  // A 300px card leaves its properties about 274px, so 170px beside the label.
  render(
    <Region width={300}>
      <Card valueWidth={120} />
    </Region>,
  );
  expect(beside("Channel", "value")).toBe(true);
  cleanup();
  render(
    <Region width={300}>
      <Card valueWidth={220} />
    </Region>,
  );
  expect(above("Channel", "value")).toBe(true);
});

function SelectionToolbar() {
  return (
    <ActivityInboxSelectionToolbar data-testid="toolbar">
      <ActivityInboxSelectionCount>12 selected</ActivityInboxSelectionCount>
      <Button variant="outline">Mark as Read</Button>
      <Button variant="outline">Mark as Done</Button>
      <Button variant="outline">Unfollow</Button>
    </ActivityInboxSelectionToolbar>
  );
}

it("the activity selection toolbar is one 44px row while it fits, and wraps in a 320px column", () => {
  render(
    <Region width={800}>
      <SelectionToolbar />
    </Region>,
  );
  const row = screen.getByTestId("toolbar");
  // 44px including its 1px hairline, on whole pixels: the 32px buttons sit 6px
  // from the top and 6px from the row's bottom edge; on a desktop with a mouse
  // the 34px buttons sit 4px from the top and 6px from the bottom edge (5px of
  // space above the hairline).
  expect(rect(row).height).toBe(44);
  const button = rect(screen.getByRole("button", { name: "Mark as Read" }));
  const desktop = matchMedia("(width >= 48rem) and (pointer: fine)").matches;
  expect(button.top - rect(row).top).toBe(desktop ? 4 : 6);
  expect(rect(row).bottom - button.bottom).toBe(6);
  cleanup();
  render(
    <Region width={320}>
      <SelectionToolbar />
    </Region>,
  );
  const toolbar = screen.getByTestId("toolbar");
  expect(rect(toolbar).height).toBeGreaterThan(44);
  expect(toolbar.scrollWidth).toBeLessThanOrEqual(toolbar.clientWidth);
});

function TasksToolbar() {
  return (
    <TasksPanelRoot>
      <TasksPanelToolbar data-testid="toolbar">
        <TasksPanelToolbarNewTask>
          <Button>New Task</Button>
        </TasksPanelToolbarNewTask>
        <TasksPanelToolbarFilters data-testid="filters">
          <Button variant="outline">Assignee</Button>
        </TasksPanelToolbarFilters>
        <TasksPanelToolbarView>
          <Button variant="outline">Board</Button>
        </TasksPanelToolbarView>
      </TasksPanelToolbar>
    </TasksPanelRoot>
  );
}

it("the tasks toolbar takes the narrow layout in a 360px task column on a wide window", () => {
  render(
    <Region width={360}>
      <TasksToolbar />
    </Region>,
  );
  expect(getComputedStyle(screen.getByTestId("toolbar")).display).toBe("grid");
  expect(rect(screen.getByTestId("filters")).top).toBeGreaterThan(
    rect(screen.getByText("New Task")).bottom,
  );
  cleanup();
  render(
    <Region width={800}>
      <TasksToolbar />
    </Region>,
  );
  expect(getComputedStyle(screen.getByTestId("toolbar")).display).toBe("flex");
});

const IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23dbeafe'/%3E%3C/svg%3E";

const GALLERY_ROW = { items: [0, 1].map((index) => ({ index, fit: "cover" as const })) };

function Gallery() {
  const row = GALLERY_ROW;
  return (
    <MessageImageGallery data-testid="gallery">
      <MessageImageGalleryRow row={row} data-testid="row">
        {row.items.map((item) => (
          <MessageImageGalleryItem key={item.index} layout={item}>
            <img src={IMAGE} alt="" />
          </MessageImageGalleryItem>
        ))}
      </MessageImageGalleryRow>
    </MessageImageGallery>
  );
}

it("a gallery is the column's width when the column is narrower than 360px, with the shorter rows", () => {
  render(
    <Region width={280}>
      <Gallery />
    </Region>,
  );
  expect(rect(screen.getByTestId("gallery")).width).toBeLessThanOrEqual(280.5);
  expect(getComputedStyle(screen.getByTestId("row")).gridAutoRows).toBe("128px");
  cleanup();
  render(
    <Region width={600}>
      <Gallery />
    </Region>,
  );
  expect(rect(screen.getByTestId("gallery")).width).toBeCloseTo(360, 0);
  expect(getComputedStyle(screen.getByTestId("row")).gridAutoRows).toBe("144px");
});

function Bundle() {
  return (
    <MessageForwardedBundleGallery>
      {[0, 1, 2].map((n) => (
        <MessageForwardedBundleGalleryTile key={n} data-testid={`tile-${n}`}>
          <img src={IMAGE} alt="" />
        </MessageForwardedBundleGalleryTile>
      ))}
    </MessageForwardedBundleGallery>
  );
}

it("a forwarded bundle's row of three is two across in a 320px card and three across in a wide one", () => {
  render(
    <Region width={320}>
      <Bundle />
    </Region>,
  );
  expect(rect(screen.getByTestId("tile-2")).top).toBeGreaterThan(
    rect(screen.getByTestId("tile-0")).top,
  );
  cleanup();
  render(
    <Region width={560}>
      <Bundle />
    </Region>,
  );
  expect(rect(screen.getByTestId("tile-2")).top).toBeCloseTo(
    rect(screen.getByTestId("tile-0")).top,
    0,
  );
});

function Segments() {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <SegmentedControl defaultValue="list" aria-label="View">
        <SegmentedControlItem value="board">Board</SegmentedControlItem>
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="calendar">Calendar</SegmentedControlItem>
      </SegmentedControl>
    </div>
  );
}

it("a segmented control that can't fit scrolls inside its own track instead of spilling", async () => {
  render(
    <Region width={140}>
      <Segments />
    </Region>,
  );
  const track = bySlot("segmented-control");
  await waitFor(() => expect(track.hasAttribute("data-overflowing")).toBe(true));
  expect(rect(track).right).toBeLessThanOrEqual(rect(screen.getByTestId("region")).right + 0.5);
  expect(track.scrollWidth).toBeGreaterThan(track.clientWidth);
  expect(getComputedStyle(track).overflowX).toBe("auto");
  cleanup();
  render(
    <Region width={600}>
      <Segments />
    </Region>,
  );
  const wide = bySlot("segmented-control");
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  expect(wide.hasAttribute("data-overflowing")).toBe(false);
  // Not clipped while it fits: the focus ring reaches 1px past the track.
  expect(getComputedStyle(wide).overflowX).toBe("visible");
});

it("segmented controls that fit, on a wide window, never scroll or clip their focus ring", async () => {
  // The track is measured by its own scrollWidth, so Base UI's visually
  // hidden radio inputs, laid out outside the track's box, don't count.
  render(
    <Region width={1200}>
      <Segments />
      <SegmentedControl defaultValue="all" aria-label="Filter">
        <SegmentedControlItem value="all">All</SegmentedControlItem>
        <SegmentedControlItem value="unread">Unread</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl defaultValue="a" aria-label="Narrow row" className="w-full *:flex-1">
        <SegmentedControlItem value="a">Week</SegmentedControlItem>
        <SegmentedControlItem value="b">Month</SegmentedControlItem>
      </SegmentedControl>
    </Region>,
  );
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const tracks = document.querySelectorAll<HTMLElement>("[data-slot=segmented-control]");
  expect(tracks.length).toBe(3);
  for (const track of tracks) {
    expect(track.hasAttribute("data-overflowing")).toBe(false);
    expect(getComputedStyle(track).overflowX).toBe("visible");
    expect(track.scrollWidth).toBeLessThanOrEqual(track.clientWidth);
  }
});

it("a component that is its own container keeps its width in a block parent", () => {
  // As its own container a row of steps takes no width from its content; in
  // a parent with a definite width (a block here) it fills that width.
  render(
    <Region width={600}>
      <div>
        <FourSteps />
      </div>
    </Region>,
  );
  const steps = document.querySelector<HTMLElement>(".r-steps--horizontal")!;
  expect(rect(steps).width).toBeCloseTo(600, 0);
  cleanup();
  render(
    <Region width={600}>
      <div>
        <Facts />
      </div>
    </Region>,
  );
  expect(rect(bySlot("description-list")).width).toBeCloseTo(600, 0);
});

it("ListRowMeta truncates instead of running past the row once the title has given way", () => {
  render(
    <Region width={200}>
      <ListRow>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Admin</ListRowTitle>
            <ListRowMeta data-testid="meta">someone.with.a.long.address@example.com</ListRowMeta>
          </ListRowTop>
        </ListRowBody>
      </ListRow>
    </Region>,
  );
  const meta = screen.getByTestId("meta");
  expect(rect(meta).right).toBeLessThanOrEqual(rect(screen.getByTestId("region")).right + 0.5);
  expect(meta.scrollWidth).toBeGreaterThan(meta.clientWidth);
});

// A pre whose box can't change: a fixed height and no scrollbar.
const FIXED_PRE = { height: 40, scrollbarWidth: "none", overflowY: "hidden" } as const;

it("CodeBlockPre measures again when its code changes, without a resize", async () => {
  // The pre's box can't change here (a fixed height, no scrollbar), and the
  // inline code's growth isn't reported by a ResizeObserver: only measuring
  // on the content change itself makes the long line a keyboard region. A
  // ResizeObserver alone (the old CodeBlockPre) leaves it unreachable.
  const short = "ok";
  const long = "const x = ".concat("a".repeat(400), ";");
  const { rerender } = render(
    <Region width={300}>
      <CodeBlockPre style={FIXED_PRE}>
        <code>{short}</code>
      </CodeBlockPre>
    </Region>,
  );
  const pre = bySlot("code-block-pre");
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  expect(pre.hasAttribute("tabindex")).toBe(false);
  const box = rect(pre);
  rerender(
    <Region width={300}>
      <CodeBlockPre style={FIXED_PRE}>
        <code>{long}</code>
      </CodeBlockPre>
    </Region>,
  );
  // The box really didn't change, so no resize could have triggered it.
  expect(rect(pre).height).toBe(box.height);
  expect(rect(pre).width).toBe(box.width);
  await waitFor(() => expect(pre.getAttribute("tabindex")).toBe("0"));
});
