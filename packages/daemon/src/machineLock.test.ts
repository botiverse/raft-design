import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { acquireDaemonMachineLock, getDaemonMachineLockId, resolveDefaultMachineStateRoot } from "./machineLock.js";

test("daemon machine lock serializes one running daemon per machine key", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-machine-lock-test-"));

  try {
    const first = acquireDaemonMachineLock({
      apiKey: "sk_machine_test",
      serverUrl: "https://daemon.example.com",
      rootDir,
    });

    assert.equal(first.lockId, getDaemonMachineLockId("sk_machine_test"));
    assert.match(first.machineDir, /machine-/);
    const owner = JSON.parse(await readFile(path.join(first.lockDir, "owner.json"), "utf8")) as { pid: number };
    assert.equal(owner.pid, process.pid);

    assert.throws(
      () => acquireDaemonMachineLock({ apiKey: "sk_machine_test", serverUrl: "https://daemon.example.com", rootDir }),
      /Another Slock daemon is already running/,
    );

    first.release();
    const second = acquireDaemonMachineLock({
      apiKey: "sk_machine_test",
      serverUrl: "https://daemon.example.com",
      rootDir,
    });
    second.release();
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("daemon machine lock defaults to SLOCK_HOME machines directory", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-machine-lock-home-test-"));
  const oldSlockHome = process.env.SLOCK_HOME;

  try {
    process.env.SLOCK_HOME = rootDir;
    const lock = acquireDaemonMachineLock({
      apiKey: "sk_machine_test",
      serverUrl: "https://daemon.example.com",
    });

    assert.equal(resolveDefaultMachineStateRoot(), path.join(rootDir, "machines"));
    assert.equal(lock.machineDir, path.join(rootDir, "machines", getDaemonMachineLockId("sk_machine_test")));
    lock.release();
  } finally {
    if (oldSlockHome === undefined) {
      delete process.env.SLOCK_HOME;
    } else {
      process.env.SLOCK_HOME = oldSlockHome;
    }
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("daemon machine lock recovers stale lock directories", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-machine-lock-stale-test-"));

  try {
    const lockId = getDaemonMachineLockId("sk_machine_test");
    const lockDir = path.join(rootDir, lockId, "daemon.lock");
    await mkdir(lockDir, { recursive: true });
    await writeFile(path.join(lockDir, "owner.json"), JSON.stringify({ pid: 0 }), "utf8");

    const lock = acquireDaemonMachineLock({
      apiKey: "sk_machine_test",
      serverUrl: "https://daemon.example.com",
      rootDir,
    });

    assert.equal(lock.lockDir, lockDir);
    lock.release();
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});

test("daemon machine lock does not remove recent incomplete lock directories", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "slock-machine-lock-incomplete-test-"));

  try {
    const lockId = getDaemonMachineLockId("sk_machine_test");
    const lockDir = path.join(rootDir, lockId, "daemon.lock");
    await mkdir(lockDir, { recursive: true });

    assert.throws(
      () => acquireDaemonMachineLock({ apiKey: "sk_machine_test", serverUrl: "https://daemon.example.com", rootDir }),
      /Another Slock daemon is already running/,
    );

    const info = await stat(lockDir);
    assert.ok(info.isDirectory(), "recent incomplete lock directory should remain for the owner to finish writing");
  } finally {
    await rm(rootDir, { recursive: true, force: true });
  }
});
