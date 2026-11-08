import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { ComboboxSelect } from "./combobox-select";

// The list scrolls in a ScrollArea, which makes a scrollable container a Tab
// stop; a ComboboxSelect list never is one: Tab from the field never lands
// on the list (Kirby, #proj-raft-ui:#214).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const OPTIONS = Array.from({ length: 20 }, (_, i) => ({
  value: `c${i}`,
  label: `Computer ${i + 1}`,
}));

it("a list long enough to scroll is not a Tab stop", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <ComboboxSelect aria-label="Computer" options={OPTIONS} placeholder="Choose a computer" />
        <button type="button">Next</button>
      </div>
    </ThemeProvider>,
  );
  const field = document.querySelector<HTMLInputElement>(
    'input:not([type="hidden"]):not([aria-hidden="true"])',
  )!;
  await userEvent.click(field);
  const list = await screen.findByRole("listbox");
  await wait(150);
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  expect(list.tabIndex).toBe(-1);
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement === list || list.contains(document.activeElement)).toBe(false);
});
