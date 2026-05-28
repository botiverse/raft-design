import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { agents, servers, users } from "../db/schema.js";
import { createReminder, fireReminder, getReminderById, type TimeProvider } from "./reminderService.js";
import { startReminderScheduler, type SchedulerClock } from "./reminderScheduler.js";

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

function createFakeSchedulerClock(now: Date): SchedulerClock {
  return {
    now: () => now,
    setInterval: () => Symbol("interval"),
    clearInterval: () => {},
  };
}

function createFakeIo() {
  const events: Array<{ room: string; event: string; payload: unknown }> = [];
  return {
    io: {
      to(room: string) {
        return {
          emit(event: string, payload: unknown) {
            events.push({ room, event, payload });
          },
        };
      },
    } as any,
    events,
  };
}

test("R2: scanner and direct fire race still has a single winner", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seedServerAndAgent();

  const reminder = await createReminder(
    {
      serverId: server.id,
      ownerAgentId: agent.id,
      msgId: null,
      title: "race me",
      fireAt: new Date("2026-04-20T11:59:00.000Z"),
      payload: null,
      createdBy: { type: "human", id: user.id },
    },
    { clock: FIXED_CLOCK },
  );

  const firedByScanner: string[] = [];
  const fakeIo = createFakeIo();
  const scheduler = startReminderScheduler({
    io: fakeIo.io,
    clock: createFakeSchedulerClock(FIXED_NOW),
    graceMs: 0,
    intervalMs: 60_000,
    onFired: (id) => firedByScanner.push(id),
  });

  const [, firedByDirectCall] = await Promise.all([
    scheduler.tick(),
    fireReminder(reminder.id, reminder.version, { clock: FIXED_CLOCK }),
  ]);
  scheduler.stop();

  assert.ok(firedByScanner.length <= 1);
  const directWinnerCount = firedByDirectCall ? 1 : 0;
  assert.equal(firedByScanner.length + directWinnerCount, 1);

  if (firedByScanner.length === 1) {
    assert.deepEqual(firedByScanner, [reminder.id]);
    assert.equal(fakeIo.events.length, 1);
    assert.deepEqual(fakeIo.events[0], {
      room: `server:${server.id}`,
      event: "reminder:fired",
      payload: {
        reminderId: reminder.id,
        ownerAgentId: agent.id,
        firedAt: FIXED_NOW.toISOString(),
        firedBy: "server",
        catchup: false,
        nextFireAt: null,
      },
    });
  } else {
    assert.equal(fakeIo.events.length, 0);
  }

  const persisted = await getReminderById(reminder.id);
  assert.ok(persisted);
  assert.equal(persisted.status, "fired");
  assert.equal(persisted.version, 2);
  assert.equal(persisted.firedAt?.toISOString(), FIXED_NOW.toISOString());
});
