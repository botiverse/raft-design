import "../message-embed/message-embed.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  MessageQuotedPreview,
  MessageQuotedPreviewAttachment,
  MessageQuotedPreviewAttachments,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
} from "./message-quoted-preview";

// The quoted preview is drawn on MessageEmbed's frame, restyled as a square
// bar. Content at a card's edge takes the card's inner corner and clips to it
// (message-embed.md), but a bar has no corner: its content stays square and
// clips nothing, so the first attachment chip keeps its own corner (Kirby's
// review of raft-design #1138, where a 9px curve cut it). Real layout and hit
// testing only: jsdom computes neither.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

function Quote({ header }: { header: boolean }) {
  return (
    <ThemeProvider>
      <div className="w-[320px] p-8">
        <MessageQuotedPreview data-testid="quote">
          {header ? (
            <MessageQuotedPreviewHeader>
              <MessageQuotedPreviewAuthor>
                <MessageQuotedPreviewAuthorName>Developer</MessageQuotedPreviewAuthorName>
              </MessageQuotedPreviewAuthor>
            </MessageQuotedPreviewHeader>
          ) : null}
          <MessageQuotedPreviewContent data-testid="content">
            <MessageQuotedPreviewText>
              Should we migrate from Zustand to Jotai?
            </MessageQuotedPreviewText>
            <MessageQuotedPreviewAttachments>
              <MessageQuotedPreviewAttachment data-testid="chip">
                1 file
              </MessageQuotedPreviewAttachment>
            </MessageQuotedPreviewAttachments>
          </MessageQuotedPreviewContent>
        </MessageQuotedPreview>
      </div>
    </ThemeProvider>
  );
}

const px = (value: string) => Number.parseFloat(value);

for (const header of [true, false]) {
  const where = header ? "under its header" : "with no header";

  it(`content ${where} stays square and clips nothing`, () => {
    render(<Quote header={header} />);
    expect(px(getComputedStyle(screen.getByTestId("quote")).borderTopLeftRadius)).toBe(0);
    const style = getComputedStyle(screen.getByTestId("content"));
    expect(px(style.borderTopLeftRadius)).toBe(0);
    expect(px(style.borderTopRightRadius)).toBe(0);
    expect(px(style.borderBottomLeftRadius)).toBe(0);
    expect(px(style.borderBottomRightRadius)).toBe(0);
    expect(style.overflow).toBe("visible");
  });

  it(`the first attachment chip ${where} keeps its own corner`, () => {
    render(<Quote header={header} />);
    const chip = screen.getByTestId("chip");
    const content = screen.getByTestId("content");
    // The chip sits at the content's bottom-left, where a card's inner corner
    // would cut it.
    const c = chip.getBoundingClientRect();
    const box = content.getBoundingClientRect();
    expect(c.left).toBe(box.left);
    expect(c.bottom).toBe(box.bottom);

    // 2px in from the chip's bottom-left on its diagonal: inside its own 6px
    // corner, outside a 9px one.
    const hit = document.elementFromPoint(c.left + 2, c.bottom - 2);
    expect(chip.contains(hit)).toBe(true);
  });
}
