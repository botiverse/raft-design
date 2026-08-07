import { configDefaults, defineConfig } from "vite-plus";

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
    jsPlugins: ["eslint-plugin-better-tailwindcss"],
    settings: {
      "better-tailwindcss": {
        cwd: "./packages/ui",
        entryPoint: "./src/styles.css",
      },
    },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": "warn",
      "better-tailwindcss/no-deprecated-classes": "warn",
      "better-tailwindcss/no-duplicate-classes": "warn",
    },
  },
  run: {
    cache: true,
  },
  test: {
    exclude: [...configDefaults.exclude, "**/.claude/worktrees/**"],
  },
});
