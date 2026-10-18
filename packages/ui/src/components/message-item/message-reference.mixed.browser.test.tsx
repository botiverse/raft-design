import "./message-reference.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { GitBranch, Hash, Link2, ListTodo, MessageSquare } from "lucide-react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { InlineCode } from "../inline-code/inline-code";
import { TaskChip } from "../tasks/task-chip";
import { MessageItemContent } from "./message-item-content";
import {
  MessageReferenceChip,
  MessageReferenceLabel,
  MessageReferenceText,
} from "./message-reference";

// Artea (#proj-frontend:1a32281f, 2026-09-28): mentions, reference chips and
// inline code are mixed inside one long message. Every chip must sit on the
// body text's baseline, and the letters must look centred in the chip's
// coloured box — measured on the glyphs (cap height), not on the line box.
// Real browser only: jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
});

afterEach(cleanup);

function MixedMessage({ width }: { width: number }) {
  return (
    <div style={{ width: `${width}px` }}>
      <MessageItemContent>
        <p data-testid="body">
          <MessageReferenceText variant="primary" data-kind="self">
            @Developer
          </MessageReferenceText>{" "}
          please check with{" "}
          <MessageReferenceText data-kind="other">@Member User</MessageReferenceText> about{" "}
          <MessageReferenceChip variant="muted" data-kind="task">
            <ListTodo />
            <MessageReferenceLabel>#15</MessageReferenceLabel>
          </MessageReferenceChip>{" "}
          (also{" "}
          <TaskChip variant="inline" status="in-progress" data-kind="task-inline">
            #206
          </TaskChip>
          ) in the joint channel{" "}
          <MessageReferenceChip variant="accent" data-kind="joint">
            <GitBranch />
            <MessageReferenceLabel>northstar-launch-handoff</MessageReferenceLabel>
          </MessageReferenceChip>{" "}
          and in{" "}
          <MessageReferenceChip variant="accent" data-kind="channel">
            #general
          </MessageReferenceChip>{" "}
          and the thread{" "}
          <MessageReferenceChip variant="info" data-kind="thread">
            <MessageSquare />
            <MessageReferenceLabel>#general:f8ce0f76</MessageReferenceLabel>
          </MessageReferenceChip>
          , see{" "}
          <MessageReferenceChip variant="link" data-kind="link">
            <Link2 />
            <MessageReferenceLabel>#general</MessageReferenceLabel>
          </MessageReferenceChip>{" "}
          and run{" "}
          <InlineCode appearance="message" data-kind="code">
            pnpm test
          </InlineCode>
          , then a long token{" "}
          <InlineCode appearance="message" data-kind="long-code">
            {"sha256:" +
              "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08".repeat(2)}
          </InlineCode>{" "}
          and a <Hash className="inline size-3" /> plain word to finish the line of text.
        </p>
      </MessageItemContent>
    </div>
  );
}

type Measure = { kind: string; baseline: number; optical: number; icon: number | null };

function measure(): Measure[] {
  const body = screen.getByTestId("body");
  const probeAt = (parent: Node, before: Node | null) => {
    const s = document.createElement("span");
    s.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    parent.insertBefore(s, before);
    const y = s.getBoundingClientRect().top;
    s.remove();
    return y;
  };
  const ctx = document.createElement("canvas").getContext("2d")!;
  const out: Measure[] = [];
  for (const el of body.querySelectorAll<HTMLElement>("[data-kind]")) {
    const kind = el.dataset.kind!;
    if (kind === "long-code") continue;
    // First line box of the element: inline code may wrap onto a second line,
    // and the first fragment is where its first letters sit.
    const r = el.getClientRects()[0];
    const textNode = [...el.querySelectorAll("*"), el]
      .flatMap((n) => [...n.childNodes])
      // The hover badge ("joint", "thread") is an overlay outside the chip's
      // flow; the chip's own text is what must line up.
      .find(
        (n) =>
          n.nodeType === 3 &&
          n.textContent!.trim() &&
          !n.parentElement!.closest("[data-message-reference-badge]"),
      ) as Text;
    // A zero-width probe beside the text reads its baseline. A probe is itself
    // a break opportunity, so take the one that lands inside the element's box.
    const chipBaseline =
      [
        probeAt(textNode.parentNode!, textNode),
        probeAt(textNode.parentNode!, textNode.nextSibling),
      ].find((y) => y >= r.top - 0.5 && y <= r.bottom + 0.5) ?? NaN;
    // The body baseline on the chip's own line: of the probes just before and
    // just after the element, the one on the same line as the chip's first
    // text (a probe can land on the neighbouring line at a wrap).
    const beside = [probeAt(el.parentNode!, el), probeAt(el.parentNode!, el.nextSibling)];
    const bodyBaseline = beside.reduce((a, b) =>
      Math.abs(b - chipBaseline) < Math.abs(a - chipBaseline) ? b : a,
    );
    const cs = getComputedStyle(textNode.parentElement!);
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const capCentre = chipBaseline - ctx.measureText("H").actualBoundingBoxAscent / 2;
    const svg = el.querySelector("svg");
    const s = svg?.getBoundingClientRect();
    out.push({
      kind,
      baseline: +(chipBaseline - bodyBaseline).toFixed(2),
      optical: +(capCentre - (r.top + r.height / 2)).toFixed(2),
      icon: s ? +(s.top + s.height / 2 - capCentre).toFixed(2) : null,
    });
  }
  return out;
}

for (const mode of ["light", "dark"] as const) {
  for (const width of [720, 358]) {
    it(`${mode} ${width}px: every chip sits on the text baseline and looks centred`, () => {
      render(
        <ThemeProvider mode={mode}>
          <MixedMessage width={width} />
        </ThemeProvider>,
      );
      const rows = measure();
      expect(rows.map((r) => r.kind).sort()).toEqual(
        [
          "channel",
          "code",
          "joint",
          "link",
          "other",
          "self",
          "task",
          "task-inline",
          "thread",
        ].sort(),
      );
      for (const row of rows) {
        expect(Math.abs(row.baseline), `${row.kind} baseline`).toBeLessThanOrEqual(0.5);
        if (row.kind !== "other") {
          expect(Math.abs(row.optical), `${row.kind} optical centre`).toBeLessThanOrEqual(0.5);
        }
        if (row.icon !== null)
          expect(Math.abs(row.icon), `${row.kind} icon`).toBeLessThanOrEqual(0.5);
      }
    });

    it(`${mode} ${width}px: a long unbroken code token wraps inside the message`, () => {
      render(
        <ThemeProvider mode={mode}>
          <MixedMessage width={width} />
        </ThemeProvider>,
      );
      const body = screen.getByTestId("body").getBoundingClientRect();
      const code = document.querySelector<HTMLElement>("[data-kind=long-code]")!;
      for (const rect of code.getClientRects()) {
        expect(rect.right).toBeLessThanOrEqual(body.right + 0.5);
      }
    });
  }
}
