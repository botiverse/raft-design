// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useCallback, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Button } from "../button/button";
import { ChoiceList } from "./choice-list";
import type { ChoiceListItem } from "./choice-list";

// What a ChoiceList draws and how its search and choice behave, without layout.
// Keyboard, Tab order, clicks on the row and row heights need a real browser:
// choice-list.browser.test.tsx.

afterEach(cleanup);

const NAMES = [
  "atlas",
  "borealis",
  "cassini",
  "dione",
  "europa",
  "fermi",
  "galileo",
  "hubble",
  "io",
  "juno",
  "kepler",
  "luna",
];

function makeItems(count: number, extra?: (name: string) => Partial<ChoiceListItem>) {
  return NAMES.slice(0, count).map((name) => ({ value: name, label: name, ...extra?.(name) }));
}

const DESCRIBED_ITEMS: ChoiceListItem[] = [
  { value: "a", label: "atlas", description: ["4 GB free", "3 agents"] },
  { value: "b", label: "borealis" },
];

const LINE_ITEMS: ChoiceListItem[] = [
  { value: "a", label: "atlas", description: [null, "3 agents", "", false] },
  { value: "b", label: "borealis", description: ["one", "two", "three"] },
  { value: "c", label: "cassini", description: "" },
];

const WITH_DISABLED_ITEMS = [...makeItems(2), { value: "x", label: "xenon", disabled: true }];

const NO_ITEMS: ChoiceListItem[] = [];

const HUBBLE = ["hubble"];

const EIGHT_ITEMS = makeItems(8);

function ignore() {}

function Single({
  items,
  initial = null,
  search,
}: {
  items: readonly ChoiceListItem[];
  initial?: string | null;
  search?: "auto" | "always";
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <>
      <ChoiceList
        aria-label="Target computer"
        searchLabel="Search computers"
        clearSearchLabel="Clear search"
        noMatchLabel="No matches"
        empty="No computers yet"
        search={search}
        items={items}
        value={value}
        onValueChange={setValue}
      />
      <span data-testid="value">{value ?? ""}</span>
    </>
  );
}

function Multiple({
  items,
  initial = [],
}: {
  items: readonly ChoiceListItem[];
  initial?: string[];
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <>
      <ChoiceList
        multiple
        aria-label="Members"
        searchLabel="Search people"
        clearSearchLabel="Clear search"
        noMatchLabel="No matches"
        items={items}
        value={value}
        onValueChange={setValue}
      />
      <span data-testid="value">{value.join(",")}</span>
    </>
  );
}

function rowNames(role: "radio" | "checkbox" = "radio") {
  return screen
    .getAllByRole(role)
    .map((mark) => mark.getAttribute("aria-labelledby"))
    .map((id) => document.getElementById(id ?? "")?.textContent);
}

function search(text: string) {
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: text } });
}

/** jsdom has no media queries: answer `(pointer: fine)` as a mouse or a touch screen would. */
function stubPointer(fine: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query === "(pointer: fine)" ? fine : false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
}

test('search="auto" (the default): a list at every length, the search box only above five items', () => {
  for (const count of [3, 5, 6, 8, 12]) {
    const { unmount } = render(<Single items={makeItems(count)} />);
    expect(screen.getByRole("radiogroup", { name: "Target computer" })).toBeTruthy();
    expect(screen.getAllByRole("radio")).toHaveLength(count);
    expect(screen.queryAllByRole("searchbox")).toHaveLength(count > 5 ? 1 : 0);
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("listbox")).toBeNull();
    unmount();
  }
});

test('search="always": the box shows at any count, and focus starts in it with a mouse', () => {
  const restore = stubPointer(true);
  for (const count of [1, 3, 5, 8]) {
    const { unmount } = render(<Single search="always" items={makeItems(count)} />);
    const input = screen.getByRole("searchbox", { name: "Search computers" });
    expect(document.activeElement).toBe(input);
    expect(screen.getAllByRole("radio")).toHaveLength(count);
    unmount();
  }
  restore();
});

