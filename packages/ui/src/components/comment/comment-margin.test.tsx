/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { CommentMargin, CommentMarginItem } from "./comment-margin";

afterEach(cleanup);

// jsdom has no ResizeObserver: the margin places its cards instead of throwing.
test("no ResizeObserver: the margin renders its cards at their tops, nothing throws", () => {
  expect(typeof globalThis.ResizeObserver).toBe("undefined");
  render(
    <CommentMargin>
      <CommentMarginItem top={40} data-testid="first">
        First
      </CommentMarginItem>
      <CommentMarginItem top={120} data-testid="second">
        Second
      </CommentMarginItem>
    </CommentMargin>,
  );
  expect(screen.getByTestId("first").getAttribute("data-top")).toBe("40");
  expect(screen.getByTestId("second").getAttribute("data-top")).toBe("120");
});
