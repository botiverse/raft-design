import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import tailwindcss from "@tailwindcss/vite";

const baseUiUseRefWithInitPath = fileURLToPath(
  import.meta.resolve("@base-ui/utils/useRefWithInit"),
);
const raftUiIndexPath = fileURLToPath(new URL("../../packages/ui/src/index.ts", import.meta.url));
const raftUiCnPath = fileURLToPath(new URL("../../packages/ui/src/lib/cn.ts", import.meta.url));
const raftUiWipPath = fileURLToPath(new URL("../../packages/ui/src/wip.ts", import.meta.url));
const raftUiStylesPath = fileURLToPath(
  new URL("../../packages/ui/src/styles.css", import.meta.url),
);

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^raft-ui$/, replacement: raftUiIndexPath },
      { find: /^raft-ui\/cn$/, replacement: raftUiCnPath },
      { find: /^raft-ui\/wip$/, replacement: raftUiWipPath },
      { find: /^raft-ui\/styles\.css$/, replacement: raftUiStylesPath },
      { find: "@base-ui/utils/useRefWithInit", replacement: baseUiUseRefWithInitPath },
    ],
  },
  ssr: {
    noExternal: ["foxact", "torph"],
  },
  optimizeDeps: {
    include: ["foxact/use-clipboard", "torph/react"],
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr", childEnvironments: ["rsc"] } }),
    tailwindcss(),
    tanstackStart({
      router: {
        // Colocated helper files (fixtures/snippets/comparison) are not routes.
        routeFileIgnorePattern: "(fixtures|snippets|comparison)",
      },
      rsc: {
        enabled: true,
      },
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
    }),
    rsc(),
    viteReact(),
  ],
});

export default config;
