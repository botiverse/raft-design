import { randomBytes, randomUUID, createHash, timingSafeEqual } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  agents,
  oauthAccessRequests,
  oauthAccessTokens,
  oauthClients,
  oauthGrants,
  serverMembers,
  servers,
  users,
} from "../db/schema.js";

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const CLIENT_ID_REGEX = /^[a-z][a-z0-9-]{2,63}$/;
let getDbForService = getDb;

export function __setOAuthServiceDbForTests(mockGetDb: typeof getDb) {
  getDbForService = mockGetDb;
}

export function __resetOAuthServiceDbForTests() {
  getDbForService = getDb;
}

export type OAuthRequestStatus = "pending" | "approved" | "denied";

export type IntegrationOverviewItem = {
  id: string;
  type: "pending" | "active";
  serverId: string;
  agentId: string;
  agentName: string;
  agentDisplayName: string | null;
  clientId: string;
  clientKey: string;
  clientName: string;
  clientDescription: string | null;
  clientHomepageUrl: string | null;
  clientReturnUrl: string | null;
  scopes: string[];
  remember: boolean;
  createdAt: string;
  resolvedAt: string | null;
  resolvedByUserId: string | null;
  revokedAt: string | null;
};

export type OAuthClientRecord = {
  id: string;
  serverId: string;
  clientId: string;
  name: string;
  description: string | null;
  homepageUrl: string | null;
  returnUrl: string | null;
  createdByUserId: string;
  createdAt: Date;
  updatedAt: Date;
};

type AuthenticatedClient = OAuthClientRecord;
type OAuthPrincipalType = "agent" | "human";

function hashSecret(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqualHash(expectedHash: string, raw: string) {
  const left = Buffer.from(expectedHash, "hex");
  const right = Buffer.from(hashSecret(raw), "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

function normalizeScopes(scopes: unknown): string[] {
  if (!Array.isArray(scopes)) {
    throw new Error("scopes must be an array");
  }

  const normalized = Array.from(new Set(
    scopes.map((scope) => {
      if (typeof scope !== "string") {
        throw new Error("scopes must contain strings");
      }
      const trimmed = scope.trim();
      if (!trimmed) {
        throw new Error("scope values must be non-empty");
      }
      return trimmed;
    }),
  )).sort();

  if (normalized.length === 0) {
    throw new Error("at least one scope is required");
  }

  return normalized;
}

function scopesCover(grantedScopes: string[], requestedScopes: string[]) {
  const granted = new Set(grantedScopes);
  return requestedScopes.every((scope) => granted.has(scope));
}

function scopesEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, idx) => value === b[idx]);
}

function defaultClientId(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const slug = base && CLIENT_ID_REGEX.test(base) ? base : "client";
  return `${slug}-${randomBytes(3).toString("hex")}`;
}

function normalizeClientId(clientId: unknown, name: string) {
  if (typeof clientId !== "string" || !clientId.trim()) {
    return defaultClientId(name);
  }
  const normalized = clientId.trim().toLowerCase();
  if (!CLIENT_ID_REGEX.test(normalized)) {
    throw new Error("clientId must start with a letter and contain only lowercase letters, numbers, and hyphens");
  }
  return normalized;
}

export async function createOAuthClient(input: {
  serverId: string;
  createdByUserId: string;
  name: string;
  description?: string | null;
  homepageUrl?: string | null;
  returnUrl?: string | null;
  clientId?: string;
}) {
  const db = getDbForService();
  const trimmedName = input.name.trim();
  if (!trimmedName) {
    throw new Error("name is required");
  }

  const normalizedClientId = normalizeClientId(input.clientId, trimmedName);
  const rawSecret = `slock_secret_${randomBytes(24).toString("hex")}`;

  const [created] = await db.insert(oauthClients).values({
    serverId: input.serverId,
    clientId: normalizedClientId,
    clientSecretHash: hashSecret(rawSecret),
    name: trimmedName,
    description: input.description?.trim() || null,
    homepageUrl: input.homepageUrl?.trim() || null,
    returnUrl: input.returnUrl?.trim() || null,
    createdByUserId: input.createdByUserId,
  }).returning();

  return {
    client: created,
    clientSecret: rawSecret,
  };
}

