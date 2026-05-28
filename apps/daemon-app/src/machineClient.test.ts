import assert from "node:assert/strict";
import test from "node:test";
import { fetchMachineSelf } from "./machineClient";

test("fetchMachineSelf returns a normalized machine state", async () => {
  let calledUrl = "";
  const machine = await fetchMachineSelf(
    "server-1",
    "https://app.slock.ai",
    "sk_machine_test",
    async (input) => {
      calledUrl = String(input);
      return (
      new Response(
        JSON.stringify({
          id: "machine-1",
          workspaceId: "workspace-1",
          workspaceName: "Botiverse",
          serverSlug: "botiverse",
          name: "Dayu MacBook Pro",
          status: "online",
          apiKeyPrefix: "sk_machine_abc123",
          runtimes: ["codex", "claude"],
          hostname: "dayu-mbp",
          os: "darwin arm64",
          daemonVersion: "0.32.1",
          latestDaemonVersion: "0.33.0",
          lastHeartbeat: "2026-04-09T22:00:00.000Z",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      )
      );
    },
  );

  assert.equal(calledUrl, "https://api.slock.ai/internal/machine/self");

  assert.deepEqual(machine, {
    serverId: "server-1",
    machineId: "machine-1",
    workspaceId: "workspace-1",
    workspaceName: "Botiverse",
    serverSlug: "botiverse",
    name: "Dayu MacBook Pro",
    status: "online",
    apiKeyPrefix: "sk_machine_abc123",
    runtimes: ["codex", "claude"],
    hostname: "dayu-mbp",
    os: "darwin arm64",
    daemonVersion: "0.32.1",
    latestDaemonVersion: "0.33.0",
    lastHeartbeat: "2026-04-09T22:00:00.000Z",
  });
});

test("fetchMachineSelf turns auth failures into a friendly machine-key error", async () => {
  await assert.rejects(
    () =>
      fetchMachineSelf(
        "server-1",
        "https://app.slock.ai",
        "sk_machine_bad",
        async () => new Response(JSON.stringify({ error: "Invalid machine API key" }), { status: 401 }),
      ),
    /machine API key was rejected/i,
  );
});

test("fetchMachineSelf rejects malformed payloads", async () => {
  await assert.rejects(
    () =>
      fetchMachineSelf(
        "server-1",
        "https://app.slock.ai",
        "sk_machine_test",
        async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      ),
    /invalid machine response/i,
  );
});

test("fetchMachineSelf surfaces a clear error when a web page responds with HTML", async () => {
  await assert.rejects(
    () =>
      fetchMachineSelf(
        "server-1",
        "https://slock-app-staging.botiverse.dev",
        "sk_machine_test",
        async () =>
          new Response("<!DOCTYPE html><html><body>not api</body></html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
      ),
    /web app instead of the backend API/i,
  );
});
