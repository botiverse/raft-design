import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import { createServer } from "../services/serverService.js";
import { createAgent, assignMachine } from "../services/agentService.js";
import { registerMachine } from "../services/machineService.js";
import { createMessage } from "../services/messageService.js";
import * as channelService from "../services/channelService.js";
import { fireReminder, getReminderById } from "../services/reminderService.js";

// Agent-facing write path emits live Reminders-tab updates via socket. This
// pairs the server contract with the new human-facing tab on agent profile
// (AgentRemindersTab) so `reminder:scheduled` and `reminder:canceled` don't
// quietly regress without a test catching it.

interface EmittedEvent {
  room: string;
  event: string;
  payload: unknown;
}

function installFakeIo(app: { set: (k: string, v: unknown) => void }): EmittedEvent[] {
  const events: EmittedEvent[] = [];
  const fakeIo = {
    to(room: string) {
      return {
        emit(event: string, payload: unknown) {
          events.push({ room, event, payload });
        },
      };
    },
  };
  app.set("io", fakeIo);
  return events;
}

// testAppHarness's stub orchestrator doesn't know about reminder push methods
// (daemon-direct-fire path). Stub them out here so the route doesn't 500 on
// the `void orchestrator.pushReminderUpsert(...)` call — we only care about
// the socket emission in these tests, not the daemon push path (which has
// its own coverage in reminderCache.test.ts / reminderScheduler tests).
function installReminderOrchestratorStub(app: {
  get: (k: string) => unknown;
  set: (k: string, v: unknown) => void;
}): void {
  const existing = (app.get("agentOrchestrator") as Record<string, unknown>) ?? {};
  app.set("agentOrchestrator", {
    ...existing,
    pushReminderUpsert: async () => {},
    pushReminderCancel: async () => {},
  });
}

async function seed() {
  const db = getDb();
  const [owner] = await db
    .insert(users)
    .values({
      email: "internal-reminders-owner@slock.test",
      name: "internal-reminders-owner",
      displayName: "Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
  const server = await createServer("Internal Reminders", "internal-reminders", owner.id);
  const agent = await createAgent(server.id, "r-agent", { runtime: "claude" });
  const { machine, apiKey } = await registerMachine(server.id, owner.id, "dev-machine");
  await assignMachine(agent.id, machine.id);
  const [channel] = await channelService.listChannels(server.id);
  const anchor = await createMessage(channel.id, "user", owner.id, "anchor reminder here");
  return { owner, server, agent, machine, apiKey, anchorId: anchor.id };
}

function machineHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

test("POST /internal/agent/:id/reminders emits reminder:scheduled on the server room", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { server, agent, apiKey, anchorId } = await seed();
    installReminderOrchestratorStub(app.app);
    const events = installFakeIo(app.app);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({
        title: "standup",
        delaySeconds: 60,
        msgId: anchorId,
      }),
    });
    assert.equal(res.status, 201, `expected 201, got ${res.status}`);
    const body = (await res.json()) as { reminder: { reminderId: string; ownerAgentId: string } };
    assert.equal(body.reminder.ownerAgentId, agent.id);

    const scheduledEvents = events.filter((e) => e.event === "reminder:scheduled");
    assert.equal(scheduledEvents.length, 1, "expected exactly one reminder:scheduled event");
    const [evt] = scheduledEvents;
    assert.equal(evt.room, `server:${server.id}`);
    const payload = evt.payload as { reminder: { reminderId: string; ownerAgentId: string; title: string } };
    assert.equal(payload.reminder.reminderId, body.reminder.reminderId);
    assert.equal(payload.reminder.ownerAgentId, agent.id);
    assert.equal(payload.reminder.title, "standup");
  } finally {
    await app.close();
  }
});

