import "./panel-header.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { PanelAction } from "./panel-action";
import {
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelSectionHeader,
  PanelStatus,
  PanelTitle,
} from "./panel-header";
import { PanelTitleTrigger } from "./panel-title-trigger";
import { PANEL_TITLE_TRIGGER_EXTRA_WIDTH } from "./panel-title-trigger.recipe";

// A PanelTitleTrigger is the panel's title drawn as a button that opens a
// menu. Swapping a plain PanelTitle for it must not move the title or change
// the head: its first letter stays at the same x, the head keeps its height
// (44px on a desktop, 56px on a phone, where the trigger is only as tall as
// the title's line and reaches 44px through its ::after), and in a narrow
// column the title truncates while the chevron stays whole. Here with a
// mouse, at a desktop's width and at a phone's; by touch in
// panel-title-trigger.touch.browser.test.tsx. Measured in a real browser:
// jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

async function setWidth(width: number) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(width, 800);
  expect(matchMedia("(pointer: fine)").matches).toBe(true);
}

const TITLE = "Q3 launch plan";
const LONG_TITLE = "Q3 launch plan for every region, with the checklist and the rota";

type HeadOptions = {
  kind: "plain" | "trigger" | "heading";
  title?: string;
  width?: number;
  actions?: boolean;
};

function renderHead({ kind, title = TITLE, width, actions = false }: HeadOptions) {
  const trigger = <PanelTitleTrigger data-testid="trigger">{title}</PanelTitleTrigger>;
  render(
    <ThemeProvider>
      {/* Room above the head: on a phone the hit area reaches 2px past its top. */}
      <div style={{ paddingTop: "20px", width: width ? `${width}px` : undefined }}>
        <PanelHeader data-testid="head">
          <PanelHeaderContent>
            <PanelHeading>
              {kind === "plain" ? <PanelTitle data-testid="title">{title}</PanelTitle> : null}
              {kind === "trigger" ? trigger : null}
              {kind === "heading" ? <h2 className="flex min-w-0">{trigger}</h2> : null}
              <PanelStatus>v3</PanelStatus>
            </PanelHeading>
            <PanelMeta data-testid="meta">Artifact · #launch-week</PanelMeta>
          </PanelHeaderContent>
          {actions ? (
            <PanelActions>
              <PanelAction aria-label="Close">
                <svg viewBox="0 0 24 24" />
              </PanelAction>
            </PanelActions>
          ) : null}
        </PanelHeader>
      </div>
    </ThemeProvider>,
  );
  const head = screen.getByTestId("head");
  const button = kind === "plain" ? null : screen.getByTestId("trigger");
  const text =
    button?.querySelector<HTMLElement>("[data-slot=panel-title-trigger-label]") ??
    screen.getByTestId("title");
  return {
    head: head.getBoundingClientRect(),
    text: text.getBoundingClientRect(),
    meta: screen.getByTestId("meta").getBoundingClientRect(),
    textElement: text,
    button,
    chevron: button?.querySelector("svg") ?? null,
  };
}

/** A head with a plain title, then the same head with the trigger. */
function both(options: Omit<HeadOptions, "kind"> = {}, kind: "trigger" | "heading" = "trigger") {
  const plain = renderHead({ ...options, kind: "plain" });
  cleanup();
  return { plain, trigger: renderHead({ ...options, kind }) };
}

const SCREENS = [
  { name: "a desktop", width: 1280, head: 44 },
  { name: "a phone's width", width: 390, head: 56 },
] as const;

for (const s of SCREENS) {
  it(`on ${s.name} the title starts at the same x as a plain PanelTitle, on the same line`, async () => {
    await setWidth(s.width);
    const { plain, trigger } = both();
    expect(Math.abs(trigger.text.left - plain.text.left)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(trigger.text.top - plain.text.top)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(trigger.text.height - plain.text.height)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(trigger.meta.top - plain.meta.top)).toBeLessThanOrEqual(0.5);
  });

  it(`on ${s.name} the head is ${s.head}px with a plain title and with the trigger`, async () => {
    await setWidth(s.width);
    const { plain, trigger } = both();
    expect(plain.head.height).toBe(s.head);
    expect(trigger.head.height).toBe(s.head);
  });

  it(`on ${s.name} a trigger inside a heading element is laid out the same`, async () => {
    await setWidth(s.width);
    const { plain, trigger } = both({}, "heading");
    expect(Math.abs(trigger.text.left - plain.text.left)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(trigger.text.top - plain.text.top)).toBeLessThanOrEqual(0.5);
    expect(trigger.head.height).toBe(s.head);
  });
}

