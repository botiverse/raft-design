import assert from "node:assert/strict";
import test from "node:test";
import {
  getAuthenticatedUserLabel,
  listRemoteMachinesWithUserSession,
  registerMachineWithUserSession,
  resolveRemoteContext,
  rotateMachineKeyWithUserSession,
  selectRemoteServer,
} from "./authClient";

test("selectRemoteServer preserves an existing selection when it still exists", () => {
  const servers = [
    { id: "server-a", name: "Alpha", slug: "alpha", role: "owner" },
    { id: "server-b", name: "Beta", slug: "beta", role: "admin" },
  ];

  assert.deepEqual(selectRemoteServer(servers, "server-b"), servers[1]);
  assert.equal(selectRemoteServer(servers, "missing"), null);
  assert.deepEqual(selectRemoteServer([servers[0]], null), servers[0]);
});

test("selectRemoteServer can recover the attached-machine workspace by slug", () => {
  const servers = [
    { id: "server-a", name: "Alpha", slug: "alpha", role: "owner" },
    { id: "server-b", name: "Beta", slug: "beta", role: "admin" },
  ];

  assert.deepEqual(selectRemoteServer(servers, null, "beta"), servers[1]);
  assert.equal(selectRemoteServer(servers, null, "missing"), null);
});

test("getAuthenticatedUserLabel prefers displayName then name then email", () => {
  assert.equal(
    getAuthenticatedUserLabel({
      id: "user-1",
      name: "Dayu",
      displayName: "Da Yu",
      email: "dayu@slock.ai",
    }),
    "Da Yu",
  );
  assert.equal(
    getAuthenticatedUserLabel({
      id: "user-1",
      name: "Dayu",
      displayName: null,
      email: "dayu@slock.ai",
    }),
    "Dayu",
  );
});

