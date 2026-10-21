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
  SelectItemLeading,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./select";

// An item is as tall as its content: one line is 36px, and an item with a
// description grows by the description's line alone, keeping the one-line
// item's space above and below its text (design/patterns/forms.md#option-height).
// Measured in a real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const ITEMS = [
  { value: "opus", label: "Claude Opus 5.5" },
  { value: "led", label: "Sonnet" },
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
                <SelectItemText data-testid="label" id="opus-label">
                  Claude Opus 5.5
                </SelectItemText>
                <SelectItemDescription data-testid="description">
                  Best for long, careful work
                </SelectItemDescription>
                <SelectItemIndicator />
              </SelectItem>
              <SelectItem value="led" data-testid="with-leading">
                <SelectItemLeading>
                  <svg aria-hidden viewBox="0 0 16 16" />
                </SelectItemLeading>
                <SelectItemText data-testid="led-label">Sonnet</SelectItemText>
                <SelectItemDescription data-testid="led-description">
                  Fast and capable
                </SelectItemDescription>
                <SelectItemIndicator />
              </SelectItem>
              <SelectItem value="plain" data-testid="one-line">
                <SelectItemText data-testid="one-line-label">Auto</SelectItemText>
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

it("an item with a description grows and keeps the one-line item's space around its text", async () => {
  await renderOpen();
  const item = screen.getByTestId("two-line").getBoundingClientRect();
  const label = screen.getByTestId("label").getBoundingClientRect();
  const description = screen.getByTestId("description").getBoundingClientRect();
  const oneLine = screen.getByTestId("one-line").getBoundingClientRect();
  const oneLineText = screen.getByTestId("one-line-label").getBoundingClientRect();
  const inset = oneLineText.top - oneLine.top;
  expect(inset).toBeGreaterThanOrEqual(6);
  expect(oneLine.bottom - oneLineText.bottom).toBeCloseTo(inset, 1);
  expect(label.top - item.top).toBeCloseTo(inset, 1);
  expect(item.bottom - description.bottom).toBeCloseTo(inset, 1);
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

// Where the text itself starts: a box's left edge would include its padding.
function textLeft(element: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect().left;
}

it("a description starts under its label, past a leading icon", async () => {
  await renderOpen();
  expect(textLeft(screen.getByTestId("led-description"))).toBeCloseTo(
    textLeft(screen.getByTestId("led-label")),
    0,
  );
  expect(textLeft(screen.getByTestId("description"))).toBeCloseTo(
    textLeft(screen.getByTestId("label")),
    0,
  );
});

it("an option is named by its label and described by its description; one without keeps its name", async () => {
  await renderOpen();
  const twoLine = screen.getByTestId("two-line");
  expect(twoLine.getAttribute("aria-describedby")).toBe(screen.getByTestId("description").id);
  // A caller's own id on the text is the one the option is labelled by.
  expect(twoLine.getAttribute("aria-labelledby")).toBe("opus-label");
  expect(screen.getByRole("option", { name: "Claude Opus 5.5" })).toBe(twoLine);
  const oneLine = screen.getByTestId("one-line");
  expect(oneLine.hasAttribute("aria-describedby")).toBe(false);
  expect(screen.getByRole("option", { name: "Auto" })).toBe(oneLine);
});
