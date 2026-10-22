import "./message-reference.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { CircleOff, Hash, Link2, MessageSquare } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Spinner } from "../spinner";
import { TaskChip } from "../tasks/task-chip";
import { TaskStatusIcon } from "../tasks/task-status-icon";
import { MessageItemBody, MessageItemContent } from "./message-item-content";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferencePending,
  MessageReferenceSuffix,
  MessageReferenceText,
  MessageReferenceUnavailable,
} from "./message-reference";

// Every chip in a message's text shares one box (message-item.md, Chips in
// running text): 0.875em of the sentence, semibold, the body line less 2px
// tall with no padding above or below, 6px at each end, or 4.5px at each end
// with a leading mark and 4px from the mark to the text, so the ink at both
// ends sits equally far in (alignment.md, Chips). A chip is
// always 2px shorter than its line, so a line holding one keeps the body's
// line height: 22px on a desktop, 24px on a phone. Before, a reference chip
// was 22px and made a desktop line 23px, and the task chip and the yellow
// sticker were 1.2em of the sentence, about 5px shorter, with larger letters.
//
// A mention of someone else is a text mark: the sentence's size, no box.
// Real browser only: jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  // `load` resolves to the faces it loaded: none means the test CSS lost them.
  const loaded = await Promise.all(
    ['400 16px "Space Grotesk"', '600 16px "Space Grotesk"'].map((font) =>
      document.fonts.load(font),
    ),
  );
  for (const faces of loaded) expect(faces.length).toBeGreaterThan(0);
});

afterEach(cleanup);

// `mark`: the leading mark's own width. A Lucide icon is 14px; the loading
// spinner and a task's status pixel keep their own boxes, drawn to their edges.
type Case = { kind: string; mark: number | null; chip: ReactNode };

