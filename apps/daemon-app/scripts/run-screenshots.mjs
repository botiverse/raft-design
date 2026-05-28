import { spawn } from "node:child_process";
import { screenshotPages } from "./screenshot-artifacts.mjs";
import { screenshotCliHasHelpFlag } from "./screenshot-cli-args.mjs";
import { buildCaptureScreenshotsHelp } from "./screenshot-help.mjs";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const rawArgs = process.argv.slice(2);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      env: process.env,
    });

    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} terminated by signal ${signal}`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

async function main() {
  if (screenshotCliHasHelpFlag(rawArgs)) {
    console.log(buildCaptureScreenshotsHelp(screenshotPages));
    return;
  }

  const checkExitCode = await run(pnpmCommand, ["run", "check:electron"]);
  if (checkExitCode !== 0) {
    process.exitCode = checkExitCode;
    return;
  }

  const buildExitCode = await run(pnpmCommand, ["run", "build"]);
  if (buildExitCode !== 0) {
    process.exitCode = buildExitCode;
    return;
  }

  process.exitCode = await run(pnpmCommand, ["exec", "electron", "scripts/capture-screenshots.mjs", ...rawArgs]);
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
