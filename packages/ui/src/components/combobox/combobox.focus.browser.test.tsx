import "../select/select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Combobox, ComboboxControl, ComboboxInput, ComboboxItem, ComboboxList } from "./combobox";

// The list scrolls in a ScrollArea, which makes a scrollable container a Tab
// stop; a Combobox list never is one: focus stays in the input, and Tab leaves
// for the next control (Kirby, #proj-raft-ui:#214).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ITEMS = Array.from({ length: 20 }, (_, i) => `Conversation ${i + 1}`);

function Picker() {
  return (
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <Combobox inline open items={ITEMS}>
          <ComboboxControl>
            <ComboboxInput aria-label="Search conversations" />
          </ComboboxControl>
          <ComboboxList aria-label="Conversations" data-testid="list">
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </Combobox>
        <button type="button">Next</button>
      </div>
    </ThemeProvider>
  );
}

it("a list long enough to scroll is not a Tab stop; Tab leaves the input for the next control", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Picker />);
  const list = screen.getByTestId("list");
  await wait(150);
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  expect(list.tabIndex).toBe(-1);
  screen.getByRole("combobox", { name: "Search conversations" }).focus();
  await userEvent.keyboard("{Tab}");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Next" }));
});