export async function listOAuthClients(serverId: string) {
  const db = getDbForService();
  return db.select({
    id: oauthClients.id,
    serverId: oauthClients.serverId,
    clientId: oauthClients.clientId,
    name: oauthClients.name,
    description: oauthClients.description,
    homepageUrl: oauthClients.homepageUrl,
    returnUrl: oauthClients.returnUrl,
    createdByUserId: oauthClients.createdByUserId,
    createdAt: oauthClients.createdAt,
    updatedAt: oauthClients.updatedAt,
  }).from(oauthClients).where(eq(oauthClients.serverId, serverId));
}

export async function updateOAuthClient(input: {
  serverId: string;
  clientId: string;
  name?: string;
  description?: string | null;
  homepageUrl?: string | null;
  returnUrl?: string | null;
}) {
  const db = getDbForService();
  const updates: Partial<typeof oauthClients.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      throw new Error("name is required");
    }
    updates.name = trimmedName;
  }

  if (input.description !== undefined) {
    updates.description = input.description?.trim() || null;
  }
  if (input.homepageUrl !== undefined) {
    updates.homepageUrl = input.homepageUrl?.trim() || null;
  }
  if (input.returnUrl !== undefined) {
    updates.returnUrl = input.returnUrl?.trim() || null;
  }

  const [updated] = await db.update(oauthClients)
    .set(updates)
    .where(and(
      eq(oauthClients.id, input.clientId),
      eq(oauthClients.serverId, input.serverId),
    ))
    .returning({
      id: oauthClients.id,
      serverId: oauthClients.serverId,
      clientId: oauthClients.clientId,
      name: oauthClients.name,
      description: oauthClients.description,
      homepageUrl: oauthClients.homepageUrl,
      returnUrl: oauthClients.returnUrl,
      createdByUserId: oauthClients.createdByUserId,
      createdAt: oauthClients.createdAt,
      updatedAt: oauthClients.updatedAt,
    });

  return updated ?? null;
}

export async function authenticateOAuthClient(clientKey: string, clientSecret: string): Promise<AuthenticatedClient | null> {
  const db = getDbForService();
  const [client] = await db.select({
    id: oauthClients.id,
    serverId: oauthClients.serverId,
    clientId: oauthClients.clientId,
    name: oauthClients.name,
    description: oauthClients.description,
    homepageUrl: oauthClients.homepageUrl,
    returnUrl: oauthClients.returnUrl,
    createdByUserId: oauthClients.createdByUserId,
    createdAt: oauthClients.createdAt,
    updatedAt: oauthClients.updatedAt,
    clientSecretHash: oauthClients.clientSecretHash,
  }).from(oauthClients).where(eq(oauthClients.clientId, clientKey)).limit(1);

  if (!client || !safeEqualHash(client.clientSecretHash, clientSecret)) {
    return null;
  }

  const { clientSecretHash: _, ...safeClient } = client;
  return safeClient;
}

