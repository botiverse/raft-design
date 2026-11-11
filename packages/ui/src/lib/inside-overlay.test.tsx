/**
 * @vitest-environment jsdom
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vite-plus/test";

import { Popover, PopoverContent, PopoverTrigger } from "../components/popover/popover";
import { closestOverlay, isInsideOverlay } from "./inside-overlay";

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

test("closestOverlay is the innermost overlay's container: a popover opened from another is inside both", () => {
  render(
    <>
      <p>Page text</p>
      <Popover open>
        <PopoverTrigger>Outer</PopoverTrigger>
        <PopoverContent>
          <span>In outer</span>
          <Popover open>
            <PopoverTrigger>Inner</PopoverTrigger>
            <PopoverContent>
              <span>In inner</span>
            </PopoverContent>
          </Popover>
        </PopoverContent>
      </Popover>
    </>,
  );
  const outer = closestOverlay(screen.getByText("In outer"));
  const inner = closestOverlay(screen.getByText("In inner"));
  expect(outer?.hasAttribute("data-raft-ui-overlay")).toBe(true);
  expect(inner?.hasAttribute("data-raft-ui-overlay")).toBe(true);
  expect(inner).not.toBe(outer);
  // The inner one is portaled into the outer one's container.
  expect(outer?.contains(inner ?? null)).toBe(true);
  expect(outer?.contains(screen.getByText("In outer"))).toBe(true);
  expect(inner?.contains(screen.getByText("In outer"))).toBe(false);
  // A text node counts by its parent element; the page, the trigger and null are in none.
  expect(closestOverlay(screen.getByText("In inner").firstChild)).toBe(inner);
  expect(closestOverlay(screen.getByText("Page text"))).toBeNull();
  expect(closestOverlay(screen.getByRole("button", { name: "Outer" }))).toBeNull();
  expect(closestOverlay(null)).toBeNull();
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
