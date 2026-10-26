import "./row-hover.test.css";
import type { ReactElement } from "react";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "./theme/theme-provider";
import { Button } from "../components/button/button";
import { CommentCard, CommentCardTrigger } from "../components/comment/comment-card";
import { CommentEntry, CommentEntryBody } from "../components/comment/comment-entry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/dropdown-menu";
import { ListRow } from "../components/list-row/list-row";
import { MessageAttachmentCard } from "../components/message-attachment/message-attachment";
import { MessageItem, MessageItemBody, MessageItemContent } from "../components/message-item";
import { MessageReplies } from "../components/message-replies/message-replies";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../components/segmented-control/segmented-control";
import { SidebarItem, SidebarItemTitle } from "../components/sidebar/sidebar-item";
import { TaskCard } from "../components/task-card/task-card";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle-group/toggle-group";
import { deltaE, firstOklch, over, parseOklch, settled, token } from "./row-hover.test-colors";

// Hover and press in two tiers (design/foundations/states.md#hover-and-press),
// measured on the real components in a real browser: :hover needs a real
// pointer. Each tier is a translucent ink layer over the resting colour, so
// the check is the alpha the element paints in each mode:
// - subtle: hover on rows, messages and readable cards; a row whose menu is open;
// - medium: hover on small controls and press on everything, with its own
//   alpha on a colour sticker and on the frame;
// - cell: a list row (lib/list-cell.ts) hovers on its inset shape with
//   fill-cell-hover, the subtle tier in light and a stronger step in dark,
//   rows only, so the shape reads on a dark surface;
// - selected items don't respond to hover.

const it = test.skipIf(typeof window === "undefined");

const PRESSED = ["left"];

afterEach(cleanup);

const ALPHA = {
  subtle: { light: 0.04, dark: 0.03 },
  cell: { light: 0.04, dark: 0.075 },
  medium: { light: 0.078, dark: 0.065 },
  sticker: { light: 0.1, dark: 0.1 },
  frame: { light: 0.1, dark: 0.06 },
} as const;
type Tier = keyof typeof ALPHA;

/** The alpha of the hover layer an element paints: its background-image's
 *  first colour when it lays an overlay, its ::before shape's colour for a
 *  list cell, else its background colour. */
function paintedLayer(el: Element, read: "color" | "image" | "before") {
  if (read === "before") return getComputedStyle(el, "::before").backgroundColor;
  const style = getComputedStyle(el);
  return read === "image" ? firstOklch(style.backgroundImage) : style.backgroundColor;
}

const alphaOf = (value: string) => parseOklch(value)[3];

