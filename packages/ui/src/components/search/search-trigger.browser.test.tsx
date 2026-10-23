import "./search-trigger.test.css";
/**
 * Browser-mode check: the search trigger is drawn as a field, so like every
 * field it doesn't hover (design/foundations/states.md#hover-and-press); an
 * enabled one lays the medium tier when pressed, a disabled one never does.
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

it("it doesn't hover like a field; an enabled one lays the overlay when pressed", async () => {
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
  const { page, cdp } = await import("vite-plus/test/browser/context");
  const overlay = (id: string) => getComputedStyle(page.getByTestId(id).element()).backgroundImage;

  await page.getByTestId("enabled").hover();
  expect(await settled(() => overlay("enabled"))).toBe("none");

  const rect = page.getByTestId("enabled").element().getBoundingClientRect();
  const at = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    button: "left",
    clickCount: 1,
    ...at,
  });
  const pressed = await settled(() => overlay("enabled"));
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    button: "left",
    clickCount: 1,
    ...at,
  });
  expect(pressed).toContain("linear-gradient");

  await page.getByTestId("disabled").hover({ force: true });
  expect(await settled(() => overlay("disabled"))).toBe("none");
});
