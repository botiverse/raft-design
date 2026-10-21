import "../message-item/message-item.avatar-align.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Avatar, AvatarFallback } from "../avatar";
import {
  MessageQuotedPreview,
  MessageQuotedPreviewAuthor,
  MessageQuotedPreviewAuthorDelegatedBy,
  MessageQuotedPreviewAuthorName,
  MessageQuotedPreviewChannel,
  MessageQuotedPreviewContent,
  MessageQuotedPreviewHeader,
  MessageQuotedPreviewText,
  MessageQuotedPreviewTimestamp,
} from "./message-quoted-preview";

// On a phone, the quoted message's author line keeps "(sent by …)" whole:
// the author's name may truncate, and the place and time move to a second
// line instead of covering or cutting the label. Measured in a real browser.

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(414, 896);
});

// A 390px phone: the message column is what is left of the screen after the
// list's padding, the avatar column and the gap (16 + 35 + 12 + 16 + 8).
const PHONE_COLUMN = 390 - 87;

function Quote({ author }: { author: string }) {
  return (
    <ThemeProvider>
      <div style={{ width: PHONE_COLUMN }}>
        <MessageQuotedPreview>
          <MessageQuotedPreviewHeader data-testid="header">
            <MessageQuotedPreviewAuthor>
              <Avatar size="xs" type="human">
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <MessageQuotedPreviewAuthorName data-testid="name">
                {author}
              </MessageQuotedPreviewAuthorName>
              <MessageQuotedPreviewAuthorDelegatedBy data-testid="label">
                (sent by Friday Release Coordinator)
              </MessageQuotedPreviewAuthorDelegatedBy>
            </MessageQuotedPreviewAuthor>
            <MessageQuotedPreviewChannel data-testid="channel">
              #launch-week
            </MessageQuotedPreviewChannel>
            <MessageQuotedPreviewTimestamp data-testid="time">
              Today · 10:42
            </MessageQuotedPreviewTimestamp>
          </MessageQuotedPreviewHeader>
          <MessageQuotedPreviewContent>
            <MessageQuotedPreviewText>
              The launch checklist is ready for review.
            </MessageQuotedPreviewText>
          </MessageQuotedPreviewContent>
        </MessageQuotedPreview>
      </div>
    </ThemeProvider>
  );
}

function overlaps(a: DOMRect, b: DOMRect) {
  return (
    a.left < b.right - 0.5 &&
    b.left < a.right - 0.5 &&
    a.top < b.bottom - 0.5 &&
    b.top < a.bottom - 0.5
  );
}

for (const [title, author] of [
  ["a short author", "Alice"],
  ["a long author", "Alexandra Konstantinopoulou"],
] as const) {
  it(`at phone width "(sent by …)" stays whole with ${title}`, async () => {
    const { page } = await import("vite-plus/test/browser/context");
    await page.viewport(390, 844);
    render(<Quote author={author} />);
    const header = screen.getByTestId("header").getBoundingClientRect();
    const label = screen.getByTestId("label");
    const labelRect = label.getBoundingClientRect();

    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
    expect(labelRect.right).toBeLessThanOrEqual(header.right + 0.5);
    // One line: the label never wraps.
    expect(labelRect.height).toBeLessThan(24);
    // Nothing is drawn over it, and the place and time stay on the screen.
    for (const id of ["name", "channel", "time"]) {
      const rect = screen.getByTestId(id).getBoundingClientRect();
      expect(overlaps(rect, labelRect), id).toBe(false);
      expect(rect.right, id).toBeLessThanOrEqual(header.right + 0.5);
    }
    // The name keeps some of itself: it starts after the avatar, before the label.
    const name = screen.getByTestId("name").getBoundingClientRect();
    expect(name.width).toBeGreaterThan(20);
  });
}
