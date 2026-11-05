/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { useCommentMarginFits } from "./use-comment-margin-fits";

afterEach(cleanup);

function Probe() {
  const fits = useCommentMarginFits(document.body);
  return <p data-testid="fits">{String(fits)}</p>;
}

// jsdom has neither matchMedia nor ResizeObserver: the hook answers false instead of throwing.
test("no matchMedia or ResizeObserver: the margin doesn't fit, nothing throws", () => {
  expect(typeof window.matchMedia).toBe("undefined");
  expect(typeof globalThis.ResizeObserver).toBe("undefined");
  render(<Probe />);
  expect(screen.getByTestId("fits").textContent).toBe("false");
});
