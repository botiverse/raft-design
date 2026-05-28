import assert from "node:assert/strict";
import type { execFileSync } from "node:child_process";
import test from "node:test";

import { readCommandVersion, resolveCommandOnPath } from "./probe.js";

const noWindowsEnvironment = () => null;

test("resolveCommandOnPath passes the runtime name directly to powershell on Windows", () => {
  let capturedCommand: string | null = null;
  let capturedArgs: readonly string[] | null = null;

  const execFileSyncFn: typeof execFileSync = ((command: string, argsOrOptions?: readonly string[] | object) => {
    const args = Array.isArray(argsOrOptions) ? argsOrOptions : [];
    capturedCommand = command;
    capturedArgs = args;
    return Buffer.from("C:\\Program Files\\Codex\\codex.exe\r\n");
  }) as typeof execFileSync;

  const resolved = resolveCommandOnPath("codex", {
    platform: "win32",
    env: { PATH: "C:\\Windows\\System32" },
    execFileSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Program Files\\Codex\\codex.exe");
  assert.equal(capturedCommand, "powershell.exe");
  assert.deepEqual(capturedArgs, [
    "-NoProfile",
    "-NonInteractive",
    "-Command",
    "& {$cmd = Get-Command -Name $args[0] -ErrorAction Stop | Select-Object -First 1; if ($cmd.Path) { $cmd.Path } elseif ($cmd.Source) { $cmd.Source } elseif ($cmd.Definition) { $cmd.Definition } }",
    "codex",
  ]);
});

test("resolveCommandOnPath on Windows prefers .cmd over .ps1 from Get-Command", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Users\\test\\AppData\\Roaming\\npm\\claude.ps1\r\n");
  }) as typeof execFileSync;

  const existsSyncFn = (filePath: string) => filePath === "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.cmd";

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    existsSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.cmd");
});

test("resolveCommandOnPath on Windows prefers .bat over .exe when .cmd is absent", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Users\\test\\AppData\\Roaming\\npm\\claude.ps1\r\n");
  }) as typeof execFileSync;

  const existsSyncFn = (filePath: string) => filePath === "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.bat";

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    existsSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.bat");
});

test("resolveCommandOnPath on Windows prefers .exe when .cmd and .bat are absent", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Users\\test\\AppData\\Roaming\\npm\\claude.ps1\r\n");
  }) as typeof execFileSync;

  const existsSyncFn = (filePath: string) => filePath === "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.exe";

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    existsSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Users\\test\\AppData\\Roaming\\npm\\claude.exe");
});

test("resolveCommandOnPath on Windows falls back to extensionless when .ps1 alternatives are absent", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Users\\test\\AppData\\Roaming\\npm\\claude.ps1\r\n");
  }) as typeof execFileSync;

  const existsSyncFn = (filePath: string) => filePath === "C:\\Users\\test\\AppData\\Roaming\\npm\\claude";

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    existsSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Users\\test\\AppData\\Roaming\\npm\\claude");
});

test("resolveCommandOnPath on Windows returns null when Get-Command returns .ps1 and no alternative exists", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Users\\test\\AppData\\Roaming\\npm\\claude.ps1\r\n");
  }) as typeof execFileSync;

  const existsSyncFn = () => false;

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    existsSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, null);
});

test("resolveCommandOnPath on Windows returns non-.ps1 result as-is", () => {
  const execFileSyncFn: typeof execFileSync = ((_command: string, _argsOrOptions?: readonly string[] | object) => {
    return Buffer.from("C:\\Program Files\\Claude\\claude.exe\r\n");
  }) as typeof execFileSync;

  const resolved = resolveCommandOnPath("claude", {
    platform: "win32",
    env: {},
    execFileSyncFn,
    windowsEnvironmentReaderFn: noWindowsEnvironment,
  });

  assert.equal(resolved, "C:\\Program Files\\Claude\\claude.exe");
});

test("resolveCommandOnPath on Windows merges Machine and User environment before probing", () => {
  const capturedEnvs: NodeJS.ProcessEnv[] = [];

  const execFileSyncFn: typeof execFileSync = ((_command: string, _args?: readonly string[], options?: { env?: NodeJS.ProcessEnv }) => {
    if (options?.env) capturedEnvs.push(options.env);
    return Buffer.from("C:\\Users\\test\\AppData\\Local\\cursor-agent\\cursor-agent.exe\r\n");
  }) as typeof execFileSync;

  const resolved = resolveCommandOnPath("cursor-agent", {
    platform: "win32",
    env: {
      Path: "C:\\ExplicitBin",
      SHARED_VALUE: "base",
    },
    execFileSyncFn,
    windowsEnvironmentReaderFn: () => ({
      machine: {
        Path: "C:\\MachineBin",
        MACHINE_ONLY: "machine",
        SHARED_VALUE: "machine",
      },
      user: {
        Path: "C:\\Users\\test\\AppData\\Local\\cursor-agent",
        USER_ONLY: "user",
        SHARED_VALUE: "user",
      },
    }),
  });

  assert.equal(resolved, "C:\\Users\\test\\AppData\\Local\\cursor-agent\\cursor-agent.exe");
  const capturedEnv = capturedEnvs[0];
  assert.ok(capturedEnv);
  assert.equal(capturedEnv?.Path, "C:\\ExplicitBin;C:\\MachineBin;C:\\Users\\test\\AppData\\Local\\cursor-agent");
  assert.equal(capturedEnv?.MACHINE_ONLY, "machine");
  assert.equal(capturedEnv?.USER_ONLY, "user");
  assert.equal(capturedEnv?.SHARED_VALUE, "base");
});

test("readCommandVersion on Windows uses merged Machine and User environment", () => {
  const capturedEnvs: NodeJS.ProcessEnv[] = [];

  const execFileSyncFn: typeof execFileSync = ((_command: string, _args?: readonly string[], options?: { env?: NodeJS.ProcessEnv }) => {
    if (options?.env) capturedEnvs.push(options.env);
    return Buffer.from("cursor-agent 1.2.3\r\n");
  }) as typeof execFileSync;

  const version = readCommandVersion("cursor-agent", [], {
    platform: "win32",
    env: { Path: "C:\\ExplicitBin" },
    execFileSyncFn,
    windowsEnvironmentReaderFn: () => ({
      machine: { Path: "C:\\MachineBin" },
      user: { Path: "C:\\Users\\test\\AppData\\Local\\cursor-agent" },
    }),
  });

  assert.equal(version, "cursor-agent 1.2.3");
  const capturedEnv = capturedEnvs[0];
  assert.ok(capturedEnv);
  assert.equal(capturedEnv?.Path, "C:\\ExplicitBin;C:\\MachineBin;C:\\Users\\test\\AppData\\Local\\cursor-agent");
});