test('search="always" on a touch screen: the box shows but takes no focus, so no keyboard comes up', () => {
  const restore = stubPointer(false);
  render(<Single search="always" items={makeItems(3)} />);
  const input = screen.getByRole("searchbox", { name: "Search computers" });
  expect(document.activeElement).not.toBe(input);
  restore();
});

test('search="auto" never moves focus, even with a mouse', () => {
  const restore = stubPointer(true);
  render(<Single items={makeItems(8)} />);
  expect(document.activeElement).not.toBe(screen.getByRole("searchbox"));
  restore();
});

test('search="always" with no items: the empty line, no search box', () => {
  render(<Single search="always" items={NO_ITEMS} />);
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(screen.getByText("No computers yet")).toBeTruthy();
});

test("the search box is named by the caller, keeps type=search and hides WebKit's own cancel mark", () => {
  render(<Single items={makeItems(8)} />);
  const input = screen.getByRole("searchbox", { name: "Search computers" }) as HTMLInputElement;
  expect(input.type).toBe("search");
  expect(input.className.split(/\s+/)).toContain(
    "[&::-webkit-search-cancel-button]:appearance-none",
  );
});

test("the search filters by label, case-insensitively, and says when nothing matches", () => {
  render(<Single items={makeItems(8)} />);
  search("UB");
  expect(rowNames()).toEqual(["hubble"]);
  expect(screen.getByRole("status").textContent).toBe("");
  search("zzz");
  expect(screen.queryAllByRole("radio")).toHaveLength(0);
  expect(screen.getByRole("status").textContent).toBe("No matches");
});

test("the chosen row stays first, above the matches, and the no-match line goes under it", () => {
  render(<Single items={makeItems(8)} initial="galileo" />);
  search("e");
  expect(rowNames()).toEqual(["galileo", "borealis", "dione", "europa", "fermi", "hubble"]);
  search("zzz");
  expect(rowNames()).toEqual(["galileo"]);
  expect(screen.getByRole("status").textContent).toBe("No matches");
  expect((screen.getByRole("radio") as HTMLElement).getAttribute("aria-checked")).toBe("true");
});

test("a chosen row that matches is a match: no no-match line under it", () => {
  render(<Single items={makeItems(8)} initial="hubble" />);
  search("hub");
  expect(rowNames()).toEqual(["hubble"]);
  expect(screen.getByRole("status").textContent).toBe("");
});

test("the status is there with the box, empty, before anything fails to match", () => {
  render(<Single items={makeItems(8)} />);
  const status = screen.getByRole("status");
  expect(status.textContent).toBe("");
  search("zzz");
  expect(screen.getByRole("status")).toBe(status);
  expect(status.textContent).toBe("No matches");
});

test('under "auto", the search text goes when the box does, and doesn\'t come back with it', () => {
  const { rerender } = render(<Single items={makeItems(8)} />);
  search("a");
  rerender(<Single items={makeItems(3)} />);
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(rowNames()).toEqual(NAMES.slice(0, 3));
  rerender(<Single items={makeItems(8)} />);
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  expect(rowNames()).toEqual(NAMES.slice(0, 8));
});

test("filtering never changes the choice, and clearing restores the original order", () => {
  render(<Single items={makeItems(8)} initial="galileo" />);
  search("bo");
  expect(screen.getByTestId("value").textContent).toBe("galileo");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.getByTestId("value").textContent).toBe("galileo");
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
  expect(rowNames()).toEqual(NAMES.slice(0, 8));
});

test("the clear button shows only with text, and clearing puts focus back in the search box", () => {
  render(<Single items={makeItems(8)} />);
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  search("a");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole("searchbox"));
});

test("the pin is taken when the text changes: rows hold still as the choice moves, then the pin follows it", () => {
  render(<Single items={makeItems(8)} initial="galileo" />);
  search("e");
  fireEvent.click(screen.getByRole("radio", { name: "europa" }));
  expect(screen.getByTestId("value").textContent).toBe("europa");
  // The rows don't move under the pointer.
  expect(rowNames()).toEqual(["galileo", "borealis", "dione", "europa", "fermi", "hubble"]);
  search("er");
  expect(rowNames()).toEqual(["europa", "fermi"]);
});

