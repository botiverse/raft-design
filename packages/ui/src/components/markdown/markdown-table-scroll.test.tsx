/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { MarkdownCell, MarkdownTable, MarkdownTableRow, MarkdownTableScroll } from "./index";

afterEach(cleanup);

test("a wide table scrolls sideways in a horizontal ScrollArea that keeps its own slot and frame", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <MarkdownTableScroll className="extra" ref={ref}>
      <MarkdownTable>
        <tbody>
          <MarkdownTableRow>
            <MarkdownCell>Cell</MarkdownCell>
          </MarkdownTableRow>
        </tbody>
      </MarkdownTable>
    </MarkdownTableScroll>,
  );
  const scroll = container.querySelector<HTMLElement>('[data-slot="markdown-table-scroll"]')!;
  expect(ref.current).toBe(scroll);
  expect(scroll.classList).toContain("r-scroll-area");
  expect(scroll.classList).toContain("r-scroll-area--horizontal-orientation");
  expect(scroll.classList).toContain("r-scroll-area--hover-trigger");
  expect(scroll.classList).toContain("rounded-container");
  expect(scroll.classList).toContain("extra");
  // The ScrollArea scrolls it now, not a utility of its own.
  expect(scroll.classList).not.toContain("overflow-x-auto");
  // Only the horizontal axis can hold back a scroll, so the page still scrolls down past the table.
  expect(scroll.className).not.toMatch(/overscroll-y/);
  // Sticky gutters: their layer is the scroller's first child, the table the scroller's own child after it.
  expect(scroll.classList).toContain("r-scroll-area--sticky-gutters");
  expect(scroll.querySelector(":scope > .r-scroll-area__gutters + table")).not.toBeNull();
});
