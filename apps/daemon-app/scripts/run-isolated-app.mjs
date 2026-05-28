import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const [scriptName, ...scriptArgs] = process.argv.slice(2);
const handledSignals = ["SIGINT", "SIGTERM"];
const signalExitCodes = {
  SIGINT: 130,
  SIGTERM: 143,
};

if (!scriptName) {
  console.error("Usage: node scripts/run-isolated-app.mjs <pnpm-script> [-- <args...>]");
  process.exit(1);
}

const normalizedScriptArgs = scriptArgs[0] === "--" ? scriptArgs.slice(1) : scriptArgs;

function getSignalExitCode(signal) {
  return signalExitCodes[signal] ?? 1;
}

function sendSignalToChild(child, signal) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, signal);
      return;
    }
    child.kill(signal);
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ESRCH") {
      throw error;
    }
  }
}

function installSignalHandlers(child, onForwardedSignal) {
  let forwardedSignals = 0;
  const listeners = handledSignals.map((signal) => {
    const handler = () => {
      onForwardedSignal(signal);
      sendSignalToChild(child, forwardedSignals === 0 ? signal : "SIGKILL");
      forwardedSignals += 1;
    };
    process.on(signal, handler);
    return [signal, handler];
  });

  return () => {
    for (const [signal, handler] of listeners) {
      process.off(signal, handler);
    }
  };
}

function runIsolatedScript(userDataDir) {
  return new Promise((resolve, reject) => {
    let forwardedSignal = null;
    const child = spawn(
      pnpmCommand,
      ["run", scriptName, ...(normalizedScriptArgs.length > 0 ? ["--", ...normalizedScriptArgs] : [])],
      {
        cwd: process.cwd(),
        stdio: "inherit",
        detached: process.platform !== "win32",
        env: {
          ...process.env,
          DAEMON_APP_USER_DATA_DIR: userDataDir,
        },
      },
    );
    const cleanupSignalHandlers = installSignalHandlers(child, (signal) => {
      forwardedSignal ??= signal;
    });

    child.once("error", (error) => {
      cleanupSignalHandlers();
      reject(error);
    });
    child.once("exit", (code, signal) => {
      cleanupSignalHandlers();
      if (forwardedSignal) {
        resolve(getSignalExitCode(forwardedSignal));
        return;
      }
      if (signal) {
        reject(new Error(`Isolated ${scriptName} terminated by signal ${signal}.`));
        return;
      }
      resolve(code ?? 1);
    });
  });
}

async function main() {
  const userDataDir = await mkdtemp(path.join(os.tmpdir(), `daemon-app-${scriptName}-`));
  try {
    process.exitCode = await runIsolatedScript(userDataDir);
  } finally {
    await rm(userDataDir, { recursive: true, force: true });
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
