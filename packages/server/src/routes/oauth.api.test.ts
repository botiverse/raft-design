import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import argon2 from "argon2";
import { and, eq } from "drizzle-orm";

import { getDb } from "../db/index.js";
import { oauthAccessRequests, oauthGrants, users } from "../db/schema.js";
import { startTestApp } from "../test/testAppHarness.js";
import { createServer, addMember, removeMember } from "../services/serverService.js";
import { createAgent } from "../services/agentService.js";
import { createOAuthClient } from "../services/oauthService.js";

async function seedUser(email: string, name: string, opts: { avatarUrl?: string | null } = {}) {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      email,
      name,
      displayName: name,
      avatarUrl: opts.avatarUrl ?? null,
      passwordHash: await argon2.hash("password123"),
      emailVerified: true,
    })
    .returning();
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

test("human OAuth userinfo requires the user to remain a current server member", async () => {
  const app = await startTestApp("pglite://");
  try {
    const suffix = randomUUID();
    const owner = await seedUser(`oauth-owner-${suffix}@slock.test`, `oauth-owner-${suffix}`);
    const memberAvatarUrl = "/api/avatars/users/oauth-member.webp";
    const member = await seedUser(`oauth-member-${suffix}@slock.test`, `oauth-member-${suffix}`, {
      avatarUrl: memberAvatarUrl,
    });
    const server = await createServer("OAuth Member Boundary", `oauth-member-boundary-${suffix}`, owner.id);
    await addMember(server.id, member.id, "member");
    const { client, clientSecret } = await createOAuthClient({
      serverId: server.id,
      createdByUserId: owner.id,
      name: "OAuth Boundary Client",
      clientId: `oauth-boundary-${suffix.slice(0, 8)}`,
    });

    const memberToken = await login(app.baseUrl, member.email);
    const authorize = await fetch(`${app.baseUrl}/api/oauth/authorize/human`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${memberToken}`,
      },
      body: JSON.stringify({
        clientId: client.clientId,
        serverId: server.id,
        scopes: ["openid", "profile"],
      }),
    });
    assert.equal(authorize.status, 200, `authorize failed (${authorize.status})`);
    const authBody = await authorize.json() as { code: string };

    const token = await fetch(`${app.baseUrl}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.clientId,
        clientSecret,
        grantType: "authorization_code",
        code: authBody.code,
      }),
    });
    assert.equal(token.status, 200, `token exchange failed (${token.status})`);
    const tokenBody = await token.json() as { access_token: string };

    const beforeRemoval = await fetch(`${app.baseUrl}/api/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    assert.equal(beforeRemoval.status, 200);
    const beforeBody = await beforeRemoval.json() as {
      type: string;
      sub: string;
      server_role: string;
      avatar_url: string | null;
      picture: string | null;
    };
    assert.equal(beforeBody.type, "human");
    assert.equal(beforeBody.sub, member.id);
    assert.equal(beforeBody.server_role, "member");
    assert.equal(beforeBody.avatar_url, memberAvatarUrl);
    assert.equal(beforeBody.picture, `${app.baseUrl}${memberAvatarUrl}`);

    await removeMember(server.id, member.id);

    const afterRemoval = await fetch(`${app.baseUrl}/api/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    assert.equal(afterRemoval.status, 401);
  } finally {
    await app.close();
  }
});

test("agent OAuth request grants immediately without human approval", async () => {
  const app = await startTestApp("pglite://");
  try {
    const suffix = randomUUID();
    const owner = await seedUser(`oauth-agent-owner-${suffix}@slock.test`, `oauth-agent-owner-${suffix}`);
    const server = await createServer("OAuth Agent Login", `oauth-agent-login-${suffix}`, owner.id);
    const agentAvatarUrl = "pixel:random:oauth-agent-bot";
    const agent = await createAgent(server.id, "OauthAgentBot", {
      runtime: "claude",
      model: "sonnet",
      avatarUrl: agentAvatarUrl,
    });
    const { client, clientSecret } = await createOAuthClient({
      serverId: server.id,
      createdByUserId: owner.id,
      clientId: `oauth-agent-${suffix.slice(0, 8)}`,
      name: "OAuth Agent Client",
      returnUrl: "https://example.test/login/callback",
    });

    const requested = await fetch(`${app.baseUrl}/api/oauth/requests/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.clientId,
        clientSecret,
        serverSlug: server.slug,
        agentName: agent.name,
        scopes: ["openid", "profile", "identity"],
      }),
    });
    assert.equal(requested.status, 200, `agent request failed (${requested.status})`);
    const requestBody = await requested.json() as { requestId: string; status: string; scopes: string[] };
    assert.equal(requestBody.status, "approved");
    assert.deepEqual(requestBody.scopes, ["identity", "openid", "profile"]);

    const rows = await getDb()
      .select({
        requestStatus: oauthAccessRequests.status,
        remember: oauthAccessRequests.remember,
        grantId: oauthGrants.id,
      })
      .from(oauthAccessRequests)
      .innerJoin(oauthGrants, and(
        eq(oauthGrants.serverId, oauthAccessRequests.serverId),
        eq(oauthGrants.agentId, oauthAccessRequests.agentId),
        eq(oauthGrants.clientId, oauthAccessRequests.clientId),
      ))
      .where(eq(oauthAccessRequests.id, requestBody.requestId));
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.requestStatus, "approved");
    assert.equal(rows[0]?.remember, true);
    assert.ok(rows[0]?.grantId);

    const token = await fetch(`${app.baseUrl}/api/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: client.clientId,
        clientSecret,
        grantType: "urn:slock:grant-type:agent_request",
        requestId: requestBody.requestId,
      }),
    });
    assert.equal(token.status, 200, `token exchange failed (${token.status})`);
    const tokenBody = await token.json() as { access_token: string };

    const userinfo = await fetch(`${app.baseUrl}/api/oauth/userinfo`, {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    assert.equal(userinfo.status, 200);
    const userinfoBody = await userinfo.json() as {
      type: string;
      sub: string;
      avatar_url: string | null;
      picture: string | null;
    };
    assert.equal(userinfoBody.type, "agent");
    assert.equal(userinfoBody.sub, agent.id);
    assert.equal(userinfoBody.avatar_url, agentAvatarUrl);
    assert.equal(userinfoBody.picture, null);
  } finally {
    await app.close();
  }
});
