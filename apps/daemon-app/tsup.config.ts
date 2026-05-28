import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      main: "src/main.ts",
    },
    format: ["esm"],
    target: "node20",
    platform: "node",
    outDir: "dist",
    external: ["electron"],
    clean: true,
  },
  {
    entry: {
      preload: "src/preload.ts",
    },
    format: ["cjs"],
    target: "node20",
    platform: "node",
    outDir: "dist",
    external: ["electron"],
    clean: false,
    outExtension() {
      return {
        js: ".cjs",
      };
    },
  },
]);
