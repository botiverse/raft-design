import "./inbox-item.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { PanelAction } from "../panel/panel-action";
import { PanelToggleAction } from "../panel/panel-toggle-action";
import {
  InboxItem,
  InboxItemActions,
  InboxItemBody,
  InboxItemContent,
  InboxItemContext,
  InboxItemHeading,
  InboxItemMetadata,
  InboxItemSender,
  InboxItemTimestamp,
  InboxItemTitle,
  InboxItemTrailing,
  InboxItemTrigger,
} from "./inbox-item";

// On a touch screen (`pointer: coarse`) every action in the row keeps a 44px
// target at any width, and two targets don't overlap. A phone-width viewport
// is where it matters: there the panel action's own `md:` overhang is off.
// Measured in a real browser with touch emulated through CDP; jsdom has no
// media queries or layout.

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

function renderRow() {
  render(
    <InboxItem>
      <InboxItemTrigger aria-label="Open Martin needs your OK" />
      <InboxItemContent>
        <InboxItemTitle>Martin needs your OK</InboxItemTitle>
      </InboxItemContent>
      <InboxItemTrailing>
        <InboxItemActions>
          <PanelToggleAction aria-label="Save activity item">S</PanelToggleAction>
          <PanelAction aria-label="Mark as done">D</PanelAction>
        </InboxItemActions>
      </InboxItemTrailing>
    </InboxItem>,
  );
  return {
    save: screen.getByRole("button", { name: "Save activity item" }),
    done: screen.getByRole("button", { name: "Mark as done" }),
  };
}

/** The pressable box: the button plus the overhang of its `::after`. */
function hitArea(el: HTMLElement) {
  const box = el.getBoundingClientRect();
  const after = getComputedStyle(el, "::after");
  const overhang = (side: "top" | "right" | "bottom" | "left") =>
    after.position === "absolute" ? Math.max(0, -parseFloat(after[side])) : 0;
  return {
    left: box.left - overhang("left"),
    right: box.right + overhang("right"),
    width: box.width + overhang("left") + overhang("right"),
    height: box.height + overhang("top") + overhang("bottom"),
  };
}

it("keeps a 44px target for each row action on a touch screen at phone width", async () => {
  await setCoarsePointer(true);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  const { save, done } = renderRow();
  for (const action of [save, done]) {
    const area = hitArea(action);
    expect(area.width).toBeGreaterThanOrEqual(44);
    expect(area.height).toBeGreaterThanOrEqual(44);
  }
  expect(hitArea(save).right).toBeLessThanOrEqual(hitArea(done).left);
});

const CARD_TITLE = "The activity card spacing is ready for a source-parity review";
const CARD_BODY =
  "I kept the original border, spacing and selected treatment. Let me know if the hover state needs another pass.";

/**
 * An Activity card. The `reference` card has an empty `InboxItemTrailing`;
 * the test pads its context and title lines by the real column's width: the
 * card as it should lay out, with the trailing column beside them only.
 */
function Card({ reference = false }: { reference?: boolean }) {
  return (
    <InboxItem data-testid={reference ? "reference" : "card"} data-unread>
      <InboxItemTrigger aria-label={`Open ${CARD_TITLE}`} />
      <InboxItemContent>
        <InboxItemContext data-testid="card-first-line">#launch-week</InboxItemContext>
        <InboxItemHeading data-testid="card-first-line">
          <InboxItemTitle>{CARD_TITLE}</InboxItemTitle>
        </InboxItemHeading>
        <InboxItemBody data-testid="card-body">
          <InboxItemSender>Bob: </InboxItemSender>
          {CARD_BODY}
        </InboxItemBody>
        <InboxItemMetadata>
          <Badge>#21 @Mira</Badge>
          <Badge>4 replies</Badge>
          <Badge>@ you</Badge>
          <Badge>3 new</Badge>
        </InboxItemMetadata>
      </InboxItemContent>
      {!reference ? (
        <InboxItemTrailing data-testid="card-trailing">
          <InboxItemTimestamp>2 minutes ago</InboxItemTimestamp>
          <InboxItemActions reveal="hover">
            <Button variant="outline" size="icon-md" aria-label="Mark as done">
              D
            </Button>
          </InboxItemActions>
        </InboxItemTrailing>
      ) : (
        <InboxItemTrailing className="after:hidden" />
      )}
    </InboxItem>
  );
}

it("keeps the trailing column beside the first lines of a card on a touch screen at phone width", async () => {
  await setCoarsePointer(true);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  const { unmount } = render(<Card />);
  const card = screen.getByTestId("card").getBoundingClientRect();
  const trailing = screen.getByTestId("card-trailing").getBoundingClientRect();
  const body = screen.getByTestId("card-body").getBoundingClientRect();
  // The excerpt runs the full width of the text, under the trailing column.
  expect(body.right).toBeGreaterThan(trailing.left);
  expect(body.right).toBe(card.right - 16);
  // The trailing column takes room beside the context and title lines only,
  // so the card is as tall as one with an empty trailing column whose
  // context and title lines are padded by its width instead.
  unmount();
  render(<Card reference />);
  for (const line of screen.getAllByTestId("card-first-line")) {
    line.style.paddingRight = `${trailing.width}px`;
  }
  expect(card.height).toBe(screen.getByTestId("reference").getBoundingClientRect().height);
});

it("leaves a mouse at phone width as it was: 32px buttons, no overhang", async () => {
  expect(matchMedia("(pointer: coarse)").matches).toBe(false);
  const { save, done } = renderRow();
  for (const action of [save, done]) {
    expect(getComputedStyle(action, "::after").position).not.toBe("absolute");
    expect(action.getBoundingClientRect().height).toBe(32);
  }
  expect(done.getBoundingClientRect().left - save.getBoundingClientRect().right).toBe(2);
});
