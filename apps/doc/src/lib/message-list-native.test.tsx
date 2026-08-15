import { cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageList, ThemeProvider, useTheme } from "raft-ui";

function installMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((media: string) => ({
      matches,
      media,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(window, "matchMedia");
});

function ResolvedMode() {
  const { resolvedMode } = useTheme();
  return <output data-slot="resolved-mode">{resolvedMode}</output>;
}

describe("MessageList native viewport", () => {
  it("preserves the existing custom ScrollArea path by default on desktop", () => {
    installMatchMedia(false);

    const { container } = render(
      <MessageList>
        <div>Message</div>
      </MessageList>,
    );

    expect(container.querySelector('[data-slot="message-list"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')).toBeNull();
    expect(container.querySelector('[data-slot="message-list-viewport"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="scroll-area-content"]')).not.toBeNull();
  });

  it("preserves the existing native path by default on mobile", () => {
    installMatchMedia(true);

    const { container } = render(
      <MessageList>
        <div>Message</div>
      </MessageList>,
    );

    expect(container.querySelector('[data-slot="message-list-viewport"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="scroll-area-content"]')).toBeNull();
  });

  it("uses one native scroll owner on desktop when explicitly requested", () => {
    installMatchMedia(false);
    const viewportRef = createRef<HTMLDivElement>();
    const scrollTargets: EventTarget[] = [];

    const { container } = render(
      <MessageList
        nativeViewport
        ref={viewportRef}
        render={<section data-consumer-viewport="true" />}
        onScroll={(event) => scrollTargets.push(event.currentTarget)}
      >
        <div>Message</div>
      </MessageList>,
    );
    const viewport = container.querySelector<HTMLElement>('[data-slot="message-list-viewport"]');

    expect(viewport?.tagName).toBe("SECTION");
    expect(viewport?.dataset.consumerViewport).toBe("true");
    expect(viewportRef.current).toBe(viewport);
    expect(container.querySelector('[data-slot="scroll-area-content"]')).toBeNull();
    expect(container.querySelector('[data-slot="scroll-area-scrollbar"]')).toBeNull();

    fireEvent.scroll(viewport as HTMLElement);
    expect(scrollTargets).toEqual([viewport]);
  });

  it("falls back to the desktop path when matchMedia is unavailable", () => {
    Reflect.deleteProperty(window, "matchMedia");

    expect(() =>
      render(
        <MessageList>
          <div>Message</div>
        </MessageList>,
      ),
    ).not.toThrow();
  });
});

describe("ThemeProvider media-query fallback", () => {
  it("resolves system mode to light when matchMedia is unavailable", () => {
    Reflect.deleteProperty(window, "matchMedia");

    const { getByText } = render(
      <ThemeProvider theme="elegant" mode="system" syncDom={false}>
        <ResolvedMode />
      </ThemeProvider>,
    );

    expect(getByText("light").getAttribute("data-slot")).toBe("resolved-mode");
  });

  it("continues to resolve system mode from matchMedia when available", () => {
    installMatchMedia(true);

    const { getByText } = render(
      <ThemeProvider theme="elegant" mode="system" syncDom={false}>
        <ResolvedMode />
      </ThemeProvider>,
    );

    expect(getByText("dark").getAttribute("data-slot")).toBe("resolved-mode");
  });
});
