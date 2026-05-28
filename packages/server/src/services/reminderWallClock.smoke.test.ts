import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { closeDatabase, getDb, initDatabase } from "../db/index.js";
import { agents, channelAgents, channels, messages, servers, users } from "../db/schema.js";
import { createReminder, getReminderById } from "./reminderService.js";
import { resolveScheduleInput } from "./reminderScheduleInput.js";
import { startReminderScheduler } from "./reminderScheduler.js";

afterEach(async () => {
  await closeDatabase();
});

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

async function seedAnchor(serverId: string, senderId: string, agentId: string) {
  const db = getDb();
  const [channel] = await db
    .insert(channels)
    .values({
      id: "44444444-4444-4444-4444-444444444444",
      serverId,
      name: "general",
      type: "channel",
    })
    .returning();
  await db.insert(channelAgents).values({ channelId: channel.id, agentId: agentId }).onConflictDoNothing();
  const [message] = await db
    .insert(messages)
    .values({
      id: "55555555-5555-4555-8555-555555555555",
      channelId: channel.id,
      senderType: "user",
      senderId,
      content: "anchor message",
    })
    .returning();
  return { channel, message };
}

interface IoEvent {
  room: string;
  event: string;
  payload: unknown;
}

interface DeliveredMessage {
  agentId: string;
  payload: { content: string; sender_type: string; channel_type: string; channel_id: string };
}

function createFakeIo() {
  const events: IoEvent[] = [];
  const roomChain = (room: string) => ({
    in(_other: string) {
      return {
        in(_more: string) {
          return { socketsJoin(_r: string) {} };
        },
        socketsJoin(_r: string) {},
      };
    },
    emit(event: string, payload: unknown) {
      events.push({ room, event, payload });
    },
  });
  const io = {
    to: roomChain,
    in: roomChain,
  } as any;
  return { io, events };
}

function createFakeOrchestrator() {
  const delivered: DeliveredMessage[] = [];
  const orchestrator = {
    deliverMessage: async (agentId: string, payload: any) => {
      delivered.push({ agentId, payload });
    },
  } as any;
  return { orchestrator, delivered };
}

async function pollUntil<T>(
  fn: () => T | Promise<T>,
  predicate: (value: T) => boolean,
  timeoutMs: number,
  intervalMs: number,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T;
  do {
    last = await fn();
    if (predicate(last)) return last;
    await new Promise((r) => setTimeout(r, intervalMs));
  } while (Date.now() < deadline);
  return last;
}

// Wall-clock smoke: end-to-end fire + anchored-surface wake path.
// Covers @ApplePI's full gate: `delay_seconds=3` → within 10s, reminder row
// reaches status=fired AND the wake system message is delivered via
// the real scheduler → deliverFireWake → owner-only synthetic deliverMessage chain.
test("wall-clock: delaySeconds=3 fires AND delivers anchored wake within 10s", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();
  const { message } = await seedAnchor(server.id, user.id, agent.id);

  const schedule = resolveScheduleInput({ delaySeconds: 3 }, Date.now());
  assert.equal(schedule.ok, true);
  if (!schedule.ok) return;

  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "wall-clock smoke",
    fireAt: schedule.fireAt,
    payload: null,
    createdBy: { type: "human", id: user.id },
  });

  const { io, events } = createFakeIo();
  const { orchestrator, delivered } = createFakeOrchestrator();

  const scheduler = startReminderScheduler({
    io,
    orchestrator,
    intervalMs: 500,
    graceMs: 0,
  });

  try {
    // Gate A: fired status persisted
    const firedRow = await pollUntil(
      () => getReminderById(reminder.id),
      (row) => row?.status === "fired",
      10_000,
      250,
    );
    assert.ok(firedRow, "reminder row should still exist");
    assert.equal(firedRow.status, "fired", `expected status=fired, got ${firedRow.status}`);
    assert.equal(firedRow.version, 2);
    assert.ok(firedRow.firedAt);

    // Gate B: anchored wake delivered through the real deliverFireWake chain.
    // deliverFireWake → orchestrator.deliverMessage(transient)
    // with sender_type=system and the canonical reminder fire message.
    const wake = await pollUntil(
      () =>
        delivered.find(
          (d) =>
            d.agentId === agent.id &&
            d.payload.sender_type === "system" &&
            /^🔔 Reminder #[a-f0-9]{8}\b/.test(d.payload.content),
        ),
      (w) => w !== undefined,
      10_000,
      250,
    );
    assert.ok(wake, "anchored wake should be delivered to owner agent within 10s");
    assert.match(wake.payload.content, /wall-clock smoke/);
    assert.equal(wake.payload.channel_id, message.channelId);
    assert.equal(wake.payload.channel_type, "channel");

    // Gate C: server-scoped reminder:fired socket event also emitted.
    const reminderFired = events.find((e) => e.event === "reminder:fired");
    assert.ok(reminderFired, "reminder:fired socket event should be emitted");
    assert.equal(reminderFired.room, `server:${server.id}`);
  } finally {
    scheduler.stop();
  }
});

