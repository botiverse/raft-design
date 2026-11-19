import "./fit-toolbar.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import { Select, SelectContent, SelectItem, SelectList, SelectTrigger } from "../select/select";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarPicker,
  FitToolbarSearch,
} from "./fit-toolbar";

// The item holding the toolbar's one Tab stop gives way after the toolbar
// first laid out: the region narrows, or an item arrives with the page's
// data, and the scope collapses into its Select. Base UI's composite checks
// that its highlighted item is shown only when its item list changes, so the
// stop stayed on the hidden segment ("Yours" kept tabIndex 0, every shown
// control -1) and Tab passed over the whole toolbar (slock's Apps at 375px;
// Tasks, collapsed from its first layout, kept its stop). Real layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const settle = async () => {
  await frame();
  await frame();
};
const el = (id: string) => screen.getByTestId(id);
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.testid;

/** Every element of the toolbar Tab can stop on, the hidden and inert included. */
const stops = () =>
  Array.from(el("bar").querySelectorAll<HTMLElement>("*")).filter(
    (node) =>
      node.tabIndex >= 0 &&
      !(node instanceof HTMLInputElement && node.type === "hidden") &&
      node.closest("[data-slot=fit-toolbar-search-sizer]") === null,
  );

/** The toolbar has exactly one Tab stop, on a control a person can see and reach. */
function expectOneShownStop() {
  const all = stops();
  expect(all.map((node) => node.dataset.testid ?? node.outerHTML.slice(0, 80))).toHaveLength(1);
  const [stop] = all;
  expect(stop!.getClientRects().length).toBeGreaterThan(0);
  expect(stop!.closest("[inert], [aria-hidden=true]")).toBeNull();
  return stop!;
}

const SCOPES = { yours: "Yours", discover: "Discover" };

function ScopeSelect() {
  return (
    <Select defaultValue="yours" items={SCOPES} modal={false}>
      <FitToolbarPicker trigger={<SelectTrigger />} icon={null} data-testid="scope-select">
        Yours
      </FitToolbarPicker>
      <SelectContent>
        <SelectList>
          <SelectItem value="yours">Yours</SelectItem>
          <SelectItem value="discover">Discover</SelectItem>
        </SelectList>
      </SelectContent>
    </Select>
  );
}

function AppsBar({ add, counts }: { add: boolean; counts: boolean }) {
  const [scope, setScope] = useState("yours");
  return (
    <FitToolbar aria-label="Apps" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2" collapseOrder={5} collapsed={<ScopeSelect />}>
        <SegmentedControl value={scope} onValueChange={setScope} aria-label="Whose apps">
          <SegmentedControlItem value="yours" data-testid="yours">
            <SegmentedControlLabel>Yours</SegmentedControlLabel>
            {counts ? <SegmentedControlCount>12</SegmentedControlCount> : null}
          </SegmentedControlItem>
          <SegmentedControlItem value="discover" data-testid="discover">
            <SegmentedControlLabel>Discover</SegmentedControlLabel>
            {counts ? <SegmentedControlCount>340</SegmentedControlCount> : null}
          </SegmentedControlItem>
        </SegmentedControl>
      </FitToolbarGroup>
      <FitToolbarSearch
        aria-label="Search apps"
        placeholder="Search"
        minWidth={160}
        data-testid="search"
      />
      <FitToolbarGroup overflow="scroll" wrapOrder={3} className="gap-2">
        <FitToolbarButton data-testid="filter">Category</FitToolbarButton>
      </FitToolbarGroup>
      <FitToolbarGroup firstLine className="gap-2">
        {add ? (
          <FitToolbarButton variant="default" icon={<Plus />} plusOrder={4} data-testid="add">
            Add app
          </FitToolbarButton>
        ) : null}
      </FitToolbarGroup>
    </FitToolbar>
  );
}

