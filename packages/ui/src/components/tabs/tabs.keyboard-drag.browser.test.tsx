import "../drag/drag.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { useCallback, useState } from "react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { SortableTabsList, SortableTabsTab, Tabs, TabsLabel } from "./index";

// Sortable tabs follow the one drag model (design/patterns/drag-and-drop.md):
// Space picks a tab up, the arrows move it, Space drops it and Escape puts it
// back, while Base UI's own arrow keys stay out of the way; the copy that
// follows the hand is the tab, lifted, and the tab it came from stays at 40%.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function keys(...presses: string[]) {
  const { userEvent } = await import("vite-plus/test/browser/context");
  for (const press of presses) {
    await userEvent.keyboard(press);
    await wait(60);
  }
}

function renderTabs() {
  const onReorder = vi.fn();
  function Harness() {
    const [order, setOrder] = useState(["chat", "tasks", "files"]);
    const handleReorder = useCallback((next: string[]) => {
      setOrder(next);
      onReorder(next);
    }, []);
    return (
      <Tabs defaultValue="chat">
        <SortableTabsList value={order} onReorder={handleReorder}>
          {order.map((id) => (
            <SortableTabsTab key={id} value={id}>
              <TabsLabel>{id[0]!.toUpperCase() + id.slice(1)}</TabsLabel>
            </SortableTabsTab>
          ))}
        </SortableTabsList>
      </Tabs>
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
