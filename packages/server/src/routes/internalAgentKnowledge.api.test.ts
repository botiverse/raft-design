import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import argon2 from "argon2";
import { desc, eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { agentKnowledgeEvents, users } from "../db/schema.js";
import { sanitizeAgentKnowledgeContent } from "../services/agentKnowledgeService.js";
import { createAgent } from "../services/agentService.js";
import { mintAgentCredential, type AgentCapability } from "../services/agentCredentialService.js";
import { createServer } from "../services/serverService.js";
import { startTestApp } from "../test/testAppHarness.js";

type Fixture = {
  agentId: string;
  serverId: string;
  apiKey: string;
  readOnlyApiKey: string;
};

function agentHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Slock-Client": "cli",
  };
}

async function mintAgentKey(agentId: string, scopes: readonly AgentCapability[]): Promise<string> {
  const minted = await mintAgentCredential({
    agentId,
    scopes,
    name: `knowledge-test-${scopes.join("-")}`,
    createdByUserId: null,
  });
  return minted.apiKey;
}

async function seedFixture(): Promise<Fixture> {
  const db = getDb();
  const suffix = randomUUID();
  const [owner] = await db.insert(users).values({
    email: `agent-knowledge-${suffix}@slock.test`,
    name: `agent-knowledge-${suffix}`,
    displayName: "Agent Knowledge Owner",
    passwordHash: await argon2.hash("password123"),
    emailVerified: true,
  }).returning();

  const server = await createServer("Agent Knowledge Test", `agent-knowledge-${suffix}`, owner.id);
  const agent = await createAgent(server.id, "AgentKnowledgeBot", { runtime: "claude", model: "sonnet" });

  return {
    agentId: agent.id,
    serverId: server.id,
    apiKey: await mintAgentKey(agent.id, ["knowledge"]),
    readOnlyApiKey: await mintAgentKey(agent.id, ["read"]),
  };
}

async function latestKnowledgeEvent() {
  const [event] = await getDb()
    .select()
    .from(agentKnowledgeEvents)
    .orderBy(desc(agentKnowledgeEvents.requestedAt))
    .limit(1);
  return event;
}

test("agent-api knowledge get returns a versioned doc and emits metadata-only event", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const reason = "Need workspace home guidance";
    const res = await fetch(
      `${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home&turn_id=turn-1&trace_id=trace-1&reason=${encodeURIComponent(reason)}`,
      { headers: agentHeaders(fixture.apiKey) },
    );

    assert.equal(res.status, 200);
    const body = await res.json() as {
      ok?: boolean;
      docId?: string;
      docVersion?: string;
      docState?: string;
      content?: string;
    };
    assert.equal(body.ok, true);
    assert.equal(body.docId, "slock-home");
    assert.match(body.docVersion ?? "", /^sha256:[0-9a-f]{16}$/);
    assert.equal(body.docState, "published");
    assert.ok(body.content && body.content.length > 0);

    const event = await latestKnowledgeEvent();
    assert.ok(event);
    assert.equal(event.agentId, fixture.agentId);
    assert.equal(event.serverId, fixture.serverId);
    assert.equal(event.docId, "slock-home");
    assert.equal(event.topicOrPath, "slock-home");
    assert.equal(event.docVersion, body.docVersion);
    assert.equal(event.docState, "published");
    assert.equal(event.source, "cli");
    assert.equal(event.status, "success");
    assert.equal(event.turnId, "turn-1");
    assert.equal(event.traceId, "trace-1");
    assert.equal(event.reason, reason);
    assert.equal(event.responseBytes, Buffer.byteLength(body.content, "utf8"));
    assert.equal(JSON.stringify(event).includes(body.content.slice(0, 20)), false);
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get emits not_found without doc version", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=missing-topic`, {
      headers: agentHeaders(fixture.apiKey),
    });

    assert.equal(res.status, 404);
    const body = await res.json() as { code?: string };
    assert.equal(body.code, "knowledge_not_found");

    const event = await latestKnowledgeEvent();
    assert.ok(event);
    assert.equal(event.agentId, fixture.agentId);
    assert.equal(event.topicOrPath, "missing-topic");
    assert.equal(event.status, "not_found");
    assert.equal(event.docId, null);
    assert.equal(event.docVersion, null);
    assert.equal(event.docState, null);
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get resolves imported agent knowledge docs by doc id and path alias", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    for (const topic of ["server", "agent-knowledge/server", "docs/agent-knowledge/server"]) {
      const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=${encodeURIComponent(topic)}`, {
        headers: agentHeaders(fixture.apiKey),
      });

      assert.equal(res.status, 200);
      const body = await res.json() as {
        ok?: boolean;
        docId?: string;
        docVersion?: string;
        docState?: string;
        contentType?: string;
        content?: string;
      };
      assert.equal(body.ok, true);
      assert.equal(body.docId, "server");
      assert.match(body.docVersion ?? "", /^sha256:[0-9a-f]{16}$/);
      assert.equal(body.docState, "published");
      assert.equal(body.contentType, "text/mdx");
      assert.match(body.content ?? "", /doc_id: server/);
      assert.doesNotMatch(body.content ?? "", /Verified against/);
    }
  } finally {
    await app.close();
  }
});

test("sanitizeAgentKnowledgeContent strips MDX comments outside fenced code blocks only", () => {
  const source = [
    "---",
    "doc_id: mdx-comments",
    "---",
    "{/* source-only verification metadata */}",
    "Visible before fence.",
    "```mdx",
    "{/* this stays as an example */}",
    "```",
    "{/* another source-only comment */}",
    "Visible after fence.",
    "",
  ].join("\n");

  const sanitized = sanitizeAgentKnowledgeContent(source);
  assert.doesNotMatch(sanitized, /source-only verification metadata/);
  assert.doesNotMatch(sanitized, /another source-only comment/);
  assert.match(sanitized, /\{\/\* this stays as an example \*\/\}/);
  assert.match(sanitized, /Visible before fence/);
  assert.match(sanitized, /Visible after fence/);
});

