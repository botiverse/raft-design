/**
 * Message system stress tests.
 *
 * Usage:
 *   tsx scripts/stress-messages.ts <test>
 *
 * tests:
 *   seq-ordering     — fire N concurrent sends, check REST seq vs socket arrival order
 *   pagination       — seed K messages, scan via before= / after=, check no gaps/dupes
 *   context-mutation — (stub) /messages/context during edit/delete (server has no edit API yet)
 *   thread-burst     — fire N concurrent thread replies, check replyCount consistency
 *   send-and-see     — pattern: POST msg is immediately visible via /channel, /sync, /context
 *   unread-counter   — pattern: mark-read → other-sends bump count; own-sends don't
 *   resume-catchup   — pattern: /sync(since=K) returns exactly the messages > K, ascending, no gaps
 *   permalink-context — pattern: /context returns symmetric neighbors; edge cases have !hasOlder/!hasNewer
 *   all              — run every test in order
 *
 * Env overrides:
 *   SLOCK_ENV_FILE=.dev-env-message-stress.json (default)
 *   CONCURRENCY=30
 *   SEED_COUNT=500
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { io as ioClient, type Socket } from "../packages/web/node_modules/socket.io-client/build/esm/index.js";

type Env = {
  user: { id: string; email: string; password: string };
  server: { id: string };
  channel: { id: string };
  dmChannel: { id: string };
  agent: { id: string };
  machine: { apiKey: string };
};

const ENV_FILE = process.env.SLOCK_ENV_FILE ?? ".dev-env-message-stress.json";
const env = JSON.parse(readFileSync(resolve(ENV_FILE), "utf8")) as Env;
const PORT_OFFSET = 42; // message-stress offset — server on 13043
const BASE = `http://localhost:${13001 + PORT_OFFSET}`;
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 30);
const SEED_COUNT = Number(process.env.SEED_COUNT ?? 500);

async function login(): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: env.user.email, password: env.user.password }),
  });
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`);
  const { accessToken } = (await res.json()) as { accessToken: string };
  return accessToken;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Server-Id": env.server.id,
  };
}

function connectSocket(token: string): Promise<Socket> {
  return new Promise((resolvePromise, reject) => {
    const socket = ioClient(BASE, {
      auth: { token, serverId: env.server.id },
      transports: ["websocket"],
    });
    socket.once("connect", () => {
      socket.once("rooms:joined", () => resolvePromise(socket));
    });
    socket.once("connect_error", reject);
  });
}

async function sendMessage(
  token: string,
  channelId: string,
  content: string,
): Promise<{ id: string; seq: number; createdAt: string }> {
  const res = await fetch(`${BASE}/api/messages`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ channelId, content }),
  });
  if (!res.ok) throw new Error(`send failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; seq: number; createdAt: string };
}

async function agentSend(content: string, idempotencyKey: string) {
  const res = await fetch(`${BASE}/internal/agent/${env.agent.id}/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.machine.apiKey}`,
    },
    body: JSON.stringify({ target: "#general", content, idempotencyKey }),
  });
  if (!res.ok) throw new Error(`agent send failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { ok: boolean; messageId: string };
}

/** Test 1: concurrent REST POSTs, check seq monotonicity + broadcast ordering */
async function testSeqOrdering() {
  console.log(`\n=== test: seq-ordering (concurrency=${CONCURRENCY}) ===`);
  const token = await login();
  const socket = await connectSocket(token);

  const received: { seq: number; id: string; arrivedAt: number }[] = [];
  socket.on("message:new", (msg: { id: string; seq: number; channelId: string }) => {
    if (msg.channelId !== env.channel.id) return;
    received.push({ seq: msg.seq, id: msg.id, arrivedAt: Date.now() });
  });

  const restStarts = Date.now();
  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) =>
      sendMessage(token, env.channel.id, `stress-seq-${Date.now()}-${i}`),
    ),
  );
  const restEnded = Date.now();

  await new Promise((r) => setTimeout(r, 1500));

  const restSeqs = results.map((r) => r.seq).sort((a, b) => a - b);
  const restIds = new Set(results.map((r) => r.id));
  const broadcastsForBatch = received.filter((r) => restIds.has(r.id));
  const broadcastSeqs = broadcastsForBatch.map((r) => r.seq);

  const gaps: number[] = [];
  for (let i = 1; i < restSeqs.length; i++) {
    if (restSeqs[i] !== restSeqs[i - 1] + 1) gaps.push(restSeqs[i]);
  }

  const inOrder = broadcastSeqs.every((s, i) => i === 0 || s >= broadcastSeqs[i - 1]);
  const broadcastReceived = broadcastsForBatch.length;

  console.log(`  rest duration: ${restEnded - restStarts}ms`);
  console.log(`  rest seq range: ${restSeqs[0]}..${restSeqs[restSeqs.length - 1]}`);
  console.log(`  rest seqs contiguous: ${gaps.length === 0} (gaps at: ${gaps.join(",") || "none"})`);
  console.log(`  broadcasts received: ${broadcastReceived}/${CONCURRENCY}`);
  console.log(`  broadcasts in seq order: ${inOrder}`);
  if (!inOrder) {
    for (let i = 1; i < broadcastSeqs.length; i++) {
      if (broadcastSeqs[i] < broadcastSeqs[i - 1]) {
        console.log(`    out-of-order at i=${i}: seq ${broadcastSeqs[i - 1]} then ${broadcastSeqs[i]}`);
      }
    }
  }
  if (broadcastReceived < CONCURRENCY) {
    const missingSeqs = restSeqs.filter((s) => !broadcastSeqs.includes(s));
    console.log(`  MISSING from broadcast: ${missingSeqs.join(",")}`);
  }

  socket.close();
}

