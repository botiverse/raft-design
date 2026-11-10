import "./fit-toolbar.test.css";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../dropdown-menu/dropdown-menu";
import {
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarMore,
  FitToolbarMoreItems,
  FitToolbarPicker,
  FitToolbarSearch,
  useFitItem,
  useFitMore,
} from "./fit-toolbar";
import type { FitSteps } from "./fit-toolbar";

// The toolbar over a list (responsive.md › The toolbar over a list): one
// thing fills each line, the search on the first and the scrolling filters on
// the second, and it takes at most two lines. As its region narrows: 1. the
// sort, the grouping and the view show their icons; 2. the filters show their
// icons; 3. the filters move to a line of their own with their labels back,
// Clear all pinned at its end as ×; 4. the primary action becomes +; 5. the
// scope becomes a Select; 6. once the search is down to 160px, the sort, the
// grouping and the view move into More together; 7. the empty search becomes
// a button that opens the field across the first line. Fixed-width items keep
// the arithmetic independent of fonts. Real layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const settle = async () => {
  await frame();
  await frame();
};
const el = (id: string) => screen.getByTestId(id);
const box = (id: string) => el(id).getBoundingClientRect();
const field = () => document.querySelector<HTMLElement>("[data-fit-search-field]")!;
const searchButton = () => document.querySelector<HTMLElement>("[data-fit-search-button]")!;
const searchWrapper = () => document.querySelector<HTMLElement>("[data-slot=fit-toolbar-search]")!;

/**
 * An item `width` wide, `labelWidth` once its label has given way; hidden
 * once in More, as FitToolbarButton is.
 */
function Item({
  id,
  width,
  labelWidth = 40,
  active = false,
  ...steps
}: FitSteps & { id: string; width: number; labelWidth?: number; active?: boolean }) {
  const item = useFitItem(steps);
  const style = useMemo(
    () => ({ "--w": `${width}px`, "--w-label": `${labelWidth}px` }) as CSSProperties,
    [width, labelWidth],
  );
  return (
    <BaseToolbar.Button
      data-testid={id}
      data-active={active ? "" : undefined}
      style={style}
      className="h-8 w-(--w) flex-none data-fit-label:w-(--w-label) data-fit-more:hidden data-fit-plus:w-10"
      {...item.props}
    >
      {id}
    </BaseToolbar.Button>
  );
}

function More() {
  const fit = useFitMore();
  return (
    <>
      <BaseToolbar.Button
        aria-label="More"
        data-testid="more"
        className="hidden h-8 w-10 flex-none data-fit-shown:block"
        {...fit.props}
      />
      <div hidden data-testid="menu">
        <FitToolbarMoreItems />
      </div>
    </>
  );
}

/**
 * Tasks: the scope (150, or a 90px Select), the search (160 at least), three
 * filters (100, 40 as icons) with Clear all pinned (90, a 32px × as an icon),
 * the sort, the grouping and the view (90, 90 and 70; 40, 40 and 60 as
 * icons), More, and Create task (120, a 40px +). One line is 982px and the
 * search.
 */
function ListBar({ search = true }: { search?: boolean }) {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      {search ? (
        <FitToolbarGroup
          firstLine
          className="gap-2"
          data-testid="scope-group"
          collapseOrder={50}
          collapsed={<Item id="scope-select" width={90} />}
        >
          <Item id="scope" width={150} />
        </FitToolbarGroup>
      ) : null}
      {search ? (
        <FitToolbarSearch
          aria-label="Search tasks"
          collapseOrder={70}
          minWidth={160}
          data-testid="search"
        />
      ) : null}
      <FitToolbarGroup
        overflow="scroll"
        wrapOrder={30}
        firstLine={!search}
        className="gap-2"
        data-testid="filters"
        end={<Item id="clear" width={90} labelWidth={32} label={20} />}
      >
        <Item id="f1" width={100} label={20} active />
        <Item id="f2" width={100} label={20} />
        <Item id="f3" width={100} label={20} />
      </FitToolbarGroup>
      <FitToolbarGroup
        firstLine
        className="gap-2"
        data-testid="display"
        moreOrder={search ? 60 : undefined}
        moreItem={<span>Display options</span>}
      >
        <Item id="sort" width={90} label={10} />
        {search ? <Item id="grouping" width={90} label={10} /> : null}
        {search ? <Item id="view" width={70} labelWidth={60} label={10} /> : null}
      </FitToolbarGroup>
      {search ? (
        <FitToolbarGroup firstLine className="gap-2" data-testid="actions">
          <More />
          <Item id="create" width={120} plus={40} />
        </FitToolbarGroup>
      ) : null}
    </FitToolbar>
  );
}

