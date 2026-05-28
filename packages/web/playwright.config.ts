import path from "node:path";
import { defineConfig } from "@playwright/test";

const webPort = Number(process.env.PLAYWRIGHT_WEB_PORT || "4173");
const apiPort = Number(process.env.PLAYWRIGHT_API_PORT || "4174");
const stateDir = path.resolve(process.cwd(), ".playwright", "state");
const seedStatePath = path.join(stateDir, "playwright-server.json");
const authStatePath = path.join(stateDir, "auth.json");

export default defineConfig({
  testDir: "./tests/e2e/tests",
  fullyParallel: false,
  // 1 retry on CI to absorb known infra flakiness (vite ws ECONNRESET noise +
  // occasional `socket hang up` from the pglite-backed test API server during
  // auth login, observed on 2/4 e2e shards in run 25755352840). Local stays at
  // 0 — flaky tests should fail loudly when developers run them. Retried tests
  // are reported separately by Playwright; we'll see flake rates over time.
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  globalSetup: "./tests/e2e/fixtures/globalSetup.ts",
  use: {
    baseURL: `http://127.0.0.1:${webPort}`,
    storageState: authStatePath,
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: "pnpm exec vite --host 127.0.0.1 --port 4173",
      url: `http://127.0.0.1:${webPort}`,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        SLOCK_SERVER_PORT: String(apiPort),
        VITE_DEV_PORT: String(webPort),
      },
    },
    {
      command: "pnpm --dir ../server exec tsx src/test/startPlaywrightServer.ts",
      url: `http://127.0.0.1:${apiPort}/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        DATABASE_URL: "pglite://",
        SLOCK_TEST_SERVER_PORT: String(apiPort),
        SLOCK_TEST_STATE_PATH: seedStatePath,
        PLAYWRIGHT_BASE_URL: `http://127.0.0.1:${webPort}`,
        VITE_DEV_PORT: String(webPort),
      },
    },
  ],
});
