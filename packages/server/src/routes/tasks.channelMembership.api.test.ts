import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { getDb } from "../db/index.js";
import { serverMembers, users } from "../db/schema.js";
import { createChannel, addHuman } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { createServer } from "../services/serverService.js";
import * as taskService from "../services/taskService.js";
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

test("public channel tasks are readable but immutable for server humans who have not joined the channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("task-owner@slock.test", "task-owner");
    const reader = await seedUser("task-reader@slock.test", "task-reader");
    const server = await createServer("Task Readonly Contract", "task-readonly-contract", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: reader.id, role: "member" }).onConflictDoNothing();
    const channel = await createChannel(server.id, "readonly-public");
    await addHuman(channel.id, owner.id);

    const [task] = await taskService.createTasks(channel.id, "user", owner.id, [{ title: "readonly task" }]);
    const message = await createMessage(channel.id, "user", owner.id, "convert me");
    const readerToken = await login(app.baseUrl, reader.email);
    const headers = authHeaders(readerToken, server.id);

    const listRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}`, { headers });
    assert.equal(listRes.status, 200, `expected read 200, got ${listRes.status}`);
    const listBody = await listRes.json() as { tasks: Array<{ id: string }> };
    assert.equal(listBody.tasks.some((candidate) => candidate.id === task.id), true);

    const claimRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/claim`, {
      method: "PATCH",
      headers,
    });
    assert.equal(claimRes.status, 403, `expected claim 403, got ${claimRes.status}`);

    const statusRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "in_progress" }),
    });
    assert.equal(statusRes.status, 403, `expected status 403, got ${statusRes.status}`);

    const createRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tasks: [{ title: "should not create" }] }),
    });
    assert.equal(createRes.status, 403, `expected create 403, got ${createRes.status}`);

    const convertRes = await fetch(`${app.baseUrl}/api/tasks/convert-message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messageId: message.id }),
    });
    assert.equal(convertRes.status, 403, `expected convert 403, got ${convertRes.status}`);
  } finally {
    await app.close();
  }
});

test("private channel tasks are not readable by server humans outside the channel", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("private-task-owner@slock.test", "private-task-owner");
    const member = await seedUser("private-task-member@slock.test", "private-task-member");
    const reader = await seedUser("private-task-reader@slock.test", "private-task-reader");
    const server = await createServer("Private Task Contract", "private-task-contract", owner.id);
    await db.insert(serverMembers).values([
      { serverId: server.id, userId: member.id, role: "member" },
      { serverId: server.id, userId: reader.id, role: "member" },
    ]).onConflictDoNothing();
    const channel = await createChannel(server.id, "private-tasks", undefined, "private");
    await addHuman(channel.id, owner.id);
    await addHuman(channel.id, member.id);

    const [task] = await taskService.createTasks(channel.id, "user", member.id, [{ title: "private task" }]);
    const privateMessage = await createMessage(channel.id, "user", member.id, "private convert target");
    const memberToken = await login(app.baseUrl, member.email);
    const memberHeaders = authHeaders(memberToken, server.id);
    const readerToken = await login(app.baseUrl, reader.email);
    const headers = authHeaders(readerToken, server.id);

    const memberListRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}`, { headers: memberHeaders });
    assert.equal(memberListRes.status, 200, `expected member list 200, got ${memberListRes.status}`);
    const memberListBody = await memberListRes.json() as { tasks: Array<{ id: string }> };
    assert.equal(memberListBody.tasks.some((candidate) => candidate.id === task.id), true);

    const memberNumberRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}/number/${task.taskNumber}`, { headers: memberHeaders });
    assert.equal(memberNumberRes.status, 200, `expected member number lookup 200, got ${memberNumberRes.status}`);
    const memberNumberBody = await memberNumberRes.json() as { task: { id: string } };
    assert.equal(memberNumberBody.task.id, task.id);

    const listRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}`, { headers });
    assert.equal(listRes.status, 404, `expected list 404, got ${listRes.status}`);

    const numberRes = await fetch(`${app.baseUrl}/api/tasks/channel/${channel.id}/number/${task.taskNumber}`, { headers });
    assert.equal(numberRes.status, 404, `expected number lookup 404, got ${numberRes.status}`);

    const claimRes = await fetch(`${app.baseUrl}/api/tasks/${task.id}/claim`, {
      method: "PATCH",
      headers,
    });
    assert.equal(claimRes.status, 404, `expected claim 404, got ${claimRes.status}`);

    const convertRes = await fetch(`${app.baseUrl}/api/tasks/convert-message`, {
      method: "POST",
      headers,
      body: JSON.stringify({ messageId: privateMessage.id }),
    });
    assert.equal(convertRes.status, 404, `expected convert 404, got ${convertRes.status}`);
  } finally {
    await app.close();
  }
});
