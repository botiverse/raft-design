// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import {
  MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT,
  MessageItemCollapsibleContent,
  MessageItemCollapsibleContentPanel,
  MessageItemCollapsibleContentTrigger,
  messageItemContentOverflows,
} from "./message-item-collapsible-content";

describe("message item collapsible content", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as { scrollHeight?: number }).scrollHeight;
    document.body.replaceChildren();
  });

  it("uses the source-compatible 320px threshold", () => {
    expect(messageItemContentOverflows(MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT)).toBe(false);
    expect(messageItemContentOverflows(MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT + 1)).toBe(true);
  });

  it("keeps trigger copy consumer-owned", () => {
    const markup = renderToStaticMarkup(
      <MessageItemCollapsibleContent defaultExpanded>
        <MessageItemCollapsibleContentPanel>Long message</MessageItemCollapsibleContentPanel>
        <MessageItemCollapsibleContentTrigger>
          {({ expanded }) => (expanded ? "Collapse" : "Show more")}
        </MessageItemCollapsibleContentTrigger>
      </MessageItemCollapsibleContent>,
    );

    expect(markup).toContain('data-slot="message-item-collapsible-content-panel"');
    expect(markup).not.toContain("Show more");
    expect(markup).not.toContain("Collapse");
  });

  it("keeps non-collapsed content visible and bypasses disabled wrapper DOM", () => {
    const visibleMarkup = renderToStaticMarkup(
      <MessageItemCollapsibleContent defaultExpanded>
        <MessageItemCollapsibleContentPanel>Visible message</MessageItemCollapsibleContentPanel>
        <MessageItemCollapsibleContentTrigger>Collapse</MessageItemCollapsibleContentTrigger>
      </MessageItemCollapsibleContent>,
    );
    const disabledMarkup = renderToStaticMarkup(
      <MessageItemCollapsibleContent disabled>
        <MessageItemCollapsibleContentPanel>Action card</MessageItemCollapsibleContentPanel>
        <MessageItemCollapsibleContentTrigger>Show more</MessageItemCollapsibleContentTrigger>
      </MessageItemCollapsibleContent>,
    );

    expect(visibleMarkup).not.toContain("overflow-hidden");
    expect(disabledMarkup).toBe("Action card");
  });

  it("collapses overflowing content and expands from the consumer-owned trigger", () => {
    class ResizeObserverMock {
      constructor(_callback: ResizeObserverCallback) {}

      disconnect() {}
      observe() {}
      unobserve() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT + 1,
    });
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(
        <MessageItemCollapsibleContent>
          <MessageItemCollapsibleContentPanel>Long message</MessageItemCollapsibleContentPanel>
          <MessageItemCollapsibleContentTrigger>
            {({ expanded }) => (expanded ? "Collapse" : "Show more")}
          </MessageItemCollapsibleContentTrigger>
        </MessageItemCollapsibleContent>,
      );
    });

    const panel = container.querySelector<HTMLElement>(
      "[data-slot='message-item-collapsible-content-panel']",
    );
    const trigger = container.querySelector<HTMLButtonElement>(
      "[data-slot='message-item-collapsible-content-trigger']",
    );
    expect(panel?.dataset.collapsed).toBe("true");
    expect(panel?.style.maxHeight).toBe(`${MESSAGE_ITEM_COLLAPSIBLE_CONTENT_HEIGHT}px`);
    expect(trigger?.textContent).toBe("Show more");

    act(() => trigger?.click());

    expect(panel?.dataset.collapsed).toBeUndefined();
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");
    expect(trigger?.textContent).toBe("Collapse");

    act(() => root.unmount());
  });
});