export async function requestAgentAccess(input: {
  clientId: string;
  serverSlug: string;
  agentName: string;
  scopes: unknown;
}) {
  const db = getDbForService();
  const scopes = normalizeScopes(input.scopes);

  const [agent] = await db.select({
    agentId: agents.id,
    agentName: agents.name,
    agentDisplayName: agents.displayName,
    serverId: agents.serverId,
    serverSlug: servers.slug,
  }).from(agents)
    .innerJoin(servers, eq(agents.serverId, servers.id))
    .where(and(
      eq(servers.slug, input.serverSlug),
      eq(agents.name, input.agentName),
      isNull(agents.deletedAt),
      isNull(servers.deletedAt),
    ))
    .limit(1);

  if (!agent) {
    throw new Error("Agent not found");
  }

  const [client] = await db.select({
    id: oauthClients.id,
    name: oauthClients.name,
    description: oauthClients.description,
    homepageUrl: oauthClients.homepageUrl,
    createdByUserId: oauthClients.createdByUserId,
  }).from(oauthClients)
    .where(and(
      eq(oauthClients.id, input.clientId),
      eq(oauthClients.serverId, agent.serverId),
    ))
    .limit(1);

  if (!client) {
    throw new Error("OAuth client not found for server");
  }

  const activeGrants = await db.select().from(oauthGrants).where(and(
    eq(oauthGrants.serverId, agent.serverId),
    eq(oauthGrants.agentId, agent.agentId),
    eq(oauthGrants.clientId, client.id),
    isNull(oauthGrants.revokedAt),
  ));

  const coveringGrant = activeGrants.find((grant) => scopesCover(grant.scopes ?? [], scopes));
  if (coveringGrant) {
    const [autoApproved] = await db.insert(oauthAccessRequests).values({
      serverId: agent.serverId,
      agentId: agent.agentId,
      clientId: client.id,
      scopes,
      status: "approved",
      remember: true,
      resolvedAt: new Date(),
    }).returning();

    return {
      request: autoApproved,
      status: "approved" as const,
      grantStatus: "reused" as const,
      agent,
      client,
    };
  }

  const now = new Date();
  return db.transaction(async (tx) => {
    await tx.insert(oauthGrants).values({
      serverId: agent.serverId,
      agentId: agent.agentId,
      clientId: client.id,
      scopes,
      grantedByUserId: client.createdByUserId,
      createdAt: now,
      updatedAt: now,
    });

    const [created] = await tx.insert(oauthAccessRequests).values({
      serverId: agent.serverId,
      agentId: agent.agentId,
      clientId: client.id,
      scopes,
      status: "approved",
      remember: true,
      resolvedAt: now,
      createdAt: now,
      updatedAt: now,
    }).returning();

    return {
      request: created,
      status: "approved" as const,
      grantStatus: "created" as const,
      agent,
      client,
    };
  });
}

export async function issueHumanAuthorizationCode(input: {
  clientKey: string;
  userId: string;
  serverId: string;
  returnUrl?: string | null;
  scopes?: unknown;
}) {
  const db = getDbForService();
  const scopes = input.scopes === undefined || input.scopes === null
    ? ["openid", "profile"]
    : normalizeScopes(input.scopes);

  const [client] = await db.select({
    id: oauthClients.id,
    serverId: oauthClients.serverId,
    clientId: oauthClients.clientId,
    name: oauthClients.name,
    description: oauthClients.description,
    homepageUrl: oauthClients.homepageUrl,
    returnUrl: oauthClients.returnUrl,
  }).from(oauthClients)
    .where(and(
      eq(oauthClients.clientId, input.clientKey),
      eq(oauthClients.serverId, input.serverId),
    ))
    .limit(1);

  if (!client) {
    throw new Error("OAuth client not found for server");
  }

  const requestedReturnUrl = input.returnUrl?.trim() || null;
  if (requestedReturnUrl && client.returnUrl && requestedReturnUrl !== client.returnUrl) {
    throw new Error("returnUrl does not match registered OAuth client");
  }

  const [member] = await db.select({
    userId: serverMembers.userId,
    serverId: serverMembers.serverId,
    role: serverMembers.role,
    serverSlug: servers.slug,
  }).from(serverMembers)
    .innerJoin(servers, eq(serverMembers.serverId, servers.id))
    .where(and(
      eq(serverMembers.serverId, input.serverId),
      eq(serverMembers.userId, input.userId),
      isNull(servers.deletedAt),
    ))
    .limit(1);

  if (!member) {
    throw new Error("User is not a member of this server");
  }

  const [created] = await db.insert(oauthAccessRequests).values({
    serverId: input.serverId,
    principalType: "human",
    userId: input.userId,
    agentId: null,
    clientId: client.id,
    scopes,
    status: "approved",
    remember: false,
    resolvedByUserId: input.userId,
    resolvedAt: new Date(),
  }).returning();

  return {
    code: created.id,
    request: created,
    client,
    server: {
      id: member.serverId,
      slug: member.serverSlug,
      role: member.role,
    },
    scopes,
    returnUrl: client.returnUrl,
  };
}