/** Test 2: seed K messages, walk pagination forward/backward, check contiguity */
async function testPagination() {
  console.log(`\n=== test: pagination (seed=${SEED_COUNT}) ===`);
  const token = await login();

  // Remember baseline max seq before seeding (to scope "missing" checks to this run)
  const baselineRes = await fetch(
    `${BASE}/api/messages/channel/${env.channel.id}?limit=1`,
    { headers: authHeaders(token) },
  );
  const { messages: baseline } = (await baselineRes.json()) as { messages: { seq: number }[] };
  const baselineMaxSeq = baseline[0]?.seq ?? 0;

  const seededIds: string[] = [];
  const batchSize = 20;
  console.log(`  seeding ${SEED_COUNT} messages via agent endpoint...`);
  for (let i = 0; i < SEED_COUNT; i += batchSize) {
    const chunk = Math.min(batchSize, SEED_COUNT - i);
    const batch = await Promise.all(
      Array.from({ length: chunk }, (_, j) =>
        agentSend(`pag-${Date.now()}-${i + j}`, `pag-${Date.now()}-${i + j}`),
      ),
    );
    seededIds.push(...batch.map((b) => b.messageId));
  }
  console.log(`  seeded ${seededIds.length} messages`);

  // Backward pagination walk (before=)
  // listMessages response is always ASCENDING (see messageService.ts:653 — reverses internally).
  // Page[0].seq is the OLDEST in the page, page[last].seq is the NEWEST.
  // So cursor for backward walk is page[0].seq.
  const collectedBackward: { seq: number; id: string }[] = [];
  let cursor: number | undefined = undefined;
  let pages = 0;
  while (pages < Math.ceil(SEED_COUNT / 50) + 5) {
    const qs = new URLSearchParams({ limit: "50" });
    if (cursor !== undefined) qs.set("before", String(cursor));
    const res = await fetch(
      `${BASE}/api/messages/channel/${env.channel.id}?${qs.toString()}`,
      { headers: authHeaders(token) },
    );
    const { messages: page } = (await res.json()) as { messages: { seq: number; id: string }[] };
    if (page.length === 0) break;
    collectedBackward.push(...page);
    cursor = page[0].seq; // oldest of page → feed as `before` for next query
    pages++;
    if (cursor <= baselineMaxSeq) break;
  }
  const backwardIds = new Set(collectedBackward.map((m) => m.id));
  const missingBackward = seededIds.filter((id) => !backwardIds.has(id));
  const dupesBackward = collectedBackward.length - backwardIds.size;
  console.log(`  backward pages: ${pages}, collected: ${collectedBackward.length}`);
  console.log(`  seeded messages missing from backward walk: ${missingBackward.length}`);
  console.log(`  duplicates in backward walk: ${dupesBackward}`);

  // Forward pagination walk (after=)
  const collectedForward: { seq: number; id: string }[] = [];
  let afterCursor: number | undefined = baselineMaxSeq;
  pages = 0;
  while (pages < Math.ceil(SEED_COUNT / 50) + 5) {
    const qs = new URLSearchParams({ limit: "50", after: String(afterCursor) });
    const res = await fetch(
      `${BASE}/api/messages/channel/${env.channel.id}?${qs.toString()}`,
      { headers: authHeaders(token) },
    );
    const { messages: page } = (await res.json()) as { messages: { seq: number; id: string }[] };
    if (page.length === 0) break;
    collectedForward.push(...page);
    afterCursor = page[page.length - 1].seq;
    pages++;
  }
  const forwardIds = new Set(collectedForward.map((m) => m.id));
  const missingForward = seededIds.filter((id) => !forwardIds.has(id));
  const dupesForward = collectedForward.length - forwardIds.size;
  const forwardAsc = collectedForward.every(
    (m, i) => i === 0 || collectedForward[i - 1].seq < m.seq,
  );
  console.log(`  forward pages: ${pages}, collected: ${collectedForward.length}`);
  console.log(`  seeded messages missing from forward walk: ${missingForward.length}`);
  console.log(`  duplicates in forward walk: ${dupesForward}`);
  console.log(`  forward walk ascending: ${forwardAsc}`);

  // Seq contiguity of seeded range (in DB, seq is bigserial — gaps only if other inserts happened)
  const seedSeqs = collectedForward
    .filter((m) => seededIds.includes(m.id))
    .map((m) => m.seq)
    .sort((a, b) => a - b);
  let gaps = 0;
  const gapDetails: string[] = [];
  for (let i = 1; i < seedSeqs.length; i++) {
    if (seedSeqs[i] !== seedSeqs[i - 1] + 1) {
      gaps++;
      if (gapDetails.length < 5) gapDetails.push(`${seedSeqs[i - 1]}→${seedSeqs[i]}`);
    }
  }
  console.log(`  seeded seq gaps: ${gaps}${gapDetails.length > 0 ? " (" + gapDetails.join(",") + ")" : ""}`);
}

