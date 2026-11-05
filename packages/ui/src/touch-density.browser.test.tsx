import "./components/inbox-item/inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Button } from "./components/button/button";
import { Input } from "./components/input/input";
import {
  InboxItem,
  InboxItemBody,
  InboxItemContent,
  InboxItemHeading,
  InboxItemLeading,
  InboxItemTitle,
  InboxItemTrigger,
} from "./components/inbox-item/inbox-item";

// Touch density (sizing audit v12; design/foundations/spacing.md): on a touch
// screen a control at the control height has a 10px corner, and a rich row
// (an Activity or Inbox item) is 56px, its whole width the target. Pinned
// here so a change to the touch tokens fails (Kirby's review of #974).
// Measured in a real browser with touch emulated through CDP.

const it = test.skipIf(typeof window === "undefined");

async function setCoarsePointer(enabled: boolean) {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: enabled ? "coarse" : "" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(390, 844);
});

afterEach(async () => {
  cleanup();
  if (typeof window !== "undefined") await setCoarsePointer(false);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

it("on a touch screen a rich row is 56px", async () => {
  await setCoarsePointer(true);
  for (const density of ["compact", "default"] as const) {
    render(
      <InboxItem density={density} data-testid={`row-${density}`}>
        <InboxItemTrigger aria-label="Open" />
        <InboxItemLeading>
          <span style={{ display: "inline-block", width: 35, height: 35 }} />
        </InboxItemLeading>
        <InboxItemContent>
          <InboxItemHeading>
            <InboxItemTitle>Martin needs your OK</InboxItemTitle>
          </InboxItemHeading>
          <InboxItemBody>One line of preview</InboxItemBody>
        </InboxItemContent>
      </InboxItem>,
    );
  }
  expect(screen.getByTestId("row-compact").getBoundingClientRect().height).toBe(56);
  expect(screen.getByTestId("row-default").getBoundingClientRect().height).toBeGreaterThanOrEqual(56);
});

it("on a touch screen a control at the control height has a 10px corner", async () => {
  await setCoarsePointer(true);
  render(
    <>
      <Input aria-label="Name" data-testid="input" />
      <Button size="lg" data-testid="button">
        Save
      </Button>
    </>,
  );
  for (const id of ["input", "button"]) {
    const element = screen.getByTestId(id);
    expect(element.getBoundingClientRect().height, id).toBe(44);
    expect(getComputedStyle(element).borderTopLeftRadius, id).toBe("10px");
  }
});