test("search matches searchText when given, such as a handle beside the display name", () => {
  const items = makeItems(8, (name) => ({
    label: name.toUpperCase(),
    searchText: `${name} @${name.slice(0, 3)}bot`,
  }));
  render(<Single items={items} />);
  search("@hubbot");
  expect(rowNames()).toEqual(["HUBBLE"]);
});

test("a radio is named by its label alone; its description lines describe it", () => {
  render(<Single items={DESCRIBED_ITEMS} />);
  const radio = screen.getByRole("radio", { name: "atlas" });
  const described = document.getElementById(radio.getAttribute("aria-describedby") ?? "");
  expect(described?.textContent).toBe("4 GB free3 agents");
  expect(screen.getByRole("radio", { name: "borealis" }).hasAttribute("aria-describedby")).toBe(
    false,
  );
});

test("an empty description line is not drawn, and no more than two are", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  render(<Single items={LINE_ITEMS} />);
  const rows = document.querySelectorAll("[data-slot=choice-list-item]");
  const lines = (row: Element) =>
    [...row.querySelectorAll("[data-slot=choice-list-description]")].map((el) => el.textContent);
  expect(lines(rows[0]!)).toEqual(["3 agents"]);
  expect(lines(rows[1]!)).toEqual(["one", "two"]);
  expect(lines(rows[2]!)).toEqual([]);
  expect(warn).toHaveBeenCalledWith(expect.stringContaining("more than 2 description lines"));
  warn.mockRestore();
});

test("a row action sits outside the row's label and the group, and choosing it chooses nothing", () => {
  const onDetails = vi.fn();
  render(
    <Single
      initial="atlas"
      items={makeItems(3, (name) =>
        name === "borealis"
          ? {}
          : {
              action: (
                <Button
                  variant="ghost"
                  size="icon-md"
                  aria-label={`Details for ${name}`}
                  onClick={onDetails}
                >
                  i
                </Button>
              ),
            },
      )}
    />,
  );
  const group = screen.getByRole("radiogroup");
  const buttons = screen.getAllByRole("button", { name: /^Details for / });
  expect(buttons.map((button) => button.getAttribute("aria-label"))).toEqual([
    "Details for atlas",
    "Details for cassini",
  ]);
  for (const button of buttons) {
    expect(group.contains(button)).toBe(false);
    expect(button.closest("label")).toBeNull();
    // After the group in the DOM, so after it in the Tab order.
    expect(group.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  }
  // A row without an action has no button of its own.
  expect(screen.queryByRole("button", { name: "Details for borealis" })).toBeNull();
  // Each action is laid on its own row of the shared grid.
  const actions = document.querySelectorAll<HTMLElement>("[data-slot=choice-list-action]");
  expect([...actions].map((el) => el.style.gridRow)).toEqual(["1", "3"]);
  expect(group.style.gridRow).toBe("1 / span 3");

  fireEvent.click(buttons[1]!);
  expect(onDetails).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("value").textContent).toBe("atlas");
  expect(screen.getByRole("radio", { name: "atlas" }).getAttribute("aria-checked")).toBe("true");
});

test("actions follow their rows through a search", () => {
  render(
    <Single
      items={makeItems(8, (name) => ({
        action: <Button aria-label={`Details for ${name}`}>i</Button>,
      }))}
    />,
  );
  search("u");
  expect(
    screen
      .getAllByRole("button", { name: /^Details for / })
      .map((b) => b.getAttribute("aria-label")),
  ).toEqual(["Details for europa", "Details for hubble"]);
});

