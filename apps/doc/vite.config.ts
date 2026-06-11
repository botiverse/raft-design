import { fileURLToPath } from "node:url";
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

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@base-ui/utils/useRefWithInit": baseUiUseRefWithInitPath,
    },
  },
  ssr: {
    noExternal: ["nucleo-ui-fill-18", "nucleo-ui-outline-18"],
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr", childEnvironments: ["rsc"] } }),
    tailwindcss(),
    tanstackStart({
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
