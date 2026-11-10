import "./fit-toolbar.test.css";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  FitToolbar,
  FitToolbarGroup,
  FitToolbarSearch,
  useFitItem,
  useFitMore,
} from "./fit-toolbar";
import type { FitSteps } from "./fit-toolbar";

// The search field of a list's toolbar (responsive.md › The toolbar over a
// list): it fills the rest of its line and keeps at least 160px, so the
// toolbar's other steps (the sort and the view into More) come before it is
// squeezed; last, it becomes a search icon button at the start of the line
// that opens the field across the whole first line, closed again once it is
// empty and loses focus, or on Esc. A search with text stays open. Measured
// in the toolbar's region, never the window. Fixed-width items keep the
// arithmetic independent of fonts. Real layout only.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const settle = async () => {
  await frame();
  await frame();
};
const el = (id: string) => screen.getByTestId(id);
const box = (id: string) => el(id).getBoundingClientRect();
const shown = (node: Element) => node.getClientRects().length > 0;
const field = () => document.querySelector<HTMLElement>("[data-fit-search-field]")!;
const searchButton = () => document.querySelector<HTMLElement>("[data-fit-search-button]")!;

/** A 90px item, or 40px when `narrow`; hidden once in More, as FitToolbarButton is. */
function Item({ id, narrow = false, ...steps }: FitSteps & { id: string; narrow?: boolean }) {
  const item = useFitItem(steps);
  return (
    <BaseToolbar.Button
      data-testid={id}
      className={
        narrow
          ? "h-8 w-10 flex-none data-fit-more:hidden"
          : "h-8 w-[90px] flex-none data-fit-more:hidden"
      }
      {...item.props}
    >
      {id}
    </BaseToolbar.Button>
  );
}

function More() {
  const fit = useFitMore();
  return (
    <BaseToolbar.Button
      aria-label="More"
      data-testid="more"
      className="hidden h-8 w-10 flex-none data-fit-shown:block"
      {...fit.props}
    />
  );
}

/**
 * The scope (90), the search, then the sort and the view (40 each) at the
 * end, which move into More (60) before the search collapses (70).
 */
