import { globSync, readFileSync } from "node:fs";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { configDefaults, defineConfig } from "vite-plus";
import type { BrowserProvider, BrowserProviderOption } from "vite-plus/test/node";

const browserTests = "src/**/*.browser.test.{ts,tsx}";

// A browser test file that emulates touch (CDP `setTouchEmulationEnabled`)
// runs in a browser of its own. Playwright gives headless Chromium its mouse
// through launch flags; once a page has had touch emulation on and off again,
// it reports `hover: none` and no pointer instead, for every file it runs
// after that, so the hover and mouse tests of a later file failed
// (activity, then list-cell.content: 0 of 14, 2026-11-05). Only a new page
// starts from the launch flags again, and Vitest opens one per instance, not
// per file. So each such file, found by that call, is an instance of its own
// that runs after the others, one at a time (its own `sequence.groupOrder`):
// no file order can matter.
const touchTests = globSync(browserTests, { cwd: import.meta.dirname })
  .filter((file) =>
    readFileSync(join(import.meta.dirname, file), "utf8").includes("setTouchEmulationEnabled"),
  )
  .sort();

// The provider all touch instances share: an instance's Chromium is launched
// when its file runs, not prewarmed with the rest, and closed when the next
// touch file starts, so a run holds two Chromiums at most, not one per file
// (31 went past a 3 GiB job). In watch mode a file can run again, so each
// keeps its browser.
const touchBrowser = ((): BrowserProviderOption => {
  const { prewarm: _prewarm, ...base } = playwright();
  let current: BrowserProvider | undefined;
  return {
    ...base,
    providerFactory(project) {
      const provider = base.providerFactory(project);
      const openPage = provider.openPage.bind(provider);
      provider.openPage = async (...args) => {
        if (current !== provider) {
          if (!project.vitest.config.watch) await current?.close();
          current = provider;
        }
        return openPage(...args);
      };
      return provider;
    },
  };
})();

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    // The tests read ricons from source, as tsconfig.json's `paths` does, so
    // they need no build of packages/icons first. The package itself imports
    // "@botiverse/ricons" (a dependency, so `pack` leaves it external).
    alias: [
      {
        find: /^@botiverse\/ricons$/,
        replacement: join(import.meta.dirname, "../icons/src/index.ts"),
      },
    ],
  },
  test: {
    browser: {
      provider: playwright(),
      // A browser run takes only the browser tests. The rest are Node and
      // jsdom tests (node:fs reads, @vitest-environment jsdom) that CI runs;
      // in Chromium a node:fs import never resolves and the run hangs, so
      // running a whole component folder by hand stalled (2026-10-23).
      instances: [
        {
          browser: "chromium",
          include: [browserTests],
          exclude: [...configDefaults.exclude, ...touchTests],
        },
        ...touchTests.map((file, index) => ({
          browser: "chromium" as const,
          name: `chromium touch ${index + 1}`,
          include: [file],
          provider: touchBrowser,
          sequence: { groupOrder: index + 1 },
        })),
      ],
    },
  },
  pack: {
    // Without tsconfig.json's `paths` to ricons' source (tsconfig.build.json).
    tsconfig: "tsconfig.build.json",
    // Emit one ESM module per source module (mirrors src/) instead of one
    // ~620 KB index.mjs, so consumers' bundlers can drop unused components.
    // Paired with "sideEffects" in package.json.
    unbundle: true,
    plugins: [
      {
        // dist/index.mjs and dist/wip.mjs are the drag Escape guard plus
        // `export * from "./<entry>-exports.mjs"`, as in src/: the bundler
        // flattens the re-export into one import per component, and an entry
        // in "sideEffects" keeps every import it has, so a consumer's bundler
        // put each component the app used on any lazy page in the chunk that
        // loads raft-ui first (src/index-exports.ts).
        name: "raft-ui:entries-reexport-barrel",
        generateBundle(_options: unknown, bundle: Record<string, { type: string; code?: string }>) {
          for (const entry of ["index", "wip"]) {
            const chunk = bundle[`${entry}.mjs`];
            if (chunk?.type !== "chunk" || !bundle[`${entry}-exports.mjs`]) continue;
            chunk.code = `import "./lib/drag-escape.mjs";\nexport * from "./${entry}-exports.mjs";\n`;
          }
        },
      },
      {
        // Component CSS ships through styles.css (copied below), never through
        // the JS, so drop the relative `import "./x.css"` lines a component
        // keeps for dev and tests; a bare package CSS import is left alone. Without this, unbundle emits a CSS chunk per
        // component and renames its JS (timeline.mjs -> timeline2.mjs).
        name: "raft-ui:drop-component-css",
        resolveId(source: string) {
          if (/^\.\.?\//.test(source) && source.endsWith(".css"))
            return { id: source, external: true, moduleSideEffects: false };
        },
      },
    ],
    deps: {
      // tsdown <0.23 compatibility: resolve external dependency subpaths.
      // Remove to preserve subpath imports as written (the new default).
      // https://tsdown.dev/options/dependencies#deps-resolvedepsubpath
      resolveDepSubpath: true,
    },
    entry: {
      index: "src/index.ts",
      // The entries' names, apart from the entries (which add the drag Escape
      // guard): own modules, so dist/index.mjs stays the guard plus
      // `export * from "./index-exports.mjs"` (src/index-exports.ts says why).
      "index-exports": "src/index-exports.ts",
      cn: "src/lib/cn.ts",
      wip: "src/wip.ts",
      "wip-exports": "src/wip-exports.ts",
      lint: "src/lint/index.ts",
    },
    copy: [
      {
        from: "src/components/steps/ottie-assets/*.webp",
        to: "dist/components/steps/ottie-assets",
      },
      { from: "src/foundation.css", to: "dist", rename: "foundation.css" },
      { from: "src/tokens.json", to: "dist", rename: "tokens.json" },
      { from: "src/themes.css", to: "dist", rename: "themes.css" },
      { from: "src/styles.css", to: "dist", rename: "styles.css" },
      { from: "src/fonts.css", to: "dist", rename: "fonts.css" },
      // Oxlint's `extends` takes a file path, so the recommended config ships as JSON.
      { from: "src/lint/recommended.json", to: "dist/lint", rename: "recommended.json" },
      {
        from: "src/components/timeline/timeline.css",
        to: "dist/components/timeline",
        rename: "timeline.css",
      },
      {
        from: "src/components/steps/steps.css",
        to: "dist/components/steps",
        rename: "steps.css",
      },
      {
        from: "src/components/steps/otter-indicator.css",
        to: "dist/components/steps",
        rename: "otter-indicator.css",
      },
      {
        from: "src/components/combobox-select/combobox-select.css",
        to: "dist/components/combobox-select",
        rename: "combobox-select.css",
      },
      {
        from: "src/components/virtual-list/styles/virtual-list.css",
        to: "dist/components/virtual-list/styles",
        rename: "virtual-list.css",
      },
      {
        from: "src/components/scroll-area/scroll-area.css",
        to: "dist/components/scroll-area",
        rename: "scroll-area.css",
      },
    ],
    dts: {
      generator: "tsgo",
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