export async function approveAccessRequest(input: {
  requestId: string;
  resolvedByUserId: string;
  remember: boolean;
}) {
  const db = getDbForService();
  return db.transaction(async (tx) => {
    const [request] = await tx.select()
      .from(oauthAccessRequests)
      .where(eq(oauthAccessRequests.id, input.requestId))
      .limit(1)
      .for("update");
    if (!request) {
      throw new Error("Access request not found");
    }
    if (request.status !== "pending") {
      return {
        request,
        grantId: null,
      };
    }

    let createdGrantId: string | null = null;
    if (input.remember && (request.principalType ?? "agent") === "agent" && request.agentId) {
      const existingGrants = await tx.select().from(oauthGrants).where(and(
        eq(oauthGrants.serverId, request.serverId),
        eq(oauthGrants.agentId, request.agentId),
        eq(oauthGrants.clientId, request.clientId),
        isNull(oauthGrants.revokedAt),
      ));
      const matched = existingGrants.find((grant) => scopesEqual(grant.scopes ?? [], request.scopes ?? []));
      if (matched) {
        createdGrantId = matched.id;
      } else {
        const [grant] = await tx.insert(oauthGrants).values({
          serverId: request.serverId,
          agentId: request.agentId,
          clientId: request.clientId,
          scopes: request.scopes,
          grantedByUserId: input.resolvedByUserId,
        }).returning();
        createdGrantId = grant.id;
      }
    }

    const [updated] = await tx.update(oauthAccessRequests).set({
      status: "approved",
      remember: input.remember,
      resolvedByUserId: input.resolvedByUserId,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(oauthAccessRequests.id, request.id)).returning();

    return {
      request: updated,
      grantId: createdGrantId,
    };
  });
}

export async function denyAccessRequest(input: {
  requestId: string;
  resolvedByUserId: string;
}) {
  const db = getDbForService();
  return db.transaction(async (tx) => {
    const [request] = await tx.select()
      .from(oauthAccessRequests)
      .where(eq(oauthAccessRequests.id, input.requestId))
      .limit(1)
      .for("update");
    if (!request) {
      return null;
    }
    if (request.status !== "pending") {
      return request;
    }

    const [updated] = await tx.update(oauthAccessRequests).set({
      status: "denied",
      remember: false,
      resolvedByUserId: input.resolvedByUserId,
      resolvedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(oauthAccessRequests.id, input.requestId)).returning();
    return updated || null;
  });
}

export async function revokeGrant(input: {
  grantId: string;
  revokedByUserId: string;
}) {
  const db = getDbForService();
  return db.transaction(async (tx) => {
    const [grant] = await tx.select()
      .from(oauthGrants)
      .where(eq(oauthGrants.id, input.grantId))
      .limit(1)
      .for("update");
    if (!grant) {
      return null;
    }
    if (grant.revokedAt) {
      return grant;
    }

    const revokedAt = new Date();
    const [updated] = await tx.update(oauthGrants).set({
      revokedByUserId: input.revokedByUserId,
      revokedAt,
      updatedAt: revokedAt,
    }).where(eq(oauthGrants.id, input.grantId)).returning();

    await tx.update(oauthAccessTokens).set({
      revokedAt,
    }).where(and(
      eq(oauthAccessTokens.grantId, input.grantId),
      isNull(oauthAccessTokens.revokedAt),
    ));

    return updated || null;
  });
}

export async function exchangeAccessRequest(input: {
  clientId: string;
  requestId: string;
}) {
  const db = getDbForService();
  return db.transaction(async (tx) => {
    const [request] = await tx.select()
      .from(oauthAccessRequests)
      .where(eq(oauthAccessRequests.id, input.requestId))
      .limit(1)
      .for("update");
    if (!request || request.clientId !== input.clientId) {
      throw new Error("Access request not found");
    }
    if (request.status === "pending") {
      throw new Error("authorization_pending");
    }
    if (request.status === "denied") {
      throw new Error("access_denied");
    }
    if (request.consumedAt) {
      throw new Error("request_already_consumed");
    }

    const principalType = (request.principalType ?? "agent") as OAuthPrincipalType;
    const [grant] = request.remember && principalType === "agent"
      ? await tx.select().from(oauthGrants).where(and(
          eq(oauthGrants.serverId, request.serverId),
          eq(oauthGrants.agentId, request.agentId!),
          eq(oauthGrants.clientId, request.clientId),
          isNull(oauthGrants.revokedAt),
        )).limit(1)
      : [null];
    if (request.remember && principalType === "agent" && !grant) {
      throw new Error("access_denied");
    }

    const rawToken = `slock_at_${randomBytes(32).toString("hex")}`;
    const expiresAt = new Date(Date.now() + ACCESS_TOKEN_TTL_MS);
    const [createdToken] = await tx.insert(oauthAccessTokens).values({
      serverId: request.serverId,
      principalType,
      agentId: request.agentId,
      userId: request.userId,
      clientId: request.clientId,
      requestId: request.id,
      grantId: grant?.id ?? null,
      tokenHash: hashSecret(rawToken),
      scopes: request.scopes,
      expiresAt,
    }).returning();

    await tx.update(oauthAccessRequests).set({
      consumedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(oauthAccessRequests.id, request.id));

    return {
      accessToken: rawToken,
      expiresAt,
      scopes: request.scopes ?? [],
      token: createdToken,
    };
  });
}

export async function getIdentityByAccessToken(rawToken: string) {
  const db = getDbForService();
  const [token] = await db.select({
    tokenId: oauthAccessTokens.id,
    principalType: oauthAccessTokens.principalType,
    scopes: oauthAccessTokens.scopes,
    expiresAt: oauthAccessTokens.expiresAt,
    revokedAt: oauthAccessTokens.revokedAt,
    grantRevokedAt: oauthGrants.revokedAt,
    clientKey: oauthClients.clientId,
    clientName: oauthClients.name,
    serverId: servers.id,
    serverSlug: servers.slug,
    serverDeletedAt: servers.deletedAt,
    humanId: users.id,
    humanName: users.name,
    humanDisplayName: users.displayName,
    humanAvatarUrl: users.avatarUrl,
    humanDescription: users.description,
    humanRole: serverMembers.role,
    agentId: agents.id,
    agentName: agents.name,
    agentDisplayName: agents.displayName,
    agentAvatarUrl: agents.avatarUrl,
    agentDescription: agents.description,
    agentDeletedAt: agents.deletedAt,
  }).from(oauthAccessTokens)
    .innerJoin(oauthClients, eq(oauthAccessTokens.clientId, oauthClients.id))
    .innerJoin(servers, eq(oauthAccessTokens.serverId, servers.id))
    .leftJoin(agents, eq(oauthAccessTokens.agentId, agents.id))
    .leftJoin(users, eq(oauthAccessTokens.userId, users.id))
    .leftJoin(serverMembers, and(
      eq(serverMembers.serverId, oauthAccessTokens.serverId),
      eq(serverMembers.userId, oauthAccessTokens.userId),
    ))
    .leftJoin(oauthGrants, eq(oauthAccessTokens.grantId, oauthGrants.id))
    .where(eq(oauthAccessTokens.tokenHash, hashSecret(rawToken)))
    .limit(1);

  if (!token) {
    return null;
  }
  if (token.revokedAt || token.grantRevokedAt || token.expiresAt.getTime() <= Date.now()) {
    return null;
  }
  if (token.serverDeletedAt) {
    return null;
  }

  const principalType = (token.principalType ?? "agent") as OAuthPrincipalType;
  if (principalType === "agent" && (!token.agentId || token.agentDeletedAt)) {
    return null;
  }
  if (principalType === "human" && (!token.humanId || !token.humanRole)) {
    return null;
  }

  return token;
}

export async function getServerIntegrationsOverview(serverId: string): Promise<IntegrationOverviewItem[]> {
  const db = getDbForService();
  const [pendingRows, activeRows] = await Promise.all([
    db.select({
      id: oauthAccessRequests.id,
      serverId: oauthAccessRequests.serverId,
      agentId: agents.id,
      agentName: agents.name,
      agentDisplayName: agents.displayName,
      clientId: oauthClients.id,
      clientKey: oauthClients.clientId,
      clientName: oauthClients.name,
      clientDescription: oauthClients.description,
      clientHomepageUrl: oauthClients.homepageUrl,
      clientReturnUrl: oauthClients.returnUrl,
      scopes: oauthAccessRequests.scopes,
      remember: oauthAccessRequests.remember,
      createdAt: oauthAccessRequests.createdAt,
      resolvedAt: oauthAccessRequests.resolvedAt,
      resolvedByUserId: oauthAccessRequests.resolvedByUserId,
    }).from(oauthAccessRequests)
      .innerJoin(agents, eq(oauthAccessRequests.agentId, agents.id))
      .innerJoin(oauthClients, eq(oauthAccessRequests.clientId, oauthClients.id))
      .where(and(
        eq(oauthAccessRequests.serverId, serverId),
        eq(oauthAccessRequests.status, "pending"),
      ))
      .orderBy(desc(oauthAccessRequests.createdAt)),
    db.select({
      id: oauthGrants.id,
      serverId: oauthGrants.serverId,
      agentId: agents.id,
      agentName: agents.name,
      agentDisplayName: agents.displayName,
      clientId: oauthClients.id,
      clientKey: oauthClients.clientId,
      clientName: oauthClients.name,
      clientDescription: oauthClients.description,
      clientHomepageUrl: oauthClients.homepageUrl,
      clientReturnUrl: oauthClients.returnUrl,
      scopes: oauthGrants.scopes,
      createdAt: oauthGrants.createdAt,
      revokedAt: oauthGrants.revokedAt,
      resolvedByUserId: oauthGrants.grantedByUserId,
    }).from(oauthGrants)
      .innerJoin(agents, eq(oauthGrants.agentId, agents.id))
      .innerJoin(oauthClients, eq(oauthGrants.clientId, oauthClients.id))
      .where(and(
        eq(oauthGrants.serverId, serverId),
        isNull(oauthGrants.revokedAt),
      ))
      .orderBy(desc(oauthGrants.createdAt)),
  ]);

  const pending = pendingRows.map((row) => ({
    id: row.id,
    type: "pending" as const,
    serverId: row.serverId,
    agentId: row.agentId,
    agentName: row.agentName,
    agentDisplayName: row.agentDisplayName,
    clientId: row.clientId,
    clientKey: row.clientKey,
    clientName: row.clientName,
    clientDescription: row.clientDescription,
    clientHomepageUrl: row.clientHomepageUrl,
    clientReturnUrl: row.clientReturnUrl,
    scopes: row.scopes ?? [],
    remember: false,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.resolvedAt?.toISOString() ?? null,
    resolvedByUserId: row.resolvedByUserId,
    revokedAt: null,
  }));

  const active = activeRows.map((row) => ({
    id: row.id,
    type: "active" as const,
    serverId: row.serverId,
    agentId: row.agentId,
    agentName: row.agentName,
    agentDisplayName: row.agentDisplayName,
    clientId: row.clientId,
    clientKey: row.clientKey,
    clientName: row.clientName,
    clientDescription: row.clientDescription,
    clientHomepageUrl: row.clientHomepageUrl,
    clientReturnUrl: row.clientReturnUrl,
    scopes: row.scopes ?? [],
    remember: true,
    createdAt: row.createdAt.toISOString(),
    resolvedAt: row.createdAt.toISOString(),
    resolvedByUserId: row.resolvedByUserId,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }));

  return [...pending, ...active];
}

export async function getAgentIntegrationsOverview(agentId: string): Promise<IntegrationOverviewItem[]> {
  const db = getDbForService();
  const [agent] = await db.select({ serverId: agents.serverId }).from(agents).where(eq(agents.id, agentId)).limit(1);
  if (!agent) return [];
  const all = await getServerIntegrationsOverview(agent.serverId);
  return all.filter((item) => item.agentId === agentId);
}
