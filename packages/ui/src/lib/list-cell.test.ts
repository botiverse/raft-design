import { readFileSync } from "node:fs";
import { expect, test } from "vite-plus/test";
import { activityInboxShell } from "../components/activity-inbox/activity-inbox-shell.recipe";
import { inboxItem } from "../components/inbox-item/inbox-item.recipe";
import { listRow } from "../components/list-row/list-row.recipe";
import { searchEntity } from "../components/search/search-entity.recipe";
import { searchMessage } from "../components/search/search-message.recipe";
import { searchThread } from "../components/search/search-thread.recipe";
import { search } from "../components/search/search.recipe";
import { sidebarSectionRecipe } from "../components/sidebar/sidebar-section.recipe";
import { sidebarItemRecipe } from "../components/sidebar/sidebar-item.recipe";
import { listCell, listCellStates } from "./list-cell";

// List cells (design/patterns/lists.md): every list row draws its states on
// one inset shape, its ::before, and no row draws a divider; the list spaces
// its rows with a 2px gap. Layout is measured in the browser tests; these hold
// the recipes to the fragment.

const cells = {
  "inbox-item": inboxItem().item(),
  "list-row": listRow().root(),
  "list-row plain": listRow({ variant: "plain" }).root(),
  "sidebar-item": sidebarItemRecipe().sidebarItem(),
  "search-entity-result": searchEntity().entity(),
  "search-message-result": searchMessage().message(),
};

const classesOf = (value: string) => value.split(/\s+/).filter(Boolean);

test("the shape fills the row's height, inset 8px at each side, with the control radius", () => {
  const fragment = listCell.join(" ");
  expect(fragment).toContain("[--cell-inset-x:8px]");
  expect(fragment).toContain("[--cell-radius:var(--radius-control)]");
  // No vertical inset: the space between two rows is the list's gap.
  expect(fragment).not.toContain("--cell-inset-y");
  expect(fragment).toContain("before:inset-y-0");
  // The end inset gives back what a classic scrollbar takes.
  expect(fragment).toContain(
    "[--cell-inset-end:max(0px,calc(var(--cell-inset-x)-var(--scrollbar-size,0px)))]",
  );
  expect(fragment).toContain("before:right-(--cell-inset-end)");
  expect(fragment).toContain("before:left-(--cell-inset-x)");
  expect(fragment).toContain("before:pointer-events-none");
});

test("every container of list cells is a column with a 2px gap", () => {
  const containers = {
    "sidebar-list": sidebarSectionRecipe().sidebarList(),
    "search-results-list": search().list(),
    "search-thread-messages": searchThread().threadMessages(),
    "list-row-group": listRow().group(),
    "activity-inbox-viewport": activityInboxShell().viewport(),
  };
  for (const [name, value] of Object.entries(containers)) {
    const classes = classesOf(value);
    expect(classes, name).toContain("flex");
    expect(classes, name).toContain("flex-col");
    expect(classes, name).toContain("gap-0.5");
  }
  // In a group the first and last shapes keep the gap from the card's frame.
  expect(classesOf(listRow().group())).toContain("py-0.5");
});

for (const [name, value] of Object.entries(cells)) {
  const classes = classesOf(value);

  test(`${name} is a list cell`, () => {
    for (const cls of classesOf(listCell.join(" "))) {
      expect(classes, `${name} has ${cls}`).toContain(cls);
    }
  });

  test(`${name} draws no divider and paints no state on the row itself`, () => {
    expect(value).not.toContain("border-t");
    expect(value).not.toContain("line-hairline");
    // No margin on any side: the list's gap spaces the rows, not the row.
    expect(classes.some((cls) => /^(?:[\w-]+:)*-?m[trblxyse]?-/.test(cls))).toBe(false);
    // Every fill is on the shape: no hover, press, open or selected
    // background on the row, which stays transparent.
    const rowFills = classes.filter(
      (cls) =>
        /(?:^|:)(?:bg-|overlay-)/.test(cls) && !cls.includes("before:") && cls !== "bg-transparent",
    );
    expect(rowFills, name).toEqual([]);
  });
}

test("interactive rows hover and press the cell tokens on the shape", () => {
  for (const name of [
    "inbox-item",
    "list-row",
    "sidebar-item",
    "search-entity-result",
    "search-message-result",
  ]) {
    const classes = classesOf(cells[name as keyof typeof cells]);
    for (const cls of classesOf(listCellStates.join(" "))) {
      expect(classes, `${name} has ${cls}`).toContain(cls);
    }
  }
  // Press shows at once, on a touch screen as with a mouse.
  expect(listCellStates).toContain("active:before:transition-none");
});

test("selected cells use the cell's selected tint on the shape", () => {
  expect(classesOf(cells["inbox-item"])).toContain(
    "data-[active=true]:before:bg-fill-cell-selected",
  );
  expect(classesOf(cells["list-row"])).toContain("data-selected:before:bg-fill-cell-selected");
  expect(classesOf(cells["search-entity-result"])).toContain(
    "data-[selected=true]:before:bg-brand-soft",
  );
  expect(classesOf(cells["sidebar-item"])).toContain("data-active:before:bg-selected");
});

test("the located highlight is painted on every cell's shape", () => {
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  const start = css.indexOf("/* A list cell (lib/list-cell.ts");
  expect(start).toBeGreaterThan(-1);
  const block = css.slice(start, css.indexOf("/* Reduced motion", start));
  // Keyed on the class, which every cell carries even when a row is rendered
  // through another part (a ContextMenuTrigger), which replaces its data-slot.
  expect(block).toContain(".list-cell[data-located]::before");
  expect(listCell.join(" ")).toMatch(/(?:^|\s)list-cell(?:\s|$)/);
  expect(css).toContain("  .list-cell,\n  :active,");
  expect(block).toContain("--located-tint: var(--fill-cell-selected);");
});

test("dark row states step up, rows only: the global tiers keep their values", () => {
  const css = readFileSync(new URL("../foundation.css", import.meta.url), "utf8");
  const darkValues = [
    "--fill-cell-hover: oklch(0.9843 0.004 106.47 / 0.075);",
    "--fill-cell-press: oklch(0.9843 0.004 106.47 / 0.12);",
    "--fill-cell-selected: oklch(0.452 0.0862 225.67 / 0.38);",
  ];
  // Once for `.dark`, once for the system dark scheme.
  for (const value of darkValues) expect(css.split(value).length - 1, value).toBe(2);
  expect(css).toContain("--fill-cell-hover: var(--fill-subtle);");
  expect(css).toContain("--fill-cell-press: var(--fill-medium);");
  expect(css).toContain("--fill-cell-selected: var(--info-soft);");
  expect(css).toContain("--fill-subtle: oklch(0.9843 0.004 106.47 / 0.03);");
});
