import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { agents, servers, users } from "../db/schema.js";
import {
  cancelReminder,
  createReminder,
  fireReminder,
  getReminderById,
  listReminderEvents,
  snoozeReminder,
  updateReminder,
  type TimeProvider,
} from "./reminderService.js";

afterEach(async () => {
  await closeDatabase();
});

const FIXED_NOW = new Date("2026-04-20T12:00:00.000Z");
const FIXED_CLOCK: TimeProvider = { now: () => FIXED_NOW };

async function seedServerAndAgent() {
  const db = getDb();

  const [user] = await db
    .insert(users)
    .values({
      id: "11111111-1111-1111-1111-111111111111",
      email: "owner@example.com",
      name: "Owner",
      passwordHash: "hash",
      emailVerified: true,
    })
    .returning();

  const [server] = await db
    .insert(servers)
    .values({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Acme",
      slug: "acme",
      ownerId: user.id,
    })
    .returning();

  const [agent] = await db
    .insert(agents)
    .values({
      id: "33333333-3333-3333-3333-333333333333",
      serverId: server.id,
      name: "applepi",
      status: "active",
      model: "sonnet",
      runtime: "claude",
      executionMode: "byoc",
    })
    .returning();

  return { user, server, agent };
}

test("R3: cancel wins cleanly and a later fire attempt becomes no-op", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "cancel me first",
      fireAt: new Date("2026-04-20T13:00:00.000Z"),
      payload: null,
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const canceled = await cancelReminder(reminder.id, { clock: FIXED_CLOCK });
  assert.ok(canceled);
  assert.equal(canceled.status, "canceled");
  assert.equal(canceled.version, 2);
  assert.equal(canceled.canceledAt?.toISOString(), FIXED_NOW.toISOString());

  const lateFire = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.equal(lateFire, null);

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "canceled");
  assert.equal(persisted.version, 2);
  assert.equal(persisted.canceledAt?.toISOString(), FIXED_NOW.toISOString());
  assert.equal(persisted.firedAt, null);
});

test("R3: fired one-time reminder can still be canceled", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "fire me first",
      fireAt: new Date("2026-04-20T13:00:00.000Z"),
      payload: null,
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const fired = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(fired);
  assert.equal(fired.row.status, "fired");
  assert.equal(fired.row.version, 2);
  assert.equal(fired.row.firedAt?.toISOString(), FIXED_NOW.toISOString());

  const lateCancel = await cancelReminder(reminder.id, { clock: FIXED_CLOCK });
  assert.ok(lateCancel);
  assert.equal(lateCancel.status, "canceled");
  assert.equal(lateCancel.version, 3);

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "canceled");
  assert.equal(persisted.version, 3);
  assert.equal(persisted.firedAt?.toISOString(), FIXED_NOW.toISOString());
  assert.equal(persisted.canceledAt?.toISOString(), FIXED_NOW.toISOString());
});

test("B-minimal: fired one-time can snooze back to scheduled but cannot update", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();
  const snoozeClock: TimeProvider = {
    now: () => new Date("2026-04-20T12:05:00.000Z"),
  };

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "one-time alarm",
      fireAt: new Date("2026-04-20T13:00:00.000Z"),
      payload: null,
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const fired = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(fired);
  assert.equal(fired.row.status, "fired");

  const rejectedUpdate = await updateReminder(
    reminder.id,
    { kind: "title", title: "new title" },
    { clock: snoozeClock },
  );
  assert.equal(rejectedUpdate, null);

  const snoozed = await snoozeReminder(reminder.id, 30 * 60, { clock: snoozeClock });
  assert.ok(snoozed);
  assert.equal(snoozed.status, "scheduled");
  assert.equal(snoozed.fireAt.toISOString(), "2026-04-20T12:35:00.000Z");

  const events = await listReminderEvents(reminder.id);
  assert.deepEqual(events.map((e) => e.eventType), ["snoozed", "scheduled", "fired"]);
  assert.equal(events[0].nextFireAt?.toISOString(), "2026-04-20T12:35:00.000Z");
  assert.equal(events[2].nextFireAt, null);
});
