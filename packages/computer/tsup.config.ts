import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node20",
  platform: "node",
  splitting: false,
  clean: true,
  shims: true,
  // Inline CLI/runtime helper deps so basic surfaces keep working even
  // when the install root is moved by the upgrade swap before npm has
  // populated ambient node_modules. The daemon package stays external:
  // it ships runtime assets (chat-bridge + bundled slock CLI) that must
  // remain in a real package root, so the upgrade flow hydrates it into
  // the staged install before swap.
  noExternal: ["commander", "proper-lockfile", "undici"],
  banner: {
    js:
      "#!/usr/bin/env node\n" +
      "import { createRequire as __slockCreateRequire } from \"node:module\";\n" +
      "const require = __slockCreateRequire(import.meta.url);",
  },
});