/** Test 3: concurrent thread replies, check parent replyCount + thread:updated fan-out */
async function testThreadBurst() {
  console.log(`\n=== test: thread-burst (concurrency=${CONCURRENCY}) ===`);
  const token = await login();
  const socket = await connectSocket(token);

  const parent = await sendMessage(token, env.channel.id, `thread-parent-${Date.now()}`);
  const threadRes = await fetch(
    `${BASE}/api/channels/${env.channel.id}/threads`,
    {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ parentMessageId: parent.id }),
    },
  );
  if (!threadRes.ok) {
    console.log(`  thread create failed: ${threadRes.status} ${await threadRes.text()} — skipping`);
    socket.close();
    return;
  }
  const { threadChannelId } = (await threadRes.json()) as { threadChannelId: string };

  const threadUpdates: { replyCount?: number; lastReplyAt?: string }[] = [];
  socket.on(
    "thread:updated",
    (evt: { parentMessageId: string; replyCount?: number; lastReplyAt?: string }) => {
      if (evt.parentMessageId === parent.id) threadUpdates.push(evt);
    },
  );

  const replies = await Promise.all(
    Array.from({ length: CONCURRENCY }, (_, i) =>
      sendMessage(token, threadChannelId, `reply-${i}`),
    ),
  );
  await new Promise((r) => setTimeout(r, 1500));

  // Fetch thread info via REST and compare
  const infoRes = await fetch(
    `${BASE}/api/channels/${env.channel.id}/threads/${parent.id}`,
    { headers: authHeaders(token) },
  );
  const info = infoRes.ok ? ((await infoRes.json()) as { replyCount?: number }) : null;

  console.log(`  replies sent: ${replies.length}`);
  console.log(`  thread:updated events: ${threadUpdates.length}`);
  const lastEventCount = threadUpdates[threadUpdates.length - 1]?.replyCount;
  console.log(`  last event replyCount: ${lastEventCount}`);
  console.log(`  REST replyCount: ${info?.replyCount}`);
  if (info?.replyCount !== undefined && info.replyCount !== replies.length) {
    console.log(
      `  ⚠️ replyCount mismatch: REST=${info.replyCount} expected=${replies.length}`,
    );
  }

  socket.close();
}

