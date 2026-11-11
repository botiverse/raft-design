import { playwright } from "vite-plus/test/browser-playwright";
import { configDefaults, defineConfig } from "vite-plus";

const browserTests = "src/**/*.browser.test.{ts,tsx}";

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      // A browser run takes only the browser tests; the rest are jsdom tests
      // that CI runs in Node (packages/ui/vite.config.ts says why).
      instances: [
        {
          browser: "chromium",
          include: [browserTests],
          exclude: [...configDefaults.exclude],
        },
      ],
    },
  },
  pack: {
    // One ESM module per source module, as raft-ui ships, so a bundler keeps
    // only the icons an app imports. Paired with "sideEffects" (only the CSS).
    unbundle: true,
    entry: {
      index: "src/index.ts",
    },
    copy: [{ from: "src/styles.css", to: "dist", rename: "styles.css" }],
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
