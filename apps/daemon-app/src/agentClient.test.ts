import assert from "node:assert/strict";
import test from "node:test";
import {
  fetchMachineAgents,
  startMachineAssignedAgent,
  stopMachineAssignedAgent,
} from "./agentClient";

test("fetchMachineAgents returns normalized machine-assigned agents", async () => {
  const agents = await fetchMachineAgents(
    "server-1",
    "https://app.slock.ai",
    "sk_machine_test",
    async () =>
      new Response(
        JSON.stringify([
          {
            id: "agent-1",
            name: "ray",
            displayName: "Ray",
            avatarUrl: "pixel:diamond",
            description: "Engineer",
            status: "active",
            activity: "working",
            activityDetail: "Reviewing PR #701",
            model: "sonnet",
            runtime: "claude",
            executionMode: "byoc",
          },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  );

  assert.deepEqual(agents, [
    {
      serverId: "server-1",
      id: "agent-1",
      name: "ray",
      displayName: "Ray",
      avatarUrl: "pixel:diamond",
      description: "Engineer",
      status: "active",
      activity: "working",
      activityDetail: "Reviewing PR #701",
      model: "sonnet",
      runtime: "claude",
      executionMode: "byoc",
    },
  ]);
});

test("fetchMachineAgents turns auth failures into a friendly machine-key error", async () => {
  await assert.rejects(
    () =>
      fetchMachineAgents(
        "server-1",
        "https://app.slock.ai",
        "sk_machine_bad",
        async () => new Response(JSON.stringify({ error: "Invalid machine API key" }), { status: 401 }),
      ),
    /machine API key was rejected/i,
  );
});

test("fetchMachineAgents rejects malformed payloads", async () => {
  await assert.rejects(
    () =>
      fetchMachineAgents(
        "server-1",
        "https://app.slock.ai",
        "sk_machine_test",
        async () =>
          new Response(JSON.stringify([{ id: "agent-1", name: "ray" }]), {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
      ),
    /invalid machine agent response/i,
  );
});

test("startMachineAssignedAgent posts to the machine-auth start endpoint", async () => {
  let calledUrl = "";
  let calledMethod = "";

  await startMachineAssignedAgent(
    "https://app.slock.ai",
    "sk_machine_test",
    "agent-1",
    async (input, init) => {
      calledUrl = String(input);
      calledMethod = init?.method ?? "";
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
  );

  assert.equal(calledUrl, "https://api.slock.ai/internal/machine/agents/agent-1/start");
  assert.equal(calledMethod, "POST");
});

test("stopMachineAssignedAgent surfaces server-side error messages", async () => {
  await assert.rejects(
    () =>
      stopMachineAssignedAgent(
        "https://app.slock.ai",
        "sk_machine_test",
        "agent-1",
        async () =>
          new Response(JSON.stringify({ error: "Machine offline. Please start your local daemon." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
      ),
    /Machine offline\. Please start your local daemon\./,
  );
});

test("fetchMachineAgents surfaces a clear error when the server returns HTML", async () => {
  await assert.rejects(
    () =>
      fetchMachineAgents(
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
