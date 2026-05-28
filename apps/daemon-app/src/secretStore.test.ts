import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { DaemonAppSecretStore, type SecretStorageAdapter } from "./secretStore";

const fakeStorage: SecretStorageAdapter = {
  isEncryptionAvailable: () => true,
  encryptString: (value) => Buffer.from(value, "utf8"),
  decryptString: (value) => value.toString("utf8"),
};

test("concurrent secret writes are serialized instead of overwriting each other", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-secrets-"));
  const store = new DaemonAppSecretStore(path.join(tempDir, "secrets.json"), fakeStorage);

  try {
    const storeWithHooks = store as any;
    const originalWriteSecrets = storeWithHooks.writeSecrets.bind(storeWithHooks) as (secrets: unknown) => Promise<void>;
    let concurrentWrites = 0;
    let maxConcurrentWrites = 0;

    storeWithHooks.writeSecrets = async (secrets: unknown) => {
      concurrentWrites += 1;
      maxConcurrentWrites = Math.max(maxConcurrentWrites, concurrentWrites);
      await new Promise((resolve) => setTimeout(resolve, 20));
      try {
        await originalWriteSecrets(secrets);
      } finally {
        concurrentWrites -= 1;
      }
    };

    await Promise.all([
      store.setMachineApiKey("server-a", "sk_machine_a"),
      store.setMachineApiKey("server-b", "sk_machine_b"),
    ]);

    assert.equal(maxConcurrentWrites, 1);
    assert.equal(await store.getMachineApiKey("server-a"), "sk_machine_a");
    assert.equal(await store.getMachineApiKey("server-b"), "sk_machine_b");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("provider API keys can be stored and cleared independently", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-secrets-"));
  const store = new DaemonAppSecretStore(path.join(tempDir, "secrets.json"), fakeStorage);

  try {
    await store.setProviderApiKey("provider-a", "sk_provider_a");
    assert.equal(await store.hasProviderApiKey("provider-a"), true);
    assert.equal(await store.getProviderApiKey("provider-a"), "sk_provider_a");

    await store.clearProviderApiKey("provider-a");
    assert.equal(await store.hasProviderApiKey("provider-a"), false);
    assert.equal(await store.getProviderApiKey("provider-a"), null);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("user sessions can be stored and cleared independently per server slot", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "daemon-app-secrets-"));
  const store = new DaemonAppSecretStore(path.join(tempDir, "secrets.json"), fakeStorage);

  try {
    await store.setUserSession("server-a", {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    assert.deepEqual(await store.getUserSession("server-a"), {
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    await store.clearUserSession("server-a");
    assert.equal(await store.getUserSession("server-a"), null);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
