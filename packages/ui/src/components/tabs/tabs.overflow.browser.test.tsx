import "./tabs.test.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";
import { Tabs, TabsList, TabsTab } from "./index";
import type { TabsPlacement } from "./index";

// The edge fade (data-overflow, mask-fade-x) is for tabs the row hides. A row
// whose tabs all fit must not fade, whatever a tab draws past its own box: the
// underline tab's tap area reaches into the gap beside it, and at the row's
// ends that reach used to count as overflow, fading the last tab.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const frame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

function Row({
  variant,
  placement,
  dir,
}: {
  variant: "default" | "underline";
  placement: TabsPlacement;
  dir?: "rtl";
}) {
  return (
    <div style={{ width: 360 }} dir={dir}>
      <Tabs defaultValue="general" placement={placement}>
        <TabsList variant={variant} aria-label="Channel settings">
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="members">Members</TabsTab>
          <TabsTab value="notifications">Notifications</TabsTab>
        </TabsList>
      </Tabs>
    </div>
  );
}

for (const variant of ["default", "underline"] as const) {
  for (const placement of ["top", "bottom"] as const) {
    for (const dir of [undefined, "rtl"] as const) {
      it(`${variant} ${placement}${dir ? " rtl" : ""}: tabs that fit don't fade or scroll`, async () => {
        render(<Row variant={variant} placement={placement} dir={dir} />);
        await document.fonts.ready;
        await frame();
        await frame();
        const list = screen.getByRole("tablist");
        expect(list.scrollWidth - list.clientWidth).toBeLessThanOrEqual(1);
        expect(list.hasAttribute("data-overflow")).toBe(false);
      });
    }
  }
}

it("underline: tabs that don't fit still fade at the end", async () => {
  render(
    <div style={{ width: 160 }}>
      <Tabs defaultValue="general">
        <TabsList variant="underline" aria-label="Channel settings">
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="members">Members</TabsTab>
          <TabsTab value="notifications">Notifications</TabsTab>
        </TabsList>
      </Tabs>
    </div>,
  );
  await document.fonts.ready;
  await frame();
  await frame();
  expect(screen.getByRole("tablist").getAttribute("data-overflow")).toBe("end");
});