function inRegion(width: number, ui: ReactNode) {
  return render(
    <ThemeProvider mode="light">
      <button type="button" data-testid="before">
        before
      </button>
      <div style={{ width }} data-testid="region">
        {ui}
      </div>
      <button type="button" data-testid="after">
        after
      </button>
    </ThemeProvider>,
  );
}

async function wide() {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
}

const has = (id: string, step: string) => el(id).hasAttribute(`data-fit-${step}`);

/** Which form each part shows. */
function state() {
  return {
    display: has("display", "more") ? "more" : has("sort", "label") ? "icons" : "labels",
    filters: has("f1", "label") ? "icons" : "labels",
    clear: has("clear", "label") ? "x" : "label",
    wrapped: has("filters", "wrap"),
    create: has("create", "plus") ? "plus" : "label",
    scope: has("scope-group", "collapse") ? "select" : "segmented",
    search: searchWrapper().hasAttribute("data-fit-collapse") ? "button" : "field",
  };
}

/** What a person can reach in the toolbar, as it shows. */
function reachable() {
  return Array.from(el("bar").querySelectorAll<HTMLElement>("button, input")).filter(
    (control) =>
      control.getClientRects().length > 0 &&
      control.closest("[inert], [aria-hidden=true], [hidden]") === null &&
      getComputedStyle(control).visibility !== "hidden" &&
      !control.hasAttribute("data-base-ui-focus-guard"),
  );
}

/** The lines, top to bottom, by each control's vertical center. */
function lineOf(control: HTMLElement) {
  const rect = control.getBoundingClientRect();
  // A line is 32px; the second's centers sit 40px below the first's.
  return rect.top + rect.height / 2 - box("bar").top > 36 ? 1 : 0;
}

/** Reading order: line by line, left to right on each. */
function visualOrder() {
  return reachable().sort(
    (a, b) =>
      lineOf(a) - lineOf(b) || a.getBoundingClientRect().left - b.getBoundingClientRect().left,
  );
}

/** The rule's invariants, at any width. */
function expectTheRule() {
  const region = box("region");
  const bar = el("bar");
  // Nothing pokes out of the region; a scrolling group clips its own items.
  for (const control of reachable()) {
    if (control.closest("[data-fit-scroller]")) continue;
    expect(control.getBoundingClientRect().right, control.textContent ?? "").toBeLessThanOrEqual(
      region.right + 0.5,
    );
  }
  expect(box("filters").right).toBeLessThanOrEqual(region.right + 0.5);
  // At most two lines.
  const lines = new Set(reachable().map(lineOf));
  expect(lines.size).toBeLessThanOrEqual(2);
  expect(Math.max(...lines)).toBeLessThanOrEqual(1);
  // The first line starts at the region's start: never buttons hanging at its end alone.
  const first = visualOrder()[0]!;
  expect(first.getBoundingClientRect().left).toBe(region.left);
  // One thing fills each line: the search (160px at least) or its button on
  // the first; the filters, the whole width, on the second.
  if (state().search === "field") {
    expect(field().getBoundingClientRect().width).toBeGreaterThanOrEqual(160);
  } else {
    expect(searchButton().getBoundingClientRect().left).toBe(region.left);
  }
  if (bar.hasAttribute("data-fit-wrapping")) {
    expect(box("filters").left).toBe(region.left);
    expect(box("filters").right).toBe(region.right);
    // Clear all pinned at the line's end.
    expect(box("clear").right).toBe(region.right);
  }
}