test("DELETE /internal/agent/:id/reminders/:reminderId emits reminder:canceled on the server room", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { server, agent, apiKey, anchorId } = await seed();
    installReminderOrchestratorStub(app.app);

    // Create the reminder first via the same route so we exercise the real path.
    const createRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ title: "to-cancel", delaySeconds: 120, msgId: anchorId }),
    });
    assert.equal(createRes.status, 201);
    const createBody = (await createRes.json()) as { reminder: { reminderId: string } };
    const reminderId = createBody.reminder.reminderId;

    // Swap in the fake io AFTER create so we only capture the cancel event,
    // keeping the assertion tight.
    const events = installFakeIo(app.app);

    const delRes = await fetch(
      `${app.baseUrl}/internal/agent/${agent.id}/reminders/${reminderId}`,
      {
        method: "DELETE",
        headers: machineHeaders(apiKey),
      },
    );
    assert.equal(delRes.status, 200, `expected 200, got ${delRes.status}`);

    const canceledEvents = events.filter((e) => e.event === "reminder:canceled");
    assert.equal(canceledEvents.length, 1, "expected exactly one reminder:canceled event");
    const [evt] = canceledEvents;
    assert.equal(evt.room, `server:${server.id}`);
    assert.deepEqual(evt.payload, {
      reminderId,
      ownerAgentId: agent.id,
    });
  } finally {
    await app.close();
  }
});

test("POST /internal/agent/:id/reminders rejects missing msgId", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey } = await seed();
    installReminderOrchestratorStub(app.app);

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({
        title: "missing-anchor",
        delaySeconds: 60,
      }),
    });
    assert.equal(res.status, 400, `expected 400, got ${res.status}`);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? "", /msgId is required/);
  } finally {
    await app.close();
  }
});

test("snooze/update/log routes enforce B-minimal reminder state", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, anchorId } = await seed();
    installReminderOrchestratorStub(app.app);

    const createRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ title: "b-minimal", delaySeconds: 120, msgId: anchorId }),
    });
    assert.equal(createRes.status, 201);
    const createBody = (await createRes.json()) as { reminder: { reminderId: string; fireAt: string } };
    const reminderId = createBody.reminder.reminderId;

    const updateRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders/${reminderId}`, {
      method: "PATCH",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ title: "updated title" }),
    });
    assert.equal(updateRes.status, 200, `expected scheduled update to work, got ${updateRes.status}`);
    const updateBody = (await updateRes.json()) as { reminder: { title: string; status: string } };
    assert.equal(updateBody.reminder.title, "updated title");
    assert.equal(updateBody.reminder.status, "scheduled");

    const beforeFire = await getReminderById(reminderId);
    assert.ok(beforeFire);
    const fired = await fireReminder(beforeFire.id, beforeFire.version);
    assert.ok(fired);
    assert.equal(fired.row.status, "fired");

    const rejectedUpdate = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders/${reminderId}`, {
      method: "PATCH",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ title: "cannot update fired" }),
    });
    assert.equal(rejectedUpdate.status, 409);
    const rejectedBody = (await rejectedUpdate.json()) as { error?: string };
    assert.match(rejectedBody.error ?? "", /snooze it back to scheduled/);

    const snoozeRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders/${reminderId}/snooze`, {
      method: "POST",
      headers: machineHeaders(apiKey),
      body: JSON.stringify({ delaySeconds: 300 }),
    });
    assert.equal(snoozeRes.status, 200);
    const snoozeBody = (await snoozeRes.json()) as { reminder: { status: string; fireAt: string } };
    assert.equal(snoozeBody.reminder.status, "scheduled");
    assert.notEqual(snoozeBody.reminder.fireAt, createBody.reminder.fireAt);

    const logRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/reminders/${reminderId}/log`, {
      method: "GET",
      headers: machineHeaders(apiKey),
    });
    assert.equal(logRes.status, 200);
    const logBody = (await logRes.json()) as { events: Array<{ eventType: string }> };
    assert.deepEqual(logBody.events.map((e) => e.eventType), ["snoozed", "fired", "updated", "scheduled"]);
  } finally {
    await app.close();
  }
});
