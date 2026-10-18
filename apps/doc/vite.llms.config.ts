import { fileURLToPath, URL } from "node:url";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Config for the agent-surfaces pass (`scripts/build-llms.mjs`). It loads the
// content modules (src/lib/content) in plain Node, so it carries the aliases
// from `vite.config.ts` but none of the Cloudflare / Start / RSC plugins, which
// only make sense for the site.
const ui = (p: string) => fileURLToPath(new URL(`../../packages/ui/src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^raft-ui$/, replacement: ui("index.ts") },
      { find: /^raft-ui\/cn$/, replacement: ui("lib/cn.ts") },
      { find: /^raft-ui\/wip$/, replacement: ui("wip.ts") },
      { find: /^raft-ui\/fonts\.css$/, replacement: ui("fonts.css") },
      { find: /^raft-ui\/styles\.css$/, replacement: ui("styles.css") },
    ],
  },
  ssr: { noExternal: ["foxact", "torph"] },
});
