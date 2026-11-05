// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vite-plus/test";
import main from "./inbox-item.parity.main.json";
import { PARITY_ROWS } from "./inbox-item.test-parity-rows";

// A row that keeps its trailing column, or has no time, renders as it did before
// InboxItemLine. inbox-item.parity.main.json is what main's components rendered
// for these rows, at the baseline named in its "generatedFrom". It was written
// with no test runner: main's packages/ui/src taken with `git archive`, bundled
// with esbuild around inbox-item.test-parity-rows.tsx, run in Node and rendered
// with the same renderToStaticMarkup. To regenerate after a row or a change to
// main, do the same at the new baseline.
//
// The new layout is keyed in CSS on InboxItemLine and on the time in the heading,
// and an element can't drop a class by what it holds, so compact parts carry
// these classes on every row. Each one's selector needs a part or attribute these
// rows never have, which the test checks too, so they are taken out before the
// comparison and nothing else is.
const NEW_LAYOUT_CLASS = /inbox-item-line|data-inbox-item-time/;

function withoutNewLayoutClasses(html: string) {
  return html.replace(/class="([^"]*)"/g, (_, classes: string) => {
    const kept = classes.split(" ").filter((name) => !NEW_LAYOUT_CLASS.test(name));
    return `class="${kept.join(" ")}"`;
  });
}

const rows = Object.entries(PARITY_ROWS);

test("the fixture has every row", () => {
  expect(Object.keys(main.rows).sort()).toEqual(rows.map(([name]) => name).sort());
});

for (const [name, row] of rows) {
  test(`${name} renders as on main, but for classes that need the new layout's parts`, () => {
    const html = renderToStaticMarkup(row);
    expect(html).not.toContain('data-slot="inbox-item-line"');
    expect(html).not.toContain("data-inbox-item-time=");
    expect(withoutNewLayoutClasses(html)).toBe(main.rows[name as keyof typeof main.rows]);
  });
}
