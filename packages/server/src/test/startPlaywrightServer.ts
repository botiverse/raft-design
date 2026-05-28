import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { startTestApp } from "./testAppHarness.js";
import { seedPlaywrightScenario } from "./seedPlaywrightScenario.js";

async function main() {
  const port = Number(process.env.SLOCK_TEST_SERVER_PORT || "4174");
  const statePath = process.env.SLOCK_TEST_STATE_PATH
    ? path.resolve(process.env.SLOCK_TEST_STATE_PATH)
    : path.resolve(process.cwd(), ".playwright", "state", "playwright-server.json");

  process.env.CORS_ORIGIN ||= `http://127.0.0.1:${process.env.VITE_DEV_PORT || "4173"}`;

  const testApp = await startTestApp(process.env.DATABASE_URL || "pglite://", port);
  const seedState = await seedPlaywrightScenario();

  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(
    statePath,
    JSON.stringify(
      {
        ...seedState,
        urls: {
          api: testApp.baseUrl,
          web: process.env.PLAYWRIGHT_BASE_URL || `http://127.0.0.1:${process.env.VITE_DEV_PORT || "4173"}`,
        },
      },
      null,
      2,
    ),
    "utf8",
  );

  console.log(`[playwright-server] listening on http://127.0.0.1:${port}`);
}

main().catch((err) => {
  console.error("[playwright-server] fatal:", err);
  process.exit(1);
});
