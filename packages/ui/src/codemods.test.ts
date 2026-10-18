import { expect, test } from "vite-plus/test";
// @ts-expect-error -- plain ESM scripts shipped in the package, without types.
import { renameDependency, renameSpecifiers } from "../codemods/package-name.mjs";
// @ts-expect-error -- plain ESM scripts shipped in the package, without types.
import { renameTokens } from "../codemods/token-names.mjs";

test("package-name rewrites JS and CSS specifiers once, and leaves bare strings alone", () => {
  const before = [
    'import { Button } from "raft-ui";',
    'import "raft-ui/styles.css";',
    'const { cn } = require("raft-ui/cn");',
    'const Lazy = import("raft-ui/wip");',
    '@import "raft-ui/fonts.css";',
    '@import url("raft-ui/styles.css");',
    '@source "../node_modules/raft-ui/dist";',
    'dedupe: ["react", "raft-ui"],',
  ].join("\n");
  const after = renameSpecifiers(before);
  expect(after).toBe(
    [
      'import { Button } from "@botiverse/raft-ui";',
      'import "@botiverse/raft-ui/styles.css";',
      'const { cn } = require("@botiverse/raft-ui/cn");',
      'const Lazy = import("@botiverse/raft-ui/wip");',
      '@import "@botiverse/raft-ui/fonts.css";',
      '@import url("@botiverse/raft-ui/styles.css");',
      '@source "../node_modules/@botiverse/raft-ui/dist";',
      'dedupe: ["react", "raft-ui"],',
    ].join("\n"),
  );
  expect(renameSpecifiers(after)).toBe(after);
});

test("package-name renames the dependency and keeps workspace ranges", () => {
  const json = {
    dependencies: { react: "^19", "raft-ui": "0.6.0" },
    devDependencies: { "raft-ui": "workspace:*" },
  };
  expect(renameDependency(json, "0.7.0")).toBe(true);
  expect(json).toEqual({
    dependencies: { react: "^19", "@botiverse/raft-ui": "0.7.0" },
    devDependencies: { "@botiverse/raft-ui": "workspace:*" },
  });
});

test("token-names renames utilities and references, not declarations or BEM modifiers", () => {
  const before = [
    '<div className="border-line-muted bg-layer-panel hover:bg-primary-soft/50 shadow-raft-float" />',
    ".r-button--primary { color: var(--accent-400); border-color: var(--line); }",
    "--line: var(--line-seam);",
  ].join("\n");
  const after = renameTokens(before);
  expect(after).toBe(
    [
      '<div className="border-line-hairline bg-layer-canvas hover:bg-brand-soft/50 shadow-float" />',
      ".r-button--primary { color: var(--attention-400); border-color: var(--line-seam); }",
      "--line: var(--line-seam);",
    ].join("\n"),
  );
  expect(renameTokens(after)).toBe(after);
});
