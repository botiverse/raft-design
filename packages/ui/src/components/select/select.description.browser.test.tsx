import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemDescription,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./select";

// An item is as tall as its content: one line keeps the 36px minimum, and an
// item with a description grows with 6px above and below its text, so two
// two-line items never touch. Measured in a real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const ITEMS = [
  { value: "opus", label: "Claude Opus 5.5" },
  { value: "plain", label: "Auto" },
];

async function renderOpen() {
  render(
    <ThemeProvider>
      <div style={{ width: 320 }}>
        <Select items={ITEMS} defaultValue="opus" defaultOpen>
          <SelectTrigger aria-label="Model" data-testid="trigger">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectList>
              <SelectItem value="opus" data-testid="two-line">
                <SelectItemText data-testid="label">Claude Opus 5.5</SelectItemText>
                <SelectItemDescription data-testid="description">
                  Best for long, careful work
                </SelectItemDescription>
                <SelectItemIndicator />
              </SelectItem>
              <SelectItem value="plain" data-testid="one-line">
                <SelectItemText>Auto</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            </SelectList>
          </SelectContent>
        </Select>
      </div>
    </ThemeProvider>,
  );
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

it("an item with a description grows and keeps 6px around its text", async () => {
  await renderOpen();
  const item = screen.getByTestId("two-line").getBoundingClientRect();
  const label = screen.getByTestId("label").getBoundingClientRect();
  const description = screen.getByTestId("description").getBoundingClientRect();
  expect(label.top - item.top).toBeCloseTo(6, 0);
  expect(item.bottom - description.bottom).toBeCloseTo(6, 0);
  expect(description.top).toBeGreaterThanOrEqual(label.bottom);
  expect(item.height).toBeGreaterThan(36);
});

it("a one-line item keeps its 36px height", async () => {
  await renderOpen();
  expect(screen.getByTestId("one-line").getBoundingClientRect().height).toBe(36);
});

it("the trigger shows only the label, not the description", async () => {
  await renderOpen();
  expect(screen.getByTestId("trigger").textContent).toBe("Claude Opus 5.5");
});