function ListBar({ filters = false, value }: { filters?: boolean; value?: string }) {
  return (
    <FitToolbar aria-label="Tasks" wrap className="gap-2" data-testid="bar">
      <FitToolbarGroup firstLine className="gap-2">
        <Item id="scope" />
      </FitToolbarGroup>
      <FitToolbarSearch
        aria-label="Search tasks"
        collapseOrder={70}
        clearLabel="Clear search"
        defaultValue={value}
        data-testid="search"
      />
      {filters ? (
        <FitToolbarGroup overflow="scroll" wrapOrder={30} className="gap-2" data-testid="filters">
          {["f1", "f2"].map((id) => (
            <BaseToolbar.Button key={id} data-testid={id} className="h-8 w-[90px] flex-none">
              {id}
            </BaseToolbar.Button>
          ))}
        </FitToolbarGroup>
      ) : null}
      <FitToolbarGroup firstLine className="gap-2" data-testid="end">
        <Item id="sort" narrow more={60} />
        {filters ? null : <Item id="view" narrow more={60} />}
        <More />
      </FitToolbarGroup>
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

it("fills the rest of its line, the end group at the line's end", async () => {
  await wide();
  inRegion(400, <ListBar />);
  await settle();
  // 90 + 8 + search + 8 + 40 + 8 + 40 = 400.
  expect(field().getBoundingClientRect().width).toBe(206);
  expect(field().getBoundingClientRect().left).toBe(box("scope").right + 8);
  expect(box("view").right).toBe(box("region").right);
  expect(shown(el("more"))).toBe(false);
  expect(shown(searchButton())).toBe(false);
  expect(screen.getByRole("searchbox", { name: "Search tasks" })).toBe(el("search"));
});

it("keeps 160px: below that the sort and the view move into More, measured in its region", async () => {
  await wide();
  // A search of 166px: nothing gives way.
  inRegion(360, <ListBar />);
  await settle();
  expect(field().getBoundingClientRect().width).toBe(166);
  expect(el("sort").hasAttribute("data-fit-more")).toBe(false);
  // It would be 156px: the sort and the view move into More, the search widens.
  el("region").style.width = "350px";
  await settle();
  expect(el("sort").hasAttribute("data-fit-more")).toBe(true);
  expect(el("view").hasAttribute("data-fit-more")).toBe(true);
  expect(shown(el("more"))).toBe(true);
  // 350 - 90 - 8 - 8 - 40.
  expect(field().getBoundingClientRect().width).toBe(204);
  expect(el("search").closest("[data-fit-collapse]")).toBeNull();
});

it("last, under 160px with the end in More, it becomes a search icon button at the line's start", async () => {
  await wide();
  inRegion(280, <ListBar />);
  await settle();
  const wrapper = el("search").closest("[data-slot=fit-toolbar-search]")!;
  expect(wrapper.hasAttribute("data-fit-collapse")).toBe(true);
  expect(shown(field())).toBe(false);
  expect(shown(searchButton())).toBe(true);
  // At the start of the line, before the scope; More stays at the end.
  expect(searchButton().getBoundingClientRect().left).toBe(box("region").left);
  expect(box("scope").left).toBe(searchButton().getBoundingClientRect().right + 8);
  expect(box("more").right).toBe(box("region").right);
  expect(screen.getByRole("button", { name: "Search tasks" })).toBe(searchButton());
  // Wider again: the field is back, the button gone.
  el("region").style.width = "400px";
  await settle();
  expect(wrapper.hasAttribute("data-fit-collapse")).toBe(false);
  expect(shown(field())).toBe(true);
  expect(shown(searchButton())).toBe(false);
});

it("the button opens the field in the scope's place, More kept at the end; Esc empties it, then closes it back to the button", async () => {
  await wide();
  inRegion(280, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(searchButton());
  await settle();
  expect(document.activeElement).toBe(el("search"));
  const open = field().getBoundingClientRect();
  expect(open.left).toBe(box("region").left);
  expect(open.right + 8).toBe(box("more").left);
  expect(box("more").right).toBe(box("region").right);
  expect(
    Math.abs(open.top + open.height / 2 - (box("scope").top + box("scope").height / 2)),
  ).toBeLessThanOrEqual(1);
  // What it covers can't be reached, More can; the toolbar measured the same.
  expect(el("scope").closest("[inert]")).not.toBeNull();
  expect(el("more").closest("[inert]")).toBeNull();
  expect(getComputedStyle(el("more")).visibility).toBe("visible");
  expect(
    el("search").closest("[data-slot=fit-toolbar-search]")!.hasAttribute("data-fit-collapse"),
  ).toBe(true);

  await userEvent.keyboard("abc");
  expect((el("search") as HTMLInputElement).value).toBe("abc");
  await userEvent.keyboard("{Escape}");
  expect((el("search") as HTMLInputElement).value).toBe("");
  expect(shown(field())).toBe(true);
  await userEvent.keyboard("{Escape}");
  await settle();
  expect(shown(field())).toBe(false);
  expect(document.activeElement).toBe(searchButton());
  expect(el("scope").closest("[inert]")).toBeNull();
  expect(el("scope").style.visibility).toBe("");
});

it("an empty field closes when it loses focus; one with text keeps its field until it is cleared", async () => {
  await wide();
  inRegion(280, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(searchButton());
  await settle();
  el("after").focus();
  await settle();
  expect(shown(field())).toBe(false);

  await userEvent.click(searchButton());
  await settle();
  await userEvent.keyboard("abc");
  el("after").focus();
  await settle();
  expect(shown(field())).toBe(true);
  expect(field().getBoundingClientRect().left).toBe(box("region").left);
  // Its clear button empties it and keeps focus in it; leaving it closes it.
  await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
  await settle();
  expect((el("search") as HTMLInputElement).value).toBe("");
  expect(document.activeElement).toBe(el("search"));
  el("after").focus();
  await settle();
  expect(shown(field())).toBe(false);
});

it("a search that starts with text is open from the first frame", async () => {
  await wide();
  inRegion(280, <ListBar value="bug" />);
  await settle();
  // The button keeps its place under the field, unseen and out of reach.
  expect(getComputedStyle(searchButton()).visibility).toBe("hidden");
  expect(searchButton().closest("[inert]")).not.toBeNull();
  expect(shown(field())).toBe(true);
  // 280 - 8 - More's 40.
  expect(field().getBoundingClientRect().width).toBe(232);
  expect(el("more").closest("[inert]")).toBeNull();
});

it("collapsed, it is the first stop: Tab enters at it, and the arrow keys go on to the scope", async () => {
  await wide();
  inRegion(280, <ListBar />);
  await settle();
  const { userEvent } = await import("vite-plus/test/browser/context");
  el("before").focus();
  await userEvent.tab();
  expect(document.activeElement).toBe(searchButton());
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("scope"));
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("more"));
  // One Tab stop: the next Tab leaves the toolbar.
  await userEvent.tab();
  expect(document.activeElement).toBe(el("after"));
});

it("beside a scrolling group the search fills and the filters keep their width; then the filters wrap", async () => {
  await wide();
  inRegion(1000, <ListBar filters />);
  await settle();
  // One line: the filters at their own width, the search taking the rest.
  expect(box("f1").top).toBe(box("scope").top);
  const filters = box("filters");
  expect(filters.width).toBe(188);
  expect(field().getBoundingClientRect().right + 8).toBe(filters.left);
  // 1000 - 90 - 8 - 8 - 188 - 8 - 40: More is hidden, so no gap after the sort.
  expect(field().getBoundingClientRect().width).toBe(658);
  // The search would be under 160px: the filters wrap, the search fills the first line.
  el("region").style.width = "500px";
  await settle();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  expect(box("f1").top).toBeGreaterThan(box("scope").bottom);
  expect(field().getBoundingClientRect().width).toBe(500 - 90 - 8 - 8 - 40);
  expect(box("filters").width).toBe(500);
  expect(el("sort").hasAttribute("data-fit-more")).toBe(false);
});

it("open in the scope's place, it leaves More and the wrapped filters reachable", async () => {
  await wide();
  inRegion(260, <ListBar filters />);
  await settle();
  expect(el("filters").hasAttribute("data-fit-wrap")).toBe(true);
  expect(shown(searchButton())).toBe(true);
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.click(searchButton());
  await settle();
  expect(el("filters").closest("[inert]")).toBeNull();
  expect(el("f1").style.visibility).toBe("");
  expect(el("more").closest("[inert]")).toBeNull();
  expect(el("more").checkVisibility()).toBe(true);
  // At the caret's end the arrow goes on to its clear button, to More at the
  // first line's end, then to the next line, in reading order.
  await userEvent.keyboard("bug{ArrowRight}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Clear search" }));
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("more"));
  await userEvent.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(el("f1"));
});
