import path from "node:path";
import { screenshotPages } from "./screenshot-artifacts.mjs";
import { normalizeScreenshotCliArgs } from "./screenshot-cli-args.mjs";

function fail(message) {
  throw new Error(`Screenshot verification failed: ${message}`);
}

export function parseScreenshotVerifyCliArgs(argv, options) {
  const { cwd, defaultOutputDir, pages = screenshotPages } = options;
  const normalizedArgs = normalizeScreenshotCliArgs(argv);
  const pagesByState = new Map(pages.map((page) => [page.state, page]));
  let outputDir = defaultOutputDir;
  let portableManifest = false;
  const selectedStates = [];

  for (let index = 0; index < normalizedArgs.length; index += 1) {
    const argument = normalizedArgs[index];
    if (argument === "--state") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        fail("missing value for --state");
      }
      selectedStates.push(next);
      index += 1;
      continue;
    }
    if (argument === "--output-dir") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        fail("missing value for --output-dir");
      }
      outputDir = path.resolve(cwd, next);
      index += 1;
      continue;
    }
    if (argument === "--generated-at") {
      const next = normalizedArgs[index + 1];
      if (!next) {
        fail("missing value for --generated-at");
      }
      index += 1;
      continue;
    }
    if (argument === "--portable-manifest") {
      portableManifest = true;
      continue;
    }
    if (argument.startsWith("--")) {
      fail(`unknown argument ${argument}`);
    }
    if (outputDir !== defaultOutputDir) {
      fail(`unexpected extra argument ${argument}`);
    }
    outputDir = path.resolve(cwd, argument);
  }

  const resolvedStates = [...new Set(selectedStates.length > 0 ? selectedStates : pages.map((page) => page.state))];
  const selectedPages = resolvedStates.map((state) => {
    const page = pagesByState.get(state);
    if (!page) {
      fail(`unknown screenshot state: ${state}. Expected one of ${pages.map((entry) => entry.state).join(", ")}`);
    }
    return page;
  });

  return { outputDir, portableManifest, selectedPages };
}

export function verifyScreenshotArtifacts(manifest, indexHtml, options = {}) {
  const { pages = screenshotPages, portableManifest = false } = options;

  if (!manifest || typeof manifest !== "object") {
    fail("manifest.json is not an object");
  }
  if (!Array.isArray(manifest.screenshots)) {
    fail("manifest.json is missing screenshots array");
  }
  if (portableManifest && "outputDir" in manifest) {
    fail("portable manifest should not include outputDir");
  }
  if (manifest.screenshots.length !== pages.length) {
    fail(`expected ${pages.length} screenshots, got ${manifest.screenshots.length}`);
  }

  const pagesByState = new Map(pages.map((page) => [page.state, page]));
  const fileNames = new Set();
  const states = new Set();

  for (const entry of manifest.screenshots) {
    if (!entry || typeof entry !== "object") {
      fail("manifest contains a non-object screenshot entry");
    }
    if (
      typeof entry.state !== "string" ||
      typeof entry.title !== "string" ||
      typeof entry.fileName !== "string" ||
      typeof entry.relativePath !== "string"
    ) {
      fail("manifest screenshot entry is missing string metadata");
    }

    const expectedPage = pagesByState.get(entry.state);
    if (!expectedPage) {
      fail(`manifest contains unexpected screenshot state ${entry.state}`);
    }
    if (states.has(entry.state)) {
      fail(`manifest contains duplicate screenshot state ${entry.state}`);
    }
    states.add(entry.state);
    if (entry.title !== expectedPage.marker) {
      fail(`manifest title mismatch for ${entry.state}`);
    }
    if (fileNames.has(entry.fileName)) {
      fail(`manifest contains duplicate file name ${entry.fileName}`);
    }
    fileNames.add(entry.fileName);
    if (portableManifest && "absolutePath" in entry) {
      fail(`portable manifest entry should not include absolutePath for ${entry.fileName}`);
    }
    if (!indexHtml.includes(`./${encodeURIComponent(entry.fileName)}`)) {
      fail(`index.html does not reference ${entry.fileName}`);
    }
  }

  return {
    screenshots: manifest.screenshots.length,
    fileNames: [...fileNames],
  };
}
