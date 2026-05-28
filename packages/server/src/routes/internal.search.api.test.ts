import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import argon2 from "argon2";

import { getDb } from "../db/index.js";
import { agents, serverMembers, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createAgent, assignMachine } from "../services/agentService.js";
import { createChannel } from "../services/channelService.js";
import { createMessage } from "../services/messageService.js";
import { registerMachine } from "../services/machineService.js";
import { createServer } from "../services/serverService.js";

const execFileAsync = promisify(execFile);
const cliEntry = fileURLToPath(new URL("../../../cli/src/index.ts", import.meta.url));

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

async function seedSearchFixture() {
  const db = getDb();
  const owner = await seedUser("search-ref-owner@slock.test", "search-ref-owner");
  const speaker = await seedUser("search-ref-speaker@slock.test", "search-ref-speaker");
  const server = await createServer("Search Ref Server", "search-ref-server", owner.id);
  await db.insert(serverMembers).values({ serverId: server.id, userId: speaker.id, role: "member" }).onConflictDoNothing();
  const agent = await createAgent(server.id, "search-ref-agent", { runtime: "codex" });
  const { machine, apiKey } = await registerMachine(server.id, owner.id, "search-ref-machine");
  await assignMachine(agent.id, machine.id);
  const channel = await createChannel(server.id, "search-ref-channel");

  const ownerMessage = await createMessage(channel.id, "user", owner.id, "memberref owner zebraneedle");
  const speakerMessage = await createMessage(channel.id, "user", speaker.id, "memberref speaker zebraneedle");

  return { owner, speaker, server, agent, apiKey, channel, ownerMessage, speakerMessage };
}

function machineHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function runSlockCli(
  args: string[],
  env: Record<string, string>,
): Promise<{ stdout: string; stderr: string }> {
  return execFileAsync(process.execPath, ["--import", "tsx", cliEntry, ...args], {
    env: {
      ...process.env,
      SLOCK_AGENT_TOKEN_FILE: "",
      ...env,
    },
  });
}

test("internal agent search resolves sender handle refs and filters by sender", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { speaker, agent, apiKey, speakerMessage, ownerMessage } = await seedSearchFixture();
    const params = new URLSearchParams({
      q: "zebraneedle",
      sender: `@${speaker.name}`,
    });

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/search?${params}`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<{ id: string; senderName: string }> };
    assert.deepEqual(body.results.map((result) => result.id), [speakerMessage.id]);
    assert.equal(body.results.some((result) => result.id === ownerMessage.id), false);
    assert.equal(body.results[0]?.senderName, speaker.name);
  } finally {
    await app.close();
  }
});

test("internal agent search reports invisible or unknown sender handles as member_not_found", async () => {
  const app = await startTestApp("pglite://");
  try {
    const invisible = await seedUser("search-ref-invisible@slock.test", "search-ref-invisible");
    const { agent, apiKey } = await seedSearchFixture();
    const params = new URLSearchParams({
      q: "zebraneedle",
      sender: `@${invisible.name}`,
    });

    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/search?${params}`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 404);
    const body = await res.json() as { errorCode?: string; error?: string };
    assert.equal(body.errorCode, "member_not_found");
    assert.match(body.error ?? "", /Member not found/);
  } finally {
    await app.close();
  }
});

test("internal agent search reports ambiguous human/agent sender handles", async () => {
  const app = await startTestApp("pglite://");
  try {
    const db = getDb();
    const { server, agent, apiKey } = await seedSearchFixture();
    const duplicateHuman = await seedUser("search-ref-dupe@slock.test", "search-ref-dupe");
    await db.insert(serverMembers).values({ serverId: server.id, userId: duplicateHuman.id, role: "member" }).onConflictDoNothing();
    await db.insert(agents).values({
      serverId: server.id,
      name: duplicateHuman.name,
      displayName: duplicateHuman.name,
      runtime: "codex",
      model: "sonnet",
    });

    const params = new URLSearchParams({
      q: "zebraneedle",
      sender: `@${duplicateHuman.name}`,
    });
    const res = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/search?${params}`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(res.status, 409);
    const body = await res.json() as { errorCode?: string; error?: string };
    assert.equal(body.errorCode, "ambiguous_member_ref");
    assert.match(body.error ?? "", /ambiguous/);
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock message search --sender accepts member handles", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { speaker, server, agent, apiKey } = await seedSearchFixture();
    const { stdout, stderr } = await runSlockCli(
      ["message", "search", "--query", "zebraneedle", "--sender", `@${speaker.name}`],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    assert.match(stdout, /sender: @search-ref-speaker \(human\)/);
    assert.match(stdout, /memberref speaker zebraneedle/);
    assert.doesNotMatch(stdout, /memberref owner zebraneedle/);
  } finally {
    await app.close();
  }
});
