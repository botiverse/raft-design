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
        from: "src/components/combobox-select/combobox-select.css",
        to: "dist/components/combobox-select",
        rename: "combobox-select.css",
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