test("agent-api knowledge get accepts turn and trace ids from headers", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home`, {
      headers: {
        ...agentHeaders(fixture.apiKey),
        "X-Slock-Turn-Id": "turn-header",
        "X-Slock-Trace-Id": "trace-header",
      },
    });

    assert.equal(res.status, 200);
    const event = await latestKnowledgeEvent();
    assert.ok(event);
    assert.equal(event.turnId, "turn-header");
    assert.equal(event.traceId, "trace-header");
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get rejects conflicting query and header correlation ids", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home&turn_id=query-turn`, {
      headers: {
        ...agentHeaders(fixture.apiKey),
        "X-Slock-Turn-Id": "header-turn",
      },
    });

    assert.equal(res.status, 400);
    const body = await res.json() as { code?: string; error?: string };
    assert.equal(body.code, "knowledge_turn_id_invalid");
    assert.match(body.error ?? "", /disagree/);
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get requires knowledge capability", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home`, {
      headers: agentHeaders(fixture.readOnlyApiKey),
    });

    assert.equal(res.status, 403);
    const body = await res.json() as { code?: string; requiredCapability?: string };
    assert.equal(body.code, "capability_not_authorized");
    assert.equal(body.requiredCapability, "knowledge");

    const events = await getDb().select().from(agentKnowledgeEvents).where(eq(agentKnowledgeEvents.agentId, fixture.agentId));
    assert.equal(events.length, 0);
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get rejects raw payload rationale", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const rawReason = "[target=#secret msg=abcdef12] @human: raw quoted message";
    const res = await fetch(
      `${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home&reason=${encodeURIComponent(rawReason)}`,
      { headers: agentHeaders(fixture.apiKey) },
    );

    assert.equal(res.status, 400);
    const body = await res.json() as { code?: string; error?: string };
    assert.equal(body.code, "knowledge_reason_invalid");
    assert.match(body.error ?? "", /raw Slock message headers/);
  } finally {
    await app.close();
  }
});

test("agent-api knowledge get rejects non-CLI source", async () => {
  const app = await startTestApp("pglite://");
  try {
    const fixture = await seedFixture();
    const headers = agentHeaders(fixture.apiKey);
    delete headers["X-Slock-Client"];
    const res = await fetch(`${app.baseUrl}/internal/agent-api/knowledge?topic=slock-home`, { headers });

    assert.equal(res.status, 400);
    const body = await res.json() as { code?: string };
    assert.equal(body.code, "knowledge_source_invalid");
  } finally {
    await app.close();
  }
});