test("a disabled row can't be chosen and marks its row", () => {
  render(<Single items={WITH_DISABLED_ITEMS} />);
  const radio = screen.getByRole("radio", { name: "xenon" });
  expect(radio.hasAttribute("data-disabled")).toBe(true);
  expect(radio.closest("label")?.hasAttribute("data-disabled")).toBe(true);
  fireEvent.click(radio);
  expect(screen.getByTestId("value").textContent).toBe("");
});

test("no items at all draws the caller's empty line and no group", () => {
  render(<Single items={NO_ITEMS} />);
  expect(screen.queryByRole("radiogroup")).toBeNull();
  expect(screen.getByText("No computers yet")).toBeTruthy();
});

test("multiple: a group of checkboxes that toggle, with every chosen row pinned", () => {
  render(<Multiple items={makeItems(8)} initial={HUBBLE} />);
  expect(screen.getByRole("group", { name: "Members" })).toBeTruthy();
  expect(screen.queryByRole("radio")).toBeNull();
  fireEvent.click(screen.getByRole("checkbox", { name: "atlas" }));
  expect(screen.getByTestId("value").textContent).toBe("hubble,atlas");
  fireEvent.click(screen.getByRole("checkbox", { name: "hubble" }));
  expect(screen.getByTestId("value").textContent).toBe("atlas");
  fireEvent.click(screen.getByRole("checkbox", { name: "hubble" }));

  search("io");
  expect(rowNames("checkbox")).toEqual(["atlas", "hubble", "dione"]);
  fireEvent.click(screen.getByRole("checkbox", { name: "dione" }));
  expect(screen.getByTestId("value").textContent).toBe("atlas,hubble,dione");
  // A new pin keeps the items' own order.
  search("zzz");
  expect(rowNames("checkbox")).toEqual(["atlas", "dione", "hubble"]);
  expect(screen.getByRole("status").textContent).toBe("No matches");
});

test("rows show no cursor of their own; the app's cursor rule owns it", () => {
  render(<Single items={makeItems(3)} />);
  for (const row of document.querySelectorAll("[data-slot=choice-list-item]")) {
    expect(row.className).not.toMatch(/(^|\s)cursor-pointer(\s|$)/);
  }
});

test("defaultSearchValue starts the search, with the chosen row pinned", () => {
  render(
    <ChoiceList
      aria-label="Target computer"
      searchLabel="Search computers"
      clearSearchLabel="Clear search"
      noMatchLabel="No matches"
      defaultSearchValue="zzz"
      items={EIGHT_ITEMS}
      value="cassini"
      onValueChange={ignore}
    />,
  );
  expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("zzz");
  expect(rowNames()).toEqual(["cassini"]);
  expect(screen.getByRole("status").textContent).toBe("No matches");
});

const GROUPS = [
  { value: "agents", label: "Agents" },
  { value: "people", label: "People" },
];

const PEOPLE_AND_AGENTS: ChoiceListItem[] = [
  { value: "mia", label: "Mia", group: "people" },
  { value: "kirby", label: "Kirby", group: "agents" },
  { value: "noel", label: "Noel", group: "agents" },
  { value: "ricky", label: "Ricky", group: "people" },
  { value: "guest", label: "Guest" },
];

const RICKY = ["ricky"];

function withDetails(items: readonly ChoiceListItem[]): ChoiceListItem[] {
  return items.map((item) => ({
    ...item,
    action: <Button aria-label={`Details for ${item.value}`}>i</Button>,
  }));
}

function Grouped({ initial = [] as string[], groups = GROUPS }) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <ChoiceList
      multiple
      search="always"
      aria-label="Members"
      searchLabel="Search people"
      clearSearchLabel="Clear search"
      noMatchLabel="No matches"
      groups={groups}
      items={PEOPLE_AND_AGENTS}
      value={value}
      onValueChange={setValue}
    />
  );
}

