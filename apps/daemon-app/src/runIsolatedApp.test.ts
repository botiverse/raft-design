import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runnerPath = path.join(appRoot, "scripts", "run-isolated-app.mjs");
const RUNNER_TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${RUNNER_TIMEOUT_MS}ms.`));
    }, RUNNER_TIMEOUT_MS);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
}

function waitForText(stream: NodeJS.ReadableStream, pattern: string): Promise<string> {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const onData = (chunk: string | Buffer) => {
      buffer += chunk.toString();
      if (buffer.includes(pattern)) {
        cleanup();
        resolve(buffer);
      }
    };

    const onEnd = () => {
      cleanup();
      reject(new Error(`Stream ended before pattern ${pattern} appeared. Output: ${buffer}`));
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      stream.off("data", onData);
      stream.off("end", onEnd);
      stream.off("error", onError);
    };

    stream.on("data", onData);
    stream.once("end", onEnd);
    stream.once("error", onError);
  });
}

function extractUserDataDir(output: string): string {
  const match = output.match(/ISOLATED_USER_DATA_DIR=(.+)/);
  assert.ok(match, `Expected isolated runner output to include the temp userData path. Output: ${output}`);
  return match[1].trim();
}

function waitForExit(child: ReturnType<typeof spawn>): Promise<{ code: number | null; signal: NodeJS.Signals | null }> {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve({ code, signal });
    });
  });
}

async function assertPathMissing(targetPath: string) {
  await assert.rejects(access(targetPath));
}

test("isolated launch runner removes its temp userData directory after a successful run", async () => {
  const child = spawn(process.execPath, [runnerPath, "fixture-isolated-exit"], {
    cwd: appRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  const [stdout, exit] = await Promise.all([
    withTimeout(waitForText(child.stdout, "ISOLATED_USER_DATA_DIR="), "isolated exit fixture output"),
    withTimeout(waitForExit(child), "isolated exit fixture exit"),
  ]);

  assert.equal(exit.code, 0);
  assert.equal(exit.signal, null);

  const userDataDir = extractUserDataDir(stdout);
  assert.equal(path.basename(userDataDir).startsWith("daemon-app-fixture-isolated-exit-"), true);
  await assertPathMissing(userDataDir);
});

test("isolated launch runner removes its temp userData directory after a forwarded SIGINT", {
  skip: process.platform === "win32",
}, async () => {
  const child = spawn(process.execPath, [runnerPath, "fixture-isolated-wait"], {
    cwd: appRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  const stdout = await withTimeout(waitForText(child.stdout, "ISOLATED_READY"), "isolated wait fixture readiness");
  const userDataDir = extractUserDataDir(stdout);

  child.kill("SIGINT");
  const exit = await withTimeout(waitForExit(child), "isolated wait fixture exit");

  assert.equal(exit.code, 130);
  assert.equal(exit.signal, null);
  await assertPathMissing(userDataDir);
});
