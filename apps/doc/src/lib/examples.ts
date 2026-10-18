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

/** `grouped-generic` → `GroupedGeneric`. */
function pascal(name: string) {
  return name.replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());
}

/**
 * The component an example renders. By the modules' convention `*Content` is
 * the real usage and `*Composition` is a display shell around it (for an
 * overlay, the root and a portal kept inside the canvas), so the page renders
 * the shell and shows the file's source with the shell stripped. A file that
 * exports several is named after the one it is about.
 */
export async function loadExample(key: string): Promise<ComponentType | null> {
  const load = moduleByKey.get(key);
  if (!load) return null;
  const exports = await load();
  // Function components, and memo() / forwardRef() objects.
  const components = Object.entries(exports).filter(
    ([name, value]) =>
      /^[A-Z]/.test(name) &&
      (typeof value === "function" ||
        (typeof value === "object" && value !== null && "$$typeof" in value)),
  );
  const file = pascal(key.split("/").at(-1)!);
  const picked =
    components.find(([name]) => name.endsWith(`${file}Composition`)) ??
    components.find(([name]) => name.endsWith(`${file}Content`)) ??
    components.find(([name]) => name.endsWith(file)) ??
    components.find(([name]) => name.endsWith("Composition")) ??
    components.find(([name]) => name.endsWith("Content")) ??
    components[0];
  return (picked?.[1] as ComponentType | undefined) ?? null;
}

/** The example's source as a reader should copy it: display-shell blocks removed. */
export async function loadExampleSource(key: string): Promise<string | null> {
  const load = sourceByKey.get(key);
  if (!load) return null;
  return stripSourceCodeBlocks(await load()).trim();
}

/** Every composition an `example` block can name. */
export const EXAMPLE_KEYS: readonly string[] = [...moduleByKey.keys()].sort();
