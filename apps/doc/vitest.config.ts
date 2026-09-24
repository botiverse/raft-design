import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    alias: [
      {
        find: "raft-ui/wip",
        replacement: new URL("../../packages/ui/src/wip.ts", import.meta.url).pathname,
      },
      {
        find: "raft-ui",
        replacement: new URL("../../packages/ui/src/index.ts", import.meta.url).pathname,
      },
    ],
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    passWithNoTests: true,
  },
});
