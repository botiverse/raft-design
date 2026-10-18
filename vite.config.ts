import { configDefaults, defineConfig } from "vite-plus";

const ignorePatterns = [
  // The Raft Design System's pages, previews and reference CSS: hand-written
  // Chinese prose with wide tables and minified CSS that the formatter would
  // reflow without making them clearer.
  "design/**",
  "**/routeTree.gen.ts",
  "**/dist/**",
  ".agents/**",
  ".claude/skills/**",
  ".github/skills/**",
];

export default defineConfig({
  staged: {
    // Staged-file scope by choice: fast on every commit. Cross-file fallout is
    // still covered — the PR `check` workflow runs the full workspace check.
    // (Full-repo pre-commit was measured at ~22s per commit and rejected.)
    // Known edge: a whitespace-only staged change gets formatted away, leaving
    // nothing to commit, and lint-staged aborts with "prevented an empty git
    // commit" — that message means "the change is already clean", not a broken
    // hook.
    "*": "vp check --fix",
  },
  fmt: { ignorePatterns },
  lint: {
    ignorePatterns,
    options: { typeAware: true, typeCheck: true },
    // Oxlint's `plugins` array OVERWRITES its default plugin set, so the sets
    // we want have to be restated: typescript, unicorn, oxc (defaults) plus
    // import (off by default). Dropping a default silently disables its rules —
    // with only `["import"]`, `typescript/consistent-type-imports` stopped
    // reporting without complaining. ESLint-core rules are deliberately NOT
    // listed: they are oxlint's always-on base set (measured — `plugins: []`
    // still runs 60 rules), not a plugin this array switches.
    plugins: ["oxc", "unicorn", "typescript", "import", "react", "react-perf"],
    jsPlugins: ["eslint-plugin-better-tailwindcss"],
    settings: {
      "better-tailwindcss": {
        cwd: "./packages/ui",
        entryPoint: "./src/styles.css",
      },
    },
    rules: {
      // Type-only imports must be their own `import type { ... }` statement:
      // `consistent-type-imports` catches unmarked type-only usage,
      // `consistent-type-specifier-style` (default: prefer-top-level) moves
      // inline `{ type X }` specifiers out. Both are auto-fixable.
      "typescript/consistent-type-imports": "error",
      "import/consistent-type-specifier-style": "error",
      // False positives on Vite `?raw` imports (the plugin cannot see the
      // build-tool default export), so it stays off.
      "import/default": "off",
      // No React Compiler here, so a function / object / array created during
      // render is a new reference every time: it defeats memo() children and
      // re-runs effects that depend on it. Hoist constants out of the
      // component, or wrap with useCallback / useMemo. Native elements are
      // exempt — a new reference there costs nothing.
      "react-perf/jsx-no-new-function-as-prop": ["error", { nativeAllowList: "all" }],
      "react-perf/jsx-no-new-object-as-prop": ["error", { nativeAllowList: "all" }],
      "react-perf/jsx-no-new-array-as-prop": ["error", { nativeAllowList: "all" }],
      "react/exhaustive-deps": "error",
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
