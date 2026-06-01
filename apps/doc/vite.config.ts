import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({ prerender: { enabled: true, crawlLinks: true } }),
    nitro({
      preset: "cloudflare-module",
      compatibilityDate: "2026-05-30",
      cloudflare: { wrangler: { name: "slock-ui-docs" } },
    }),
    viteReact(),
  ],
});

export default config;
