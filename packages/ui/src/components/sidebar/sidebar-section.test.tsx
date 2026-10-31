/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SidebarSection,
  SidebarSectionAttention,
  SidebarSectionControl,
  SidebarSectionControls,
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
 * text-node change on a 300-message channel, #386). They key off data
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

function renderControls() {
  const { container } = render(
    <ThemeProvider>
      <SidebarSection>
        <SidebarSectionHeader>
          <SidebarSectionDisclosure type="button">
            <SidebarSectionTitle>Channels</SidebarSectionTitle>
          </SidebarSectionDisclosure>
          <SidebarSectionTrailing>
            <SidebarSectionControls>
              <SidebarSectionControl aria-label="Sort channels">
                <svg />
              </SidebarSectionControl>
              <SidebarSectionControl aria-label="Create channel">
                <svg />
              </SidebarSectionControl>
            </SidebarSectionControls>
          </SidebarSectionTrailing>
        </SidebarSectionHeader>
      </SidebarSection>
    </ThemeProvider>,
  );
  const classes = (slot: string) =>
    container.querySelector<HTMLElement>(`[data-slot="${slot}"]`)!.className.split(/\s+/);
  const control = container.querySelector<HTMLElement>('[aria-label="Create channel"]')!;
  return { classes, control };
}

/**
 * A classic scrollbar takes its width out of the scroller. The rows give it
 * back from their end inset (lib/list-cell.ts); the header gives back the
 * same, so its controls don't move left when the scrollbar appears (stdrc,
 * 2026-10-31). A fixed px-5 moved them 8px.
 */
test("the header's end padding gives back the scrollbar, as the rows do", () => {
  const header = renderControls().classes("sidebar-section-header");
  expect(header).toContain("pr-[calc(max(0px,calc(8px-var(--scrollbar-size,0px)))+12px)]");
  expect(header).toContain("pl-5");
  expect(header).not.toContain("px-5");
});

/**
 * The ends of a header (design/foundations/alignment.md): the last control's
 * 14px icon box, not its 24px button, ends on the header's line, as the
 * chevron starts on it. The control declares its 5px inset; the controls pull
 * their last child out by it.
 */
test("the last control is pulled out by its own 5px icon inset", () => {
  const { classes, control } = renderControls();
  expect(classes("sidebar-section-controls")).toContain(
    "[&>[data-icon-inset]:last-child]:-mr-icon-inset",
  );
  expect(control.hasAttribute("data-icon-inset")).toBe(true);
  const own = control.className.split(/\s+/).filter((c) => c.startsWith("[--icon-inset:"));
  expect(own).toEqual(["[--icon-inset:calc((--spacing(6)-14px)/2)]"]);
});

/**
 * At rest a control is in the title's hint color, so the header reads as one
 * label; the one under the pointer, in focus or with its menu open turns body
 * color on the ghost fill. tailwind-merge must drop the ghost Button's
 * text-foreground, or both survive and stylesheet order decides.
 */
test("a control rests in the hint color and turns body color when it is the one in use", () => {
  const cls = renderControls().control.className.split(/\s+/);
  expect(cls).toContain("text-foreground-hint");
  expect(cls).not.toContain("text-foreground");
  for (const token of [
    "hover:text-foreground",
    "focus-visible:text-foreground",
    "data-popup-open:text-foreground",
    "data-popup-open:bg-fill-medium",
    "hover:bg-fill-medium",
  ]) {
    expect(cls).toContain(token);
  }
});
