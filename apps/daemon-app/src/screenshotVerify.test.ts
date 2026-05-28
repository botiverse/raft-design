import assert from "node:assert/strict";
import test from "node:test";
import {
  parseScreenshotVerifyCliArgs,
  verifyScreenshotArtifacts,
} from "../scripts/screenshot-verify.mjs";

const pages = [
  { state: "login", marker: "Slock Daemon — login" },
  { state: "dashboard", marker: "Slock Daemon — dashboard · Botiverse" },
];

test("parseScreenshotVerifyCliArgs resolves output dir, portable flag, and selected pages", () => {
  const result = parseScreenshotVerifyCliArgs(
    [
      "--",
      "--output-dir",
      "artifacts/out",
      "--generated-at",
      "2026-04-10T00:00:00.000Z",
      "--state",
      "dashboard",
      "--state",
      "dashboard",
      "--portable-manifest",
    ],
    {
      cwd: "/repo/apps/daemon-app",
      defaultOutputDir: "/repo/apps/daemon-app/artifacts/screenshots",
      pages,
    },
  );

  assert.equal(result.outputDir, "/repo/apps/daemon-app/artifacts/out");
  assert.equal(result.portableManifest, true);
  assert.deepEqual(result.selectedPages, [pages[1]]);
});

test("parseScreenshotVerifyCliArgs defaults to the full page set", () => {
  const result = parseScreenshotVerifyCliArgs([], {
    cwd: "/repo/apps/daemon-app",
    defaultOutputDir: "/repo/apps/daemon-app/artifacts/screenshots",
    pages,
  });

  assert.equal(result.outputDir, "/repo/apps/daemon-app/artifacts/screenshots");
  assert.equal(result.portableManifest, false);
  assert.deepEqual(result.selectedPages, pages);
});

test("verifyScreenshotArtifacts accepts a portable manifest with matching pages", () => {
  const result = verifyScreenshotArtifacts(
    {
      generatedAt: "2026-04-10T00:00:00.000Z",
      screenshots: [
        {
          state: "login",
          title: "Slock Daemon — login",
          fileName: "daemon-login.png",
          relativePath: "daemon-login.png",
        },
        {
          state: "dashboard",
          title: "Slock Daemon — dashboard · Botiverse",
          fileName: "daemon-dashboard.png",
          relativePath: "daemon-dashboard.png",
        },
      ],
    },
    '<a href="./daemon-login.png"></a><a href="./daemon-dashboard.png"></a>',
    { pages, portableManifest: true },
  );

  assert.deepEqual(result, {
    screenshots: 2,
    fileNames: ["daemon-login.png", "daemon-dashboard.png"],
  });
});

test("verifyScreenshotArtifacts rejects portable manifests that still include outputDir", () => {
  assert.throws(
    () =>
      verifyScreenshotArtifacts(
        {
          outputDir: "/repo/apps/daemon-app/artifacts/screenshots",
          generatedAt: "2026-04-10T00:00:00.000Z",
          screenshots: [],
        },
        "",
        { pages: [], portableManifest: true },
      ),
    /portable manifest should not include outputDir/,
  );
});

test("verifyScreenshotArtifacts rejects title drift against expected page markers", () => {
  assert.throws(
    () =>
      verifyScreenshotArtifacts(
        {
          generatedAt: "2026-04-10T00:00:00.000Z",
          screenshots: [
            {
              state: "dashboard",
              title: "Wrong title",
              fileName: "daemon-dashboard.png",
              relativePath: "daemon-dashboard.png",
            },
          ],
        },
        '<a href="./daemon-dashboard.png"></a>',
        { pages: [pages[1]] },
      ),
    /manifest title mismatch for dashboard/,
  );
});