const cases: {
  id: string;
  tier: Tier;
  read: "color" | "image" | "before";
  element: ReactElement;
}[] = [
  {
    id: "message",
    tier: "subtle",
    read: "color",
    element: (
      <MessageItem data-testid="message">
        <MessageItemContent>
          <MessageItemBody>A message someone reads with the pointer on it.</MessageItemBody>
        </MessageItemContent>
      </MessageItem>
    ),
  },
  {
    id: "sidebar",
    tier: "cell",
    read: "before",
    element: (
      <SidebarItem data-testid="sidebar">
        <SidebarItemTitle>launch-week</SidebarItemTitle>
      </SidebarItem>
    ),
  },
  {
    id: "list-row",
    tier: "cell",
    read: "before",
    element: <ListRow data-testid="list-row">Wug</ListRow>,
  },
  {
    id: "comment",
    tier: "subtle",
    read: "color",
    element: (
      <div className="relative w-72">
        <CommentCard>
          <CommentEntry>
            <CommentEntryBody clamp>A comment beside the passage.</CommentEntryBody>
          </CommentEntry>
          <CommentCardTrigger aria-label="Comment from Wug" data-testid="comment" />
        </CommentCard>
      </div>
    ),
  },
  {
    id: "attachment",
    tier: "subtle",
    read: "image",
    element: <MessageAttachmentCard data-testid="attachment">migration.diff</MessageAttachmentCard>,
  },
  {
    id: "replies",
    tier: "subtle",
    read: "image",
    element: <MessageReplies data-testid="replies">4 replies</MessageReplies>,
  },
  {
    id: "task-card",
    tier: "subtle",
    read: "image",
    element: (
      <TaskCard data-testid="task-card" onClick={() => {}}>
        Polish onboarding
      </TaskCard>
    ),
  },
  {
    id: "outline",
    tier: "medium",
    read: "image",
    element: (
      <Button data-testid="outline" variant="outline">
        Button
      </Button>
    ),
  },
  {
    id: "ghost",
    tier: "medium",
    read: "color",
    element: (
      <Button data-testid="ghost" variant="ghost">
        Ghost
      </Button>
    ),
  },
  {
    id: "primary",
    tier: "sticker",
    read: "image",
    element: (
      <Button data-testid="primary" variant="primary">
        Unarchive
      </Button>
    ),
  },
  {
    id: "on-frame",
    tier: "frame",
    read: "color",
    element: (
      <div className="bg-layer-frame p-2">
        <Button data-testid="on-frame" variant="on-frame">
          Frame
        </Button>
      </div>
    ),
  },
];

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: each element hovers with its tier`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={`${mode} flex flex-col items-start gap-3 bg-layer-canvas p-3`}>
          {cases.map((c) => (
            <div key={c.id}>{c.element}</div>
          ))}
          <SegmentedControl aria-label="View" defaultValue="board">
            <SegmentedControlItem value="board">Board</SegmentedControlItem>
            <SegmentedControlItem value="list" data-testid="segment">
              List
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent } = await import("vite-plus/test/browser/context");
    const all = [...cases, { id: "segment", tier: "medium" as Tier, read: "color" as const }];
    for (const c of all) {
      await userEvent.unhover(document.body);
      const el = getByTestId(c.id);
      await page.getByTestId(c.id).hover();
      const layer = await settled(() => paintedLayer(el, c.read));
      expect
        .soft(alphaOf(layer), `${mode} ${c.id} hovers with the ${c.tier} tier (${layer})`)
        .toBeCloseTo(ALPHA[c.tier][mode], 3);
    }
  });

  // One translucent layer, so the subtle step reads the same on white, the
  // yellowish sidebar and a card: 2 to 3.5 in OKLab distance on each.
  it(`${mode}: the subtle tier is the same small step on every surface`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope" />
      </ThemeProvider>,
    );
    const scope = getByTestId("scope");
    const fill = parseOklch(token(scope, "fill-subtle"));
    for (const surface of ["layer-canvas", "layer-sidebar", "layer-card", "layer-popover"]) {
      const base = parseOklch(token(scope, surface));
      const step = deltaE(over(fill, base), base);
      expect.soft(step, `${mode} subtle on ${surface}: ${step.toFixed(2)}`).toBeGreaterThan(2);
      expect.soft(step, `${mode} subtle on ${surface}: ${step.toFixed(2)}`).toBeLessThan(3.5);
    }
  });

  // Selection is the strongest signal: a selected segment or toggle doesn't
  // darken on hover, like a selected tab or sidebar item; pressing it lays
  // the medium tier for a colour sticker.
  it(`${mode}: a selected segment or toggle doesn't respond to hover, and presses medium`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={`${mode} flex flex-col items-start gap-3 bg-layer-canvas p-3`}>
          <SegmentedControl aria-label="View" defaultValue="board">
            <SegmentedControlItem value="board" data-testid="selected-segment">
              Board
            </SegmentedControlItem>
            <SegmentedControlItem value="list">List</SegmentedControlItem>
          </SegmentedControl>
          <ToggleGroup aria-label="Alignment" defaultValue={PRESSED}>
            <ToggleGroupItem value="left" data-testid="pressed-toggle">
              Left
            </ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </ThemeProvider>,
    );
    const { page, userEvent, cdp } = await import("vite-plus/test/browser/context");
    for (const id of ["selected-segment", "pressed-toggle"]) {
      await userEvent.unhover(document.body);
      const el = getByTestId(id);
      const rest = await settled(() => {
        const s = getComputedStyle(el);
        return `${s.backgroundColor} | ${s.backgroundImage}`;
      });
      await page.getByTestId(id).hover();
      const hovered = await settled(() => {
        const s = getComputedStyle(el);
        return `${s.backgroundColor} | ${s.backgroundImage}`;
      });
      expect.soft(hovered, `${mode} ${id} on hover`).toBe(rest);

      const rect = el.getBoundingClientRect();
      const at = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      await cdp().send("Input.dispatchMouseEvent", {
        type: "mousePressed",
        button: "left",
        clickCount: 1,
        ...at,
      });
      const pressed = await settled(() => firstOklch(getComputedStyle(el).backgroundImage));
      await cdp().send("Input.dispatchMouseEvent", {
        type: "mouseReleased",
        button: "left",
        clickCount: 1,
        ...at,
      });
      expect
        .soft(alphaOf(pressed), `${mode} ${id} pressed (${pressed})`)
        .toBeCloseTo(ALPHA.sticker[mode], 3);
    }
  });

  // A readable card hovers subtle and presses medium.
  it(`${mode}: a readable card presses with the medium tier`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={`${mode} bg-layer-canvas p-3`}>
          <MessageAttachmentCard data-testid="card">migration.diff</MessageAttachmentCard>
        </div>
      </ThemeProvider>,
    );
    const { page, cdp } = await import("vite-plus/test/browser/context");
    const el = getByTestId("card");
    await page.getByTestId("card").hover();
    const rect = el.getBoundingClientRect();
    const at = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    await cdp().send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      button: "left",
      clickCount: 1,
      ...at,
    });
    const pressed = await settled(() => firstOklch(getComputedStyle(el).backgroundImage));
    await cdp().send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      button: "left",
      clickCount: 1,
      ...at,
    });
    expect(alphaOf(pressed), `${mode} card pressed (${pressed})`).toBeCloseTo(
      ALPHA.medium[mode],
      3,
    );
  });

  // The current item in a popup is the yellow highlight, not a grey; in dark
  // mode at 20% so it outweighs a button hover beside it.
  it(`${mode}: a menu item under the pointer takes brand-soft`, async () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <div className={mode} data-testid="scope">
          <DropdownMenu defaultOpen>
            <DropdownMenuTrigger render={<Button variant="outline" />}>Open</DropdownMenuTrigger>
            <DropdownMenuContent className={mode}>
              <DropdownMenuItem data-testid="item">Pin thread</DropdownMenuItem>
              <DropdownMenuItem>Copy link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ThemeProvider>,
    );
    const { page } = await import("vite-plus/test/browser/context");
    await page.getByTestId("item").hover();
    const el = getByTestId("item");
    const fill = await settled(() => getComputedStyle(el).backgroundColor);
    expect(fill).toBe(token(getByTestId("scope"), "brand-soft"));
    expect(alphaOf(fill), `${mode} brand-soft (${fill})`).toBeCloseTo(mode === "dark" ? 0.2 : 1, 3);
  });
}

// Every :hover rule sits under @media (hover: hover): on a touch screen a
// hover would stay on the last thing tapped. Tailwind's hover: does this; the
// plain CSS files (ComboboxSelect, FloatButton, Steps) must do it too.
it("every :hover rule in the stylesheet is gated by (hover: hover)", () => {
  const ungated: string[] = [];
  const walk = (rules: CSSRuleList, gated: boolean, parent: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules, gated || /hover:\s*hover/.test(rule.conditionText), parent);
      } else if (rule instanceof CSSStyleRule) {
        const selector = rule.selectorText.replace(/&/g, parent);
        if (!gated && /:hover/.test(selector) && rule.style.length > 0) ungated.push(selector);
        walk(rule.cssRules, gated, selector);
      } else if ("cssRules" in rule) {
        walk((rule as CSSGroupingRule).cssRules, gated, parent);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules, false, "");
  expect(ungated).toEqual([]);
});
