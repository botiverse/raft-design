/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "./sidebar-section";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

function renderSection(defaultOpen = true) {
  const { container } = render(
    <ThemeProvider>
      <SidebarSection defaultOpen={defaultOpen}>
        <SidebarSectionHeader>
          <SidebarSectionDisclosure type="button">
            <SidebarSectionTitle>Channels</SidebarSectionTitle>
          </SidebarSectionDisclosure>
          <SidebarSectionTrailing>
            <SidebarSectionAttention />
          </SidebarSectionTrailing>
        </SidebarSectionHeader>
      </SidebarSection>
    </ThemeProvider>,
  );
  const root = container.querySelector<HTMLElement>('[data-slot="sidebar-section"]')!;
  const attention = container.querySelector<HTMLElement>(
    '[data-slot="sidebar-section-attention"]',
  )!;
  return { container, root, attention };
}

/**
 * The attention badge hides while the section panel is open, or while a popup
 * hosted inside the header is open. Both conditions used to style descendants
 * off an ancestor's `:has()`: that makes Chromium recalculate the whole page on unrelated mutations (measured at ~55ms per
 * text-node change on a 300-message channel, #133). They key off data
 * attributes instead — `data-open` on the section root (Base UI Collapsible
 * already writes it) and `data-popup-open` mirrored onto the header by the
 * composition that hosts the popup. Pinned as an exact class set so a
 * re-introduced ancestor `:has()` fails here as well as in the source guard.
 */
test("attention hides via data attributes, not an ancestor :has()", () => {
  const { attention } = renderSection();
  expect(attention.className.split(/\s+/).toSorted()).toEqual(
    [
      "group-data-open/section:hidden",
      "group-data-popup-open/section-header:hidden",
      "group-hover/section-header:hidden",
      "inline-flex",
      "items-center",
      "justify-center",
      "min-w-4.5",
      "shrink-0",
    ].toSorted(),
  );
});

test("the section root carries the group and the open state the attention rule keys on", () => {
  const { root } = renderSection();
  expect(root.className.split(/\s+/)).toContain("group/section");
  expect(root.hasAttribute("data-open")).toBe(true);
});

test("collapsing the section drops data-open, which is the attention rule's target state", () => {
  const { container, root } = renderSection();
  const disclosure = container.querySelector<HTMLButtonElement>(
    '[data-slot="sidebar-section-disclosure"]',
  )!;
  fireEvent.click(disclosure);
  expect(root.hasAttribute("data-open")).toBe(false);
});
