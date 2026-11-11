/**
 * @vitest-environment jsdom
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Popover, PopoverContent, PopoverTrigger } from "../components/popover/popover";
import { isInsideOverlay } from "./inside-overlay";

afterEach(cleanup);

test("a node in a popover's content is inside an overlay; a node of the page and null are not", () => {
  render(
    <>
      <p>Page text</p>
      <Popover open>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <button type="button">Inside</button>
        </PopoverContent>
      </Popover>
    </>,
  );
  const inside = screen.getByRole("button", { name: "Inside" });
  expect(isInsideOverlay(inside)).toBe(true);
  // A text node counts by its parent element.
  expect(isInsideOverlay(inside.firstChild)).toBe(true);

  const page = screen.getByText("Page text");
  expect(isInsideOverlay(page)).toBe(false);
  expect(isInsideOverlay(page.firstChild)).toBe(false);
  // The trigger stays in the page's tree.
  expect(isInsideOverlay(screen.getByRole("button", { name: "Open" }))).toBe(false);
  expect(isInsideOverlay(document)).toBe(false);
  expect(isInsideOverlay(null)).toBe(false);
});

const COMPONENTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../components");

function componentSources(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...componentSources(path));
    else if (entry.endsWith(".tsx") && !/\.test\.|\.stories\.|test-/.test(entry)) files.push(path);
  }
  return files;
}

test("every Base UI portal raft-ui renders is marked as an overlay", () => {
  const unmarked: string[] = [];
  let portals = 0;
  for (const path of componentSources(COMPONENTS_DIR)) {
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(/<\w+\.Portal\s[^>]*>/g)) {
      portals += 1;
      if (!match[0].includes('data-raft-ui-overlay=""')) {
        unmarked.push(`${relative(COMPONENTS_DIR, path)}: ${match[0]}`);
      }
    }
  }
  expect(portals).toBeGreaterThan(10);
  expect(unmarked).toEqual([]);
});