/** Each group's heading and the names under it, in DOM order; "" for rows of no group. */
function sectionsShown() {
  const group = document.querySelector("[data-slot=choice-list-group]")!;
  return [...group.children].map((child) =>
    child.getAttribute("data-slot") === "choice-list-section"
      ? [
          child.querySelector("[data-slot=choice-list-heading]")?.textContent,
          ...[...child.querySelectorAll("[data-slot=choice-list-label]")].map(
            (el) => el.textContent,
          ),
        ]
      : ["", child.querySelector("[data-slot=choice-list-label]")?.textContent],
  );
}

test("groups: a heading over each group's rows, in the groups' order; rows of no group come last", () => {
  render(<Grouped />);
  expect(sectionsShown()).toEqual([
    ["Agents", "Kirby", "Noel"],
    ["People", "Mia", "Ricky"],
    ["", "Guest"],
  ]);
  // Each group is a group named by its heading, inside the one checkbox group.
  const agents = screen.getByRole("group", { name: "Agents" });
  expect(screen.getByRole("group", { name: "Members" }).contains(agents)).toBe(true);
  expect(within(agents).getAllByRole("checkbox")).toHaveLength(2);
});

test("groups: a group the search leaves empty loses its heading; the chosen row stays first in its own group", () => {
  render(<Grouped initial={RICKY} />);
  search("i");
  expect(sectionsShown()).toEqual([
    ["Agents", "Kirby"],
    ["People", "Ricky", "Mia"],
  ]);
  search("noel");
  expect(sectionsShown()).toEqual([
    ["Agents", "Noel"],
    ["People", "Ricky"],
  ]);
  search("zzz");
  expect(sectionsShown()).toEqual([["People", "Ricky"]]);
  expect(screen.getByRole("status").textContent).toBe("No matches");
});

test("groups: a heading and its rows take grid rows in order, and each action is laid on its row's", () => {
  render(
    <ChoiceList
      aria-label="Members"
      searchLabel="Search people"
      clearSearchLabel="Clear search"
      groups={GROUPS}
      items={withDetails(PEOPLE_AND_AGENTS)}
      value={null}
      onValueChange={ignore}
    />,
  );
  const sections = document.querySelectorAll<HTMLElement>("[data-slot=choice-list-section]");
  expect([...sections].map((section) => section.style.gridRow)).toEqual([
    "1 / span 3",
    "4 / span 3",
  ]);
  const actions = document.querySelectorAll<HTMLElement>("[data-slot=choice-list-action]");
  expect([...actions].map((action) => [action.textContent, action.style.gridRow])).toEqual([
    ["i", "2"],
    ["i", "3"],
    ["i", "5"],
    ["i", "6"],
    ["i", "7"],
  ]);
  expect(
    [...actions].map((action) => action.querySelector("button")?.getAttribute("aria-label")),
  ).toEqual([
    "Details for kirby",
    "Details for noel",
    "Details for mia",
    "Details for ricky",
    "Details for guest",
  ]);
  expect(
    (document.querySelector("[data-slot=choice-list-group]") as HTMLElement).style.gridRow,
  ).toBe("1 / span 7");
});

test("searchValue: the caller owns the search text and hears each change, the clear button too", () => {
  const changes: string[] = [];
  function Controlled() {
    const [text, setText] = useState("");
    const hear = useCallback((next: string) => {
      changes.push(next);
      setText(next);
    }, []);
    return (
      <>
        <ChoiceList
          aria-label="Target computer"
          searchLabel="Search computers"
          clearSearchLabel="Clear search"
          noMatchLabel={`Nothing matches “${text}”`}
          searchValue={text}
          onSearchValueChange={hear}
          items={EIGHT_ITEMS}
          value={null}
          onValueChange={ignore}
        />
        <span data-testid="query">{text}</span>
      </>
    );
  }
  render(<Controlled />);
  search("zzz");
  expect(screen.getByTestId("query").textContent).toBe("zzz");
  expect(screen.getByRole("status").textContent).toBe("Nothing matches “zzz”");
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(changes).toEqual(["zzz", ""]);
  expect(rowNames()).toHaveLength(8);
});

