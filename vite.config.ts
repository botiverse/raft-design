import { defineConfig } from "vite-plus";

const ignorePatterns = [
  "**/routeTree.gen.ts",
  "**/dist/**",
  ".agents/**",
  ".claude/skills/**",
  ".github/skills/**",
];

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns },
  lint: {
    ignorePatterns,
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    cache: true,
  },
});
