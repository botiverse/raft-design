import "../drag/drag.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { SortableTabsList, SortableTabsTab, Tabs, TabsLabel } from "./index";

// Sortable tabs follow the one drag model (design/patterns/drag-and-drop.md):
// Space picks a tab up, the arrows move it, Space drops it and Escape puts it
// back, while Base UI's own arrow keys stay out of the way; the copy that
// follows the hand is the tab, lifted, and the tab it came from stays at 40%.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const LABELS: Record<string, string> = {
  "tab-9c1": "Chat",
  "tab-4e2": "Tasks",
  "tab-7b3": "Files",
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (const press of presses) {
    await userEvent.keyboard(press);
    await wait(60);
  }
}

function renderTabs({
  wrapperStyle,
  container,
  ids = ["chat", "tasks", "files"],
}: {
  wrapperStyle?: CSSProperties;
  container?: Element | null;
  ids?: string[];
} = {}) {
  const onReorder = vi.fn();
  const label = (id: string) => LABELS[id] ?? id[0]!.toUpperCase() + id.slice(1);
  function Harness() {
    const [order, setOrder] = useState(ids);
    const handleReorder = useCallback((next: string[]) => {
      setOrder(next);
      onReorder(next);
    }, []);
    return (
      <div data-testid="wrapper" style={wrapperStyle}>
        <Tabs defaultValue={ids[0]}>
          <SortableTabsList
            aria-label="launch-week"
            value={order}
            onReorder={handleReorder}
            container={container}
          >
            {order.map((id) => (
              <SortableTabsTab key={id} value={id}>
                <TabsLabel>{label(id)}</TabsLabel>
              </SortableTabsTab>
            ))}
          </SortableTabsList>
        </Tabs>
      </div>
    );
  }
  render(<Harness />);
  return onReorder;
}

it("Space, ArrowRight, Space moves a tab one place", async () => {
  const onReorder = renderTabs();
  screen.getByRole("tab", { name: "Tasks" }).focus();
  await keys(" ");

  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]");
  expect(lift?.textContent).toBe("Tasks");
  expect(getComputedStyle(screen.getByRole("tab", { name: "Tasks" })).opacity).toBe("0.4");

  await keys("{ArrowRight}");
  // Away from home the tab's own slot is the dashed place.
  expect(document.querySelector("[data-slot=drop-placeholder]")).not.toBeNull();
  await keys(" ");
  expect(onReorder).toHaveBeenLastCalledWith(["chat", "files", "tasks"]);
  await wait(250);
  expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
    "Chat",
    "Files",
    "Tasks",
  ]);
});

it("Escape puts the tab back", async () => {
  const onReorder = renderTabs();
  screen.getByRole("tab", { name: "Tasks" }).focus();
  await keys(" ", "{ArrowRight}", "{Escape}");
  expect(onReorder).not.toHaveBeenCalled();
});

it("Enter doesn't pick a tab up", async () => {
  const onReorder = renderTabs();
  screen.getByRole("tab", { name: "Tasks" }).focus();
  await keys("{Enter}");
  expect(document.querySelector("[data-slot=drag-lift]")).toBeNull();
  // Not dragging, the arrows are Base UI's: focus goes to Files, which Space then picks up.
  await keys("{ArrowRight}", " ", "{ArrowLeft}", " ");
  expect(onReorder).toHaveBeenLastCalledWith(["chat", "files", "tasks"]);
});

it("Enter selects the focused tab", async () => {
  renderTabs();
  screen.getByRole("tab", { name: "Tasks" }).focus();
  await keys("{Enter}");
  expect(screen.getByRole("tab", { name: "Tasks" }).getAttribute("aria-selected")).toBe("true");
});

// A drawer's popup (translate3d and scale) or a dialog (-translate-1/2) makes
// itself the containing block of anything `position: fixed` inside it.
const TRANSFORMED: CSSProperties = { transform: "translate3d(40px, 30px, 0) scale(0.98)" };

it("the lifted copy renders in document.body, where a transformed ancestor can't offset it", async () => {
  renderTabs({ wrapperStyle: TRANSFORMED });
  const tab = screen.getByRole("tab", { name: "Tasks" });
  tab.focus();
  await keys(" ");
  const lift = document.querySelector<HTMLElement>("[data-slot=drag-lift]")!;
  expect(screen.getByTestId("wrapper").contains(lift)).toBe(false);
  expect(lift.closest("[data-slot=drag-lift-portal]")?.parentElement).toBe(document.body);
  // Over its place, 6px down and right (a keyboard drag), not shifted by the transform.
  const place = tab.getBoundingClientRect();
  const copy = lift.getBoundingClientRect();
  expect(copy.left - place.left).toBeCloseTo(6, 0);
  expect(copy.top - place.top).toBeCloseTo(6, 0);
  await keys("{Escape}");
});

it("container renders the copy there", async () => {
  const host = document.createElement("div");
  document.body.append(host);
  try {
    renderTabs({ container: host });
    screen.getByRole("tab", { name: "Tasks" }).focus();
    await keys(" ");
    expect(host.querySelector("[data-slot=drag-lift]")).not.toBeNull();
    await keys("{Escape}");
  } finally {
    host.remove();
  }
});

it("every step is announced by the tab's name and position, never its value", async () => {
  renderTabs({ ids: ["tab-9c1", "tab-4e2", "tab-7b3"] });
  screen.getByRole("tab", { name: "Tasks" }).focus();
  const region = document.querySelector("[role=status][aria-live]")!;
  const said: string[] = [];
  for (const press of [" ", "{ArrowRight}", " "]) {
    await keys(press);
    said.push(region.textContent ?? "");
  }
  await keys(" ", "{Escape}");
  said.push(region.textContent ?? "");
  for (const line of said) expect(line).not.toMatch(/tab-\w{3}/);
  expect(said).toEqual([
    "Picked up Tasks. Over launch-week, position 2 of 3.",
    "Over launch-week, position 3 of 3.",
    "Dropped Tasks in launch-week, position 3 of 3.",
    "Cancelled. Tasks is back in launch-week, position 3 of 3.",
  ]);
});
