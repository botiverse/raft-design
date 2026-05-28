import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { users, messages, agents, channelAgents, serverMembers } from "../db/schema.js";
import { createChannel, addHuman, deleteChannel } from "../services/channelService.js";
import { createServer } from "../services/serverService.js";
import * as taskService from "../services/taskService.js";
import { deleteAgent } from "../services/agentService.js";
import { startTestApp } from "../test/testAppHarness.js";

async function seedUser(email: string, name: string) {
  const db = getDb();
  const [user] = await db.insert(users).values({
    email,
    name,
    displayName: name,
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();
  return user;
}

async function seedAgent(serverId: string, name: string) {
  const db = getDb();
  const [agent] = await db.insert(agents).values({
    serverId,
    name,
    displayName: name,
    status: "active",
    runtime: "claude_code",
    model: "sonnet",
    reasoningEffort: "medium",
    executionMode: "cloud",
    creatorType: "user",
    creatorId: "00000000-0000-0000-0000-000000000000",
  }).returning();
  return agent;
}

async function login(baseUrl: string, email: string): Promise<string> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  assert.equal(res.status, 200, `login failed for ${email}`);
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

function authHeaders(token: string, serverId: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-Server-Id": serverId,
  };
}

test("channel soft-delete auto-closes open tasks", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("channel-orphan-owner@slock.test", "channel-orphan-owner");
    const server = await createServer("Channel Orphan Test", "channel-orphan-test", owner.id);
    const channel = await createChannel(server.id, "doomed-channel");
    await addHuman(channel.id, owner.id);

    const [todoTask] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "todo task" }]);
    const [inProgressTask] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "in progress task" }]);
    const [inReviewTask] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "in review task" }]);
    const [doneTask] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "done task" }]);

    await taskService.forceUpdateTaskStatus(inProgressTask.id, "in_progress");
    await taskService.forceUpdateTaskStatus(inReviewTask.id, "in_review");
    await taskService.forceUpdateTaskStatus(doneTask.id, "done");

    await deleteChannel(channel.id);

    const [todoRow] = await db.select().from(messages).where(eq(messages.id, todoTask.id));
    assert.equal(todoRow.taskStatus, "closed", "todo task should be auto-closed");
    assert.notEqual(todoRow.taskCompletedAt, null, "completedAt should be set");

    const [inProgressRow] = await db.select().from(messages).where(eq(messages.id, inProgressTask.id));
    assert.equal(inProgressRow.taskStatus, "closed", "in_progress task should be auto-closed");

    const [inReviewRow] = await db.select().from(messages).where(eq(messages.id, inReviewTask.id));
    assert.equal(inReviewRow.taskStatus, "closed", "in_review task should be auto-closed");

    const [doneRow] = await db.select().from(messages).where(eq(messages.id, doneTask.id));
    assert.equal(doneRow.taskStatus, "done", "done task should remain done");
  } finally {
    await app.close();
  }
});

test("agent soft-delete releases task claims", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("agent-orphan-owner@slock.test", "agent-orphan-owner");
    const server = await createServer("Agent Orphan Test", "agent-orphan-test", owner.id);
    const channel = await createChannel(server.id, "agent-task-channel");
    await addHuman(channel.id, owner.id);
    const agent = await seedAgent(server.id, "atlas-test");
    await db.insert(channelAgents).values({ channelId: channel.id, agentId: agent.id }).onConflictDoNothing();

    const [task] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "agent claimed task" }]);
    await taskService.claimTask(task.id, "agent", agent.id);

    const [beforeRow] = await db.select().from(messages).where(eq(messages.id, task.id));
    assert.equal(beforeRow.taskAssigneeId, agent.id);
    assert.equal(beforeRow.taskAssigneeType, "agent");

    await deleteAgent(agent.id);

    const [afterRow] = await db.select().from(messages).where(eq(messages.id, task.id));
    assert.equal(afterRow.taskAssigneeId, null, "claim should be released");
    assert.equal(afterRow.taskAssigneeType, null, "assignee type should be null");
    assert.equal(afterRow.taskClaimedAt, null, "claimedAt should be null");
    assert.equal(afterRow.taskStatus, "in_progress", "status should be preserved (claim moves todo to in_progress)");
  } finally {
    await app.close();
  }
});