/** The arrow keys go through every control in the order they show, and Tab enters at the first. */
async function expectKeyboardFollowsTheScreen() {
  const { userEvent } = await import("vite-plus/test/browser/context");
  const expected = visualOrder();
  el("before").focus();
  await userEvent.tab();
  const visited = [document.activeElement];
  for (let index = 1; index < expected.length; index += 1) {
    await userEvent.keyboard("{ArrowRight}");
    visited.push(document.activeElement);
  }
  expect(visited.map((node) => (node as HTMLElement).dataset.testid ?? node?.ariaLabel)).toEqual(
    expected.map((node) => node.dataset.testid ?? node.ariaLabel),
  );
  // One Tab stop: the next Tab leaves.
  await userEvent.tab();
  expect(document.activeElement).toBe(el("after"));
}

const steps = [
  {
    width: 1180,
    state: {
      display: "labels",
      filters: "labels",
      clear: "label",
      wrapped: false,
      create: "label",
      scope: "segmented",
      search: "field",
    },
    search: 198,
  },
  {
    width: 1100,
    state: {
      display: "icons",
      filters: "labels",
      clear: "label",
      wrapped: false,
      create: "label",
      scope: "segmented",
      search: "field",
    },
    search: 228,
  },
  {
    width: 900,
    state: {
      display: "icons",
      filters: "icons",
      clear: "x",
      wrapped: false,
      create: "label",
      scope: "segmented",
      search: "field",
    },
    search: 266,
  },
  {
    width: 780,
    state: {
      display: "icons",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "label",
      scope: "segmented",
      search: "field",
    },
    search: 330,
  },
  {
    width: 560,
    state: {
      display: "icons",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "plus",
      scope: "segmented",
      search: "field",
    },
    search: 190,
  },
  {
    width: 500,
    state: {
      display: "icons",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "plus",
      scope: "select",
      search: "field",
    },
    search: 190,
  },
  {
    width: 420,
    state: {
      display: "more",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "plus",
      scope: "select",
      search: "field",
    },
    search: 226,
  },
  {
    width: 375,
    state: {
      display: "more",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "plus",
      scope: "select",
      search: "field",
    },
    search: 181,
  },
  {
    width: 320,
    state: {
      display: "more",
      filters: "labels",
      clear: "x",
      wrapped: true,
      create: "plus",
      scope: "select",
      search: "button",
    },
    search: undefined,
  },
] as const;

for (const step of steps) {
  it(`at ${step.width}px it takes the rule's steps up to ${step.state.search === "button" ? "the search button" : step.state.display === "more" ? "More" : step.state.scope === "select" ? "the scope's Select" : step.state.create === "plus" ? "+" : step.state.wrapped ? "the filters' own line" : step.state.filters === "icons" ? "the filters' icons" : step.state.display === "icons" ? "the display icons" : "nothing"}, and keeps the rule`, async () => {
    await wide();
    inRegion(step.width, <ListBar />);
    await settle();
    expect(state()).toEqual(step.state);
    if (step.search !== undefined) {
      expect(field().getBoundingClientRect().width).toBe(step.search);
    }
    expectTheRule();
    // More holds the sort, the grouping and the view together, and only then.
    expect(el("more").getClientRects().length > 0).toBe(step.state.display === "more");
    expect(el("menu").textContent).toBe(step.state.display === "more" ? "Display options" : "");
    await expectKeyboardFollowsTheScreen();
  });
}

it("narrowing and widening give the same toolbar at every width", async () => {
  await wide();
  inRegion(1180, <ListBar />);
  await settle();
  const seen = new Map<number, string>();
  for (const { width, state: expected } of steps) {
    el("region").style.width = `${width}px`;
    await settle();
    expect(state(), `${width} narrowing`).toEqual(expected);
    seen.set(width, JSON.stringify(state()));
  }
  for (const { width } of [...steps].reverse()) {
    el("region").style.width = `${width}px`;
    await settle();
    expect(JSON.stringify(state()), `${width} widening`).toBe(seen.get(width));
    expectTheRule();
  }
});

