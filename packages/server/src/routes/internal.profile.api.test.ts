import assert from "node:assert/strict";
import test from "node:test";
import { execFile } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import argon2 from "argon2";

import { startTestApp } from "../test/testAppHarness.js";
import { getDb } from "../db/index.js";
import { users } from "../db/schema.js";
import { createServer } from "../services/serverService.js";
import { createAgent, assignMachine } from "../services/agentService.js";
import { registerMachine } from "../services/machineService.js";

const execFileAsync = promisify(execFile);
const cliEntry = fileURLToPath(new URL("../../../cli/src/index.ts", import.meta.url));
const ONE_BY_ONE_GIF = Buffer.from(
  "R0lGODdhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=",
  "base64",
);

async function seed() {
  const db = getDb();
  const [owner] = await db
    .insert(users)
    .values({
      email: "profile-owner@slock.test",
      name: "profile-owner",
      displayName: "Profile Owner",
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();

  const server = await createServer("Profile Server", "profile-server", owner.id);
  const agent = await createAgent(server.id, "profile-agent", { runtime: "codex", model: "gpt-5.5" });
  const { machine, apiKey } = await registerMachine(server.id, owner.id, "dev-machine");
  await assignMachine(agent.id, machine.id);

  return { owner, server, agent, machine, apiKey };
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

test("CLI e2e: slock profile show --json includes the user-facing computer name", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, machine, apiKey, server } = await seed();
    const { stdout, stderr } = await runSlockCli(
      ["profile", "show", "--json"],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    const payload = JSON.parse(stdout) as { ok: true; data: { kind: string; computerName?: string | null } };
    assert.equal(payload.ok, true);
    assert.equal(payload.data.kind, "agent");
    assert.equal(payload.data.computerName, machine.name);
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile show @human resolves a visible human profile", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, agent, apiKey, server } = await seed();
    const { stdout, stderr } = await runSlockCli(
      ["profile", "show", `@${owner.name}`, "--json"],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    const payload = JSON.parse(stdout) as { ok: true; data: { kind: string; name: string } };
    assert.equal(payload.data.kind, "human");
    assert.equal(payload.data.name, owner.name);
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update --avatar-file updates the agent avatar", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();
    const tempDir = mkdtempSync(join(tmpdir(), "slock-profile-avatar-"));
    const avatarPath = join(tempDir, "avatar.gif");
    writeFileSync(avatarPath, ONE_BY_ONE_GIF);

    const { stdout, stderr } = await runSlockCli(
      ["profile", "update", "--avatar-file", avatarPath, "--json"],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    const payload = JSON.parse(stdout) as { ok: true; data: { kind: string; avatarUrl: string | null } };
    assert.equal(payload.data.kind, "agent");
    assert.match(payload.data.avatarUrl ?? "", /^\/api\/avatars\//);
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update --avatar-url updates the agent pixel avatar", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();

    const { stdout, stderr } = await runSlockCli(
      ["profile", "update", "--avatar-url", "pixel:random:kimi-avatar", "--json"],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    const payload = JSON.parse(stdout) as { ok: true; data: { kind: string; avatarUrl: string | null } };
    assert.equal(payload.data.kind, "agent");
    assert.equal(payload.data.avatarUrl, "pixel:random:kimi-avatar");
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update --display-name --description updates both fields", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();

    const { stdout, stderr } = await runSlockCli(
      [
        "profile",
        "update",
        "--display-name",
        "Renamed Agent",
        "--description",
        "Helps with code review",
        "--json",
      ],
      {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      },
    );

    assert.equal(stderr, "");
    const payload = JSON.parse(stdout) as {
      ok: true;
      data: { kind: string; displayName: string | null; description: string | null };
    };
    assert.equal(payload.data.kind, "agent");
    assert.equal(payload.data.displayName, "Renamed Agent");
    assert.equal(payload.data.description, "Helps with code review");
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update rejects avatar file and URL together", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();
    const tempDir = mkdtempSync(join(tmpdir(), "slock-profile-avatar-"));
    const avatarPath = join(tempDir, "avatar.gif");
    writeFileSync(avatarPath, ONE_BY_ONE_GIF);

    await assert.rejects(
      runSlockCli(
        [
          "profile",
          "update",
          "--avatar-file",
          avatarPath,
          "--avatar-url",
          "pixel:random:kimi-avatar",
          "--json",
        ],
        {
          SLOCK_SERVER_URL: app.baseUrl,
          SLOCK_AGENT_ID: agent.id,
          SLOCK_AGENT_TOKEN: apiKey,
          SLOCK_SERVER_ID: server.id,
        },
      ),
      (err: NodeJS.ErrnoException & { stderr?: string }) => {
        assert.match(err.stderr ?? "", /INVALID_ARG/);
        assert.match(err.stderr ?? "", /Use either --avatar-file or --avatar-url/);
        return true;
      },
    );
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update --display-name '' is rejected", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();

    await assert.rejects(
      runSlockCli(["profile", "update", "--display-name", "", "--json"], {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      }),
      (err: NodeJS.ErrnoException & { stderr?: string }) => {
        assert.match(err.stderr ?? "", /INVALID_ARG/);
        assert.match(err.stderr ?? "", /must not be empty/);
        return true;
      },
    );
  } finally {
    await app.close();
  }
});

test("CLI e2e: slock profile update with no fields fails fast", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { agent, apiKey, server } = await seed();

    await assert.rejects(
      runSlockCli(["profile", "update", "--json"], {
        SLOCK_SERVER_URL: app.baseUrl,
        SLOCK_AGENT_ID: agent.id,
        SLOCK_AGENT_TOKEN: apiKey,
        SLOCK_SERVER_ID: server.id,
      }),
      (err: NodeJS.ErrnoException & { stderr?: string }) => {
        assert.match(err.stderr ?? "", /INVALID_ARG/);
        return true;
      },
    );
  } finally {
    await app.close();
  }
});