it("on a desktop the trigger is the bar button's 28px, with a 14px chevron 4px after the title", async () => {
  await setWidth(1280);
  const { button, chevron, text } = renderHead({ kind: "trigger" });
  expect(button!.getBoundingClientRect().height).toBe(28);
  const box = chevron!.getBoundingClientRect();
  expect(box.width).toBe(14);
  expect(box.height).toBe(14);
  expect(box.left - text.right).toBeCloseTo(4, 1);
});

it("at a phone's width the trigger is as tall as the title's line and its hit area reaches 44px", async () => {
  await setWidth(390);
  const { plain, trigger } = both();
  const box = trigger.button!.getBoundingClientRect();
  expect(box.height).toBe(plain.text.height);
  expect(box.height).toBeLessThan(44);
  const x = box.left + box.width / 2;
  const middle = box.top + box.height / 2;
  // 44px centered on the title's line: a point 21px above and below its
  // middle is still the trigger, and one past the 44px is not.
  for (const offset of [-21, 0, 21]) {
    expect(trigger.button!.contains(document.elementFromPoint(x, middle + offset))).toBe(true);
  }
  for (const offset of [-24, 24]) {
    expect(trigger.button!.contains(document.elementFromPoint(x, middle + offset))).toBe(false);
  }
});

for (const width of [160, 208]) {
  it(`in a ${width}px head a long title truncates and the chevron stays whole, inside the head`, async () => {
    await setWidth(1280);
    const { head, textElement, text, button, chevron } = renderHead({
      kind: "trigger",
      title: LONG_TITLE,
      width,
      actions: true,
    });
    expect(head.width).toBe(width);
    expect(textElement.scrollWidth).toBeGreaterThan(textElement.clientWidth + 1);
    expect(text.width).toBeGreaterThan(0);
    const box = chevron!.getBoundingClientRect();
    expect(box.width).toBe(14);
    expect(box.left).toBeGreaterThanOrEqual(text.right);
    expect(box.right).toBeLessThanOrEqual(button!.getBoundingClientRect().right);
    expect(button!.getBoundingClientRect().right).toBeLessThanOrEqual(head.right);
    const close = screen.getByRole("button", { name: "Close" }).getBoundingClientRect();
    expect(box.right).toBeLessThanOrEqual(close.left);
    // The chevron is what the pointer finds there: nothing covers or clips it.
    const top = document.elementFromPoint(box.left + 7, box.top + 7);
    expect(button!.contains(top)).toBe(true);
  });
}

it("on a desktop the trigger takes PANEL_TITLE_TRIGGER_EXTRA_WIDTH more room than a plain title", async () => {
  await setWidth(1280);
  const { plain, trigger } = both();
  // The room it takes from where the title starts: its start inset is pulled
  // back, so it is not part of it.
  const room = trigger.button!.getBoundingClientRect().right - trigger.text.left;
  expect(room - plain.text.width).toBeCloseTo(PANEL_TITLE_TRIGGER_EXTRA_WIDTH, 1);
});

it("in a section head at a phone's width, on the frame, the trigger takes the title's color there", async () => {
  await setWidth(390);
  render(
    <ThemeProvider>
      <PanelSectionHeader>
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle data-testid="title">Tasks</PanelTitle>
            <PanelTitleTrigger data-testid="trigger">Tasks</PanelTitleTrigger>
          </PanelHeading>
          <PanelMeta data-testid="meta">12 open</PanelMeta>
        </PanelHeaderContent>
      </PanelSectionHeader>
    </ThemeProvider>,
  );
  const color = (element: Element) => getComputedStyle(element).color;
  const trigger = screen.getByTestId("trigger");
  const onFrame = { title: color(trigger), chevron: color(trigger.querySelector("svg")!) };
  expect(onFrame.title).toBe(color(screen.getByTestId("title")));
  expect(onFrame.chevron).toBe(color(screen.getByTestId("meta")));
  cleanup();
  // CONTROL: in a panel's head the chevron is not the frame's muted color.
  const { chevron } = renderHead({ kind: "trigger" });
  expect(color(chevron!)).not.toBe(onFrame.chevron);
});
