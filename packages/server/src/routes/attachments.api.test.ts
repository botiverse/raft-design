import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { attachments, users } from "../db/schema.js";
import { assignMachine, createAgent } from "../services/agentService.js";
import { registerMachine } from "../services/machineService.js";
import { createServer } from "../services/serverService.js";
import { addAgent, createChannel } from "../services/channelService.js";
import { resetStorageForTests } from "../services/storageService.js";
import {
  ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
  MAX_ATTACHMENT_FILE_SIZE_BYTES,
  isHtmlAttachmentMimeType,
  resolveAttachmentMimeType,
  shouldStreamAttachmentThroughServerForRequest,
} from "./attachments.js";

/**
 * Regression tests for #proj-security task #10 (2026-04-19):
 *
 *   Prior to this fix, an authenticated user on server A could download an
 *   attachment UUID belonging to server B, because `canUserAccessChannel`
 *   returned true for any `type="channel"` without a serverId check, and the
 *   `/api/attachments/:id{/url}` download endpoints ran under `requireFlexAuth`
 *   alone (no `requireServer`). The fix:
 *     - `canUserAccessChannel` now takes a mandatory `serverId` and rejects
 *       channels that don't belong to it.
 *     - `requireServerForFlex` middleware enforces X-Server-Id (or `serverId`
 *       query param) + membership for user-auth on the attachment router.
 *
 * These tests assert both legs of the cross-server attack are now blocked.
 */

async function login(baseUrl: string, email: string, password = "password123") {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 200, `login for ${email} expected 200`);
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

