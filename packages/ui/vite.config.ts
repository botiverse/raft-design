import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: {
      index: "src/index.ts",
      cn: "src/lib/cn.ts",
      wip: "src/wip.ts",
    },
    copy: [
      { from: "src/styles.css", to: "dist", rename: "styles.css" },
      { from: "src/fonts.css", to: "dist", rename: "fonts.css" },
    ],
    dts: {
      tsgo: true,
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
