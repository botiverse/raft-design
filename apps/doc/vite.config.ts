import { fileURLToPath } from "node:url";
import type { Logger } from "vite";
import { createLogger, defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";

import { cloudflare } from "@cloudflare/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import rsc from "@vitejs/plugin-rsc";
import tailwindcss from "@tailwindcss/vite";

const baseUiUseRefWithInitPath = fileURLToPath(
  import.meta.resolve("@base-ui/utils/useRefWithInit"),
);

function isNucleoMissingSourcemapWarning(message: string): boolean {
  return (
    message.startsWith("Sourcemap for ") &&
    message.includes("/node_modules/nucleo-ui-") &&
    message.includes(" points to missing source files")
  );
}

function createFilteredLogger(): Logger {
  const logger = createLogger();

  return {
    ...logger,
    warn(message, options) {
      if (isNucleoMissingSourcemapWarning(message)) {
        return;
      }

      logger.warn(message, options);
    },
    warnOnce(message, options) {
      if (isNucleoMissingSourcemapWarning(message)) {
        return;
      }

      logger.warnOnce(message, options);
    },
    get hasWarned() {
      return logger.hasWarned;
    },
    set hasWarned(value) {
      logger.hasWarned = value;
    },
  };
}

const config = defineConfig({
  customLogger: createFilteredLogger(),
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
