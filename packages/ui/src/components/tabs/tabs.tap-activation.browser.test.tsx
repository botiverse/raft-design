import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vite-plus/test";
import { Tabs, TabsLabel, TabsList, TabsTab } from "./index";

// Real touch input through CDP on real Tabs
// (design/patterns/navigation.md#switching-on-finger-lift): a tab switches when
// the finger lifts, exactly once, and a touch that moves is a scroll and
// switches nothing. The case the rule is for, a tap that lands while a list
// is still momentum-scrolling and gets no click, doesn't reproduce here:
// headless Chromium flings under CDP touch, but still sends the click of the
// tap that stops it. So the test checks the switch has happened at touchend,
// before any click, which is what makes the momentum case work on a phone.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

async function cdp() {
  const { cdp } = await import("vite-plus/test/browser/context");
  return cdp();
}

beforeEach(async () => {
  if (typeof window === "undefined") return;
  await (
    await cdp()
  ).send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function touch(type: "touchStart" | "touchMove" | "touchEnd", x: number, y: number) {
  await (
    await cdp()
  ).send("Input.dispatchTouchEvent", {
    type,
    touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }],
  });
}

async function tap(x: number, y: number) {
  await touch("touchStart", x, y);
  await touch("touchEnd", x, y);
  await wait(100);
}

function renderTabs() {
  const onValueChange = vi.fn();
  const onClick = vi.fn();
  render(
    <div style={{ height: 300, overflowY: "auto" }}>
      <div style={{ position: "sticky", top: 0, background: "white", zIndex: 1 }}>
        <Tabs defaultValue="chat" onValueChange={onValueChange}>
          <TabsList aria-label="Views">
            <TabsTab value="chat">
              <TabsLabel>Chat</TabsLabel>
            </TabsTab>
            <TabsTab value="tasks" onClick={onClick}>
              <TabsLabel>Tasks</TabsLabel>
            </TabsTab>
          </TabsList>
        </Tabs>
      </div>
      <div style={{ height: 20000 }} />
    </div>,
  );
  const tab = screen.getByRole("tab", { name: "Tasks" });
  const box = tab.getBoundingClientRect();
  return { tab, onValueChange, onClick, x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

it("a tap switches the tab once", async () => {
  const { tab, onValueChange, onClick, x, y } = renderTabs();
  await tap(x, y);
  expect(onValueChange).toHaveBeenCalledTimes(1);
  expect(onValueChange.mock.calls[0]?.[0]).toBe("tasks");
  expect(onClick).toHaveBeenCalledTimes(1);
  expect(tab.getAttribute("aria-selected")).toBe("true");
});

it("a touch that moves does not switch the tab", async () => {
  const { onValueChange, x, y } = renderTabs();
  await touch("touchStart", x, y);
  for (let step = 1; step <= 4; step++) await touch("touchMove", x + step * 6, y);
  await touch("touchEnd", x + 24, y);
  await wait(100);
  expect(onValueChange).not.toHaveBeenCalled();
});

it("the tab switches when the finger lifts, before any click", async () => {
  const { onValueChange, onClick, x, y } = renderTabs();
  // Runs after the tab's own touchend listener: the switch has happened by
  // then, so it doesn't wait for a click the browser may never send.
  let switchesAtLift = -1;
  let clicksAtLift = -1;
  const atLift = () => {
    switchesAtLift = onValueChange.mock.calls.length;
    clicksAtLift = onClick.mock.calls.length;
  };
  document.addEventListener("touchend", atLift, { once: true });
  await tap(x, y);
  document.removeEventListener("touchend", atLift);
  expect(switchesAtLift).toBe(1);
  expect(clicksAtLift).toBe(1);
  expect(onValueChange).toHaveBeenCalledTimes(1);
});