function Page({
  width,
  add = true,
  counts = false,
}: {
  width: number;
  add?: boolean;
  counts?: boolean;
}) {
  return (
    <ThemeProvider mode="light">
      <button type="button" data-testid="before">
        before
      </button>
      <div style={{ width }} data-testid="region">
        <AppsBar add={add} counts={counts} />
      </div>
      <button type="button" data-testid="after">
        after
      </button>
    </ThemeProvider>
  );
}

/**
 * The scope (174px), the search (160px at least) and Add as + (32px), 8px
 * apart, are 382px: past this width, and the scope collapses. Without Add
 * they are 342px and fit.
 */
const NARROW = 360;
/** Wide enough for all of them, until the scope's counts arrive. */
const SNUG = 400;

async function viewport() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
}

const collapsed = () =>
  document.querySelector("[data-slot=fit-toolbar-group][data-fit-collapse]") !== null;

async function tabIn() {
  const { userEvent } = await import("vite-plus/test/browser/context");
  el("before").focus();
  await userEvent.keyboard("{Tab}");
}

it("the scope collapsing after the first layout (the region narrows) moves the Tab stop to a shown control", async () => {
  await viewport();
  const { rerender } = render(<Page width={1000} add />);
  await settle();
  expect(collapsed()).toBe(false);
  expect(expectOneShownStop().dataset.testid).toBe("yours");

  rerender(<Page width={NARROW} add />);
  await settle();
  expect(collapsed()).toBe(true);
  expect(expectOneShownStop().dataset.testid).toBe("scope-select");
  await tabIn();
  expect(focused()).toBe("scope-select");
});

it("the scope collapsing when its counts arrive after mount moves the Tab stop to a shown control", async () => {
  await viewport();
  const { rerender } = render(<Page width={SNUG} />);
  await settle();
  expect(collapsed()).toBe(false);
  expect(expectOneShownStop().dataset.testid).toBe("yours");

  // The counts arrive with the page's data, no toolbar item comes or goes:
  // now the scope collapses.
  rerender(<Page width={SNUG} counts />);
  await settle();
  expect(collapsed()).toBe(true);
  expect(expectOneShownStop().dataset.testid).toBe("scope-select");
  await tabIn();
  expect(focused()).toBe("scope-select");
});

// An item arriving changes Base UI's list, which checks its stop again: this
// one held before the fix too, and guards the fix against breaking it.
it("the scope collapsing when an item arrives after mount moves the Tab stop to a shown control", async () => {
  await viewport();
  const { rerender } = render(<Page width={NARROW} add={false} />);
  await settle();
  expect(collapsed()).toBe(false);
  expect(expectOneShownStop().dataset.testid).toBe("yours");

  // The primary action arrives with the page's data: now the scope collapses.
  rerender(<Page width={NARROW} add />);
  await settle();
  expect(collapsed()).toBe(true);
  expect(expectOneShownStop().dataset.testid).toBe("scope-select");
  await tabIn();
  expect(focused()).toBe("scope-select");
});

it("the scope expanding again moves the Tab stop back to a shown control, still one", async () => {
  await viewport();
  const { rerender } = render(<Page width={1000} add />);
  await settle();
  rerender(<Page width={NARROW} add />);
  await settle();
  expect(collapsed()).toBe(true);
  expect(expectOneShownStop().dataset.testid).toBe("scope-select");

  rerender(<Page width={1000} add />);
  await settle();
  expect(collapsed()).toBe(false);
  expect(expectOneShownStop().dataset.testid).toBe("yours");
  await tabIn();
  expect(focused()).toBe("yours");
});

it("a shown control holding the Tab stop keeps it when the scope collapses", async () => {
  await viewport();
  const { rerender } = render(<Page width={1000} add />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await tabIn();
  expect(focused()).toBe("yours");
  // Over to the search, then out of the toolbar.
  await userEvent.keyboard("{ArrowRight}{ArrowRight}");
  expect(focused()).toBe("search");
  act(() => el("after").focus());

  rerender(<Page width={NARROW} add />);
  await settle();
  expect(collapsed()).toBe(true);
  // The search still holds the stop: it is shown, and it is where the person was.
  expect(expectOneShownStop().dataset.testid).toBe("search");
});
