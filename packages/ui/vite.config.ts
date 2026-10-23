import tailwindcss from "@tailwindcss/vite";
import { playwright } from "vite-plus/test/browser-playwright";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [tailwindcss()],
  test: {
    browser: {
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
  pack: {
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
        from: "src/components/float-button/float-button.css",
        to: "dist/components/float-button",
        rename: "float-button.css",
      },
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
