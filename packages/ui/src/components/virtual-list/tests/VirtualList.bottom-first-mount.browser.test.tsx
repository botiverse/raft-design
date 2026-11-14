// A list opened at its bottom (a chat's conversation: scrollTo({ position: "bottom" }) as soon as its rows are
// there) mounts the rows near the bottom, not every row: the range first computed at the top (rows 0..) must
// not be carried into the jump. The jump is short when the list is short (under OVERSCAN_MAX + 1 viewports of
// rows), which is when keeping that range's start mounted all of them.
//
// Scene: VirtualList in a 480 x 400 frame, laid out empty (the conversation's list before its page arrives), then
// given rows of 60px (the estimate is 72px) and scrolled to the bottom in the layout effect that sees them.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vite-plus/test";

import { VirtualList } from "../index";
import type { VirtualListApi, VirtualListItemRenderProps } from "../index";

const it = test.skipIf(typeof window === "undefined");

type Row = { key: string };
const getKey = (row: Row) => row.key;
const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function OpenAtBottom({ page }: { page: Row[] }) {
  const api = useRef<VirtualListApi>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const jumped = useRef(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setRows(page));
    return () => cancelAnimationFrame(id);
  }, [page]);
  useLayoutEffect(() => {
    if (jumped.current || rows.length === 0) return;
    jumped.current = true;
    api.current?.scrollTo({ position: "bottom", behavior: "instant" });
  }, [rows]);
  return (
    <div style={{ width: 480, height: 400 }}>
      <VirtualList
        componentRef={api}
        items={rows}
        getKey={getKey}
        itemResizable
        itemEstimatedSize={72}
        itemMinSize={20}
      >
        {({ item, domRef }: VirtualListItemRenderProps<Row>) => (
          <div key={item.key} ref={domRef} data-row={item.key} style={{ height: 60 }}>
            {item.key}
          </div>
        )}
      </VirtualList>
    </div>
  );
}

const mountedRows = () => document.querySelectorAll("[data-row]").length;

afterEach(() => cleanup());

describe("VirtualList opened at its bottom", () => {
  // At the 72px estimate 14 rows (1008px) are a jump of 608px to the bottom and 30 rows (2160px) one of
  // 1760px: under 2.5 viewports (1000px) and over it. Both mount the rows near the bottom only.
  for (const count of [14, 30]) {
    it(`mounts the rows near the bottom, not all ${count}`, async () => {
      const rows = Array.from({ length: count }, (_, index) => ({ key: `row-${index}` }));
      render(<OpenAtBottom page={rows} />);
      await frame();
      await frame();
      await frame();
      const mounted = mountedRows();
      expect(document.querySelector(`[data-row="row-${count - 1}"]`)).not.toBeNull();
      expect(document.querySelector('[data-row="row-0"]')).toBeNull();
      // 400px of 60px rows in view (7), and a row or two of overscan.
      expect(mounted).toBeLessThanOrEqual(10);
    });
  }
});
