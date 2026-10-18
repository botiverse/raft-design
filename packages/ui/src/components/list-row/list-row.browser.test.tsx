import "./list-row.test.css";
/**
 * Browser-mode checks for what the class strings alone cannot prove: the
 * hairline is drawn only between two rows (flat and in `ul > li`, never between
 * entry rows), and a row
 * that is selected or disabled does not react to hover.
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

/** Whether the row draws its hairline: a ::before that is shown, has content
 *  and a top border. (A flex container blockifies even an empty ::before, so
 *  display alone would read "block" for a row with no line.) */
function drawsRule(element: Element): boolean {
  const rule = getComputedStyle(element, "::before");
  return (
    rule.display !== "none" &&
    rule.content !== "none" &&
    rule.content !== "normal" &&
    Number.parseFloat(rule.borderTopWidth) > 0
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

it("draws the hairline only between two rows, flat and in a ul > li list", async () => {
  const { getByTestId } = render(
    <ThemeProvider>
      <div>
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

  expect(await settled(() => String(drawsRule(getByTestId("flat-2"))))).toBe("true");
  expect(drawsRule(getByTestId("flat-1"))).toBe(false);
  expect(drawsRule(getByTestId("flat-3"))).toBe(true);
  expect(drawsRule(getByTestId("li-1"))).toBe(false);
  expect(drawsRule(getByTestId("li-2"))).toBe(true);
  expect(drawsRule(getByTestId("entry-1"))).toBe(false);
  expect(drawsRule(getByTestId("entry-2"))).toBe(false);
  // The default row's line starts at the text: 16 + 35 + 12.
  expect(getComputedStyle(getByTestId("flat-2"), "::before").left).toBe("63px");
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
  const overlay = (id: string) => getComputedStyle(page.getByTestId(id).element()).backgroundImage;

  // Positive control: the rules have landed and hover lays the overlay.
  await page.getByTestId("control").hover();
  expect(await settled(() => overlay("control"))).toContain("linear-gradient");

  for (const id of ["selected", "disabled"]) {
    await page.getByTestId(id).hover({ force: true });
    expect(await settled(() => overlay(id)), `${id} must not react to hover`).toBe("none");
  }
});
