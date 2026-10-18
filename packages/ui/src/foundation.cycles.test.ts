import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vite-plus/test";

// A custom property that reaches itself through var() is invalid at computed
// time, and so is everything that reads it. The alias blocks come last in
// foundation.css, so one cycle there silently blanks the token it shadows in
// every mode (a rename once turned `--layer-panel: var(--layer-canvas)` into
// `--layer-canvas: var(--layer-canvas)`). jsdom computes no custom properties,
// so this reads the graph straight from the source.

const sourceDirectory = dirname(fileURLToPath(import.meta.url));

function referenceGraph(css: string): Map<string, Set<string>> {
  const graph = new Map<string, Set<string>>();
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const match of source.matchAll(/(?<![\w-])--([a-z0-9-]+)\s*:([^;{}]*);/g)) {
    const refs = graph.get(match[1]) ?? new Set<string>();
    for (const ref of match[2].matchAll(/var\(\s*--([a-z0-9-]+)/g)) refs.add(ref[1]);
    graph.set(match[1], refs);
  }
  return graph;
}

function cycles(graph: Map<string, Set<string>>): string[] {
  const found: string[] = [];
  const state = new Map<string, "visiting" | "done">();
  const stack: string[] = [];
  function visit(name: string) {
    if (state.get(name) === "done") return;
    if (state.get(name) === "visiting") {
      found.push([...stack.slice(stack.indexOf(name)), name].join(" -> "));
      return;
    }
    state.set(name, "visiting");
    stack.push(name);
    for (const ref of graph.get(name) ?? []) visit(ref);
    stack.pop();
    state.set(name, "done");
  }
  for (const name of graph.keys()) visit(name);
  return found;
}

test.each(["foundation.css", "styles.css"])("no custom property in %s refers to itself", (file) => {
  const css = readFileSync(join(sourceDirectory, file), "utf8");
  expect(cycles(referenceGraph(css))).toEqual([]);
});
