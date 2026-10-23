import "./choice-list.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { Button } from "../button/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "../popover/popover";
import { ChoiceList } from "./choice-list";
import type { ChoiceListItem } from "./choice-list";

// What needs a real browser: the Tab order, arrow keys, clicks on the row and
// its action, the action laid beside its row, the 36px and 44px rows and the
// scrolling frame. jsdom has no layout, focus order or media queries; the rest
// of the behaviour is in choice-list.test.tsx.

const it = test.skipIf(typeof window === "undefined");

async function context() {
  return import("vite-plus/test/browser/context");
}

// Turning touch emulation off leaves Chromium with no fine pointer, whatever
// the media emulation says (option-height.browser.test.tsx), so it is only
// ever turned on: the mouse cases come first in this file, the touch cases
// last, and afterAll resets it.
async function useCoarsePointer() {
  const { cdp } = await context();
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
}

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp } = await context();
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await cdp().send("Emulation.setEmulatedMedia", { features: [] });
});

const NAMES = ["atlas", "borealis", "cassini", "dione", "europa", "fermi", "galileo", "hubble"];

function Details({ name }: { name: string }) {
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="ghost" size="icon-md" aria-label={`Details for ${name}`} />}
      >
        i
      </PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>{name}</PopoverTitle>
      </PopoverContent>
    </Popover>
  );
}

function makeItems(
  names: readonly string[],
  withAction: (name: string) => boolean = () => true,
): ChoiceListItem[] {
  return names.map((name) => ({
    value: name,
    label: name,
    description: name === "borealis" ? ["16 GB free", "3 agents"] : undefined,
    action: withAction(name) ? <Details name={name} /> : undefined,
  }));
}

function Picker({
  items,
  initial = null,
  search,
}: {
  items: readonly ChoiceListItem[];
  initial?: string | null;
  search?: "auto" | "always";
}) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <div style={{ width: 360 }}>
      <ChoiceList
        aria-label="Target computer"
        searchLabel="Search computers"
        clearSearchLabel="Clear search"
        noMatchLabel="No matches"
        search={search}
        items={items}
        value={value}
        onValueChange={setValue}
      />
      <span data-testid="value">{value ?? ""}</span>
    </div>
  );
}

function value() {
  return screen.getByTestId("value").textContent;
}

function row(name: string) {
  return screen.getByRole("radio", { name }).closest("label") as HTMLElement;
}

it("Tab: the search box, the group as one stop, then each row's action in row order", async () => {
  const { userEvent } = await context();
  render(<Picker items={makeItems(NAMES, (name) => name !== "cassini")} initial="dione" />);
  const stops: string[] = [];
  for (let index = 0; index < 1 + 1 + 7; index += 1) {
    await userEvent.tab();
    const active = document.activeElement as HTMLElement;
    stops.push(active.getAttribute("aria-label") ?? active.getAttribute("role") ?? active.tagName);
  }
  expect(stops).toEqual([
    "Search computers",
    "radio",
    ...NAMES.filter((name) => name !== "cassini").map((name) => `Details for ${name}`),
  ]);
  // The radio that takes the group's stop is the chosen one.
  await userEvent.tab({ shift: true });
  for (let index = 0; index < 6; index += 1) await userEvent.tab({ shift: true });
  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "dione" }));
});

it("arrow keys move the choice and focus among the rows drawn, and the rows hold still", async () => {
  const { userEvent } = await context();
  render(<Picker items={makeItems(NAMES)} initial="galileo" />);
  await userEvent.click(screen.getByRole("searchbox"));
  await userEvent.keyboard("e");
  const order = ["galileo", "borealis", "dione", "europa", "fermi", "hubble"];
  const drawn = () =>
    screen.getAllByRole("radio").map((radio) => radio.closest("label")?.textContent ?? "");
  await waitFor(() => expect(drawn().map((text) => text.split(/\d/)[0])).toEqual(order));

  // Past the clear button, which shows once there is text.
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "Clear search" }));
  await userEvent.tab();
  expect(document.activeElement).toBe(screen.getByRole("radio", { name: "galileo" }));
  const seen: string[] = [];
  for (let index = 1; index < order.length; index += 1) {
    await userEvent.keyboard("{ArrowDown}");
    seen.push(value() ?? "");
    expect(document.activeElement).toBe(screen.getByRole("radio", { name: value() ?? "" }));
  }
  // atlas and cassini don't match and are never reached.
  expect(seen).toEqual(order.slice(1));
  expect(drawn().map((text) => text.split(/\d/)[0])).toEqual(order);
  await userEvent.keyboard("{ArrowUp}");
  expect(value()).toBe("fermi");
});

