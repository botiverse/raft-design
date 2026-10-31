import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    browser: {
      provider: playwright(),
      // A browser run takes only the browser tests. The rest are Node and
      // jsdom tests (node:fs reads, @vitest-environment jsdom) that CI runs;
      // in Chromium a node:fs import never resolves and the run hangs, so
      // running a whole component folder by hand stalled (2026-10-23).
      instances: [{ browser: "chromium", include: ["src/**/*.browser.test.{ts,tsx}"] }],
    },
  },
  pack: {
    // Emit one ESM module per source module (mirrors src/) instead of one
    // ~620 KB index.mjs, so consumers' bundlers can drop unused components.
    // Paired with "sideEffects" in package.json.
    unbundle: true,
    plugins: [
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
      cn: "src/lib/cn.ts",
      wip: "src/wip.ts",
    },
    copy: [
      { from: "src/foundation.css", to: "dist", rename: "foundation.css" },
      { from: "src/tokens.json", to: "dist", rename: "tokens.json" },
      { from: "src/themes.css", to: "dist", rename: "themes.css" },
      { from: "src/styles.css", to: "dist", rename: "styles.css" },
      { from: "src/fonts.css", to: "dist", rename: "fonts.css" },
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