async function seedCrossServerFixture() {
  const db = getDb();

  const [userA] = await db
    .insert(users)
    .values({
      email: "cross-server-a@slock.test",
      name: "cross-server-a",
      displayName: "A",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();

  const [userB] = await db
    .insert(users)
    .values({
      email: "cross-server-b@slock.test",
      name: "cross-server-b",
      displayName: "B",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();

  const serverA = await createServer("Alpha", "cross-server-alpha", userA.id);
  const serverB = await createServer("Bravo", "cross-server-bravo", userB.id);

  const channelB = await createChannel(serverB.id, "secret-b", "channel");

  const attachmentId = "00000000-0000-4000-8000-000000000001";
  await db.insert(attachments).values({
    id: attachmentId,
    channelId: channelB.id,
    uploaderId: userB.id,
    uploaderType: "user",
    filename: "secret.txt",
    mimeType: "text/plain",
    sizeBytes: 42,
    storageKey: `${serverB.id}/secret.txt`,
    thumbnailKey: null,
    contentHash: "deadbeef",
  });

  return {
    userA,
    userB,
    serverA,
    serverB,
    channelB,
    attachmentId,
  };
}

function signPreviewLikeToken(
  claims: {
    attachmentId: string;
    serverId: string;
    actorId: string;
    audience?: string;
    type?: string;
  },
  expiresIn: jwt.SignOptions["expiresIn"] = "5m",
) {
  const secret = process.env.JWT_SECRET;
  assert.ok(secret, "test harness should configure JWT_SECRET");
  return jwt.sign({
    sub: claims.actorId,
    type: claims.type ?? "attachment-html-preview",
    attachmentId: claims.attachmentId,
    serverId: claims.serverId,
    actorType: "user",
    actorId: claims.actorId,
  }, secret, {
    expiresIn,
    audience: claims.audience ?? "attachment-html-preview",
    issuer: "slock-server",
  });
}

test("GET /api/attachments/:id rejects cross-server access via UUID", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, serverA, attachmentId } = await seedCrossServerFixture();
    const tokenA = await login(app.baseUrl, userA.email);

    // User A asks for server B's attachment while claiming server A active.
    // Expected: 403. Pre-fix, this returned 302/200 (leak).
    const res = await fetch(`${app.baseUrl}/api/attachments/${attachmentId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "X-Server-Id": serverA.id,
      },
      redirect: "manual",
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id/url rejects cross-server access via UUID", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, serverA, attachmentId } = await seedCrossServerFixture();
    const tokenA = await login(app.baseUrl, userA.email);

    const res = await fetch(`${app.baseUrl}/api/attachments/${attachmentId}/url`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "X-Server-Id": serverA.id,
      },
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id rejects missing X-Server-Id header", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, attachmentId } = await seedCrossServerFixture();
    const tokenA = await login(app.baseUrl, userA.email);

    const res = await fetch(`${app.baseUrl}/api/attachments/${attachmentId}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    // requireServerForFlex rejects missing scope before the resource lookup.
    assert.equal(res.status, 400, `expected 400, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id rejects X-Server-Id the user is not a member of", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, serverB, attachmentId } = await seedCrossServerFixture();
    const tokenA = await login(app.baseUrl, userA.email);

    // User A lies about being in server B. Membership check fails.
    const res = await fetch(`${app.baseUrl}/api/attachments/${attachmentId}`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "X-Server-Id": serverB.id,
      },
      redirect: "manual",
    });
    assert.equal(res.status, 403, `expected 403, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id accepts serverId from query (for <img src> fallback)", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, attachmentId } = await seedCrossServerFixture();
    const tokenB = await login(app.baseUrl, userB.email);

    // User B on server B reads their own attachment with serverId from query.
    // Local storage is not configured in the pglite harness, so the
    // download-stream path returns 503 — but we only care that auth+scope
    // passed before the storage layer ran.
    const res = await fetch(
      `${app.baseUrl}/api/attachments/${attachmentId}?serverId=${serverB.id}&token=${tokenB}`,
      { redirect: "manual" },
    );
    assert.notEqual(res.status, 400, "should not reject on missing scope");
    assert.notEqual(res.status, 403, "should not reject on membership");
    assert.notEqual(res.status, 404, "attachment should be found");
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id serves both image and pdf attachments from local storage", async () => {
  const previousUploadsDir = process.env.UPLOADS_DIR;
  const previousUploadsLocal = process.env.UPLOADS_LOCAL;
  const uploadsDir = fs.mkdtempSync(path.join(os.tmpdir(), "attachments-serve-"));
  process.env.UPLOADS_DIR = uploadsDir;
  process.env.UPLOADS_LOCAL = "true";
  resetStorageForTests();

  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const [user] = await db
      .insert(users)
      .values({
        email: "attachment-serve@slock.test",
        name: "attachment-serve",
        displayName: "Attachment Serve",
        passwordHash: await argon2.hash("password123"),
        emailVerified: true,
      })
      .returning();

    const server = await createServer("Attachment Serve", "attachment-serve", user.id);
    const channel = await createChannel(server.id, "serve-test", "channel");
    const token = await login(app.baseUrl, user.email);

    const imageId = "00000000-0000-4000-8000-000000000011";
    const pdfId = "00000000-0000-4000-8000-000000000012";
    fs.mkdirSync(path.join(uploadsDir, server.id), { recursive: true });
    const imageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xd9]);
    const pdfBuffer = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF\n");
    fs.writeFileSync(path.join(uploadsDir, server.id, `${imageId}.jpg`), imageBuffer);
    fs.writeFileSync(path.join(uploadsDir, server.id, `${pdfId}.pdf`), pdfBuffer);

    await db.insert(attachments).values([
      {
        id: imageId,
        channelId: channel.id,
        uploaderId: user.id,
        uploaderType: "user",
        filename: "image.jpg",
        mimeType: "image/jpeg",
        sizeBytes: imageBuffer.length,
        storageKey: `${server.id}/${imageId}.jpg`,
        thumbnailKey: null,
        contentHash: "hash-image",
      },
      {
        id: pdfId,
        channelId: channel.id,
        uploaderId: user.id,
        uploaderType: "user",
        filename: "doc.pdf",
        mimeType: "application/pdf",
        sizeBytes: pdfBuffer.length,
        storageKey: `${server.id}/${pdfId}.pdf`,
        thumbnailKey: null,
        contentHash: "hash-pdf",
      },
    ]);

    const imageRes = await fetch(`${app.baseUrl}/api/attachments/${imageId}`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });
    const pdfRes = await fetch(`${app.baseUrl}/api/attachments/${pdfId}`, {
      headers: { Authorization: `Bearer ${token}`, "X-Server-Id": server.id },
    });

    assert.equal(imageRes.status, 200);
    assert.equal(imageRes.headers.get("content-type"), "image/jpeg");
    assert.match(imageRes.headers.get("content-disposition") ?? "", /^inline;/);
    assert.deepEqual(Buffer.from(await imageRes.arrayBuffer()), imageBuffer);

    assert.equal(pdfRes.status, 200);
    assert.equal(pdfRes.headers.get("content-type"), "application/pdf");
    assert.match(pdfRes.headers.get("content-disposition") ?? "", /^attachment;/);
    assert.deepEqual(Buffer.from(await pdfRes.arrayBuffer()), pdfBuffer);
  } finally {
    await app.close();
    resetStorageForTests();
    if (previousUploadsDir === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = previousUploadsDir;
    if (previousUploadsLocal === undefined) delete process.env.UPLOADS_LOCAL;
    else process.env.UPLOADS_LOCAL = previousUploadsLocal;
    fs.rmSync(uploadsDir, { recursive: true, force: true });
  }
});

test("download-as-image attachment requests force same-origin streaming instead of presigned redirect", () => {
  assert.equal(shouldStreamAttachmentThroughServerForRequest({ query: { selectScreenshot: "1" } }), true);
  assert.equal(shouldStreamAttachmentThroughServerForRequest({ query: { selectScreenshot: "0" } }), false);
  assert.equal(shouldStreamAttachmentThroughServerForRequest({ query: {} }), false);
});

test("POST /api/attachments/upload rejects zero-byte files", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const tokenB = await login(app.baseUrl, userB.email);
    const body = new FormData();
    body.append("channelId", channelB.id);
    body.append("files", new Blob([], { type: "image/png" }), "empty.png");

    const res = await fetch(`${app.baseUrl}/api/attachments/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
      body,
    });
    assert.equal(res.status, 400, `expected 400, got ${res.status}`);
    assert.deepEqual(await res.json(), { error: "Empty files are not allowed" });
  } finally {
    await app.close();
  }
});

test("POST /api/attachments/upload rejects files over 50MB", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const tokenB = await login(app.baseUrl, userB.email);
    const body = new FormData();
    body.append("channelId", channelB.id);
    body.append("files", new Blob([Buffer.alloc(MAX_ATTACHMENT_FILE_SIZE_BYTES + 1)], { type: "application/octet-stream" }), "oversized.bin");

    const res = await fetch(`${app.baseUrl}/api/attachments/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
      body,
    });
    assert.equal(res.status, 413, `expected 413, got ${res.status}`);
    assert.deepEqual(await res.json(), {
      error: "Max 50MB per file",
      errorCode: "ATTACHMENT_TOO_LARGE",
      maxBytes: MAX_ATTACHMENT_FILE_SIZE_BYTES,
    });
  } finally {
    await app.close();
  }
});

