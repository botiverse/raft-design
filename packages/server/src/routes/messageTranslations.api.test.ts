import assert from "node:assert/strict";
import test from "node:test";
import argon2 from "argon2";
import { BasicTracer, MemoryTraceSink } from "@slock-ai/shared";
import { and, eq } from "drizzle-orm";
import { getDb } from "../db/index.js";
import {
  channelHumans,
  messageTranslations,
  serverMembers,
  servers,
  users,
} from "../db/schema.js";
import { assignMachine, createAgent } from "../services/agentService.js";
import { createChannel } from "../services/channelService.js";
import { registerMachine } from "../services/machineService.js";
import {
  __resetMessageTranslationServiceDepsForTests,
  __setMessageTranslationServiceDepsForTests,
} from "../services/messageTranslationService.js";
import { createMessage } from "../services/messageService.js";
import { createServer } from "../services/serverService.js";
import {
  TranslationPlaceholderValidationError,
  TranslationProviderError,
  type TranslationBatchItem,
  type TranslationBatchResult,
  type TranslationProvider,
  type TranslationProviderVersion,
} from "../services/translation/index.js";
import { startTestApp } from "../test/testAppHarness.js";

const TEST_PROVIDER_VERSION: TranslationProviderVersion = {
  provider: "fake",
  apiVersion: "v0",
  policyVersion: "fake-v0",
};
const TEST_PROVIDER_VERSION_KEY = "fake@v0+fake-v0";
const TEST_PLACEHOLDER_POLICY_VERSION = "placeholder-v0";

class FakeApiTranslationProvider implements TranslationProvider {
  readonly providerVersion = TEST_PROVIDER_VERSION;

  async translateBatch(
    items: readonly TranslationBatchItem[],
    targetLanguage: string,
  ): Promise<TranslationBatchResult> {
    return {
      providerVersion: this.providerVersion,
      items: items.map((item) => ({
        key: item.key,
        sourceText: item.sourceText,
        translatedText: `[${targetLanguage}] ${item.sourceText}`,
        targetLanguage,
        ...(item.sourceLanguage ? { sourceLanguage: item.sourceLanguage } : {}),
      })),
    };
  }
}

function setTestProvider(provider: TranslationProvider): void {
  __setMessageTranslationServiceDepsForTests({
    resolveProvider: () => ({
      provider,
      placeholderPolicyVersion: TEST_PLACEHOLDER_POLICY_VERSION,
    }),
  });
}

test.beforeEach(() => {
  setTestProvider(new FakeApiTranslationProvider());
});

test.afterEach(() => {
  __resetMessageTranslationServiceDepsForTests();
});

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

function authHeaders(token: string, serverId: string) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Server-Id": serverId,
  };
}

