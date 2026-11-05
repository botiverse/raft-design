import "./sidebar-item.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  SidebarSection,
  SidebarSectionChevron,
  SidebarSectionControl,
  SidebarSectionControls,
  SidebarSectionDisclosure,
  SidebarSectionEndChevron,
  SidebarSectionHeader,
  SidebarSectionTitle,
  SidebarSectionTrailing,
} from "./sidebar-section";

// The section's chevron by input (sidebar.md, Section headers): with a mouse
// on a desktop it is the header's last control and the one before the title
// is gone; on a touch screen it is before the title and the end one is gone.
// A header without `chevronAtEnd` keeps its chevron before the title with a
// mouse too. Measured in a real browser with touch emulated through CDP;
// turning touch emulation off again leaves Chromium reporting `pointer:
// none`, so the mouse cases run first and touch goes on once, at the end.

const it = test.skipIf(typeof window === "undefined");

async function setCoarsePointer(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

async function viewport(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
}

afterEach(cleanup);

let touching = false;

afterAll(async () => {
  if (typeof window === "undefined") return;
  if (touching) await setCoarsePointer(false);
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

function renderHeader(chevronAtEnd: boolean) {
  const { container } = render(
    <ThemeProvider>
      <SidebarSection defaultOpen>
        <SidebarSectionHeader chevronAtEnd={chevronAtEnd}>
          <SidebarSectionDisclosure>
            <SidebarSectionChevron />
            <SidebarSectionTitle>Channels</SidebarSectionTitle>
          </SidebarSectionDisclosure>
          <SidebarSectionTrailing>
            <SidebarSectionControls>
              <SidebarSectionControl aria-label="New channel">+</SidebarSectionControl>
              {chevronAtEnd ? <SidebarSectionEndChevron /> : null}
            </SidebarSectionControls>
          </SidebarSectionTrailing>
        </SidebarSectionHeader>
      </SidebarSection>
    </ThemeProvider>,
  );
  const start = container.querySelector<HTMLElement>('[data-slot="sidebar-section-chevron"]')!;
  const end = container.querySelector<HTMLElement>("[data-end-chevron]");
  const shown = (element: HTMLElement | null) =>
    element !== null && element.getBoundingClientRect().width > 0;
  return { start: shown(start), end: shown(end), endElement: end };
}

it("with a mouse on a desktop the chevron is the header's last control, 24px", async () => {
  await viewport(1280);
  const header = renderHeader(true);
  expect(header.start).toBe(false);
  expect(header.end).toBe(true);
  const box = header.endElement!.getBoundingClientRect();
  expect([box.width, box.height]).toEqual([24, 24]);
});

it("CONTROL: a header without chevronAtEnd keeps its chevron before the title with a mouse", async () => {
  await viewport(1280);
  const header = renderHeader(false);
  expect(header.start).toBe(true);
  expect(header.end).toBe(false);
});

it("on a phone width with a mouse, the chevron stays before the title", async () => {
  await viewport(390);
  const header = renderHeader(true);
  expect(header.start).toBe(true);
  expect(header.end).toBe(false);
});

it("on a touch screen the chevron stays before the title and the end one is gone", async () => {
  await viewport(1280);
  touching = true;
  await setCoarsePointer(true);
  const header = renderHeader(true);
  expect(header.start).toBe(true);
  expect(header.end).toBe(false);
});