async function syncSince(
  token: string,
  since: number,
  channelId?: string,
): Promise<{ id: string; seq: number; content: string; channelId: string }[]> {
  const qs = new URLSearchParams({ since_seq: String(since) });
  if (channelId) qs.set("channel_id", channelId);
  const res = await fetch(`${BASE}/api/messages/sync?${qs.toString()}`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`sync failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as { id: string; seq: number; content: string; channelId: string }[];
}

/** Pattern: a user sends a message and immediately sees it via every read surface. */
async function testSendAndSee() {
  console.log(`\n=== test: send-and-see ===`);
  const token = await login();
  const content = `send-and-see-${Date.now()}`;
  const sent = await sendMessage(token, env.channel.id, content);

  const chanRes = await fetch(
    `${BASE}/api/messages/channel/${env.channel.id}?limit=5`,
    { headers: authHeaders(token) },
  );
  const { messages: chanMsgs } = (await chanRes.json()) as {
    messages: { id: string; content: string }[];
  };
  const viaChannel = chanMsgs.some((m) => m.id === sent.id && m.content === content);

  const syncMsgs = await syncSince(token, sent.seq - 1, env.channel.id);
  const viaSync = syncMsgs.some((m) => m.id === sent.id && m.content === content);

  const ctxRes = await fetch(
    `${BASE}/api/messages/context/${sent.id}`,
    { headers: authHeaders(token) },
  );
  const ctx = (await ctxRes.json()) as {
    targetMessageId: string;
    messages: { id: string; content: string }[];
  };
  const viaContext =
    ctx.targetMessageId === sent.id &&
    ctx.messages.some((m) => m.id === sent.id && m.content === content);

  console.log(`  seq=${sent.seq} viaChannel=${viaChannel} viaSync=${viaSync} viaContext=${viaContext}`);
  if (!viaChannel || !viaSync || !viaContext) {
    console.log(`  ❌ send-and-see: message not uniformly visible across read surfaces`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ ok — message visible via every read path`);
  }
}