it("a click anywhere on the row chooses it; a click on its action chooses nothing", async () => {
  const { userEvent } = await context();
  render(<Picker items={makeItems(NAMES.slice(0, 3))} initial="atlas" />);
  await userEvent.click(screen.getByText("3 agents"));
  expect(value()).toBe("borealis");
  await userEvent.click(screen.getByText("cassini"));
  expect(value()).toBe("cassini");

  await userEvent.click(screen.getByRole("button", { name: "Details for atlas" }));
  await screen.findByRole("dialog");
  expect(value()).toBe("cassini");
  // Escape closes the action's popover and leaves the choice alone.
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(value()).toBe("cassini");
});

it("an action sits at the end of its own row, on the name's line, clear of the row's text", () => {
  const long = "a-computer-name-long-enough-to-run-under-the-button-if-nothing-stopped-it";
  render(<Picker items={makeItems(["atlas", "borealis", long])} />);
  for (const name of ["atlas", "borealis", long]) {
    const label = row(name).getBoundingClientRect();
    const nameBox = screen.getByText(name).getBoundingClientRect();
    const button = screen
      .getByRole("button", { name: `Details for ${name}` })
      .getBoundingClientRect();
    expect(button.top).toBeGreaterThanOrEqual(label.top - 0.5);
    expect(button.bottom).toBeLessThanOrEqual(label.bottom + 0.5);
    expect(
      Math.abs((button.top + button.bottom) / 2 - (nameBox.top + nameBox.bottom) / 2),
    ).toBeLessThanOrEqual(1);
    expect(nameBox.right).toBeLessThanOrEqual(button.left);
    expect(button.right).toBeLessThanOrEqual(label.right);
  }
});

it("with a mouse a one-line row is 36px; a description line adds its own height", () => {
  render(<Picker items={makeItems(NAMES.slice(0, 3))} />);
  expect(row("atlas").getBoundingClientRect().height).toBeCloseTo(36, 0);
  expect(row("borealis").getBoundingClientRect().height).toBeGreaterThan(36);
});

it("with the search on, the frame scrolls inside a fixed height", () => {
  const many = [...NAMES, "io", "juno", "kepler", "luna"];
  render(<Picker items={makeItems(many)} />);
  const frame = document.querySelector("[data-slot=choice-list-frame]") as HTMLElement;
  expect(frame.getBoundingClientRect().height).toBeLessThanOrEqual(288.5);
  expect(frame.scrollHeight).toBeGreaterThan(frame.clientHeight);
  expect(getComputedStyle(frame).overflowY).toBe("auto");
});

it('search="always": with a mouse, focus starts in the box', () => {
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
  render(<Picker search="always" items={makeItems(NAMES.slice(0, 3))} />);
  expect(document.activeElement).toBe(screen.getByRole("searchbox"));
});

it("items that load late never take focus from a field people are in", async () => {
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
  function Late() {
    const [items, setItems] = useState<readonly ChoiceListItem[]>([]);
    return (
      <>
        <input aria-label="Channel name" />
        <button type="button" onClick={() => setItems(makeItems(NAMES.slice(0, 3)))}>
          Load
        </button>
        <Picker search="always" items={items} />
      </>
    );
  }
  render(<Late />);
  const name = screen.getByRole("textbox", { name: "Channel name" });
  name.focus();
  screen.getByRole("button", { name: "Load" }).click();
  await waitFor(() => expect(screen.getByRole("searchbox")).toBeTruthy());
  expect(document.activeElement).toBe(name);
});

// Touch from here on (see useCoarsePointer).

it("on a touch screen a one-line row is 44px and its action keeps a 44px target", async () => {
  await useCoarsePointer();
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  render(<Picker items={makeItems(NAMES.slice(0, 3))} />);
  expect(row("atlas").getBoundingClientRect().height).toBeCloseTo(44, 0);
  const button = screen.getByRole("button", { name: "Details for atlas" });
  const box = button.getBoundingClientRect();
  const x = (box.left + box.right) / 2;
  const y = (box.top + box.bottom) / 2;
  for (const dy of [-21, 21]) {
    expect(button.contains(document.elementFromPoint(x, y + dy))).toBe(true);
  }
  for (const dx of [-21, 21]) {
    expect(button.contains(document.elementFromPoint(x + dx, y))).toBe(true);
  }
});

it('search="always": on a touch screen, focus stays out of the box', async () => {
  await useCoarsePointer();
  expect(matchMedia("(pointer: fine)").matches).toBe(false);
  render(<Picker search="always" items={makeItems(NAMES.slice(0, 3))} />);
  expect(screen.getByRole("searchbox")).toBeTruthy();
  expect(document.activeElement).not.toBe(screen.getByRole("searchbox"));
});
