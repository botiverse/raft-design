import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import { attachments, messages, serverMembers, users } from "../db/schema.js";
import { createChannel, getOrCreateThread, addHuman, listChannelFiles } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { createServer } from "../services/serverService.js";
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

function headers(token: string, serverId: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
}

test("GET /api/channels/:id/files lists direct and thread message attachments with source jump metadata", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("files-owner@slock.test", "files-owner");
    const server = await createServer("Files Test", "files-test", owner.id);
    const channel = await createChannel(server.id, "files-room");
    await addHuman(channel.id, owner.id);

    const directMessage = await createMessage(channel.id, "user", owner.id, "direct attachment");
    const parentMessage = await createMessage(channel.id, "user", owner.id, "thread parent");
    const thread = await getOrCreateThread(parentMessage.id, owner.id, "user");
    const threadMessage = await createMessage(thread.id, "user", owner.id, "thread attachment");

    const older = new Date("2026-05-10T10:00:00Z");
    const newer = new Date("2026-05-10T11:00:00Z");
    await db.update(messages).set({ createdAt: older }).where(eq(messages.id, directMessage.id));
    await db.update(messages).set({ createdAt: newer }).where(eq(messages.id, threadMessage.id));
    await db.insert(attachments).values([
      {
        id: "00000000-0000-4000-8000-000000000101",
        messageId: directMessage.id,
        channelId: channel.id,
        uploaderId: owner.id,
        uploaderType: "user",
        filename: "direct.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1234,
        storageKey: "attachments/direct.pdf",
        createdAt: older,
      },
      {
        id: "00000000-0000-4000-8000-000000000102",
        messageId: threadMessage.id,
        channelId: thread.id,
        uploaderId: owner.id,
        uploaderType: "user",
        filename: "thread.png",
        mimeType: "image/png",
        sizeBytes: 5678,
        storageKey: "attachments/thread.png",
        thumbnailKey: "thumbs/thread.webp",
        createdAt: newer,
      },
    ]);

    const token = await login(app.baseUrl, "files-owner@slock.test");
    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/files`, {
      headers: headers(token, server.id),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { files: any[]; nextCursor: string | null };
    assert.equal(body.files.length, 2);
    assert.deepEqual(body.files.map((file) => file.filename), ["thread.png", "direct.pdf"]);
    assert.equal(body.nextCursor, null);

    const threadFile = body.files[0];
    assert.equal(threadFile.messageId, threadMessage.id);
    assert.equal(threadFile.source.type, "thread");
    assert.equal(threadFile.source.channelId, thread.id);
    assert.equal(threadFile.source.parentMessageId, parentMessage.id);
    assert.equal(threadFile.source.parentMessageShortId, parentMessage.id.slice(0, 8));
    assert.equal(threadFile.uploader.name, "files-owner");

    const directFile = body.files[1];
    assert.equal(directFile.messageId, directMessage.id);
    assert.equal(directFile.source.type, "channel");
    assert.equal(directFile.source.channelId, channel.id);
    assert.equal(directFile.source.parentMessageId, null);

    const cutoffFiles = await listChannelFiles(channel.id, { historyCutoff: new Date("2026-05-10T10:30:00Z") });
    assert.deepEqual(cutoffFiles.map((file) => file.filename), ["thread.png"]);

    const firstPage = await fetch(`${app.baseUrl}/api/channels/${channel.id}/files?limit=1`, {
      headers: headers(token, server.id),
    });
    assert.equal(firstPage.status, 200);
    const firstPageBody = await firstPage.json() as { files: any[]; nextCursor: string | null };
    assert.deepEqual(firstPageBody.files.map((file) => file.filename), ["thread.png"]);
    assert.equal(typeof firstPageBody.nextCursor, "string");

    const secondPage = await fetch(`${app.baseUrl}/api/channels/${channel.id}/files?limit=1&cursor=${encodeURIComponent(firstPageBody.nextCursor!)}`, {
      headers: headers(token, server.id),
    });
    assert.equal(secondPage.status, 200);
    const secondPageBody = await secondPage.json() as { files: any[]; nextCursor: string | null };
    assert.deepEqual(secondPageBody.files.map((file) => file.filename), ["direct.pdf"]);
    assert.equal(secondPageBody.nextCursor, null);
  } finally {
    await app.close();
  }
});

test("GET /api/channels/:id/files rejects private channel non-members", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const owner = await seedUser("files-private-owner@slock.test", "files-private-owner");
    const outsider = await seedUser("files-private-outsider@slock.test", "files-private-outsider");
    const server = await createServer("Private Files Test", "private-files-test", owner.id);
    await db.insert(serverMembers).values({ serverId: server.id, userId: outsider.id, role: "member" });
    const channel = await createChannel(server.id, "secret-files", undefined, "private");
    await addHuman(channel.id, owner.id);
    const message = await createMessage(channel.id, "user", owner.id, "private attachment");
    await db.insert(attachments).values({
      messageId: message.id,
      channelId: channel.id,
      uploaderId: owner.id,
      uploaderType: "user",
      filename: "secret.txt",
      mimeType: "text/plain",
      sizeBytes: 10,
      storageKey: "attachments/secret.txt",
    });

    const token = await login(app.baseUrl, "files-private-outsider@slock.test");
    const res = await fetch(`${app.baseUrl}/api/channels/${channel.id}/files`, {
      headers: headers(token, server.id),
    });
    assert.equal(res.status, 403);
  } finally {
    await app.close();
  }
});