it("the sort, the grouping and the view move into More together, never one by one", async () => {
  await wide();
  inRegion(470, <ListBar />);
  await settle();
  for (let width = 470; width >= 400; width -= 2) {
    el("region").style.width = `${width}px`;
    await settle();
    const inMore = ["sort", "grouping", "view"].filter((id) => !el(id).checkVisibility());
    expect([0, 3], `${width}`).toContain(inMore.length);
    expectTheRule();
  }
});

it("focus on the view as it moves into More goes to More", async () => {
  await wide();
  inRegion(500, <ListBar />);
  await settle();
  el("view").focus();
  el("region").style.width = "420px";
  await settle();
  expect(state().display).toBe("more");
  expect(document.activeElement).toBe(el("more"));
});

it("a filter on its own line keeps focus and comes into view as the arrows reach it", async () => {
  await wide();
  inRegion(320, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  el("f3").focus();
  await settle();
  const strip = box("filters");
  // Whole and clear of Clear all, which stays pinned at the end.
  expect(box("f3").left).toBeGreaterThanOrEqual(strip.left);
  expect(box("f3").right).toBeLessThanOrEqual(box("clear").left);
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("clear"));
  expect(box("clear").right).toBe(box("region").right);
});

it("at 320px the search button opens the field in the scope's place, More and + kept; focus goes into it, and Esc twice brings it back", async () => {
  await wide();
  inRegion(320, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  el("before").focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(searchButton());
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(document.activeElement).toBe(el("search"));
  expect(field().getBoundingClientRect().left).toBe(box("region").left);
  expect(field().getBoundingClientRect().right + 8).toBe(box("more").left);
  expect(box("create").right).toBe(box("region").right);
  // More, + and the filters' line stay as they were, and reachable.
  expect(el("filters").closest("[inert]")).toBeNull();
  expect(el("more").closest("[inert]")).toBeNull();
  expect(el("create").closest("[inert]")).toBeNull();
  expect(el("scope-select").closest("[inert]")).not.toBeNull();
  await userEvent.keyboard("bug");
  // With text it stays open as focus leaves: the arrows go from the field on
  // to More and +, as they show, and back.
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("more"));
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("create"));
  await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
  expect(document.activeElement).toBe(el("search"));
  await userEvent.keyboard("{Escape}");
  expect((el("search") as HTMLInputElement).value).toBe("");
  expect(document.activeElement).toBe(el("search"));
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(document.activeElement).toBe(searchButton());
  expect(field().checkVisibility()).toBe(false);
  expect(el("scope-select").closest("[inert]")).toBeNull();
});

