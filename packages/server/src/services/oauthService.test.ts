import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  oauthAccessRequests,
  oauthAccessTokens,
  oauthGrants,
} from "../db/schema.js";
import {
  __resetOAuthServiceDbForTests,
  __setOAuthServiceDbForTests,
  approveAccessRequest,
  denyAccessRequest,
  exchangeAccessRequest,
  getIdentityByAccessToken,
  revokeGrant,
} from "./oauthService.js";

type SelectCapture = { lockMode?: string };
type UpdateCapture = { values?: Record<string, unknown>; table?: unknown };
type InsertCapture = { values?: Record<string, unknown>; table?: unknown };

function makeSelectBuilder<T>(result: T, capture?: SelectCapture) {
  const builder: any = {
    from() {
      return builder;
    },
    innerJoin() {
      return builder;
    },
    leftJoin() {
      return builder;
    },
    where() {
      return builder;
    },
    orderBy() {
      return builder;
    },
    limit() {
      return builder;
    },
    for(mode: string) {
      if (capture) capture.lockMode = mode;
      return builder;
    },
    then(resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };
  return builder;
}

function makeUpdateBuilder<T>(result: T, capture?: UpdateCapture) {
  const afterSet: any = {
    where() {
      return afterSet;
    },
    returning() {
      return afterSet;
    },
    then(resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return {
    set(values: Record<string, unknown>) {
      if (capture) capture.values = values;
      return afterSet;
    },
  };
}

function makeInsertBuilder<T>(result: T, capture?: InsertCapture) {
  const afterValues: any = {
    returning() {
      return afterValues;
    },
    then(resolve: (value: T) => unknown, reject?: (reason: unknown) => unknown) {
      return Promise.resolve(result).then(resolve, reject);
    },
  };

  return {
    values(values: Record<string, unknown>) {
      if (capture) capture.values = values;
      return afterValues;
    },
  };
}

function makeTx(options: {
  selects?: Array<{ result: unknown; capture?: SelectCapture }>;
  updates?: Array<{ result: unknown; capture?: UpdateCapture }>;
  inserts?: Array<{ result: unknown; capture?: InsertCapture }>;
}) {
  const selects = [...(options.selects ?? [])];
  const updates = [...(options.updates ?? [])];
  const inserts = [...(options.inserts ?? [])];

  return {
    select() {
      const next = selects.shift();
      if (!next) throw new Error("Unexpected select");
      return makeSelectBuilder(next.result, next.capture);
    },
    update(table: unknown) {
      const next = updates.shift();
      if (!next) throw new Error("Unexpected update");
      if (next.capture) next.capture.table = table;
      return makeUpdateBuilder(next.result, next.capture);
    },
    insert(table: unknown) {
      const next = inserts.shift();
      if (!next) throw new Error("Unexpected insert");
      if (next.capture) next.capture.table = table;
      return makeInsertBuilder(next.result, next.capture);
    },
  };
}

afterEach(() => {
  __resetOAuthServiceDbForTests();
});

test("exchangeAccessRequest consumes remembered requests on first exchange", async () => {
  const consumeCapture: UpdateCapture = {};
  const tokenInsertCapture: InsertCapture = {};
  const tx = makeTx({
    selects: [
      {
        result: [{
          id: "request-1",
          clientId: "client-1",
          serverId: "server-1",
          agentId: "agent-1",
          scopes: ["identity"],
          status: "approved",
          remember: true,
          consumedAt: null,
        }],
      },
      {
        result: [{
          id: "grant-1",
          serverId: "server-1",
          agentId: "agent-1",
          clientId: "client-1",
          revokedAt: null,
        }],
      },
    ],
    inserts: [{ result: [{ id: "token-1" }], capture: tokenInsertCapture }],
    updates: [{ result: undefined, capture: consumeCapture }],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  await exchangeAccessRequest({ clientId: "client-1", requestId: "request-1" });

  assert.equal(tokenInsertCapture.table, oauthAccessTokens);
  assert.equal(consumeCapture.table, oauthAccessRequests);
  assert.ok(consumeCapture.values?.consumedAt instanceof Date);
});

test("exchangeAccessRequest rejects remembered requests once already consumed", async () => {
  const tx = makeTx({
    selects: [{
      result: [{
        id: "request-1",
        clientId: "client-1",
        status: "approved",
        remember: true,
        consumedAt: new Date(),
      }],
    }],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  await assert.rejects(
    () => exchangeAccessRequest({ clientId: "client-1", requestId: "request-1" }),
    /request_already_consumed/,
  );
});

test("exchangeAccessRequest rejects remembered requests when active grant is gone", async () => {
  const tx = makeTx({
    selects: [
      {
        result: [{
          id: "request-1",
          clientId: "client-1",
          serverId: "server-1",
          agentId: "agent-1",
          scopes: ["identity"],
          status: "approved",
          remember: true,
          consumedAt: null,
        }],
      },
      { result: [] },
    ],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  await assert.rejects(
    () => exchangeAccessRequest({ clientId: "client-1", requestId: "request-1" }),
    /access_denied/,
  );
});

test("exchangeAccessRequest mints human tokens without requiring an agent grant", async () => {
  const tokenInsertCapture: InsertCapture = {};
  const tx = makeTx({
    selects: [
      {
        result: [{
          id: "request-1",
          clientId: "client-1",
          serverId: "server-1",
          principalType: "human",
          agentId: null,
          userId: "user-1",
          scopes: ["openid", "profile"],
          status: "approved",
          remember: false,
          consumedAt: null,
        }],
      },
    ],
    inserts: [{ result: [{ id: "token-1" }], capture: tokenInsertCapture }],
    updates: [{ result: undefined }],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  await exchangeAccessRequest({ clientId: "client-1", requestId: "request-1" });

  assert.equal(tokenInsertCapture.table, oauthAccessTokens);
  assert.equal(tokenInsertCapture.values?.principalType, "human");
  assert.equal(tokenInsertCapture.values?.agentId, null);
  assert.equal(tokenInsertCapture.values?.userId, "user-1");
});

test("revokeGrant also revokes outstanding access tokens", async () => {
  const grantUpdateCapture: UpdateCapture = {};
  const tokenUpdateCapture: UpdateCapture = {};
  const tx = makeTx({
    selects: [{
      result: [{
        id: "grant-1",
        revokedAt: null,
      }],
    }],
    updates: [
      { result: [{ id: "grant-1", revokedAt: new Date() }], capture: grantUpdateCapture },
      { result: undefined, capture: tokenUpdateCapture },
    ],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  await revokeGrant({ grantId: "grant-1", revokedByUserId: "user-1" });

  assert.equal(grantUpdateCapture.table, oauthGrants);
  assert.equal(tokenUpdateCapture.table, oauthAccessTokens);
  assert.ok(tokenUpdateCapture.values?.revokedAt instanceof Date);
});

test("getIdentityByAccessToken rejects tokens whose parent grant was revoked", async () => {
  __setOAuthServiceDbForTests(() => ({
    select: () => makeSelectBuilder([{
      tokenId: "token-1",
      principalType: "agent",
      scopes: ["identity"],
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      grantRevokedAt: new Date(),
      clientKey: "client-key",
      clientName: "Client",
      serverId: "server-1",
      serverSlug: "acme",
      serverDeletedAt: null,
      agentId: "agent-1",
      agentName: "ray",
      agentDisplayName: "Ray",
      agentAvatarUrl: null,
      agentDescription: null,
      agentDeletedAt: null,
    }]),
  }) as any);

  const token = await getIdentityByAccessToken("slock_at_test");
  assert.equal(token, null);
});

test("getIdentityByAccessToken rejects human tokens after server membership is removed", async () => {
  __setOAuthServiceDbForTests(() => ({
    select: () => makeSelectBuilder([{
      tokenId: "token-1",
      principalType: "human",
      scopes: ["openid", "profile"],
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      grantRevokedAt: null,
      clientKey: "client-key",
      clientName: "Client",
      serverId: "server-1",
      serverSlug: "acme",
      serverDeletedAt: null,
      humanId: "user-1",
      humanName: "alice",
      humanDisplayName: "Alice",
      humanAvatarUrl: null,
      humanDescription: null,
      humanRole: null,
    }]),
  }) as any);

  const token = await getIdentityByAccessToken("slock_at_test");
  assert.equal(token, null);
});

test("getIdentityByAccessToken rejects tokens for deleted servers and agents", async () => {
  __setOAuthServiceDbForTests(() => ({
    select: () => makeSelectBuilder([{
      tokenId: "token-1",
      principalType: "agent",
      scopes: ["identity"],
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      grantRevokedAt: null,
      clientKey: "client-key",
      clientName: "Client",
      serverId: "server-1",
      serverSlug: "acme",
      serverDeletedAt: new Date(),
      agentId: "agent-1",
      agentName: "ray",
      agentDisplayName: "Ray",
      agentAvatarUrl: null,
      agentDescription: null,
      agentDeletedAt: null,
    }]),
  }) as any);

  assert.equal(await getIdentityByAccessToken("slock_at_test"), null);

  __setOAuthServiceDbForTests(() => ({
    select: () => makeSelectBuilder([{
      tokenId: "token-2",
      principalType: "agent",
      scopes: ["identity"],
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
      grantRevokedAt: null,
      clientKey: "client-key",
      clientName: "Client",
      serverId: "server-1",
      serverSlug: "acme",
      serverDeletedAt: null,
      agentId: "agent-1",
      agentName: "ray",
      agentDisplayName: "Ray",
      agentAvatarUrl: null,
      agentDescription: null,
      agentDeletedAt: new Date(),
    }]),
  }) as any);

  assert.equal(await getIdentityByAccessToken("slock_at_test"), null);
});

test("approveAccessRequest locks the request row and returns a stable shape for non-pending requests", async () => {
  const selectCapture: SelectCapture = {};
  const tx = makeTx({
    selects: [{
      result: [{
        id: "request-1",
        status: "approved",
      }],
      capture: selectCapture,
    }],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  const result = await approveAccessRequest({
    requestId: "request-1",
    resolvedByUserId: "user-1",
    remember: true,
  });

  assert.equal(selectCapture.lockMode, "update");
  assert.deepEqual(result, {
    request: {
      id: "request-1",
      status: "approved",
    },
    grantId: null,
  });
});

test("denyAccessRequest locks the row and does not overwrite non-pending requests", async () => {
  const selectCapture: SelectCapture = {};
  const tx = makeTx({
    selects: [{
      result: [{
        id: "request-1",
        status: "approved",
      }],
      capture: selectCapture,
    }],
  });

  __setOAuthServiceDbForTests(() => ({
    transaction: async (fn: (arg: typeof tx) => Promise<unknown>) => fn(tx),
  }) as any);

  const result = await denyAccessRequest({
    requestId: "request-1",
    resolvedByUserId: "user-1",
  });

  assert.equal(selectCapture.lockMode, "update");
  assert.deepEqual(result, {
    id: "request-1",
    status: "approved",
  });
});