/** Pattern: mark-read zeroes unread; other-sender bumps, own-sender does not. */
async function testUnreadCounter() {
  console.log(`\n=== test: unread-counter ===`);
  const token = await login();

  await fetch(`${BASE}/api/channels/${env.channel.id}/read-all`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const baseRes = await fetch(`${BASE}/api/channels/unread`, { headers: authHeaders(token) });
  const baseCounts = (await baseRes.json()) as Record<string, number>;
  const baseUnread = baseCounts[env.channel.id] ?? 0;

  const N = 5;
  for (let i = 0; i < N; i++) {
    await agentSend(`unread-other-${Date.now()}-${i}`, `unread-other-${Date.now()}-${i}`);
  }
  const afterOtherRes = await fetch(`${BASE}/api/channels/unread`, { headers: authHeaders(token) });
  const afterOther = ((await afterOtherRes.json()) as Record<string, number>)[env.channel.id] ?? 0;

  const afterMarkRes = await fetch(
    `${BASE}/api/channels/${env.channel.id}/read-all`,
    { method: "POST", headers: authHeaders(token) },
  );
  await afterMarkRes.json();
  const M = 3;
  for (let i = 0; i < M; i++) {
    await sendMessage(token, env.channel.id, `unread-own-${Date.now()}-${i}`);
  }
  const afterOwnRes = await fetch(`${BASE}/api/channels/unread`, { headers: authHeaders(token) });
  const afterOwn = ((await afterOwnRes.json()) as Record<string, number>)[env.channel.id] ?? 0;

  const otherBump = afterOther - baseUnread;
  console.log(`  baseline unread: ${baseUnread}`);
  console.log(`  after ${N} other-sender sends: ${afterOther} (bump=${otherBump}, expected=${N})`);
  console.log(`  after ${M} own sends (post re-read): ${afterOwn} (expected=0)`);
  let fail = false;
  if (otherBump !== N) { console.log(`  ❌ other-sender unread bump wrong`); fail = true; }
  if (afterOwn !== 0) { console.log(`  ❌ own-sends counted in unread`); fail = true; }
  if (!fail) console.log(`  ✅ ok — read cursor + unread semantics match expectation`);
  else process.exitCode = 1;
}

/** Pattern: /sync returns exactly the delta since cursor, in order, no gaps, no dupes. */
async function testResumeCatchup() {
  console.log(`\n=== test: resume-catchup ===`);
  const token = await login();

  const beforeRes = await fetch(
    `${BASE}/api/messages/channel/${env.channel.id}?limit=1`,
    { headers: authHeaders(token) },
  );
  const { messages: before } = (await beforeRes.json()) as { messages: { seq: number }[] };
  const cursor = before[0]?.seq ?? 0;
  console.log(`  cursor before catch-up window: ${cursor}`);

  const N = 25;
  const sentIds: string[] = [];
  for (let i = 0; i < N; i++) {
    const r = await agentSend(`resume-${Date.now()}-${i}`, `resume-${Date.now()}-${i}`);
    sentIds.push(r.messageId);
  }

  const resumed = await syncSince(token, cursor, env.channel.id);
  const seqs = resumed.map((m) => m.seq);
  const ids = new Set(resumed.map((m) => m.id));

  const allPresent = sentIds.every((id) => ids.has(id));
  const ascending = seqs.every((s, i) => i === 0 || s > seqs[i - 1]);
  const noDupes = seqs.length === new Set(seqs).size;
  const allAboveCursor = seqs.every((s) => s > cursor);

  console.log(`  resumed count: ${resumed.length} (expected >= ${N})`);
  console.log(`  seq range: ${seqs[0]}..${seqs[seqs.length - 1]}`);
  console.log(`  all sent ids present: ${allPresent}`);
  console.log(`  ascending: ${ascending}`);
  console.log(`  no duplicates: ${noDupes}`);
  console.log(`  all seq > cursor: ${allAboveCursor}`);
  if (!allPresent || !ascending || !noDupes || !allAboveCursor) {
    console.log(`  ❌ resume-catchup: sync did not faithfully replay the delta`);
    process.exitCode = 1;
  } else {
    console.log(`  ✅ ok — every sent message returned once, in order, above cursor`);
  }
}

/** Pattern: /context anchors on a message with symmetric neighbors; edges flag hasOlder/hasNewer. */
async function testPermalinkContext() {
  console.log(`\n=== test: permalink-context ===`);
  const token = await login();

  const listRes = await fetch(
    `${BASE}/api/messages/channel/${env.channel.id}?limit=50`,
    { headers: authHeaders(token) },
  );
  const { messages: recent } = (await listRes.json()) as {
    messages: { id: string; seq: number }[];
  };
  if (recent.length < 3) {
    console.log(`  ⚠️ channel has only ${recent.length} messages — seeding 20 to create neighbors`);
    for (let i = 0; i < 20; i++) {
      await agentSend(`ctx-seed-${Date.now()}-${i}`, `ctx-seed-${Date.now()}-${i}`);
    }
    const reRes = await fetch(
      `${BASE}/api/messages/channel/${env.channel.id}?limit=50`,
      { headers: authHeaders(token) },
    );
    const reload = (await reRes.json()) as { messages: { id: string; seq: number }[] };
    recent.splice(0, recent.length, ...reload.messages);
  }

  const midMsg = recent[Math.floor(recent.length / 2)];
  const midRes = await fetch(
    `${BASE}/api/messages/context/${midMsg.id}`,
    { headers: authHeaders(token) },
  );
  const mid = (await midRes.json()) as {
    targetMessageId: string;
    hasOlder: boolean;
    hasNewer: boolean;
    messages: { id: string; seq: number }[];
  };
  const midSeqs = mid.messages.map((m) => m.seq);
  const midAsc = midSeqs.every((s, i) => i === 0 || s > midSeqs[i - 1]);
  const midHasTarget = mid.messages.some((m) => m.id === midMsg.id);
  const midTargetIdMatch = mid.targetMessageId === midMsg.id;
  console.log(`  middle anchor seq=${midMsg.seq}:`);
  console.log(`    target in messages: ${midHasTarget}, targetMessageId match: ${midTargetIdMatch}`);
  console.log(`    messages ascending: ${midAsc}, count=${midSeqs.length}`);
  console.log(`    hasOlder=${mid.hasOlder}, hasNewer=${mid.hasNewer}`);

  const newest = recent[recent.length - 1];
  const newestRes = await fetch(
    `${BASE}/api/messages/context/${newest.id}`,
    { headers: authHeaders(token) },
  );
  const newestCtx = (await newestRes.json()) as {
    hasNewer: boolean;
    messages: { id: string; seq: number }[];
  };
  const newestIsLast = newestCtx.messages[newestCtx.messages.length - 1]?.id === newest.id;
  console.log(`  newest-anchor seq=${newest.seq}: hasNewer=${newestCtx.hasNewer}, anchor is last in window: ${newestIsLast}`);

  let fail = false;
  if (!midHasTarget || !midTargetIdMatch) { console.log(`  ❌ middle anchor missing from its own context window`); fail = true; }
  if (!midAsc) { console.log(`  ❌ context messages not ascending`); fail = true; }
  if (newestCtx.hasNewer) { console.log(`  ❌ newest message reports hasNewer=true`); fail = true; }
  if (!newestIsLast) { console.log(`  ❌ newest anchor not positioned last in context window`); fail = true; }
  if (!fail) console.log(`  ✅ ok — context is symmetric, ascending, edge-aware`);
  else process.exitCode = 1;
}

async function main() {
  const test = process.argv[2] ?? "all";
  const known = [
    "seq-ordering",
    "pagination",
    "thread-burst",
    "send-and-see",
    "unread-counter",
    "resume-catchup",
    "permalink-context",
    "all",
  ];
  try {
    if (test === "seq-ordering" || test === "all") await testSeqOrdering();
    if (test === "pagination" || test === "all") await testPagination();
    if (test === "thread-burst" || test === "all") await testThreadBurst();
    if (test === "send-and-see" || test === "all") await testSendAndSee();
    if (test === "unread-counter" || test === "all") await testUnreadCounter();
    if (test === "resume-catchup" || test === "all") await testResumeCatchup();
    if (test === "permalink-context" || test === "all") await testPermalinkContext();
    if (!known.includes(test)) {
      console.log(`unknown test: ${test}`);
      process.exit(1);
    }
  } catch (err) {
    console.error("FATAL:", err);
    process.exit(1);
  }
  process.exit(process.exitCode ?? 0);
}

main();
