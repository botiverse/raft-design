import { cut } from "jieba-wasm";
import { sql } from "drizzle-orm";
import { getSearchDb } from "../db/index.js";

export interface MessageSearchResult {
  id: string;
  seq: number;
  channelId: string;
  threadId: string | null;
  parentMessageId: string | null;
  parentMessageContent: string | null;
  parentChannelId: string;
  parentChannelName: string;
  parentChannelType: "channel" | "private" | "joint" | "dm" | "thread";
  parentChannelArchivedAt: string | null;
  senderId: string;
  senderType: "user" | "agent";
  senderName: string;
  channelName: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  channelArchivedAt: string | null;
  content: string;
  snippet: string;
  createdAt: string;
}

export type MessageSearchSort = "relevance" | "recent";

const INLINE_CODE_RE = /`([^`]+)`/g;
const FENCED_CODE_RE = /```([\s\S]*?)```/g;
const IMAGE_RE = /!\[([^\]]*)\]\([^)]+\)/g;
const LINK_RE = /\[([^\]]+)\]\([^)]+\)/g;
const URL_RE = /https?:\/\/\S+/g;
const MARKDOWN_DECORATION_RE = /[*_~>|]/g;
const MULTISPACE_RE = /\s+/g;

function normalizeToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return null;
  if (!/[\p{L}\p{N}]/u.test(trimmed)) return null;
  return /[A-Za-z]/.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}

export function preprocessSearchContent(content: string): string {
  return content
    .replace(FENCED_CODE_RE, " $1 ")
    .replace(INLINE_CODE_RE, " $1 ")
    .replace(IMAGE_RE, " $1 ")
    .replace(LINK_RE, " $1 ")
    .replace(URL_RE, " ")
    .replace(MARKDOWN_DECORATION_RE, " ")
    .replace(MULTISPACE_RE, " ")
    .trim();
}

export function tokenizeSearchText(content: string): string[] {
  return cut(preprocessSearchContent(content))
    .map(normalizeToken)
    .filter((token): token is string => !!token);
}

export function buildSearchText(content: string): string {
  return tokenizeSearchText(content).join(" ");
}

function buildSnippet(content: string, queryTokens: string[]): string {
  const compact = content.replace(MULTISPACE_RE, " ").trim();
  if (!compact) return "";

  const lower = compact.toLowerCase();
  let matchIndex = -1;
  let matchToken = "";
  for (const token of queryTokens) {
    const idx = lower.indexOf(token.toLowerCase());
    if (idx >= 0 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
      matchToken = token;
    }
  }

  if (matchIndex === -1) {
    return compact.length > 180 ? `${compact.slice(0, 177)}...` : compact;
  }

  const start = Math.max(0, matchIndex - 70);
  const end = Math.min(compact.length, matchIndex + matchToken.length + 90);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < compact.length ? "..." : "";
  return `${prefix}${compact.slice(start, end)}${suffix}`;
}

interface SearchRow extends Record<string, unknown> {
  id: string;
  seq: number | string;
  channelId: string;
  threadId: string | null;
  parentMessageId: string | null;
  parentMessageContent: string | null;
  parentChannelId: string;
  parentChannelName: string;
  parentChannelType: "channel" | "private" | "joint" | "dm" | "thread";
  parentChannelArchivedAt: Date | string | null;
  senderId: string;
  senderType: "user" | "agent";
  senderName: string;
  channelName: string;
  channelType: "channel" | "private" | "joint" | "dm" | "thread";
  channelArchivedAt: Date | string | null;
  content: string;
  createdAt: Date | string;
}

function normalizeCreatedAt(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeNullableTimestamp(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function normalizeSeq(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function hasMeaningfulSearchFilter(params: {
  channelId?: string;
  senderId?: string;
  after?: Date;
  before?: Date;
}): boolean {
  return Boolean(params.channelId || params.senderId || params.after || params.before);
}

async function searchMessages(
  membershipJoin: ReturnType<typeof sql>,
  membershipFilter: ReturnType<typeof sql>,
  membershipParams: {
    serverId: string;
    channelId?: string;
    senderId?: string;
    after?: Date;
    before?: Date;
    sort: MessageSearchSort;
    limit: number;
    offset: number;
  },
  query: string,
): Promise<{ results: MessageSearchResult[]; hasMore: boolean }> {
  const db = getSearchDb();
  const queryTokens = tokenizeSearchText(query);
  const searchText = queryTokens.join(" ");
  const hasSearchText = Boolean(searchText);
  if (!hasSearchText && !hasMeaningfulSearchFilter(membershipParams)) {
    return { results: [], hasMore: false };
  }

  const tsQuery = hasSearchText ? sql`plainto_tsquery('simple', ${searchText})` : null;
  const channelFilter = membershipParams.channelId
    ? sql`AND m.channel_id = ${membershipParams.channelId}`
    : sql``;
  const senderFilter = membershipParams.senderId
    ? sql`AND m.sender_id = ${membershipParams.senderId}`
    : sql``;
  const afterFilter = membershipParams.after
    ? sql`AND m.created_at >= ${membershipParams.after}`
    : sql``;
  const beforeFilter = membershipParams.before
    ? sql`AND m.created_at <= ${membershipParams.before}`
    : sql``;
  const searchVectorFilter = tsQuery ? sql`AND m.search_vector @@ ${tsQuery}` : sql``;
  const orderBy = !tsQuery
    ? sql`m.created_at DESC`
    : membershipParams.sort === "recent"
      ? sql`m.created_at DESC, ts_rank_cd(m.search_vector, ${tsQuery}) DESC`
      : sql`ts_rank_cd(m.search_vector, ${tsQuery}) DESC, m.created_at DESC`;

  const rows = await db.execute<SearchRow>(sql`
    SELECT
      m.id AS "id",
      m.seq AS "seq",
      m.channel_id AS "channelId",
      m.thread_id AS "threadId",
      c.parent_message_id AS "parentMessageId",
      pm.content AS "parentMessageContent",
      COALESCE(pc.id, c.id) AS "parentChannelId",
      COALESCE(pc.name, c.name) AS "parentChannelName",
      COALESCE(pc.type, c.type) AS "parentChannelType",
      COALESCE(pc.archived_at, c.archived_at) AS "parentChannelArchivedAt",
      m.sender_id AS "senderId",
      m.sender_type AS "senderType",
      COALESCE(NULLIF(a.display_name, ''), a.name, NULLIF(u.display_name, ''), u.name, 'Unknown') AS "senderName",
      c.name AS "channelName",
      c.type AS "channelType",
      c.archived_at AS "channelArchivedAt",
      m.content AS "content",
      m.created_at AS "createdAt"
    FROM messages m
    JOIN channels c ON c.id = m.channel_id
    LEFT JOIN messages pm
      ON c.type = 'thread'
     AND pm.id = c.parent_message_id
    LEFT JOIN channels pc
      ON pc.id = pm.channel_id
    ${membershipJoin}
    LEFT JOIN agents a
      ON m.sender_type = 'agent'
     AND a.id = m.sender_id::uuid
    LEFT JOIN users u
      ON m.sender_type = 'user'
     AND m.sender_id <> 'system'
     AND u.id = m.sender_id::uuid
    WHERE c.server_id = ${membershipParams.serverId}
      ${membershipFilter}
      AND m.message_type = 'chat'
      ${channelFilter}
      ${senderFilter}
      ${afterFilter}
      ${beforeFilter}
      ${searchVectorFilter}
    ORDER BY ${orderBy}
    LIMIT ${membershipParams.limit + 1}
    OFFSET ${membershipParams.offset}
  `);

  const hasMore = rows.rows.length > membershipParams.limit;
  const visibleRows = hasMore ? rows.rows.slice(0, membershipParams.limit) : rows.rows;

  return {
    hasMore,
    results: visibleRows.map((row) => ({
    ...row,
    seq: normalizeSeq(row.seq),
    snippet: buildSnippet(row.content, queryTokens),
    createdAt: normalizeCreatedAt(row.createdAt),
    channelArchivedAt: normalizeNullableTimestamp(row.channelArchivedAt),
    parentChannelArchivedAt: normalizeNullableTimestamp(row.parentChannelArchivedAt),
    })),
  };
}

export async function searchMessagesForUser(params: {
  serverId: string;
  userId: string;
  query: string;
  channelId?: string;
  senderId?: string;
  after?: Date;
  before?: Date;
  sort?: MessageSearchSort;
  limit?: number;
  offset?: number;
}): Promise<{ results: MessageSearchResult[]; hasMore: boolean }> {
  return searchMessages(
    sql`
      JOIN server_members sm
        ON sm.server_id = c.server_id
       AND sm.user_id = ${params.userId}
      LEFT JOIN channel_humans ch
        ON ch.channel_id = c.id
       AND ch.user_id = ${params.userId}
      LEFT JOIN channel_humans pch
        ON pch.channel_id = pc.id
       AND pch.user_id = ${params.userId}
    `,
    sql`
      AND (
        c.type = 'channel'
        OR (c.type IN ('private', 'dm') AND ch.user_id IS NOT NULL)
        OR (
          c.type = 'thread'
          AND (
            pc.type = 'channel'
            OR (pc.type IN ('private', 'dm') AND pch.user_id IS NOT NULL)
          )
        )
      )
    `,
    {
      serverId: params.serverId,
      channelId: params.channelId,
      senderId: params.senderId,
      after: params.after,
      before: params.before,
      sort: params.sort ?? "relevance",
      limit: Math.min(params.limit ?? 20, 50),
      offset: Math.max(params.offset ?? 0, 0),
    },
    params.query,
  );
}

export async function searchMessagesForAgent(params: {
  serverId: string;
  agentId: string;
  query: string;
  channelId?: string;
  senderId?: string;
  after?: Date;
  before?: Date;
  sort?: MessageSearchSort;
  limit?: number;
  offset?: number;
}): Promise<{ results: MessageSearchResult[]; hasMore: boolean }> {
  return searchMessages(
    sql`
      LEFT JOIN channel_agents ca
        ON ca.channel_id = c.id
       AND ca.agent_id = ${params.agentId}
      LEFT JOIN channel_agents pca
        ON pca.channel_id = pc.id
       AND pca.agent_id = ${params.agentId}
    `,
    sql`
      AND (
        c.type = 'channel'
        OR (c.type IN ('private', 'dm') AND ca.agent_id IS NOT NULL)
        OR (
          c.type = 'thread'
          AND (
            pc.type = 'channel'
            OR (pc.type IN ('private', 'dm') AND pca.agent_id IS NOT NULL)
          )
        )
      )
    `,
    {
      serverId: params.serverId,
      channelId: params.channelId,
      senderId: params.senderId,
      after: params.after,
      before: params.before,
      sort: params.sort ?? "relevance",
      limit: Math.min(params.limit ?? 20, 50),
      offset: Math.max(params.offset ?? 0, 0),
    },
    params.query,
  );
}