test("pre-existing orphan task can be closed by admin via PATCH status", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const admin = await seedUser("orphan-admin@slock.test", "orphan-admin");
    const server = await createServer("Orphan Close Test", "orphan-close-test", admin.id);
    const channel = await createChannel(server.id, "will-delete");
    await addHuman(channel.id, admin.id);

    const [task] = await taskService.createTasks(channel.id, "user", admin.id, [{ title: "orphan to close" }]);
    await taskService.forceUpdateTaskStatus(task.id, "in_review");

    await deleteChannel(channel.id);

    // Force task back to open state to simulate a pre-fix orphan
    await db.update(messages)
      .set({ taskStatus: "in_review", taskCompletedAt: null })
      .where(eq(messages.id, task.id));

    const token = await login(app.baseUrl, admin.email);
    const headers = authHeaders(token, server.id);

    const closeRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "done" }),
    });
    assert.equal(closeRes.status, 200, `expected 200, got ${closeRes.status}`);

    const [closedRow] = await db.select().from(messages).where(eq(messages.id, task.id));
    assert.equal(closedRow.taskStatus, "done");
  } finally {
    await app.close();
  }
});

test("orphan task rejects non-terminal status transitions", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const admin = await seedUser("orphan-reject-admin@slock.test", "orphan-reject-admin");
    const server = await createServer("Orphan Reject Test", "orphan-reject-test", admin.id);
    const channel = await createChannel(server.id, "will-delete-reject");
    await addHuman(channel.id, admin.id);

    const [task] = await taskService.createTasks(channel.id, "user", admin.id, [{ title: "orphan no reopen" }]);

    await deleteChannel(channel.id);
    // Force task back to open state to simulate a pre-fix orphan
    await db.update(messages)
      .set({ taskStatus: "in_review", taskCompletedAt: null })
      .where(eq(messages.id, task.id));

    const token = await login(app.baseUrl, admin.email);
    const headers = authHeaders(token, server.id);

    // Trying to move to in_progress should be rejected (non-terminal)
    const rejectRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "in_progress" }),
    });
    assert.equal(rejectRes.status, 409, `expected 409, got ${rejectRes.status}`);
    const body = await rejectRes.json() as { code?: string };
    assert.equal(body.code, "channel_deleted_terminal_only");

    // Claim should also be rejected
    const claimRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/claim`, {
      method: "PATCH",
      headers,
    });
    assert.equal(claimRes.status, 409, `expected claim 409, got ${claimRes.status}`);
  } finally {
    await app.close();
  }
});

test("orphan task can be DELETEd by admin", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const admin = await seedUser("orphan-delete-admin@slock.test", "orphan-delete-admin");
    const server = await createServer("Orphan Delete Test", "orphan-delete-test", admin.id);
    const channel = await createChannel(server.id, "will-delete-task");
    await addHuman(channel.id, admin.id);

    const [task] = await taskService.createTasks(channel.id, "user", admin.id, [{ title: "orphan to delete" }]);
    await deleteChannel(channel.id);

    const token = await login(app.baseUrl, admin.email);
    const headers = authHeaders(token, server.id);

    const delRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}`, {
      method: "DELETE",
      headers,
    });
    assert.equal(delRes.status, 200, `expected delete 200, got ${delRes.status}`);
  } finally {
    await app.close();
  }
});

test("orphan task DELETE rejects non-creator non-admin", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("orphan-del-owner@slock.test", "orphan-del-owner");
    const member = await seedUser("orphan-del-member@slock.test", "orphan-del-member");
    const server = await createServer("Orphan Delete Reject", "orphan-delete-reject", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: member.id, role: "member" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "delete-reject-ch");
    await addHuman(channel.id, owner.id);
    await addHuman(channel.id, member.id);

    // Owner creates the task — member is neither creator nor admin
    const [task] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "owner orphan" }]);
    await deleteChannel(channel.id);

    const memberToken = await login(app.baseUrl, member.email);
    const headers = authHeaders(memberToken, server.id);

    const delRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}`, {
      method: "DELETE",
      headers,
    });
    assert.equal(delRes.status, 403, `expected delete 403, got ${delRes.status}`);
  } finally {
    await app.close();
  }
});
