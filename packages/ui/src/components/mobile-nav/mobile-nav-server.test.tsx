/**
 * @vitest-environment jsdom
 *
 * The server tab (navigation.md, "Servers"): the one tab that opens a menu.
 * A press opens it, a 500ms hold opens it, and the click that ends the hold
 * must not close it again.
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MobileNavLabel, MobileNavRoot } from "./mobile-nav";
import {
  MobileNavServerItem,
  MobileNavServerMenu,
  MobileNavServerMenuContent,
} from "./mobile-nav-server";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function renderTab() {
  render(
    <MobileNavRoot aria-label="Primary">
      <MobileNavServerMenu>
        <MobileNavServerItem aria-label="Raft HQ">
          <span data-slot="avatar">R</span>
          <MobileNavLabel>Raft HQ</MobileNavLabel>
        </MobileNavServerItem>
        <MobileNavServerMenuContent aria-label="Servers">
          <button type="button">Launch Crew</button>
        </MobileNavServerMenuContent>
      </MobileNavServerMenu>
    </MobileNavRoot>,
  );
  return screen.getByRole("button", { name: "Raft HQ" });
}

const menu = () => screen.queryByRole("dialog", { name: "Servers" });

function press(tab: HTMLElement, pointerType = "touch") {
  fireEvent.pointerDown(tab, { button: 0, pointerType, clientX: 10, clientY: 10 });
  fireEvent.pointerUp(tab, { button: 0, pointerType, clientX: 10, clientY: 10 });
  fireEvent.click(tab);
}

describe("MobileNavServerItem", () => {
  test("is a tab-bar item that announces a popup, and is never pressed or selected", () => {
    const tab = renderTab();
    expect(tab.dataset.slot).toBe("mobile-nav-server-item");
    expect(tab.getAttribute("aria-haspopup")).toBe("dialog");
    expect(tab.getAttribute("aria-expanded")).toBe("false");
    expect(tab.hasAttribute("aria-pressed")).toBe(false);
    expect(tab.hasAttribute("data-selected")).toBe(false);
  });

  test("a press opens the menu and a second press closes it", () => {
    const tab = renderTab();
    press(tab);
    expect(menu()).not.toBeNull();
    expect(tab.getAttribute("aria-expanded")).toBe("true");
    press(tab);
    expect(tab.getAttribute("aria-expanded")).toBe("false");
  });

  test("holding it opens the menu, and lifting the finger leaves it open", () => {
    vi.useFakeTimers();
    const tab = renderTab();
    fireEvent.pointerDown(tab, { button: 0, pointerType: "touch", clientX: 10, clientY: 10 });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(menu()).toBeNull();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(menu()).not.toBeNull();
    fireEvent.pointerUp(tab, { button: 0, pointerType: "touch", clientX: 10, clientY: 10 });
    fireEvent.click(tab);
    expect(tab.getAttribute("aria-expanded")).toBe("true");
  });

  test("a finger that moves off the spot is a scroll, not a hold", () => {
    vi.useFakeTimers();
    const tab = renderTab();
    fireEvent.pointerDown(tab, { button: 0, pointerType: "touch", clientX: 10, clientY: 10 });
    fireEvent.pointerMove(tab, { pointerType: "touch", clientX: 10, clientY: 30 });
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(menu()).toBeNull();
  });

  test("blocks the system's long-press menu", () => {
    const tab = renderTab();
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    tab.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  test("needs MobileNavServerMenu around it", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<MobileNavServerItem>Raft HQ</MobileNavServerItem>)).toThrow(
      /MobileNavServerMenu/,
    );
  });
});