// Wall-clock recurring smoke: an `every:2s` reminder should fire multiple
// times within a short window and stay in `scheduled` status across fires.
// This is @Tao's "does the whole recurrence chain actually loop end-to-end"
// gate that pure unit tests on fireReminder can't catch.
test("wall-clock recurring: every:2s fires at least twice and stays scheduled", async () => {
  await initDatabase("pglite://");
  const { server, agent, user } = await seed();
  // Anchor the reminder so deliverFireWake can resolve a surface for the
  // synthetic wake envelope. Recurrence chain semantics are independent of
  // anchor; we just need a real channel for AgentMessage context (post-#1242
  // detached reminders don't wake).
  const { message } = await seedAnchor(server.id, user.id, agent.id);

  const firstFireAt = new Date(Date.now() + 1500);
  const reminder = await createReminder({
    serverId: server.id,
    ownerAgentId: agent.id,
    msgId: message.id,
    title: "recurring smoke",
    fireAt: firstFireAt,
    payload: null,
    recurrence: { version: 1, rule: { kind: "interval", seconds: 2 } },
    createdBy: { type: "human", id: user.id },
  });

  const { io, events } = createFakeIo();
  const { orchestrator, delivered } = createFakeOrchestrator();

  const scheduler = startReminderScheduler({
    io,
    orchestrator,
    intervalMs: 500,
    graceMs: 0,
  });

  try {
    // Wait for ≥2 wake DMs. First fire ≈t+1.5s, second ≈t+3.5s, third ≈t+5.5s.
    // 10s is plenty of budget for the scanner to produce two deliveries.
    const delivers = await pollUntil(
      () =>
        delivered.filter(
          (d) =>
            d.agentId === agent.id &&
            d.payload.sender_type === "system" &&
            /^🔔 Reminder #[a-f0-9]{8}\b/.test(d.payload.content),
        ),
      (list) => list.length >= 2,
      10_000,
      250,
    );
    assert.ok(delivers.length >= 2, `expected ≥2 wake DMs, got ${delivers.length}`);

    // The row must still be scheduled — recurring never transitions to fired.
    const persisted = await getReminderById(reminder.id);
    assert.ok(persisted);
    assert.equal(persisted.status, "scheduled");
    // fireAt keeps advancing — must be > firstFireAt
    assert.ok(
      persisted.fireAt.getTime() > firstFireAt.getTime(),
      `fireAt should advance past first slot, got ${persisted.fireAt.toISOString()}`,
    );
    // nextFireAt appears on every reminder:fired event for recurring fires
    const reminderFiredEvents = events.filter((e) => e.event === "reminder:fired");
    assert.ok(reminderFiredEvents.length >= 2);
    const firstEvent = reminderFiredEvents[0].payload as { nextFireAt: string | null };
    assert.ok(firstEvent.nextFireAt, "recurring fire must broadcast nextFireAt");
  } finally {
    scheduler.stop();
  }
});
