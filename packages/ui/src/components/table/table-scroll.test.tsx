/**
 * @vitest-environment jsdom
 */
import { createRef } from "react";
import type { ReactElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";

import { MarkdownTableScroll } from "../markdown/index";
import { markdown } from "../markdown/markdown.recipe";
import { ScrollArea } from "../scroll-area/scroll-area";
import { Table, TableBody, TableCell, TableRow, TableScroll } from "./index";

afterEach(cleanup);

/** The rendered HTML, without the `useId` each area names its scroll timelines with. */
function htmlOf(element: ReactElement) {
  const { container, unmount } = render(element);
  const html = container.innerHTML.replaceAll(/_r_\w+_/g, "_r_");
  unmount();
  return html;
}

const rows = (
  <TableBody>
    <TableRow>
      <TableCell>Cell</TableCell>
    </TableRow>
  </TableBody>
);

test("TableScroll is a horizontal ScrollArea with its own slot, and the table is its own child", () => {
  const { container } = render(
    <TableScroll>
      <Table>{rows}</Table>
    </TableScroll>,
  );
  const scroll = container.querySelector<HTMLElement>('[data-slot="table-scroll"]')!;
  expect(scroll.tagName).toBe("DIV");
  expect(scroll.classList).toContain("r-scroll-area");
  expect(scroll.classList).toContain("r-scroll-area--horizontal-orientation");
  expect(scroll.classList).toContain("r-scroll-area--sticky-gutters");
  // It adds no class to ScrollArea's own: the frame, if any, is the caller's.
  expect([...scroll.classList].filter((name) => !name.startsWith("r-scroll-area"))).toEqual([]);
  // Only the horizontal axis can hold back a scroll, so the page still scrolls down past the table.
  expect(scroll.className).not.toMatch(/overscroll-y/);
  // Sticky gutters: the gutters layer first, then the table itself, with no wrapper between.
  expect(
    scroll.querySelector(':scope > .r-scroll-area__gutters + table[data-slot="table"]'),
  ).not.toBeNull();
});

test("a plain <table> is kept as it is", () => {
  const { container } = render(
    <TableScroll>
      <table className="mine">
        <tbody>
          <tr>
            <td>Cell</td>
          </tr>
        </tbody>
      </table>
    </TableScroll>,
  );
  const table = container.querySelector('[data-slot="table-scroll"] > table')!;
  expect(table.outerHTML).toBe('<table class="mine"><tbody><tr><td>Cell</td></tr></tbody></table>');
});

test("ScrollArea's props, the native props and the ref reach the element that scrolls", () => {
  const ref = createRef<HTMLDivElement>();
  const onScroll = vi.fn();
  const { container } = render(
    <TableScroll
      aria-label="Runs by month"
      className="rounded-container border"
      id="runs"
      onScroll={onScroll}
      ref={ref}
      role="region"
      size="small"
      tabIndex={-1}
      trigger="none"
    >
      <Table>{rows}</Table>
    </TableScroll>,
  );
  const scroll = container.querySelector<HTMLElement>('[data-slot="table-scroll"]')!;
  expect(ref.current).toBe(scroll);
  expect(scroll.id).toBe("runs");
  expect(scroll.getAttribute("role")).toBe("region");
  expect(scroll.getAttribute("aria-label")).toBe("Runs by month");
  expect(scroll.tabIndex).toBe(-1);
  expect(scroll.classList).toContain("rounded-container");
  expect(scroll.classList).toContain("r-scroll-area--small");
  expect(scroll.classList).toContain("r-scroll-area--none-trigger");
  scroll.dispatchEvent(new Event("scroll"));
  expect(onScroll).toHaveBeenCalledTimes(1);
});

test("it scrolls sideways whatever is passed: there is no `orientation` to set", () => {
  const { container } = render(
    // @ts-expect-error `orientation` is not one of TableScroll's props.
    <TableScroll orientation="vertical">
      <Table>{rows}</Table>
    </TableScroll>,
  );
  const scroll = container.querySelector<HTMLElement>('[data-slot="table-scroll"]')!;
  expect(scroll.classList).toContain("r-scroll-area--horizontal-orientation");
});

test("TableScroll renders what a horizontal ScrollArea with its slot renders", () => {
  expect(
    htmlOf(
      <TableScroll className="extra" overscroll="contain">
        <Table>{rows}</Table>
      </TableScroll>,
    ),
  ).toBe(
    htmlOf(
      <ScrollArea
        data-slot="table-scroll"
        className="extra"
        overscroll="contain"
        orientation="horizontal"
      >
        <Table>{rows}</Table>
      </ScrollArea>,
    ),
  );
});

// MarkdownTableScroll is TableScroll under Markdown's slot name and in Markdown's frame. Its DOM
// and classes are what it rendered as a ScrollArea of its own, before TableScroll existed.
test("MarkdownTableScroll, now a TableScroll, renders what it did as a ScrollArea of its own", () => {
  const { tableScroll } = markdown();
  for (const props of [{}, { className: "extra", id: "x", tabIndex: -1 }] as const) {
    expect(
      htmlOf(
        <MarkdownTableScroll {...props}>
          <table />
        </MarkdownTableScroll>,
      ),
    ).toBe(
      htmlOf(
        <ScrollArea
          data-slot="markdown-table-scroll"
          {...props}
          className={tableScroll({ className: "className" in props ? props.className : undefined })}
          orientation="horizontal"
        >
          <table />
        </ScrollArea>,
      ),
    );
  }
});
