import "./message-embed.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { messageCard } from "./message-embed.recipe";
import {
  MessageEmbed,
  MessageEmbedContent,
  MessageEmbedFooter,
  MessageEmbedHeader,
} from "./message-embed";

// #triage:6be3db1b (cindyz, 2026-11-10): on an Artifact card in a message the
// border's top corners were cut off. The cover runs to the frame's edges, and
// square, it covered the border's arc. Content at the frame's top or bottom
// takes the frame's inner corner and is clipped to it; the frame itself never
// clips, so the title link's ring around the whole card (its ::after) still
// draws outside it (message-embed.md, shape.md#inside-a-frame). Real layout
// and hit testing only: jsdom computes neither.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

const COVER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="10"><rect width="16" height="10" fill="oklch(0.55 0.15 260)"/></svg>',
  );

function Card({ mode }: { mode: "light" | "dark" }) {
  const { title } = messageCard();
  return (
    <ThemeProvider mode={mode}>
      <div className="p-8">
        <button type="button" data-testid="before">
          Before
        </button>
        <MessageEmbed size="item" interactive className="relative" data-testid="top-card">
          <MessageEmbedContent data-testid="top-content">
            <img src={COVER} alt="" data-testid="cover" className="block h-24 w-full" />
          </MessageEmbedContent>
          <MessageEmbedHeader>
            <p className={title()}>
              <a
                href="#plan"
                data-testid="title"
                className="no-underline after:absolute after:inset-0 after:rounded-container focus-visible:after:shadow-focus"
              >
                Launch plan
              </a>
            </p>
          </MessageEmbedHeader>
          <MessageEmbedContent data-testid="middle-content">
            <div className="h-6 bg-fill-muted" />
          </MessageEmbedContent>
          <MessageEmbedFooter>Updated 2 hours ago</MessageEmbedFooter>
        </MessageEmbed>
        <MessageEmbed size="item" className="mt-4" data-testid="bottom-card">
          <MessageEmbedHeader>Excerpt</MessageEmbedHeader>
          <MessageEmbedContent data-testid="bottom-content">
            <div className="h-24 bg-fill-muted p-3">The first lines of the page.</div>
          </MessageEmbedContent>
        </MessageEmbed>
      </div>
    </ThemeProvider>
  );
}

const px = (value: string) => Number.parseFloat(value);

/** The frame's radius less its border: the curve of the frame's inside edge. */
function innerRadius(frame: Element) {
  const style = getComputedStyle(frame);
  return px(style.borderTopLeftRadius) - px(style.borderTopWidth);
}

/**
 * What is hit 2px in from a corner of the frame, on its diagonal: outside the
 * border's arc, where the content may not be. A square cover or excerpt is.
 */
function atCorner(
  frame: Element,
  corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
) {
  const r = frame.getBoundingClientRect();
  const x = corner.endsWith("left") ? r.left + 2 : r.right - 2;
  const y = corner.startsWith("top") ? r.top + 2 : r.bottom - 2;
  return document.elementFromPoint(x, y);
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 150));

for (const mode of ["light", "dark"] as const) {
  it(`${mode}: a cover at the frame's top takes its inner corner and leaves the border's arc`, async () => {
    render(<Card mode={mode} />);
    const frame = screen.getByTestId("top-card");
    const content = screen.getByTestId("top-content");
    const cover = screen.getByTestId("cover") as HTMLImageElement;
    await cover.decode();

    const inner = innerRadius(frame);
    expect(inner).toBeGreaterThan(0);
    const style = getComputedStyle(content);
    expect(px(style.borderTopLeftRadius)).toBe(inner);
    expect(px(style.borderTopRightRadius)).toBe(inner);
    expect(style.overflow).toBe("clip");
    // Only the corners it shares with the frame: its foot meets the header.
    expect(px(style.borderBottomLeftRadius)).toBe(0);
    expect(px(style.borderBottomRightRadius)).toBe(0);

    for (const corner of ["top-left", "top-right"] as const) {
      expect(content.contains(atCorner(frame, corner)), corner).toBe(false);
    }
  });

  it(`${mode}: an excerpt at the frame's bottom takes its inner corner`, () => {
    render(<Card mode={mode} />);
    const frame = screen.getByTestId("bottom-card");
    const content = screen.getByTestId("bottom-content");
    const style = getComputedStyle(content);
    const inner = innerRadius(frame);
    expect(px(style.borderBottomLeftRadius)).toBe(inner);
    expect(px(style.borderBottomRightRadius)).toBe(inner);
    expect(px(style.borderTopLeftRadius)).toBe(0);
    for (const corner of ["bottom-left", "bottom-right"] as const) {
      expect(content.contains(atCorner(frame, corner)), corner).toBe(false);
    }
  });

  it(`${mode}: content between two rows keeps square corners and clips nothing`, () => {
    render(<Card mode={mode} />);
    const style = getComputedStyle(screen.getByTestId("middle-content"));
    expect(px(style.borderTopLeftRadius)).toBe(0);
    expect(px(style.borderBottomRightRadius)).toBe(0);
    expect(style.overflow).toBe("visible");
  });

  it(`${mode}: the frame doesn't clip, so the title's ring around the whole card shows`, async () => {
    const { userEvent } = await import("vite-plus/test/browser/context");
    render(<Card mode={mode} />);
    const frame = screen.getByTestId("top-card");
    const link = screen.getByTestId("title");

    await userEvent.click(screen.getByTestId("before"));
    await userEvent.keyboard("{Tab}");
    await settle();
    expect(document.activeElement).toBe(link);

    // The ring is the 4px outer layer of focus-ring, on the ::after that
    // covers the card: positioned on the frame, so the frame is what would
    // clip it, and it draws 4px outside the frame.
    const after = getComputedStyle(link, "::after");
    expect(after.position).toBe("absolute");
    expect(getComputedStyle(frame).position).toBe("relative");
    expect(after.boxShadow).toMatch(/0px 0px 0px 4px/);
    expect(getComputedStyle(frame).overflow).toBe("visible");
  });
}
