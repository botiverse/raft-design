import { spawn } from "node:child_process";
import { normalizeVerifyScreenshotArgs } from "./screenshot-verify-runner.mjs";
import { screenshotPages } from "./screenshot-artifacts.mjs";
import { screenshotCliHasHelpFlag } from "./screenshot-cli-args.mjs";
import { buildVerifyScreenshotsHelp } from "./screenshot-help.mjs";

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
    console.log(buildVerifyScreenshotsHelp(screenshotPages));
    return;
  }

  const verifyArgs = normalizeVerifyScreenshotArgs(rawArgs);
  const screenshotsExitCode = await run(pnpmCommand, ["run", "screenshots:isolated", "--", ...verifyArgs]);
  if (screenshotsExitCode !== 0) {
    process.exitCode = screenshotsExitCode;
    return;
  }

  const checkExitCode = await run(process.execPath, ["scripts/check-screenshot-output.mjs", ...verifyArgs]);
  process.exitCode = checkExitCode;
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
