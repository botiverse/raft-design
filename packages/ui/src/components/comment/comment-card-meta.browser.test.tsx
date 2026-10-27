import "./comment.test.css";
/**
 * CommentCardMeta rendered as a button (comment.md, Anatomy): clickable text,
 * so it underlines on hover and takes the focus ring from the keyboard; as
 * the plain line it is by default, it does neither. Real paint: only a
 * browser computes :hover and :focus-visible.
 *
 * Run: `pnpm exec vp test --run --browser.enabled --browser.headless src/components/comment/comment-card-meta.browser.test.tsx`
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { CommentCard, CommentCardMeta } from "./comment-card";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

function Card({ asButton }: { asButton: boolean }) {
  return (
    <ThemeProvider>
      <button type="button" data-testid="before">
        Before
      </button>
      <CommentCard className="w-[280px]">
        <CommentCardMeta
          data-testid="meta"
          render={asButton ? <button type="button" /> : undefined}
        >
          <span>On “Re-run the guard suites”</span>
        </CommentCardMeta>
      </CommentCard>
    </ThemeProvider>
  );
}

it("as a button, it underlines on hover and points", async () => {
  render(<Card asButton />);
  const { page, userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
  const meta = screen.getByTestId("meta");
  expect(meta.tagName).toBe("BUTTON");
  expect(getComputedStyle(meta).textDecorationLine).toBe("none");
  expect(getComputedStyle(meta).cursor).toBe("pointer");
  await page.getByTestId("meta").hover();
  expect(getComputedStyle(meta).textDecorationLine).toBe("underline");
});

it("as a button, it takes the focus ring from the keyboard, inside no border of its own", async () => {
  render(<Card asButton />);
  const { userEvent } = await import("vite-plus/test/browser/context");
  screen.getByTestId("before").focus();
  await userEvent.tab();
  const meta = screen.getByTestId("meta");
  expect(document.activeElement).toBe(meta);
  expect(getComputedStyle(meta).boxShadow).not.toBe("none");
  expect(getComputedStyle(meta).borderTopWidth).toBe("0px");
  expect(getComputedStyle(meta).backgroundColor).toBe("rgba(0, 0, 0, 0)");
});

it("as the plain line, hovering it changes nothing", async () => {
  render(<Card asButton={false} />);
  const { page } = await import("vite-plus/test/browser/context");
  const meta = screen.getByTestId("meta");
  expect(meta.tagName).toBe("DIV");
  await page.getByTestId("meta").hover();
  expect(getComputedStyle(meta).textDecorationLine).toBe("none");
  expect(getComputedStyle(meta).cursor).toBe("auto");
});
