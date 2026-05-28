import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { agents, reminders, servers, users } from "../db/schema.js";
import {
  cancelReminder,
  createReminder,
  fireReminder,
  getReminderById,
  type TimeProvider,
} from "./reminderService.js";
import { eq } from "drizzle-orm";

afterEach(async () => {
  await closeDatabase();
});

const FIXED_NOW = new Date("2026-04-20T12:00:00.000Z");
const FIXED_CLOCK: TimeProvider = { now: () => FIXED_NOW };

async function seed() {
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

test("R4: recurring fire advances fireAt instead of transitioning to fired", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "every 15m",
      fireAt: new Date("2026-04-20T11:59:00.000Z"),
      payload: null,
      recurrence: { version: 1, rule: { kind: "interval", seconds: 900 } },
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const result = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(result);
  assert.equal(result.fired, true);
  assert.equal(result.catchup, false);
  assert.ok(result.nextFireAt);

  // Recurring: stays scheduled, fireAt advanced by the recurrence rule, version bumped,
  // firedAt stamped so the UI can show "last fired at".
  assert.equal(result.row.status, "scheduled");
  assert.equal(result.row.version, 2);
  assert.equal(result.row.firedAt?.toISOString(), FIXED_NOW.toISOString());
  assert.equal(
    result.row.fireAt.toISOString(),
    new Date("2026-04-20T12:15:00.000Z").toISOString(),
  );
});

test("R4: cancel mid-series halts recurrence cleanly", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "every 15m",
      fireAt: new Date("2026-04-20T11:59:00.000Z"),
      payload: null,
      recurrence: { version: 1, rule: { kind: "interval", seconds: 900 } },
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  // Fire once (stays scheduled, bumps version to 2)
  const fired = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(fired);
  assert.equal(fired.row.status, "scheduled");
  assert.equal(fired.row.version, 2);

  // Cancel mid-series: should win cleanly, halt future fires
  const canceled = await cancelReminder(reminder.id, { clock: FIXED_CLOCK });
  assert.ok(canceled);
  assert.equal(canceled.status, "canceled");
  assert.equal(canceled.version, 3);

  // A fallback scanner that races with cancel (uses old version=2) no-ops
  const late = await fireReminder(reminder.id, 2, { clock: FIXED_CLOCK });
  assert.equal(late, null);

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "canceled");
  assert.equal(persisted.version, 3);
});

test("R4: catchup=true propagates onto FireReminderResult for recurring", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "overdue recurring",
      fireAt: new Date("2026-04-20T10:00:00.000Z"), // 2h overdue at FIXED_NOW
      payload: null,
      recurrence: { version: 1, rule: { kind: "interval", seconds: 900 } },
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const result = await fireReminder(reminder.id, reminder.version, {
    clock: FIXED_CLOCK,
    catchup: true,
  });
  assert.ok(result);
  assert.equal(result.catchup, true);
  assert.equal(result.fired, true);
  assert.equal(result.row.status, "scheduled");
  // Next fire: computed from FIXED_NOW forward, not from the overdue fireAt
  assert.equal(
    result.row.fireAt.toISOString(),
    new Date("2026-04-20T12:15:00.000Z").toISOString(),
  );
});

test("R4: forward-compat: unknown recurrence kind skips fire + advances 5min", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();

  // Seed a reminder with an unknown recurrence kind. createReminder would
  // reject this, so we round-trip through a known rule then forcibly rewrite
  // the recurrence column to simulate a newer server having stored a kind
  // this older code doesn't understand.
  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "from-the-future",
      fireAt: new Date("2026-04-20T11:59:00.000Z"),
      payload: null,
      recurrence: { version: 1, rule: { kind: "interval", seconds: 900 } },
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  await getDb()
    .update(reminders)
    .set({ recurrence: { version: 999, rule: { kind: "quantum", cadence: "weekly-ish" } } as any })
    .where(eq(reminders.id, reminder.id));

  const result = await fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK });
  assert.ok(result);
  // Skip-unknown: fired=false (no wake delivery), but row still updates
  assert.equal(result.fired, false);
  assert.equal(result.row.status, "scheduled");
  assert.equal(result.row.version, 2);
  // fireAt advanced by 5min to avoid fallback-scanner tight loop
  assert.equal(
    result.row.fireAt.toISOString(),
    new Date("2026-04-20T12:05:00.000Z").toISOString(),
  );
  // firedAt NOT stamped — it didn't actually fire
  assert.equal(result.row.firedAt, null);
});
