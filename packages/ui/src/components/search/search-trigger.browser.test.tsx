import "./search-trigger.test.css";
/**
 * Browser-mode check: a disabled search trigger does not react to hover,
 * while an enabled one lays the press overlay.
 *
 * Run: `vp test --browser.enabled=true src/components/search/search-trigger.browser.test.tsx`
 * The file stays importable in the node pool, where it skips.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { SearchTrigger, SearchTriggerLabel } from "./search-trigger";

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

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

it("a disabled trigger ignores hover; an enabled one lays the overlay", async () => {
  render(
    <ThemeProvider>
      <SearchTrigger data-testid="enabled">
        <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
      </SearchTrigger>
      <SearchTrigger data-testid="disabled" disabled>
        <SearchTriggerLabel>Search Raft</SearchTriggerLabel>
      </SearchTrigger>
    </ThemeProvider>,
  );
  const { page } = await import("vite-plus/test/browser/context");
  const overlay = (id: string) => getComputedStyle(page.getByTestId(id).element()).backgroundImage;

  await page.getByTestId("enabled").hover();
  expect(await settled(() => overlay("enabled"))).toContain("linear-gradient");

  await page.getByTestId("disabled").hover({ force: true });
  expect(await settled(() => overlay("disabled"))).toBe("none");
});
