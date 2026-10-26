import "./list-row.test.css";
/**
 * Browser-mode checks for what the class strings alone cannot prove: no row
 * draws a divider (flat, in `ul > li`, or entry rows), every row draws its
 * states on the inset shape, and a row that is selected or disabled does not
 * react to hover.
 *
 * Run: `vp test --browser.enabled=true src/components/list-row/list-row.browser.test.tsx`
 * (chromium via playwright; a real CDP hover so :hover applies). The file
 * stays importable in the node pool, where it skips.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ListRow, ListRowGroup } from "./list-row";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

/** Whether the row draws a line: a border on the row or on its ::before. */
function drawsRule(element: Element): boolean {
  const own = getComputedStyle(element);
  const shape = getComputedStyle(element, "::before");
  return [own, shape].some(
    (style) =>
      Number.parseFloat(style.borderTopWidth) > 0 || Number.parseFloat(style.borderBottomWidth) > 0,
  );
}

/** Tailwind rules are injected on demand: poll until the value settles. */
async function settled(read: () => string): Promise<string> {
  let prev = "";
  let next = read();
  for (let i = 0; i < 50 && next !== prev; i += 1) {
    prev = next;
    await new Promise((resolve) => setTimeout(resolve, 50));
    next = read();
  }
  return next;
}

it("draws no line between rows, flat, in a ul > li list or as entries; the shape is inset", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div className="flex flex-col gap-0.5">
        <ListRow data-testid="flat-1">Wug</ListRow>
        <ListRow data-testid="flat-2">Martin</ListRow>
        <ListRow data-testid="flat-3">Mia Chen</ListRow>
      </div>
      <ListRowGroup render={<ul />}>
        <li>
          <ListRow data-testid="li-1">Wug</ListRow>
        </li>
        <li>
          <ListRow data-testid="li-2">Martin</ListRow>
        </li>
      </ListRowGroup>
      <div>
        <ListRow variant="entry" data-testid="entry-1">
          Search
        </ListRow>
        <ListRow variant="entry" data-testid="entry-2">
          Activity
        </ListRow>
      </div>
    </ThemeProvider>,
  );

  // Positive control: the cell's shape rules have landed.
  expect(await settled(() => getComputedStyle(getByTestId("flat-2"), "::before").left)).toBe("8px");
  for (const id of ["flat-1", "flat-2", "flat-3", "li-1", "li-2", "entry-1", "entry-2"]) {
    const row = getByTestId(id);
    expect(drawsRule(row), `${id} draws no line`).toBe(false);
    const shape = getComputedStyle(row, "::before");
    expect([shape.top, shape.right, shape.bottom, shape.left], id).toEqual([
      "0px",
      "8px",
      "0px",
      "8px",
    ]);
    expect(shape.borderTopLeftRadius, id).toBe("8px");
  }
  // The list spaces its rows 2px apart, flat and in a group.
  const first = getByTestId("flat-1").getBoundingClientRect();
  const second = getByTestId("flat-2").getBoundingClientRect();
  expect(second.top - first.bottom).toBe(2);
  const li1 = getByTestId("li-1").getBoundingClientRect();
  const li2 = getByTestId("li-2").getBoundingClientRect();
  expect(li2.top - li1.bottom).toBe(2);
});

it("a selected or a disabled row does not react to hover; an enabled one does", async () => {
  render(
    <ThemeProvider>
      <div>
        <ListRow data-testid="control">Wug</ListRow>
        <ListRow data-testid="selected" selected>
          Martin
        </ListRow>
        <ListRow data-testid="disabled" disabled>
          Mia Chen
        </ListRow>
      </div>
    </ThemeProvider>,
  );
  const { page } = await import("vite-plus/test/browser/context");
  const fill = (id: string) =>
    getComputedStyle(page.getByTestId(id).element(), "::before").backgroundColor;
  const clear = "rgba(0, 0, 0, 0)";
  const selectedFill = await settled(() => fill("selected"));
  expect(selectedFill).not.toBe(clear);

  // Positive control: the rules have landed and hover fills the shape.
  await page.getByTestId("control").hover();
  expect(await settled(() => fill("control"))).not.toBe(clear);
  // The row itself stays transparent.
  expect(getComputedStyle(page.getByTestId("control").element()).backgroundImage).toBe("none");

  await page.getByTestId("selected").hover({ force: true });
  expect(await settled(() => fill("selected")), "selected must not react to hover").toBe(
    selectedFill,
  );
  await page.getByTestId("disabled").hover({ force: true });
  expect(await settled(() => fill("disabled")), "disabled must not react to hover").toBe(clear);
});