it("a search with text never collapses to its button: it stays open, and only empties on Esc", async () => {
  await wide();
  inRegion(320, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(searchButton());
  await settle();
  await userEvent.keyboard("bug");
  el("after").focus();
  await settle();
  expect(field().checkVisibility()).toBe(true);
  expect(getComputedStyle(searchButton()).visibility).toBe("hidden");
  // It stays in the scope's place: More and + are still there and reachable.
  expect(field().getBoundingClientRect().right + 8).toBe(box("more").left);
  expect(el("create").closest("[inert]")).toBeNull();
  // Wider, it is the field in the line again, with its text.
  el("region").style.width = "420px";
  await settle();
  expect(state().search).toBe("field");
  expect((el("search") as HTMLInputElement).value).toBe("bug");
  el("region").style.width = "320px";
  await settle();
  expect(field().checkVisibility()).toBe(true);
});

it("Esc in a field that isn't collapsed empties it and keeps focus in it; only the next Esc reaches the page", async () => {
  await wide();
  inRegion(420, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  // A dialog or a panel the toolbar sits in closes on Esc.
  let reached = 0;
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") reached += 1;
  };
  document.addEventListener("keydown", onKey);
  try {
    await userEvent.click(el("search"));
    await userEvent.keyboard("bug{Escape}");
    expect((el("search") as HTMLInputElement).value).toBe("");
    expect(document.activeElement).toBe(el("search"));
    expect(reached).toBe(0);
    await userEvent.keyboard("{Escape}");
    expect(reached).toBe(1);
  } finally {
    document.removeEventListener("keydown", onKey);
  }
});

it("without a search it is one line: the filters fill and scroll, the sort pinned at the end, labels kept", async () => {
  await wide();
  for (const width of [1180, 780, 420, 375, 320]) {
    inRegion(width, <ListBar search={false} />);
    await settle();
    expect(el("bar").hasAttribute("data-fit-wrapping"), `${width}`).toBe(false);
    expect(has("f1", "label"), `${width}`).toBe(false);
    expect(has("sort", "label"), `${width}`).toBe(false);
    expect(box("filters").left).toBe(box("region").left);
    expect(box("sort").right).toBe(box("region").right);
    expect(box("filters").right + 8).toBe(box("sort").left);
    expect(box("f1").top).toBe(box("sort").top);
    cleanup();
  }
});

it("a field with text and focus keeps both as the toolbar narrows under it", async () => {
  await wide();
  inRegion(780, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(el("search"));
  await userEvent.keyboard("bug");
  // Narrowed in steps, each measured before React renders the field open.
  for (const width of [560, 420, 320, 300]) {
    el("region").style.width = `${width}px`;
    await settle();
    expect(document.activeElement, `${width}`).toBe(el("search"));
    expect((el("search") as HTMLInputElement).value).toBe("bug");
  }
  expect(state().search).toBe("button");
  await userEvent.keyboard("s");
  expect((el("search") as HTMLInputElement).value).toBe("bugs");
});

it("Esc while an input method composes leaves the text alone", async () => {
  await wide();
  inRegion(420, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(el("search"));
  await userEvent.keyboard("bug");
  el("search").dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      code: "Escape",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  await settle();
  expect((el("search") as HTMLInputElement).value).toBe("bug");
  expect(document.activeElement).toBe(el("search"));
});

/** The sort and the view in More as one section, the view a choice of one; Clear all a real FitToolbarButton. */
function RealBar({ filtered = true }: { filtered?: boolean }) {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarSearch
        aria-label="Search tasks"
        collapseOrder={70}
        minWidth={160}
        data-testid="search"
      />
      <FitToolbarGroup
        overflow="scroll"
        wrapOrder={30}
        className="gap-2"
        data-testid="filters"
        end={
          filtered ? (
            <FitToolbarButton collapsedIcon={<X />} labelOrder={20} data-testid="clear">
              Clear filters
            </FitToolbarButton>
          ) : null
        }
      >
        <Item id="f1" width={100} label={20} active />
        <Item id="f2" width={100} label={20} />
      </FitToolbarGroup>
      <FitToolbarGroup
        firstLine
        className="gap-2"
        data-testid="display"
        moreOrder={60}
        moreItem={
          <DropdownMenuRadioGroup aria-label="View" value="list">
            <DropdownMenuRadioItem value="list">
              <DropdownMenuItemLabel>List</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="board">
              <DropdownMenuItemLabel>Board</DropdownMenuItemLabel>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        }
      >
        <Item id="view" width={90} label={10} />
      </FitToolbarGroup>
      <FitToolbarGroup firstLine className="gap-2">
        <DropdownMenu>
          <FitToolbarMore trigger={<DropdownMenuTrigger />} aria-label="Display options" />
          <DropdownMenuContent aria-label="Display options">
            <FitToolbarMoreItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </FitToolbarGroup>
    </FitToolbar>
  );
}

it("More opens a menu where a group's moreItem is a choice of one, named", async () => {
  await wide();
  inRegion(200, <RealBar />);
  await settle();
  expect(has("display", "more")).toBe(true);
  const more = screen.getByRole("button", { name: "Display options" });
  // An icon square, as the clear button is.
  expect(more.offsetWidth).toBe(more.offsetHeight);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(more);
  await settle();
  const group = await screen.findByRole("group", { name: "View" });
  const radios = screen.getAllByRole("menuitemradio");
  expect(radios.map((radio) => radio.textContent)).toEqual(["List", "Board"]);
  expect(radios.every((radio) => group.contains(radio))).toBe(true);
  expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
  await userEvent.keyboard("{Escape}");
});

it("a real FitToolbarButton pinned at the end reads as text on one line and stays × once the filters wrap", async () => {
  await wide();
  inRegion(1000, <RealBar />);
  await settle();
  const clear = el("clear");
  const label = clear.querySelector<HTMLElement>("[data-slot=fit-toolbar-button-label]")!;
  // One line: its words, no ×.
  expect(has("filters", "wrap")).toBe(false);
  expect(label.checkVisibility()).toBe(true);
  expect(label.getBoundingClientRect().width).toBeGreaterThan(1);
  expect(clear.offsetWidth).toBeGreaterThan(clear.offsetHeight);
  expect(
    clear.querySelector("[data-slot=fit-toolbar-button-collapsed-icon]")!.checkVisibility(),
  ).toBe(false);
  // The filters wrapped with their labels back; Clear all an × square at the line's end.
  el("region").style.width = "300px";
  await settle();
  expect(has("filters", "wrap")).toBe(true);
  expect(has("f1", "label")).toBe(false);
  expect(has("clear", "label")).toBe(true);
  expect(clear.offsetWidth).toBe(clear.offsetHeight);
  expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  expect(
    clear.querySelector("[data-slot=fit-toolbar-button-collapsed-icon] svg")!.checkVisibility(),
  ).toBe(true);
  expect(clear.getBoundingClientRect().right).toBe(box("region").right);
  expect(screen.getByRole("button", { name: "Clear filters" })).toBe(clear);
});

const SCOPES = [
  { value: "mine", label: "Mine", count: 61 },
  { value: "all", label: "All", count: 120 },
] as const;

/**
 * The Tasks toolbar of the docs, of real parts: the scope (a Select once it
 * gives way), the search with its measured least width, two filters, the sort
 * and the view (into More), More and Create task.
 */
function TasksBar({ placeholder = "Search tasks" }: { placeholder?: string }) {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup
        firstLine
        className="gap-2"
        data-testid="scope-group"
        collapseOrder={50}
        collapsed={
          <DropdownMenu>
            <FitToolbarPicker trigger={<DropdownMenuTrigger />} icon={null} aria-label="Scope Mine">
              Mine
            </FitToolbarPicker>
            <DropdownMenuContent aria-label="Scope" />
          </DropdownMenu>
        }
      >
        <SegmentedControl aria-label="Scope" defaultValue="mine">
          {SCOPES.map((scope) => (
            <SegmentedControlItem key={scope.value} value={scope.value}>
              <SegmentedControlLabel>{scope.label}</SegmentedControlLabel>
              <SegmentedControlCount>{scope.count}</SegmentedControlCount>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </FitToolbarGroup>
      <FitToolbarSearch
        aria-label="Search tasks"
        placeholder={placeholder}
        clearLabel="Clear search"
        collapseOrder={70}
        data-testid="search"
      />
      <FitToolbarGroup overflow="scroll" wrapOrder={30} className="gap-2" data-testid="filters">
        {["Status", "Assignee"].map((label) => (
          <DropdownMenu key={label}>
            <FitToolbarPicker trigger={<DropdownMenuTrigger />} icon={<X />} labelOrder={20}>
              {label}
            </FitToolbarPicker>
            <DropdownMenuContent aria-label={label} />
          </DropdownMenu>
        ))}
      </FitToolbarGroup>
      <FitToolbarGroup
        firstLine
        className="gap-2"
        data-testid="display"
        moreOrder={60}
        moreItem={<span>Display options</span>}
      >
        <DropdownMenu>
          <FitToolbarPicker trigger={<DropdownMenuTrigger />} icon={<X />} labelOrder={10}>
            Updated
          </FitToolbarPicker>
          <DropdownMenuContent aria-label="Sort" />
        </DropdownMenu>
      </FitToolbarGroup>
      <FitToolbarGroup firstLine className="gap-2">
        <DropdownMenu>
          <FitToolbarMore trigger={<DropdownMenuTrigger />} aria-label="Display options" />
          <DropdownMenuContent aria-label="Display options">
            <FitToolbarMoreItems />
          </DropdownMenuContent>
        </DropdownMenu>
        <FitToolbarButton variant="primary" icon={<X />} plusOrder={40}>
          Create task
        </FitToolbarButton>
      </FitToolbarGroup>
    </FitToolbar>
  );
}

const least = () => parseFloat(searchWrapper().style.getPropertyValue("--fit-search-min"));

it("the search's least width is measured: its icon and its whole placeholder, in its own font", async () => {
  await wide();
  inRegion(1180, <TasksBar />);
  await settle();
  await document.fonts.ready;
  await settle();
  const sizer = document.querySelector<HTMLElement>(
    "[data-slot=fit-toolbar-search-sizer] [data-slot=input-group]",
  )!;
  // The hidden copy is the measure: icon, placeholder, the field's padding and border.
  expect(least()).toBe(Math.ceil(sizer.getBoundingClientRect().width));
  // In the input's own font, not a guess from the number of characters.
  const words = sizer.querySelector("span")!;
  expect(getComputedStyle(words).font).toBe(getComputedStyle(el("search")).font);
  expect(least()).toBeGreaterThan(words.getBoundingClientRect().width);
  // "Search tasks" takes far less than the 160px it used to be held to.
  expect(least()).toBeLessThan(160);
  // Out of the row, out of reach.
  expect(sizer.closest("[inert]")).not.toBeNull();
  expect(sizer.closest("[aria-hidden=true]")).not.toBeNull();
  expect(getComputedStyle(sizer.parentElement!).position).toBe("absolute");
});

it("a longer placeholder raises the least width", async () => {
  await wide();
  inRegion(1180, <TasksBar />);
  await settle();
  const short = least();
  cleanup();
  inRegion(1180, <TasksBar placeholder="Search tasks, people and channels" />);
  await settle();
  expect(least()).toBeGreaterThan(short + 50);
});

it("the Tasks toolbar keeps a real search field at 375px and 320px", async () => {
  await wide();
  for (const width of [375, 320]) {
    inRegion(width, <TasksBar />);
    await settle();
    await document.fonts.ready;
    await settle();
    expect(searchWrapper().hasAttribute("data-fit-collapse"), `${width}`).toBe(false);
    expect(field().checkVisibility(), `${width}`).toBe(true);
    // The whole placeholder shows.
    const input = el("search") as HTMLInputElement;
    expect(field().getBoundingClientRect().width, `${width}`).toBeGreaterThanOrEqual(least());
    expect(input.scrollWidth, `${width}`).toBeLessThanOrEqual(input.clientWidth);
    for (const control of Array.from(el("bar").querySelectorAll<HTMLElement>("button, input"))) {
      if (!control.checkVisibility() || control.closest("[data-fit-scroller]")) continue;
      expect(control.getBoundingClientRect().right, `${width}`).toBeLessThanOrEqual(
        box("region").right + 0.5,
      );
    }
    cleanup();
  }
});

it("at the least width's threshold, a pixel either way, the field and its button never flip back and forth", async () => {
  await wide();
  inRegion(320, <TasksBar />);
  await settle();
  await document.fonts.ready;
  await settle();
  // Find the narrowest width that keeps the field.
  let width = 320;
  expect(searchWrapper().hasAttribute("data-fit-collapse")).toBe(false);
  while (!searchWrapper().hasAttribute("data-fit-collapse") && width > 120) {
    width -= 1;
    el("region").style.width = `${width}px`;
    await settle();
  }
  const threshold = width + 1;
  for (const each of [threshold, threshold - 1, threshold, threshold - 1, threshold]) {
    el("region").style.width = `${each}px`;
    await settle();
    // Settled: another measure gives the same.
    await settle();
    const collapsed = searchWrapper().hasAttribute("data-fit-collapse");
    expect(collapsed, `${each}`).toBe(each < threshold);
    if (!collapsed) expect(field().getBoundingClientRect().width).toBeGreaterThanOrEqual(least());
  }
});