test("resolveRemoteContext refreshes the session when the access token is stale", async () => {
  const calls: Array<{ url: string; method: string; auth: string | null }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const requestUrl = String(input);
    const method = init?.method ?? "GET";
    const auth = init?.headers instanceof Headers
      ? init.headers.get("Authorization")
      : Array.isArray(init?.headers)
        ? null
        : (init?.headers as Record<string, string> | undefined)?.Authorization ?? null;
    calls.push({ url: requestUrl, method, auth });

    if (requestUrl.endsWith("/api/auth/refresh")) {
      return new Response(
        JSON.stringify({ accessToken: "access-new", refreshToken: "refresh-new" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (auth === "Bearer access-old") {
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), { status: 401 });
    }

    if (requestUrl.endsWith("/api/auth/me")) {
      return new Response(
        JSON.stringify({
          id: "user-1",
          name: "Dayu",
          displayName: "Da Yu",
          email: "dayu@slock.ai",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    if (requestUrl.endsWith("/api/servers")) {
      return new Response(
        JSON.stringify([
          { id: "server-a", name: "Alpha", slug: "alpha", role: "owner" },
          { id: "server-b", name: "Beta", slug: "beta", role: "admin" },
        ]),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    }

    throw new Error(`Unexpected request: ${requestUrl}`);
  };

  const context = await resolveRemoteContext(
    "https://app.slock.ai",
    { accessToken: "access-old", refreshToken: "refresh-old" },
    fetchImpl,
  );

  assert.equal(context.session.accessToken, "access-new");
  assert.equal(context.session.refreshToken, "refresh-new");
  assert.equal(context.user.displayName, "Da Yu");
  assert.equal(context.servers.length, 2);
  assert.ok(calls.some((entry) => entry.url.endsWith("/api/auth/refresh")));
  assert.ok(calls.some((entry) => entry.url.endsWith("/api/auth/me")));
  assert.ok(calls.some((entry) => entry.url.endsWith("/api/servers")));
  assert.ok(calls.every((entry) => entry.url.startsWith("https://api.slock.ai/")));
});

test("resolveRemoteContext throws a clear error when the server returns HTML instead of API JSON", async () => {
  await assert.rejects(
    () =>
      resolveRemoteContext(
        "https://app.slock.ai",
        { accessToken: "access-new", refreshToken: "refresh-new" },
        async (input) => {
          if (String(input).endsWith("/api/auth/me")) {
            return new Response(
              JSON.stringify({
                id: "user-1",
                name: "Dayu",
              }),
              { status: 200, headers: { "content-type": "application/json" } },
            );
          }

          return new Response("<!DOCTYPE html><html><body>not api</body></html>", {
            status: 200,
            headers: { "content-type": "text/html" },
          });
        },
      ),
    {
      message:
        "The Slock server returned HTML instead of API JSON. This server URL may point at the web app instead of the backend API, or the required API routes may not be deployed yet.",
    },
  );
});

test("registerMachineWithUserSession returns the machine api key and id", async () => {
  const result = await registerMachineWithUserSession(
    "https://app.slock.ai",
    { accessToken: "access-new", refreshToken: "refresh-new" },
    "server-a",
    "Slock Daemon · dayu-mbp",
    async (input, init) => {
      assert.equal(String(input), "https://api.slock.ai/api/servers/server-a/machines");
      assert.equal(init?.method, "POST");
      return new Response(
        JSON.stringify({
          apiKey: "sk_machine_test",
          machine: {
            id: "machine-1",
            name: "Slock Daemon · dayu-mbp",
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  );

  assert.deepEqual(result, {
    session: {
      accessToken: "access-new",
      refreshToken: "refresh-new",
    },
    apiKey: "sk_machine_test",
    machineId: "machine-1",
    machineName: "Slock Daemon · dayu-mbp",
  });
});

test("listRemoteMachinesWithUserSession refreshes stale sessions and normalizes remote machine inventory", async () => {
  const calls: Array<{ url: string; auth: string | null }> = [];
  const result = await listRemoteMachinesWithUserSession(
    "https://app.slock.ai",
    { accessToken: "access-old", refreshToken: "refresh-old" },
    "local-server-1",
    "server-a",
    async (input, init) => {
      const auth = init?.headers instanceof Headers
        ? init.headers.get("Authorization")
        : Array.isArray(init?.headers)
          ? null
          : (init?.headers as Record<string, string> | undefined)?.Authorization ?? null;
      calls.push({ url: String(input), auth });

      if (String(input).endsWith("/api/auth/refresh")) {
        return new Response(
          JSON.stringify({ accessToken: "access-new", refreshToken: "refresh-new" }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }

      if (auth === "Bearer access-old") {
        return new Response(JSON.stringify({ error: "expired" }), { status: 401 });
      }

      return new Response(
        JSON.stringify({
          machines: [
            {
              id: "machine-1",
              name: "Dayu MacBook Pro",
              status: "online",
              apiKeyPrefix: "sk_machine_abc",
              runtimes: ["codex", "claude"],
              daemonVersion: "0.33.0",
              lastHeartbeat: "2026-04-10T01:59:00.000Z",
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  );

  assert.equal(result.session.accessToken, "access-new");
  assert.deepEqual(result.machines, [
    {
      localServerId: "local-server-1",
      id: "machine-1",
      name: "Dayu MacBook Pro",
      status: "online",
      apiKeyPrefix: "sk_machine_abc",
      runtimes: ["codex", "claude"],
      daemonVersion: "0.33.0",
      lastHeartbeat: "2026-04-10T01:59:00.000Z",
    },
  ]);
  assert.ok(calls.some((entry) => entry.url.endsWith("/api/servers/server-a/machines") && entry.auth === "Bearer access-new"));
  assert.ok(calls.every((entry) => entry.url.startsWith("https://api.slock.ai/")));
});

test("rotateMachineKeyWithUserSession returns the rotated machine key", async () => {
  const result = await rotateMachineKeyWithUserSession(
    "https://app.slock.ai",
    { accessToken: "access-new", refreshToken: "refresh-new" },
    "server-a",
    "machine-1",
    async (input, init) => {
      assert.equal(String(input), "https://api.slock.ai/api/servers/server-a/machines/machine-1/rotate-key");
      assert.equal(init?.method, "POST");
      return new Response(
        JSON.stringify({ apiKey: "sk_machine_rotated" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
  );

  assert.deepEqual(result, {
    session: {
      accessToken: "access-new",
      refreshToken: "refresh-new",
    },
    apiKey: "sk_machine_rotated",
  });
});
