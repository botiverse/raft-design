import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Select,
  SelectActionItem,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// The list scrolls only up and down, and a separator in it still meets the
// popup's edge on both sides (comfort.md#separators). The separator used to
// reach 4px past each side of the list, so the list scrolled sideways by 8px:
// a classic scrollbar (Windows) drew a horizontal bar under the runtimes list
// (Artea, 2026-11-08, #proj-raft-ui:20a421bd).

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const noop = () => {};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const INSTALLED = ["Claude Code", "Codex", "Gemini CLI"];
const MISSING = ["Grok Build", "Cursor CLI", "OpenCode", "Qwen Code", "Qoder", "Kimi CLI"];

function Runtimes() {
  return (
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <Select defaultValue="Claude Code">
          <SelectTrigger aria-label="Runtime" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="popup">
            <SelectList data-testid="list">
              {INSTALLED.map((runtime) => (
                <SelectItem key={runtime} value={runtime}>
                  <SelectItemText>{runtime}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
              <SelectSeparator data-testid="between-groups" />
              <SelectGroup>
                <SelectGroupLabel>Not installed on this computer</SelectGroupLabel>
                {MISSING.map((runtime) => (
                  <SelectItem key={runtime} value={runtime} disabled>
                    <SelectItemText>{runtime}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator data-testid="before-action" />
              <SelectActionItem onAction={noop}>Show installed only</SelectActionItem>
            </SelectList>
          </SelectContent>
        </Select>
      </div>
    </ThemeProvider>
  );
}

async function open() {
  render(<Runtimes />);
  screen.getByTestId("trigger").click();
  await screen.findByRole("listbox");
  await wait(150);
}

it("the list is no wider than itself and doesn't scroll sideways", async () => {
  await open();
  const list = screen.getByTestId("list");
  expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  expect(list.scrollWidth).toBe(list.clientWidth);
  expect(getComputedStyle(list).overflowX).toBe("hidden");
});

it("a separator meets the popup's edge on both sides", async () => {
  await open();
  const popup = screen.getByTestId("popup").getBoundingClientRect();
  for (const id of ["between-groups", "before-action"]) {
    const line = screen.getByTestId(id).getBoundingClientRect();
    expect(line.left).toBeCloseTo(popup.left, 1);
    expect(line.right).toBeCloseTo(popup.right, 1);
  }
});

it("an option keeps its 4px inset from the popup's edge", async () => {
  await open();
  const popup = screen.getByTestId("popup").getBoundingClientRect();
  const list = screen.getByTestId("list");
  const scrollbar = list.offsetWidth - list.clientWidth;
  const option = screen.getAllByRole("option")[0]!.getBoundingClientRect();
  expect(option.left - popup.left).toBeCloseTo(4, 1);
  expect(popup.right - scrollbar - option.right).toBeCloseTo(4, 1);
});
