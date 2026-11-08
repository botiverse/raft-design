import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./select";

// The list scrolls in a ScrollArea, which makes a scrollable container a Tab
// stop; a Select list never is one: focus moves from option to option, as
// Base UI manages it (Kirby, #proj-raft-ui:#214).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const RUNTIMES = Array.from({ length: 16 }, (_, i) => `Runtime ${i + 1}`);

function Runtimes() {
  return (
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <Select defaultValue="Runtime 1">
          <SelectTrigger aria-label="Runtime" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectList data-testid="list">
              {RUNTIMES.map((runtime) => (
                <SelectItem key={runtime} value={runtime}>
                  <SelectItemText>{runtime}</SelectItemText>
                </SelectItem>
              ))}
            </SelectList>
          </SelectContent>
        </Select>
      </div>
    </ThemeProvider>
  );
}

it("a list long enough to scroll is not a Tab stop, and the arrow keys still move option to option", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(<Runtimes />);
  screen.getByTestId("trigger").focus();
  await userEvent.keyboard("{Enter}");
  await screen.findByRole("listbox");
  await wait(150);
  const list = screen.getByTestId("list");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  expect(list.tabIndex).toBe(-1);
  const highlighted = () =>
    screen.getAllByRole("option").find((option) => option.hasAttribute("data-highlighted"))
      ?.textContent;
  const first = highlighted();
  await userEvent.keyboard("{ArrowDown}");
  await wait(60);
  const second = highlighted();
  expect(second).not.toBe(first);
  expect(document.activeElement?.getAttribute("role")).toBe("option");
  expect(document.activeElement?.textContent).toBe(second);
});