test("footer: the caller's row sits in the frame under the rows, outside what scrolls", () => {
  render(
    <ChoiceList
      aria-label="Target computer"
      searchLabel="Search computers"
      clearSearchLabel="Clear search"
      items={EIGHT_ITEMS}
      value={null}
      onValueChange={ignore}
      footer={<Button>Create an agent</Button>}
    />,
  );
  const frame = document.querySelector("[data-slot=choice-list-frame]")!;
  const scroller = document.querySelector("[data-slot=choice-list-scroller]")!;
  const footer = document.querySelector("[data-slot=choice-list-footer]")!;
  expect(frame.contains(footer)).toBe(true);
  expect(scroller.contains(footer)).toBe(false);
  expect(scroller.className).toMatch(/\boverflow-y-auto\b/);
  expect(
    within(footer as HTMLElement).getByRole("button", { name: "Create an agent" }),
  ).toBeTruthy();
});

test("fill: the list takes the height it is given and scrolls inside it, with no 18rem cap", () => {
  render(
    <ChoiceList
      fill
      aria-label="Target computer"
      searchLabel="Search computers"
      clearSearchLabel="Clear search"
      items={EIGHT_ITEMS}
      value={null}
      onValueChange={ignore}
    />,
  );
  const root = document.querySelector("[data-slot=choice-list]")!;
  const scroller = document.querySelector("[data-slot=choice-list-scroller]")!;
  expect(root.className).toMatch(/\bflex-1\b/);
  expect(scroller.className).toMatch(/\boverflow-y-auto\b/);
  expect(scroller.className).not.toMatch(/\bmax-h-72\b/);
});

test('searchValue under "auto": when the box goes, the caller hears ""; a text set from outside re-pins the chosen row', () => {
  const heard: string[] = [];
  function Owner({ count, text: start }: { count: number; text: string }) {
    const [text, setText] = useState(start);
    const hear = useCallback((next: string) => {
      heard.push(next);
      setText(next);
    }, []);
    return (
      <>
        <ChoiceList
          aria-label="Target computer"
          searchLabel="Search computers"
          clearSearchLabel="Clear search"
          searchValue={text}
          onSearchValueChange={hear}
          items={makeItems(count)}
          value="galileo"
          onValueChange={ignore}
        />
        <span data-testid="text">{text}</span>
      </>
    );
  }
  const { rerender, unmount } = render(<Owner count={8} text="bo" />);
  expect(rowNames()).toEqual(["galileo", "borealis"]);
  rerender(<Owner count={3} text="bo" />);
  expect(screen.queryByRole("searchbox")).toBeNull();
  expect(heard).toEqual([""]);
  expect(screen.getByTestId("text").textContent).toBe("");
  unmount();

  function Outside({ text }: { text: string }) {
    const [value, setValue] = useState<string | null>("atlas");
    return (
      <ChoiceList
        aria-label="Target computer"
        searchLabel="Search computers"
        clearSearchLabel="Clear search"
        searchValue={text}
        items={EIGHT_ITEMS}
        value={value}
        onValueChange={setValue}
      />
    );
  }
  const outside = render(<Outside text="e" />);
  fireEvent.click(screen.getByRole("radio", { name: "europa" }));
  // Rows hold still while choosing...
  expect(rowNames()[0]).toBe("atlas");
  // ...and a new text from the caller pins the new choice.
  outside.rerender(<Outside text="er" />);
  expect(rowNames()).toEqual(["europa", "fermi"]);
});

test("a group value with a space still names its group", () => {
  render(
    <ChoiceList
      aria-label="Members"
      searchLabel="Search people"
      clearSearchLabel="Clear search"
      groups={SPACED_GROUPS}
      items={SPACED_ITEMS}
      value={null}
      onValueChange={ignore}
    />,
  );
  expect(screen.getByRole("group", { name: "Your agents" })).toBeTruthy();
});

const SPACED_GROUPS = [{ value: "my agents", label: "Your agents" }];
const SPACED_ITEMS: ChoiceListItem[] = [{ value: "kirby", label: "Kirby", group: "my agents" }];
