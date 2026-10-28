import "./select.test.css";
import { useCallback, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Select,
  SelectActionItem,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// A list action is reached from the keyboard like an item and runs on Enter,
// but it never becomes the value: the list stays open and grows, and the
// trigger keeps what was chosen (design: select.md, "a list action changes
// what the list shows, never the value").

const it = test.skipIf(typeof window === "undefined");

const noop = () => {};

afterEach(cleanup);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (const press of presses) {
    await userEvent.keyboard(press);
    await wait(60);
  }
}

const ALL = ["Claude Code", "Codex", "Gemini CLI", "Kimi CLI"];

function Runtimes({
  onAction,
  onValueChange,
}: {
  onAction: () => void;
  onValueChange: (value: string | null) => void;
}) {
  const [value, setValue] = useState<string | null>("Claude Code");
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? ALL : ALL.slice(0, 2);
  const handleValueChange = useCallback(
    (next: string | null) => {
      onValueChange(next);
      setValue(next);
    },
    [onValueChange],
  );
  const handleAction = useCallback(() => {
    onAction();
    setExpanded(true);
  }, [onAction]);
  return (
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger aria-label="Runtime" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectList>
              {shown.map((runtime) => (
                <SelectItem key={runtime} value={runtime}>
                  <SelectItemText>{runtime}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
              {!expanded && (
                <>
                  <SelectSeparator />
                  <SelectActionItem
                    data-testid="show-all"
                    aria-expanded={expanded}
                    onAction={handleAction}
                  >
                    Show All Runtimes
                  </SelectActionItem>
                </>
              )}
            </SelectList>
          </SelectContent>
        </Select>
      </div>
    </ThemeProvider>
  );
}

it("the keyboard reaches the action, Enter runs it, and the value is unchanged", async () => {
  const onAction = vi.fn();
  const onValueChange = vi.fn();
  render(<Runtimes onAction={onAction} onValueChange={onValueChange} />);
  screen.getByTestId("trigger").focus();
  await keys("{Enter}");
  await screen.findByRole("listbox");
  await wait(100);
  await keys("{ArrowDown}", "{ArrowDown}", "{ArrowDown}");
  const action = screen.getByTestId("show-all");
  expect(action.hasAttribute("data-highlighted")).toBe(true);
  expect(document.activeElement).toBe(action);
  await keys("{Enter}");
  await wait(100);
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(screen.getByRole("listbox")).toBeTruthy();
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(ALL);
  expect(screen.getByTestId("trigger").textContent).toBe("Claude Code");
});

it("typeahead reaches the action", async () => {
  render(<Runtimes onAction={noop} onValueChange={noop} />);
  screen.getByTestId("trigger").focus();
  await keys("{Enter}");
  await screen.findByRole("listbox");
  await wait(100);
  await keys("s");
  expect(screen.getByTestId("show-all").hasAttribute("data-highlighted")).toBe(true);
});

it("the action's highlight is inset like an item's", async () => {
  render(<Runtimes onAction={noop} onValueChange={noop} />);
  screen.getByTestId("trigger").focus();
  await keys("{Enter}");
  await screen.findByRole("listbox");
  await wait(100);
  const item = screen.getAllByRole("option")[0]!.getBoundingClientRect();
  const action = screen.getByTestId("show-all").getBoundingClientRect();
  expect(action.left).toBeCloseTo(item.left, 1);
  expect(action.width).toBeCloseTo(item.width, 1);
  expect(action.height).toBe(item.height);
  expect(getComputedStyle(screen.getByTestId("show-all")).borderRadius).toBe(
    getComputedStyle(screen.getAllByRole("option")[0]!).borderRadius,
  );
});