const CHIPS: Case[] = [
  {
    kind: "channel",
    mark: null,
    chip: <MessageReferenceChip variant="accent">#general</MessageReferenceChip>,
  },
  {
    kind: "joint",
    mark: 14,
    chip: (
      <MessageReferenceChip variant="accent">
        <Hash />
        <MessageReferenceLabel>release-notes</MessageReferenceLabel>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "thread",
    mark: 14,
    chip: (
      <MessageReferenceChip variant="info">
        <MessageSquare />
        <MessageReferenceLabel>#general:f8ce0f76</MessageReferenceLabel>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "message",
    mark: 14,
    chip: (
      <MessageReferenceChip variant="link">
        <Link2 />
        <MessageReferenceLabel>#proj-chat</MessageReferenceLabel>
        <MessageReferenceSuffix>msg</MessageReferenceSuffix>
      </MessageReferenceChip>
    ),
  },
  {
    kind: "muted",
    mark: null,
    chip: <MessageReferenceChip variant="muted">mac-studio</MessageReferenceChip>,
  },
  {
    kind: "pending",
    mark: 9.5,
    chip: (
      <MessageReferencePending>
        <Spinner size="xs" />
        <span>migration-notes</span>
      </MessageReferencePending>
    ),
  },
  {
    kind: "unavailable",
    mark: 14,
    chip: (
      <MessageReferenceUnavailable>
        <CircleOff />
        <span>legacy-brief</span>
      </MessageReferenceUnavailable>
    ),
  },
  {
    kind: "sticker",
    mark: null,
    chip: <MessageReferenceText variant="primary">@Developer</MessageReferenceText>,
  },
  {
    kind: "task",
    mark: 9,
    chip: (
      <TaskChip variant="inline" status="in-progress">
        <TaskStatusIcon status="in-progress" />
        <span>#206</span>
      </TaskChip>
    ),
  },
];

function Sentences() {
  return (
    <div style={{ width: 360 }}>
      <MessageItemContent>
        <MessageItemBody>
          {CHIPS.map((c) => (
            <p key={c.kind} data-testid={`line-${c.kind}`} className="whitespace-nowrap">
              Ask in{" "}
              <span data-chip={c.kind} className="contents">
                {c.chip}
              </span>{" "}
              first.
            </p>
          ))}
          <p data-testid="line-plain">Ask in the channel first.</p>
          <p data-testid="line-other" className="whitespace-nowrap">
            Ask <MessageReferenceText data-testid="other">@Member User</MessageReferenceText> first.
          </p>
        </MessageItemBody>
      </MessageItemContent>
    </div>
  );
}

const chipOf = (kind: string) =>
  document.querySelector<HTMLElement>(`[data-chip="${kind}"]`)!.firstElementChild as HTMLElement;

/** The left edge of the first thing after the leading mark: an element or a text node. */
function textStartAfter(mark: Element) {
  let node = mark.nextSibling;
  while (node && node.nodeType === 3 && !node.textContent!.trim()) node = node.nextSibling;
  const range = document.createRange();
  range.selectNodeContents(node!);
  return range.getBoundingClientRect().left;
}

for (const [name, width, line] of [
  ["desktop", 1280, 22],
  ["phone", 390, 24],
] as const) {
  for (const mode of ["light", "dark"] as const) {
    it(`${name} ${mode}: every chip is the body line less 2px and leaves the line its height`, async () => {
      const { page } = await import("vite-plus/test/browser/context");
      await page.viewport(width, 1200);
      render(
        <ThemeProvider mode={mode}>
          <Sentences />
        </ThemeProvider>,
      );
      const plain = screen.getByTestId("line-plain");
      expect(plain.getBoundingClientRect().height, "a plain line").toBe(line);
      const bodySize = Number.parseFloat(getComputedStyle(plain).fontSize);

      for (const { kind } of CHIPS) {
        const chip = chipOf(kind);
        const style = getComputedStyle(chip);
        expect(chip.getBoundingClientRect().height, `${kind} height`).toBe(line - 2);
        expect(style.lineHeight, `${kind} line height`).toBe(`${line - 2}px`);
        expect(Number.parseFloat(style.fontSize), `${kind} type`).toBeCloseTo(bodySize * 0.875, 2);
        expect(style.fontWeight, `${kind} weight`).toBe("600");
        expect([style.paddingTop, style.paddingBottom], `${kind} block padding`).toEqual([
          "0px",
          "0px",
        ]);
        expect(style.borderTopLeftRadius, `${kind} corners`).toBe("4px");
        expect(
          screen.getByTestId(`line-${kind}`).getBoundingClientRect().height,
          `the line holding ${kind}`,
        ).toBe(line);
      }

      // A text mark keeps the sentence's size and adds no box.
      const other = screen.getByTestId("other");
      expect(getComputedStyle(other).fontSize).toBe(`${bodySize}px`);
      expect(screen.getByTestId("line-other").getBoundingClientRect().height).toBe(line);
    });
  }

  it(`${name}: 6px at each end, or 4.5px at each end and 4px from a leading mark to the text`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(width, 1200);
    render(
      <ThemeProvider mode="light">
        <Sentences />
      </ThemeProvider>,
    );
    for (const { kind, mark } of CHIPS) {
      const chip = chipOf(kind);
      const style = getComputedStyle(chip);
      const box = chip.getBoundingClientRect();
      const side = mark === null ? "6px" : "4.5px";
      expect([style.paddingLeft, style.paddingRight], `${kind} sides`).toEqual([side, side]);
      if (mark === null) continue;
      const el = chip.querySelector(":scope > svg, :scope > [data-slot=spinner]")!;
      const r = el.getBoundingClientRect();
      expect(r.left - box.left, `${kind} before the mark`).toBeCloseTo(4.5, 1);
      expect(r.width, `${kind} mark box`).toBeCloseTo(mark, 1);
      expect(textStartAfter(el) - r.right, `${kind} mark to text`).toBeCloseTo(4, 1);
      // The mark is centred on the chip.
      expect(
        Math.abs(r.top + r.height / 2 - (box.top + box.height / 2)),
        `${kind} mark centre`,
      ).toBeLessThanOrEqual(0.5);
    }
    // The task's status pixel keeps its own 9px box, with no slot around it.
    const pixel = chipOf("task").querySelector(":scope > svg")!;
    expect([pixel.getBoundingClientRect().width, pixel.getBoundingClientRect().height]).toEqual([
      9, 9,
    ]);
    expect(getComputedStyle(pixel).marginLeft).toBe("0px");
    expect(getComputedStyle(pixel).marginRight).toBe("0px");
  });
}

it("the yellow sticker draws its ink edge inside only, with no die-cut edge outside", async () => {
  for (const mode of ["light", "dark"] as const) {
    render(
      <ThemeProvider mode={mode}>
        <Sentences />
      </ThemeProvider>,
    );
    const shadow = getComputedStyle(chipOf("sticker")).boxShadow;
    expect(shadow, `${mode}: the ink edge`).toMatch(/1\.5px inset/);
    expect(shadow, `${mode}: no 1.5px ring outside`).not.toMatch(/1\.5px(?! inset)/);
    cleanup();
  }
});