test("ATTACHMENT_UPLOAD_ENABLED=false disables human and agent uploads", async () => {
  const previous = process.env.ATTACHMENT_UPLOAD_ENABLED;
  process.env.ATTACHMENT_UPLOAD_ENABLED = "false";
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const tokenB = await login(app.baseUrl, userB.email);

    const humanBody = new FormData();
    humanBody.append("channelId", channelB.id);
    humanBody.append("files", new Blob([Buffer.from("hello")], { type: "text/plain" }), "hello.txt");
    const humanRes = await fetch(`${app.baseUrl}/api/attachments/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
      body: humanBody,
    });
    assert.equal(humanRes.status, 503, `expected human upload 503, got ${humanRes.status}`);
    assert.deepEqual(await humanRes.json(), {
      error: ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
      errorCode: "ATTACHMENT_UPLOAD_DISABLED",
    });

    const agent = await createAgent(serverB.id, "attachment-disabled-agent", { runtime: "codex" });
    const { machine, apiKey } = await registerMachine(serverB.id, userB.id, "attachment-disabled-machine");
    await assignMachine(agent.id, machine.id);
    await addAgent(channelB.id, agent.id);

    const agentBody = new FormData();
    agentBody.append("channelId", channelB.id);
    agentBody.append("file", new Blob([Buffer.from("hello")], { type: "text/plain" }), "hello.txt");
    const agentRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: agentBody,
    });
    assert.equal(agentRes.status, 503, `expected agent upload 503, got ${agentRes.status}`);
    assert.deepEqual(await agentRes.json(), {
      error: ATTACHMENT_UPLOAD_DISABLED_MESSAGE,
      errorCode: "ATTACHMENT_UPLOAD_DISABLED",
    });
  } finally {
    if (previous === undefined) delete process.env.ATTACHMENT_UPLOAD_ENABLED;
    else process.env.ATTACHMENT_UPLOAD_ENABLED = previous;
    await app.close();
  }
});

test("GET /api/attachments/:id/url two-hop flow: query-token caller gets a URL carrying the query token", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, attachmentId } = await seedCrossServerFixture();
    const tokenB = await login(app.baseUrl, userB.email);

    // Hop 1: `<img src>` / fresh-tab callers cannot set Authorization. The
    // attachment service sends them to `/:id/url?token=...&serverId=...`.
    // Local storage is not configured in the pglite harness, so `/:id/url`
    // returns an absolute streaming URL (not a presigned CDN URL). That
    // returned URL MUST carry the token that got us through hop 1, or hop 2
    // re-fails with 401. (Regression guard for Cody's review on PR #945.)
    const hop1 = await fetch(
      `${app.baseUrl}/api/attachments/${attachmentId}/url?serverId=${serverB.id}&token=${tokenB}`,
    );
    assert.equal(hop1.status, 200, `hop 1 expected 200, got ${hop1.status}`);
    const { url: streamUrl, expiresAt } = (await hop1.json()) as { url: string; expiresAt: string | null };
    assert.equal(expiresAt, null, "local streaming URLs should be cacheable without a presigned expiry");

    const parsed = new URL(streamUrl);
    assert.equal(parsed.searchParams.get("token"), tokenB, "hop 1 must propagate query token to the stream URL");
    assert.equal(parsed.searchParams.get("serverId"), serverB.id, "hop 1 must propagate serverId to the stream URL");

    // Hop 2: fetch the URL that hop 1 handed back. Auth/scope must still
    // pass (we're not checking the body — local storage will 503 in pglite,
    // but auth runs before storage). The key assertion is: not 401 / 400 / 403.
    const hop2 = await fetch(streamUrl, { redirect: "manual" });
    assert.notEqual(hop2.status, 401, "hop 2 must not reject on auth");
    assert.notEqual(hop2.status, 400, "hop 2 must not reject on scope");
    assert.notEqual(hop2.status, 403, "hop 2 must not reject on membership");
    assert.notEqual(hop2.status, 404, "hop 2 must find the attachment");
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id/html-preview-url returns scoped preview URL for HTML", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const htmlAttachmentId = "00000000-0000-4000-8000-0000000000ff";
    await db.insert(attachments).values({
      id: htmlAttachmentId,
      channelId: channelB.id,
      uploaderId: userB.id,
      uploaderType: "user",
      filename: "diagram.html",
      mimeType: "application/octet-stream",
      sizeBytes: 64,
      storageKey: `${serverB.id}/diagram.html`,
      thumbnailKey: null,
      contentHash: "feedface",
    });
    const tokenB = await login(app.baseUrl, userB.email);

    const res = await fetch(`${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview-url`, {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
    });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    const { url, expiresAt } = (await res.json()) as { url: string; expiresAt: string };
    assert.ok(Date.parse(expiresAt) > Date.now(), "preview token should have a future expiry");

    const parsed = new URL(url);
    assert.equal(parsed.pathname, `/api/attachments/${htmlAttachmentId}/html-preview`);
    assert.equal(parsed.searchParams.get("token"), null, "must not leak the user's bearer token in iframe URL");
    assert.ok(parsed.searchParams.get("previewToken"), "expected scoped preview token");
    assert.notEqual(parsed.searchParams.get("previewToken"), tokenB);
    assert.equal(parsed.searchParams.get("serverId"), serverB.id);

    // Local storage is not seeded in this harness. A 500 here proves the
    // scoped preview token got past auth and failed only at the storage layer.
    const previewRes = await fetch(url, { redirect: "manual" });
    assert.equal(previewRes.status, 500, `expected valid preview token to reach storage, got ${previewRes.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id/html-preview-url scoped token cannot be reused for another attachment", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const firstAttachmentId = "00000000-0000-4000-8000-0000000000a1";
    const secondAttachmentId = "00000000-0000-4000-8000-0000000000a2";
    await db.insert(attachments).values([
      {
        id: firstAttachmentId,
        channelId: channelB.id,
        uploaderId: userB.id,
        uploaderType: "user",
        filename: "first.html",
        mimeType: "text/html",
        sizeBytes: 64,
        storageKey: `${serverB.id}/first.html`,
        thumbnailKey: null,
        contentHash: "feedface01",
      },
      {
        id: secondAttachmentId,
        channelId: channelB.id,
        uploaderId: userB.id,
        uploaderType: "user",
        filename: "second.html",
        mimeType: "text/html",
        sizeBytes: 64,
        storageKey: `${serverB.id}/second.html`,
        thumbnailKey: null,
        contentHash: "feedface02",
      },
    ]);
    const tokenB = await login(app.baseUrl, userB.email);

    const firstUrlRes = await fetch(`${app.baseUrl}/api/attachments/${firstAttachmentId}/html-preview-url`, {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
    });
    assert.equal(firstUrlRes.status, 200, `expected 200, got ${firstUrlRes.status}`);
    const { url } = (await firstUrlRes.json()) as { url: string };
    const previewToken = new URL(url).searchParams.get("previewToken");
    assert.ok(previewToken, "expected scoped preview token");

    const crossAttachmentRes = await fetch(
      `${app.baseUrl}/api/attachments/${secondAttachmentId}/html-preview?serverId=${serverB.id}&previewToken=${previewToken}`,
      { redirect: "manual" },
    );
    assert.equal(crossAttachmentRes.status, 401, `expected scoped token mismatch to 401, got ${crossAttachmentRes.status}`);
  } finally {
    await app.close();
  }
});

test("HTML preview token cannot authorize normal attachment download or URL endpoints", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const htmlAttachmentId = "00000000-0000-4000-8000-0000000000c1";
    await db.insert(attachments).values({
      id: htmlAttachmentId,
      channelId: channelB.id,
      uploaderId: userB.id,
      uploaderType: "user",
      filename: "scoped.html",
      mimeType: "text/html",
      sizeBytes: 64,
      storageKey: `${serverB.id}/scoped.html`,
      thumbnailKey: null,
      contentHash: "feedface04",
    });
    const tokenB = await login(app.baseUrl, userB.email);

    const previewUrlRes = await fetch(`${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview-url`, {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
    });
    assert.equal(previewUrlRes.status, 200, `expected 200, got ${previewUrlRes.status}`);
    const { url } = (await previewUrlRes.json()) as { url: string };
    const previewToken = new URL(url).searchParams.get("previewToken");
    assert.ok(previewToken, "expected scoped preview token");

    const downloadRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}?serverId=${serverB.id}&previewToken=${previewToken}`,
      { redirect: "manual" },
    );
    assert.equal(downloadRes.status, 401, `expected preview token not to authorize download, got ${downloadRes.status}`);

    const urlRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/url?serverId=${serverB.id}&previewToken=${previewToken}`,
      { redirect: "manual" },
    );
    assert.equal(urlRes.status, 401, `expected preview token not to authorize /url, got ${urlRes.status}`);

    const refreshRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview-url?serverId=${serverB.id}&previewToken=${previewToken}`,
      { redirect: "manual" },
    );
    assert.equal(
      refreshRes.status,
      401,
      `expected leaked preview token not to mint a fresh preview URL, got ${refreshRes.status}`,
    );
  } finally {
    await app.close();
  }
});

test("HTML preview token rejects expired and wrong-audience tokens", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const htmlAttachmentId = "00000000-0000-4000-8000-0000000000c2";
    await db.insert(attachments).values({
      id: htmlAttachmentId,
      channelId: channelB.id,
      uploaderId: userB.id,
      uploaderType: "user",
      filename: "invalid-token.html",
      mimeType: "text/html",
      sizeBytes: 64,
      storageKey: `${serverB.id}/invalid-token.html`,
      thumbnailKey: null,
      contentHash: "feedface05",
    });

    const expiredToken = signPreviewLikeToken({
      attachmentId: htmlAttachmentId,
      serverId: serverB.id,
      actorId: userB.id,
    }, -1);
    const expiredRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview?serverId=${serverB.id}&previewToken=${expiredToken}`,
      { redirect: "manual" },
    );
    assert.equal(expiredRes.status, 401, `expected expired preview token to 401, got ${expiredRes.status}`);

    const wrongAudienceToken = signPreviewLikeToken({
      attachmentId: htmlAttachmentId,
      serverId: serverB.id,
      actorId: userB.id,
      audience: "attachment-download",
    });
    const wrongAudienceRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview?serverId=${serverB.id}&previewToken=${wrongAudienceToken}`,
      { redirect: "manual" },
    );
    assert.equal(wrongAudienceRes.status, 401, `expected wrong-audience preview token to 401, got ${wrongAudienceRes.status}`);

    const wrongTypeToken = signPreviewLikeToken({
      attachmentId: htmlAttachmentId,
      serverId: serverB.id,
      actorId: userB.id,
      type: "access",
    });
    const wrongTypeRes = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview?serverId=${serverB.id}&previewToken=${wrongTypeToken}`,
      { redirect: "manual" },
    );
    assert.equal(wrongTypeRes.status, 401, `expected wrong-type preview token to 401, got ${wrongTypeRes.status}`);
  } finally {
    await app.close();
  }
});