function machineHeaders(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function seedFixture(slug: string) {
  const db = getDb();
  const owner = await seedUser(`${slug}-owner@slock.test`, `${slug}-owner`);
  const member = await seedUser(`${slug}-member@slock.test`, `${slug}-member`);
  const outsider = await seedUser(`${slug}-outsider@slock.test`, `${slug}-outsider`);
  const server = await createServer(`Translation ${slug}`, `translation-${slug}`, owner.id);
  await db.update(servers).set({ translationEnabled: true }).where(eq(servers.id, server.id));
  await db.insert(serverMembers).values([
    { serverId: server.id, userId: member.id, role: "member" },
    { serverId: server.id, userId: outsider.id, role: "member" },
  ]).onConflictDoNothing();
  const channel = await createChannel(server.id, `${slug}-public`);
  const privateChannel = await createChannel(server.id, `${slug}-private`, undefined, "private");
  await db.insert(channelHumans).values([
    { channelId: privateChannel.id, userId: owner.id },
  ]).onConflictDoNothing();
  const agentName = slug.length <= 26 ? `${slug}-agent` : `agent-${slug.slice(0, 25)}`;
  const agent = await createAgent(server.id, agentName, { runtime: "codex" });
  return { db, owner, member, outsider, server, channel, privateChannel, agent };
}

async function postBatch(baseUrl: string, token: string, serverId: string, body: unknown) {
  return fetch(`${baseUrl}/api/message-translations:batch`, {
    method: "POST",
    headers: {
      ...authHeaders(token, serverId),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("POST /api/message-translations:batch rejects when server translation is disabled", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("server-disabled");
    await db.update(servers).set({ translationEnabled: false }).where(eq(servers.id, server.id));
    const message = await createMessage(channel.id, "agent", agent.id, "你好 disabled translation");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "auto",
      messageIds: [message.id],
    });

    assert.equal(res.status, 403);
    assert.deepEqual(await res.json(), { error: "Translation is disabled for this server" });
  } finally {
    await app.close();
  }
});

test("PATCH /api/auth/me updates account display preferences", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("preferred-language@slock.test", "preferred-language");
    const token = await login(app.baseUrl, user.email);

    const patchRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preferredLanguage: "en-US",
        preferredTimezone: "Asia/Shanghai",
        autoTranslationEnabled: false,
        preferredTranslationDisplay: "original",
        preferredTimeFormat: "24H",
        preferredMessageBodyFontSize: "LG",
      }),
    });
    assert.equal(patchRes.status, 200);
    const patchBody = await patchRes.json() as { preferredLanguage: string | null; preferredTimezone: string | null; autoTranslationEnabled: boolean; preferredTranslationDisplay: string; preferredTimeFormat: string | null; preferredMessageBodyFontSize: string | null };
    assert.equal(patchBody.preferredLanguage, "en");
    assert.equal(patchBody.preferredTimezone, "Asia/Shanghai");
    assert.equal(patchBody.autoTranslationEnabled, false);
    assert.equal(patchBody.preferredTranslationDisplay, "original");
    assert.equal(patchBody.preferredTimeFormat, "24h");
    assert.equal(patchBody.preferredMessageBodyFontSize, "lg");

    const getRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(getRes.status, 200);
    const getBody = await getRes.json() as { preferredLanguage: string | null; preferredTimezone: string | null; autoTranslationEnabled: boolean; preferredTranslationDisplay: string; preferredTimeFormat: string | null; preferredMessageBodyFontSize: string | null };
    assert.equal(getBody.preferredLanguage, "en");
    assert.equal(getBody.preferredTimezone, "Asia/Shanghai");
    assert.equal(getBody.autoTranslationEnabled, false);
    assert.equal(getBody.preferredTranslationDisplay, "original");
    assert.equal(getBody.preferredTimeFormat, "24h");
    assert.equal(getBody.preferredMessageBodyFontSize, "lg");

    const clearRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredLanguage: null, preferredTimezone: null, preferredTimeFormat: null, preferredMessageBodyFontSize: null }),
    });
    assert.equal(clearRes.status, 200);
    const clearBody = await clearRes.json() as { preferredLanguage: string | null; preferredTimezone: string | null; preferredTimeFormat: string | null; preferredMessageBodyFontSize: string | null };
    assert.equal(clearBody.preferredLanguage, null);
    assert.equal(clearBody.preferredTimezone, null);
    assert.equal(clearBody.preferredTimeFormat, null);
    assert.equal(clearBody.preferredMessageBodyFontSize, null);

    const invalidTimezoneRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredTimezone: "Not/A_Timezone" }),
    });
    assert.equal(invalidTimezoneRes.status, 400);

    const invalidMessageFontSizeRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredMessageBodyFontSize: "huge" }),
    });
    assert.equal(invalidMessageFontSizeRes.status, 400);

    const unsupportedLanguageRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredLanguage: "zh-CN" }),
    });
    assert.equal(unsupportedLanguageRes.status, 400);

    const invalidAutoTranslateRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ autoTranslationEnabled: null }),
    });
    assert.equal(invalidAutoTranslateRes.status, 400);

    const invalidTranslationDisplayRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredTranslationDisplay: "auto" }),
    });
    assert.equal(invalidTranslationDisplayRes.status, 400);

    const invalidTimeFormatRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preferredTimeFormat: "military" }),
    });
    assert.equal(invalidTimeFormatRes.status, 400);
  } finally {
    await app.close();
  }
});

