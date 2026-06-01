import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns: ["**/routeTree.gen.ts", "**/dist/**"] },
  lint: {
    ignorePatterns: ["**/routeTree.gen.ts", "**/dist/**"],
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