test("HTML preview response rejects leaked user bearer token query after URL minting", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const htmlAttachmentId = "00000000-0000-4000-8000-0000000000b1";
    await db.insert(attachments).values({
      id: htmlAttachmentId,
      channelId: channelB.id,
      uploaderId: userB.id,
      uploaderType: "user",
      filename: "bearer.html",
      mimeType: "text/html",
      sizeBytes: 64,
      storageKey: `${serverB.id}/bearer.html`,
      thumbnailKey: null,
      contentHash: "feedface03",
    });
    const tokenB = await login(app.baseUrl, userB.email);

    const res = await fetch(
      `${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview?serverId=${serverB.id}&token=${tokenB}`,
      { redirect: "manual" },
    );
    assert.equal(res.status, 403, `expected user bearer query token not to authorize HTML preview, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id/html-preview-url checks access before previewability", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, serverA, attachmentId } = await seedCrossServerFixture();
    const tokenA = await login(app.baseUrl, userA.email);

    const res = await fetch(`${app.baseUrl}/api/attachments/${attachmentId}/html-preview-url`, {
      headers: {
        Authorization: `Bearer ${tokenA}`,
        "X-Server-Id": serverA.id,
      },
    });
    assert.equal(res.status, 403, `expected 403 before MIME checks, got ${res.status}`);
  } finally {
    await app.close();
  }
});

test("canUserAccessChannel returns false when channel belongs to another server", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { userA, userB, serverA, channelB } = await seedCrossServerFixture();

    const { canUserAccessChannel } = await import("../services/channelService.js");

    // User A (server A member) asking about channel in server B, claiming
    // server A as active — must refuse (cross-server guard).
    assert.equal(
      await canUserAccessChannel(channelB.id, userA.id, serverA.id),
      false,
      "cross-server access should be refused",
    );

    // Same user looking at the same channel but claiming server B — still
    // refused because userA is not a member of server B. (The serverMembers
    // check happens upstream; this just proves the function doesn't
    // over-admit.)
    // User B legitimately accessing channel B on server B — should pass.
    assert.equal(
      await canUserAccessChannel(channelB.id, userB.id, channelB.serverId),
      true,
      "same-server access should be allowed",
    );
  } finally {
    await app.close();
  }
});

test("GET /api/attachments/:id/html-preview allows configured web origin framing", async () => {
  const app = await startTestApp("pglite://");
  let filePath: string | null = null;
  try {
    const { userB, serverB, channelB } = await seedCrossServerFixture();
    const db = getDb();
    const htmlAttachmentId = "00000000-0000-4000-8000-0000000000fe";
    const storageKey = `${serverB.id}/preview-frame.html`;
    const html = "<!doctype html><html><body><script>document.body.dataset.ok='1'</script>ok</body></html>";
    filePath = path.resolve(process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads"), storageKey);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html);
    await db.insert(attachments).values({
      id: htmlAttachmentId,
      channelId: channelB.id,
      uploaderId: userB.id,
      uploaderType: "user",
      filename: "preview-frame.html",
      mimeType: "text/html",
      sizeBytes: Buffer.byteLength(html),
      storageKey,
      thumbnailKey: null,
      contentHash: "feedface2",
    });
    const tokenB = await login(app.baseUrl, userB.email);

    const previewUrlRes = await fetch(`${app.baseUrl}/api/attachments/${htmlAttachmentId}/html-preview-url`, {
      headers: {
        Authorization: `Bearer ${tokenB}`,
        "X-Server-Id": serverB.id,
      },
    });
    assert.equal(previewUrlRes.status, 200, `expected preview URL 200, got ${previewUrlRes.status}`);
    const { url } = (await previewUrlRes.json()) as { url: string };

    const res = await fetch(url, { redirect: "manual" });
    assert.equal(res.status, 200, `expected 200, got ${res.status}`);
    assert.equal(res.headers.get("x-frame-options"), null, "HTML preview must not inherit Helmet SAMEORIGIN");
    assert.match(
      res.headers.get("content-security-policy") || "",
      /frame-ancestors 'self' http:\/\/127\.0\.0\.1:4173/,
    );
    assert.equal(await res.text(), html);
  } finally {
    if (filePath) fs.rmSync(filePath, { force: true });
    await app.close();
  }
});

test("HTML preview MIME helper handles charset suffixes", () => {
  assert.equal(isHtmlAttachmentMimeType(resolveAttachmentMimeType("report.html", "text/html; charset=utf-8")), true);
});
