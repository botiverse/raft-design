import type { ComponentType } from "react";

import { stripSourceCodeBlocks } from "#/lib/source-code.ts";

// The `example` block registry. A block names a composition by its path under
// src/modules without the extension (`button/compositions/default`), exactly
// as design/authoring/README.md defines it. Both maps are lazy, so a page only
// loads the compositions it shows.
const modules = import.meta.glob<Record<string, unknown>>("../modules/**/*.composition.tsx");
const sources = import.meta.glob<string>("../modules/**/*.composition.tsx", {
  query: "?raw",
  import: "default",
});

function keyOf(path: string) {
  return path.replace(/^\.\.\/modules\//, "").replace(/\.composition\.tsx$/, "");
}

const moduleByKey = new Map(Object.entries(modules).map(([path, load]) => [keyOf(path), load]));
const sourceByKey = new Map(Object.entries(sources).map(([path, load]) => [keyOf(path), load]));

export function hasExample(key: string) {
  return moduleByKey.has(key);
}

/**
 * The component an example renders. By the modules' convention the
 * `*Content` export is the real usage and `*Composition` is a display shell
 * around it, so the docs render the usage itself inside their own canvas.
 */
export async function loadExample(key: string): Promise<ComponentType | null> {
  const load = moduleByKey.get(key);
  if (!load) return null;
  const exports = await load();
  const functions = Object.entries(exports).filter(([, value]) => typeof value === "function");
  const picked = functions.find(([name]) => name.endsWith("Content")) ?? functions[0];
  return (picked?.[1] as ComponentType | undefined) ?? null;
}

/** The example's source as a reader should copy it: display-shell blocks removed. */
export async function loadExampleSource(key: string): Promise<string | null> {
  const load = sourceByKey.get(key);
  if (!load) return null;
  return stripSourceCodeBlocks(await load()).trim();
}
