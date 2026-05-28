import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { screenshotPages } from "./screenshot-artifacts.mjs";
import { screenshotCliHasHelpFlag } from "./screenshot-cli-args.mjs";
import { buildCheckScreenshotOutputHelp } from "./screenshot-help.mjs";
import { parseScreenshotVerifyCliArgs, verifyScreenshotArtifacts } from "./screenshot-verify.mjs";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
const packageRoot = path.resolve(scriptDir, "..");
const defaultOutputDir = path.join(packageRoot, "artifacts", "screenshots");
const rawArgs = process.argv.slice(2);

async function assertExists(targetPath, label) {
  try {
    await access(targetPath);
  } catch {
    throw new Error(`Screenshot verification failed: ${label} is missing at ${targetPath}`);
  }
}

async function main() {
  if (screenshotCliHasHelpFlag(rawArgs)) {
    console.log(buildCheckScreenshotOutputHelp(screenshotPages));
    return;
  }

  const { outputDir, portableManifest, selectedPages } = parseScreenshotVerifyCliArgs(rawArgs, {
    cwd: process.cwd(),
    defaultOutputDir,
    pages: screenshotPages,
  });
  const manifestPath = path.join(outputDir, "manifest.json");
  const indexPath = path.join(outputDir, "index.html");

  await assertExists(manifestPath, "manifest.json");
  await assertExists(indexPath, "index.html");

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const indexHtml = await readFile(indexPath, "utf8");
  const verification = verifyScreenshotArtifacts(manifest, indexHtml, {
    pages: selectedPages,
    portableManifest,
  });
  for (const fileName of verification.fileNames) {
    const imagePath = path.join(outputDir, fileName);
    await assertExists(imagePath, fileName);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        outputDir,
        screenshots: verification.screenshots,
        indexFile: indexPath,
        manifestFile: manifestPath,
      },
      null,
      2,
    ),
  );
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