test("PATCH /api/auth/me records referral source or referral skip", async () => {
  const app = await startTestApp("pglite://");
  try {
    const user = await seedUser("referral-source@slock.test", "referral-source");
    const token = await login(app.baseUrl, user.email);

    const patchRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralSource: "other",
        referralSourceOther: "Vancouver meetup",
      }),
    });
    assert.equal(patchRes.status, 200);
    const patchBody = await patchRes.json() as {
      referralSource: string | null;
      referralSourceOther: string | null;
      referralSourceSkippedAt: string | null;
    };
    assert.equal(patchBody.referralSource, "other");
    assert.equal(patchBody.referralSourceOther, "Vancouver meetup");
    assert.equal(patchBody.referralSourceSkippedAt, null);

    const skipRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralSourceSkipped: true }),
    });
    assert.equal(skipRes.status, 200);
    const skipBody = await skipRes.json() as {
      referralSource: string | null;
      referralSourceOther: string | null;
      referralSourceSkippedAt: string | null;
    };
    assert.equal(skipBody.referralSource, "other");
    assert.equal(skipBody.referralSourceOther, "Vancouver meetup");
    assert.ok(skipBody.referralSourceSkippedAt);

    const invalidRes = await fetch(`${app.baseUrl}/api/auth/me`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ referralSource: "wechat" }),
    });
    assert.equal(invalidRes.status, 400);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch translates visible messages and keeps history original-only", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("visible");
    const message = await createMessage(channel.id, "agent", agent.id, "你好 translation phase one");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.equal(body.results.length, 1);
    assert.deepEqual(body.results[0], {
      messageId: message.id,
      status: "translated",
      contentHash: body.results[0].contentHash,
      sourceLanguage: "zh",
      sourceConfidence: 95,
      targetLanguage: "en",
      translatedContent: "[en] 你好 translation phase one",
      provider: "fake",
      providerVersion: TEST_PROVIDER_VERSION_KEY,
      placeholderPolicyVersion: "placeholder-v0",
    });

    const [ledgerRow] = await db
      .select()
      .from(messageTranslations)
      .where(eq(messageTranslations.messageId, message.id));
    assert.equal(ledgerRow.status, "translated");
    assert.equal(ledgerRow.providerBilledChars, message.content.length);

    const historyRes = await fetch(`${app.baseUrl}/api/messages/channel/${channel.id}`, {
      headers: authHeaders(ownerToken, server.id),
    });
    assert.equal(historyRes.status, 200);
    const history = await historyRes.json() as { messages: Array<Record<string, unknown>> };
    const historyMessage = history.messages.find((candidate) => candidate.id === message.id);
    assert.ok(historyMessage);
    assert.equal(historyMessage.content, "你好 translation phase one");
    assert.equal("translatedContent" in historyMessage, false);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch emits sanitized translation trace events", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    app.app.set("serverTracer", new BasicTracer({ sink }));
    const { owner, server, channel, agent } = await seedFixture("trace-events");
    const zhMessage = await createMessage(channel.id, "agent", agent.id, "你好 tracing");
    const enMessage = await createMessage(channel.id, "agent", agent.id, "hello tracing");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "auto",
      messageIds: [zhMessage.id, enMessage.id, "00000000-0000-0000-0000-000000000000"],
    });
    assert.equal(res.status, 200);

    const events = sink.getAllSpans().flatMap((span) => span.events);
    const providerCall = events.find((event) => event.name === "translation.provider.call");
    assert.ok(providerCall);
    assert.equal(providerCall.attrs?.provider, "fake");
    assert.equal(providerCall.attrs?.target_language, "en");
    assert.equal(providerCall.attrs?.batch_size, 1);
    assert.equal(providerCall.attrs?.char_count, zhMessage.content.length);
    assert.equal(providerCall.attrs?.outcome, "success");
    assert.equal("source_text" in (providerCall.attrs ?? {}), false);
    assert.equal("translated_text" in (providerCall.attrs ?? {}), false);

    assert.equal(events.filter((event) => event.name === "translation.skipped").length, 0);

    const finished = events.find((event) => event.name === "translation.batch.finished");
    assert.ok(finished);
    assert.equal(finished.attrs?.translated_count, 1);
    assert.equal(finished.attrs?.skipped_count, 1);
    assert.equal(finished.attrs?.not_found_count, 1);
    assert.equal(finished.attrs?.provider_call_count, 1);
    assert.equal(finished.attrs?.skip_not_found_count, 1);
    assert.equal(finished.attrs?.skip_target_is_source_count, 1);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch traces server-disabled skips", async () => {
  const app = await startTestApp("pglite://");
  try {
    const sink = new MemoryTraceSink();
    app.app.set("serverTracer", new BasicTracer({ sink }));
    const { db, owner, server, channel, agent } = await seedFixture("trace-disabled");
    await db.update(servers).set({ translationEnabled: false }).where(eq(servers.id, server.id));
    const message = await createMessage(channel.id, "agent", agent.id, "你好 disabled trace");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "auto",
      messageIds: [message.id],
    });
    assert.equal(res.status, 403);

    const skip = sink.getAllSpans()
      .flatMap((span) => span.events)
      .find((event) => event.name === "translation.skipped");
    assert.ok(skip);
    assert.equal(skip.attrs?.reason, "server_disabled");
    assert.equal(skip.attrs?.target_language, "en");
    assert.equal(skip.attrs?.requested_count, 1);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch hides invisible message existence as not_found", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, outsider, server, privateChannel } = await seedFixture("visibility");
    const privateMessage = await createMessage(privateChannel.id, "user", owner.id, "private translation source");
    const outsiderToken = await login(app.baseUrl, outsider.email);

    const res = await postBatch(app.baseUrl, outsiderToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [privateMessage.id, "00000000-0000-0000-0000-000000000000"],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.deepEqual(body.results, [
      { messageId: privateMessage.id, status: "not_found" },
      { messageId: "00000000-0000-0000-0000-000000000000", status: "not_found" },
    ]);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch applies server-side skip reasons", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("skips");
    const ownMessage = await createMessage(channel.id, "user", owner.id, "我自己的消息");
    const systemMessage = await createMessage(channel.id, "user", "system", "系统消息", "system");
    const codeMessage = await createMessage(channel.id, "agent", agent.id, "```ts\nconst value = 1;\n```");
    const lowConfidenceMessage = await createMessage(channel.id, "agent", agent.id, "12345 !!!");
    const sameLanguageMessage = await createMessage(channel.id, "agent", agent.id, "hello same language");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "auto",
      messageIds: [
        ownMessage.id,
        systemMessage.id,
        codeMessage.id,
        lowConfidenceMessage.id,
        sameLanguageMessage.id,
      ],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<{ messageId: string; status: string; skipReason?: string; providerBilledChars?: number }> };
    const reasonById = new Map(body.results.map((result) => [result.messageId, result.skipReason]));
    assert.equal(reasonById.get(ownMessage.id), "own_message");
    assert.equal(reasonById.get(systemMessage.id), "system_message");
    assert.equal(reasonById.get(codeMessage.id), "code_or_link_only");
    assert.equal(reasonById.get(lowConfidenceMessage.id), "low_confidence");
    assert.equal(reasonById.get(sameLanguageMessage.id), "same_language");
    assert.ok(body.results.every((result) => result.status === "skipped"));

    const sameLanguageRows = await db
      .select()
      .from(messageTranslations)
      .where(and(
        eq(messageTranslations.messageId, sameLanguageMessage.id),
        eq(messageTranslations.skipReason, "same_language"),
      ));
    assert.equal(sameLanguageRows.length, 1);
    assert.equal(sameLanguageRows[0].providerBilledChars, 0);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch canonicalizes browser locale target before same-language skip", async () => {
  class FailingProvider implements TranslationProvider {
    readonly providerVersion = TEST_PROVIDER_VERSION;

    async translateBatch(): Promise<TranslationBatchResult> {
      throw new Error("same-language English should not reach provider");
    }
  }

  setTestProvider(new FailingProvider());
  const app = await startTestApp("pglite://");
  try {
    const { owner, server, channel, agent } = await seedFixture("locale-same-language");
    const englishMessage = await createMessage(channel.id, "agent", agent.id, "hello browser locale");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en-US",
      mode: "auto",
      messageIds: [englishMessage.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.equal(body.results[0].status, "skipped");
    assert.equal(body.results[0].skipReason, "same_language");
    assert.equal(body.results[0].sourceLanguage, "en");
    assert.equal(body.results[0].targetLanguage, "en");
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch keeps viewer-dependent own-message skips out of shared ledger", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, member, server, channel } = await seedFixture("own-skip");
    const message = await createMessage(channel.id, "user", owner.id, "作者自己的中文消息");
    const ownerToken = await login(app.baseUrl, owner.email);
    const memberToken = await login(app.baseUrl, member.email);

    const ownerRes = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(ownerRes.status, 200);
    const ownerBody = await ownerRes.json() as { results: Array<Record<string, unknown>> };
    assert.equal(ownerBody.results[0].status, "skipped");
    assert.equal(ownerBody.results[0].skipReason, "own_message");
    assert.equal((await db.select().from(messageTranslations).where(eq(messageTranslations.messageId, message.id))).length, 0);

    const memberRes = await postBatch(app.baseUrl, memberToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(memberRes.status, 200);
    const memberBody = await memberRes.json() as { results: Array<Record<string, unknown>> };
    assert.equal(memberBody.results[0].status, "translated");
    assert.equal(memberBody.results[0].translatedContent, "[en] 作者自己的中文消息");
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch releases reserve on transient provider failure", async () => {
  class TransientFailureProvider implements TranslationProvider {
    readonly providerVersion: TranslationProviderVersion = {
      provider: "azure-translator",
      apiVersion: "3.0",
      policyVersion: "azure-translator-v1",
    };

    async translateBatch(): Promise<TranslationBatchResult> {
      throw new TranslationProviderError({
        providerVersion: this.providerVersion,
        code: "azure_transport_error",
        message: "provider timed out",
        disposition: "transient",
      });
    }
  }

  setTestProvider(new TransientFailureProvider());
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("transient-failure");
    const message = await createMessage(channel.id, "agent", agent.id, "会触发瞬时失败的中文消息");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.deepEqual(body.results[0], {
      messageId: message.id,
      status: "failed",
      contentHash: body.results[0].contentHash,
      sourceLanguage: "zh",
      sourceConfidence: 95,
      targetLanguage: "en",
      skipReason: "provider_unavailable",
      provider: "azure-translator",
      providerVersion: "azure-translator@3.0+azure-translator-v1",
      placeholderPolicyVersion: TEST_PLACEHOLDER_POLICY_VERSION,
    });

    const ledgerRows = await db
      .select()
      .from(messageTranslations)
      .where(eq(messageTranslations.messageId, message.id));
    assert.equal(ledgerRows.length, 0);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch retains reserve and writes failed ledger row on content-driven provider failure", async () => {
  class ContentDrivenFailureProvider implements TranslationProvider {
    readonly providerVersion: TranslationProviderVersion = {
      provider: "azure-translator",
      apiVersion: "3.0",
      policyVersion: "azure-translator-v1",
    };

    async translateBatch(): Promise<TranslationBatchResult> {
      throw new TranslationProviderError({
        providerVersion: this.providerVersion,
        code: "azure_http_error",
        message: "provider rejected content",
        disposition: "content_driven",
      });
    }
  }

  setTestProvider(new ContentDrivenFailureProvider());
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("content-failure");
    const message = await createMessage(channel.id, "agent", agent.id, "会触发内容失败的中文消息");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.deepEqual(body.results[0], {
      messageId: message.id,
      status: "failed",
      contentHash: body.results[0].contentHash,
      sourceLanguage: "zh",
      sourceConfidence: 95,
      targetLanguage: "en",
      skipReason: "content_invalid",
      provider: "azure-translator",
      providerVersion: "azure-translator@3.0+azure-translator-v1",
      placeholderPolicyVersion: TEST_PLACEHOLDER_POLICY_VERSION,
    });

    const [ledgerRow] = await db
      .select()
      .from(messageTranslations)
      .where(eq(messageTranslations.messageId, message.id));
    assert.equal(ledgerRow.status, "failed");
    assert.equal(ledgerRow.skipReason, "content_invalid");
    assert.equal(ledgerRow.translatedContent, null);
    assert.equal(ledgerRow.providerBilledChars, 0);
    assert.equal(ledgerRow.requestedChars, message.content.length);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch manual retry bypasses failed ledger rows", async () => {
  class FlakyProvider implements TranslationProvider {
    readonly providerVersion: TranslationProviderVersion = {
      provider: "azure-translator",
      apiVersion: "3.0",
      policyVersion: "azure-translator-v1",
    };
    calls = 0;

    async translateBatch(items: readonly TranslationBatchItem[], targetLanguage: string): Promise<TranslationBatchResult> {
      this.calls += 1;
      if (this.calls === 1) {
        throw new TranslationProviderError({
          providerVersion: this.providerVersion,
          code: "azure_http_error",
          message: "provider rejected content",
          disposition: "content_driven",
        });
      }
      return {
        providerVersion: this.providerVersion,
        items: items.map((item) => ({
          key: item.key,
          sourceText: item.sourceText,
          translatedText: `[retry:${targetLanguage}] ${item.sourceText}`,
          targetLanguage,
          ...(item.sourceLanguage ? { sourceLanguage: item.sourceLanguage } : {}),
        })),
      };
    }
  }

  const provider = new FlakyProvider();
  setTestProvider(provider);
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("manual-retry-failed-ledger");
    const message = await createMessage(channel.id, "agent", agent.id, "重试应该重新调用 provider");
    const ownerToken = await login(app.baseUrl, owner.email);

    const firstRes = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(firstRes.status, 200);
    const firstBody = await firstRes.json() as { results: Array<Record<string, unknown>> };
    assert.equal(firstBody.results[0].status, "failed");
    assert.equal(firstBody.results[0].skipReason, "content_invalid");

    const retryRes = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(retryRes.status, 200);
    const retryBody = await retryRes.json() as { results: Array<Record<string, unknown>> };
    assert.equal(retryBody.results[0].status, "translated");
    assert.equal(retryBody.results[0].translatedContent, `[retry:en] ${message.content}`);
    assert.equal(provider.calls, 2);

    const [ledgerRow] = await db
      .select()
      .from(messageTranslations)
      .where(eq(messageTranslations.messageId, message.id));
    assert.equal(ledgerRow.status, "translated");
    assert.equal(ledgerRow.translatedContent, `[retry:en] ${message.content}`);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch splits provider calls by source language", async () => {
  class SingleSourceProvider implements TranslationProvider {
    readonly providerVersion: TranslationProviderVersion = {
      provider: "azure-translator",
      apiVersion: "3.0",
      policyVersion: "azure-translator-v1",
    };
    readonly batchSources: string[] = [];

    async translateBatch(items: readonly TranslationBatchItem[], targetLanguage: string): Promise<TranslationBatchResult> {
      const sourceLanguages = new Set(items.map((item) => item.sourceLanguage));
      assert.equal(sourceLanguages.size, 1, "provider batches should not mix detected source languages");
      this.batchSources.push([...sourceLanguages][0] ?? "none");
      return {
        providerVersion: this.providerVersion,
        items: items.map((item) => ({
          key: item.key,
          sourceText: item.sourceText,
          translatedText: `[${targetLanguage}] ${item.sourceText}`,
          targetLanguage,
          ...(item.sourceLanguage ? { sourceLanguage: item.sourceLanguage } : {}),
        })),
      };
    }
  }

  const provider = new SingleSourceProvider();
  setTestProvider(provider);
  const app = await startTestApp("pglite://");
  try {
    const { owner, server, channel, agent } = await seedFixture("mixed-source-provider-split");
    const zhMessage = await createMessage(channel.id, "agent", agent.id, "你好，需要翻译");
    const enMessage = await createMessage(channel.id, "agent", agent.id, "Hello, translate me");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "ja",
      mode: "auto",
      messageIds: [zhMessage.id, enMessage.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.equal(body.results.length, 2);
    assert.equal(body.results.every((result) => result.status === "translated"), true);
    assert.deepEqual(provider.batchSources, ["zh", "en"]);
  } finally {
    await app.close();
  }
});

test("POST /api/message-translations:batch keeps placeholder mismatch output out of API and ledger", async () => {
  class PlaceholderMismatchProvider implements TranslationProvider {
    readonly providerVersion: TranslationProviderVersion = {
      provider: "azure-translator",
      apiVersion: "3.0",
      policyVersion: "azure-translator-v1",
    };

    async translateBatch(): Promise<TranslationBatchResult> {
      throw new TranslationPlaceholderValidationError({
        providerVersion: this.providerVersion,
        itemKey: "placeholder-message",
        sourcePlaceholders: ["{USER_NAME}"],
        translatedPlaceholders: ["{BROKEN_TOKEN}"],
        missingPlaceholders: ["{USER_NAME}"],
        unexpectedPlaceholders: ["{BROKEN_TOKEN}"],
      });
    }
  }

  setTestProvider(new PlaceholderMismatchProvider());
  const app = await startTestApp("pglite://");
  try {
    const { db, owner, server, channel, agent } = await seedFixture("placeholder-failure");
    const message = await createMessage(channel.id, "agent", agent.id, "你好 {USER_NAME}");
    const ownerToken = await login(app.baseUrl, owner.email);

    const res = await postBatch(app.baseUrl, ownerToken, server.id, {
      targetLanguage: "en",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(res.status, 200);
    const body = await res.json() as { results: Array<Record<string, unknown>> };
    assert.equal(body.results[0].status, "failed");
    assert.equal(body.results[0].skipReason, "placeholder_mismatch");
    assert.equal("translatedContent" in body.results[0], false);

    const [ledgerRow] = await db
      .select()
      .from(messageTranslations)
      .where(eq(messageTranslations.messageId, message.id));
    assert.equal(ledgerRow.status, "failed");
    assert.equal(ledgerRow.skipReason, "placeholder_mismatch");
    assert.equal(ledgerRow.translatedContent, null);
    assert.equal(ledgerRow.requestedChars, message.content.length);
    assert.equal(ledgerRow.providerBilledChars, 0);
  } finally {
    await app.close();
  }
});

test("agent receive returns orchestrator original content even when a translation ledger row exists", async () => {
  const app = await startTestApp("pglite://");
  try {
    const { owner, member, server, channel, agent } = await seedFixture("agent-original");
    const { machine, apiKey } = await registerMachine(server.id, owner.id, "translation-agent-original-machine");
    await assignMachine(agent.id, machine.id);
    const message = await createMessage(channel.id, "user", owner.id, "agent must see original");
    const memberToken = await login(app.baseUrl, member.email);
    const translationRes = await postBatch(app.baseUrl, memberToken, server.id, {
      targetLanguage: "zh",
      mode: "manual",
      messageIds: [message.id],
    });
    assert.equal(translationRes.status, 200);

    app.app.set("agentOrchestrator", {
      deliverMessage: async () => {},
      receiveMessages: async () => [{
        message_id: message.id,
        channel_id: channel.id,
        channel_name: channel.name,
        sender_id: owner.id,
        sender_name: owner.name,
        sender_type: "human",
        content: "agent must see original",
        timestamp: message.createdAt.toISOString(),
        seq: message.seq,
      }],
      hasMachineLocally: () => true,
      getActivity: async () => ({ activity: "offline", activityDetail: "" }),
      getMachineStatus: async () => "offline",
      getMachineStatusVersion: async () => 0,
      getMachineDaemonVersion: () => null,
      evictCache: () => {},
      shutdown: () => {},
      setIO: () => {},
    });

    const receiveRes = await fetch(`${app.baseUrl}/internal/agent/${agent.id}/receive?block=false&timeout=1`, {
      headers: machineHeaders(apiKey),
    });
    assert.equal(receiveRes.status, 200);
    const receiveBody = await receiveRes.json() as { messages: Array<{ content: string }> };
    assert.equal(receiveBody.messages[0].content, "agent must see original");
  } finally {
    await app.close();
  }
});
