import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import {
  buildScreenshotIndexHtml,
  buildScreenshotManifest,
  parseScreenshotCliArgs,
  screenshotPages,
} from "../scripts/screenshot-artifacts.mjs";

test("parseScreenshotCliArgs normalizes pnpm passthrough and deduplicates states", () => {
  const result = parseScreenshotCliArgs(
    [
      "--",
      "--state",
      "dashboard",
      "--state",
      "dashboard",
      "--output-dir",
      "artifacts/out",
      "--generated-at",
      "2026-04-10T00:00:00.000Z",
      "--portable-manifest",
    ],
    {
      cwd: "/repo/apps/daemon-app",
      defaultOutputDir: "/repo/apps/daemon-app/artifacts/screenshots",
    },
  );

  assert.equal(result.outputDir, "/repo/apps/daemon-app/artifacts/out");
  assert.equal(result.generatedAt, "2026-04-10T00:00:00.000Z");
  assert.equal(result.portableManifest, true);
  assert.equal(result.cleanOutputDir, true);
  assert.deepEqual(result.selectedPages.map((page) => page.state), ["dashboard"]);
});

test("parseScreenshotCliArgs keeps default-dir partial captures append-friendly", () => {
  const result = parseScreenshotCliArgs(["--state", "providers"], {
    cwd: "/repo/apps/daemon-app",
    defaultOutputDir: "/repo/apps/daemon-app/artifacts/screenshots",
  });

  assert.equal(result.outputDir, "/repo/apps/daemon-app/artifacts/screenshots");
  assert.equal(result.generatedAt, null);
  assert.equal(result.portableManifest, false);
  assert.equal(result.cleanOutputDir, false);
  assert.deepEqual(result.selectedPages.map((page) => page.state), ["providers"]);
});

test("parseScreenshotCliArgs expands to all pages on full runs", () => {
  const result = parseScreenshotCliArgs([], {
    cwd: "/repo/apps/daemon-app",
    defaultOutputDir: "/repo/apps/daemon-app/artifacts/screenshots",
  });

  assert.equal(result.generatedAt, null);
  assert.equal(result.portableManifest, false);
  assert.equal(result.cleanOutputDir, true);
  assert.deepEqual(
    result.selectedPages.map((page) => page.state),
    screenshotPages.map((page) => page.state),
  );
});

test("buildScreenshotManifest records generated files", () => {
  const outputDir = "/repo/apps/daemon-app/artifacts/screenshots";
  const files = [
    path.join(outputDir, "daemon-login.png"),
    path.join(outputDir, "daemon-dashboard.png"),
  ];
  const manifest = buildScreenshotManifest(
    outputDir,
    [screenshotPages[0], screenshotPages[2]],
    files,
    "2026-04-10T02:30:00.000Z",
  );

  assert.equal(manifest.generatedAt, "2026-04-10T02:30:00.000Z");
  assert.deepEqual(manifest.screenshots, [
    {
      state: "login",
      title: "Slock Daemon — login",
      fileName: "daemon-login.png",
      relativePath: "daemon-login.png",
      absolutePath: files[0],
    },
    {
      state: "dashboard",
      title: "Slock Daemon — dashboard · Botiverse",
      fileName: "daemon-dashboard.png",
      relativePath: "daemon-dashboard.png",
      absolutePath: files[1],
    },
  ]);
});

test("buildScreenshotManifest can omit absolute paths for portable output", () => {
  const outputDir = "/repo/apps/daemon-app/artifacts/screenshots";
  const manifest = buildScreenshotManifest(
    outputDir,
    [screenshotPages[1]],
    [path.join(outputDir, "daemon-setup.png")],
    "2026-04-10T02:30:00.000Z",
    { portableManifest: true },
  );

  assert.equal("outputDir" in manifest, false);
  assert.deepEqual(manifest.screenshots, [
    {
      state: "setup",
      title: "Slock Daemon — setup · Botiverse",
      fileName: "daemon-setup.png",
      relativePath: "daemon-setup.png",
    },
  ]);
});

test("buildScreenshotIndexHtml escapes visible metadata", () => {
  const html = buildScreenshotIndexHtml({
    outputDir: "/repo/apps/daemon-app/artifacts/screenshots",
    generatedAt: "2026-04-10T02:30:00.000Z",
    screenshots: [
      {
        state: "providers",
        title: `Providers & <State> "quoted"`,
        fileName: "daemon-providers.png",
        relativePath: "daemon-providers.png",
        absolutePath: "/repo/apps/daemon-app/artifacts/screenshots/daemon-providers.png",
      },
    ],
  });

  assert.match(html, /Providers &amp; &lt;State&gt; &quot;quoted&quot;/);
  assert.match(html, /href="\.\/daemon-providers\.png"/);
  assert.match(html, /Generated at <code>2026-04-10T02:30:00\.000Z<\/code>/);
});
