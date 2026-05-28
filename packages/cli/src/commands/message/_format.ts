// Canonical message formatting for agent-facing output.
// Must match the MCP chat-bridge's formatMessages() output exactly —
// this is an AX contract, not an implementation detail.

interface MessageLike {
  channel_type?: string;
  channel_name?: string;
  parent_channel_type?: string;
  parent_channel_name?: string;
  message_id?: string;
  timestamp?: string;
  sender_type?: string;
  sender_name?: string;
  sender_description?: string | null;
  content?: string;
  attachments?: Array<{ id: string; filename: string }>;
  task_status?: string;
  task_number?: number;
  task_assignee_id?: string;
  task_assignee_type?: string;
  [key: string]: unknown;
}

function toLocalTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatTarget(m: MessageLike): string {
  if (m.channel_type === "thread" && m.parent_channel_name) {
    const shortId = m.channel_name?.startsWith("thread-") ? m.channel_name.slice(7) : m.channel_name;
    if (m.parent_channel_type === "dm") {
      return `dm:@${m.parent_channel_name}:${shortId}`;
    }
    return `#${m.parent_channel_name}:${shortId}`;
  }
  if (m.channel_type === "dm") {
    return `dm:@${m.channel_name}`;
  }
  return `#${m.channel_name}`;
}

function formatSenderHandle(m: MessageLike): string {
  const name = m.sender_name ?? "unknown";
  const desc = m.sender_description ?? null;
  return desc ? `@${name} — ${desc}` : `@${name}`;
}

function formatAttachmentSuffix(attachments: Array<{ id: string; filename: string }> | undefined): string {
  if (!attachments?.length) return "";
  return ` [${attachments.length} attachment${attachments.length > 1 ? "s" : ""}: ${attachments.map((a) => `${a.filename} (id:${a.id})`).join(", ")} — use slock attachment view to download]`;
}

export function formatMessageLine(m: MessageLike): string {
  const target = formatTarget(m);
  const msgId = m.message_id ? m.message_id.slice(0, 8) : "-";
  const time = m.timestamp ? toLocalTime(m.timestamp) : "-";
  const senderType = ` type=${m.sender_type}`;
  const content = m.content ?? "";
  const attachSuffix = formatAttachmentSuffix(m.attachments);
  const taskSuffix = m.task_status
    ? ` [task #${m.task_number} status=${m.task_status}${m.task_assignee_id ? ` assignee=${m.task_assignee_type}:${m.task_assignee_id}` : ""}]`
    : "";
  return `[target=${target} msg=${msgId} time=${time}${senderType}] ${formatSenderHandle(m)}: ${content}${attachSuffix}${taskSuffix}`;
}

export function formatMessages(messages: MessageLike[]): string {
  if (messages.length === 0) return "No new messages.";
  return messages.map(formatMessageLine).join("\n");
}

// --- History formatting (matches MCP read_history output) ---

interface HistoryMessage {
  seq: number;
  id?: string;
  message_id?: string;
  createdAt?: string;
  timestamp?: string;
  senderType?: string;
  sender_type?: string;
  senderName?: string;
  sender_name?: string;
  senderDescription?: string | null;
  sender_description?: string | null;
  content: string;
  attachments?: Array<{ id: string; filename: string }>;
  taskStatus?: string | null;
  taskNumber?: number | null;
  taskAssigneeType?: string | null;
  taskAssigneeId?: string | null;
  threadId?: string | null;
  replyCount?: number | null;
  [key: string]: unknown;
}

function buildReplyTarget(channel: string, messageId: string | undefined): string | null {
  if (!messageId) return null;
  const isThreadTarget = /^#[^:]+:[0-9a-f]{8}$/i.test(channel)
    || /^dm:@[^:]+:[0-9a-f]{8}$/i.test(channel);
  if (isThreadTarget) return null;
  return `${channel}:${messageId.slice(0, 8)}`;
}

function formatHistoryMessageLine(channel: string, m: HistoryMessage): string {
  const senderName = m.senderName ?? m.sender_name ?? "unknown";
  const senderDescription = m.senderDescription ?? m.sender_description ?? null;
  const messageId = m.id ?? m.message_id ?? "-";
  const createdAt = m.createdAt ?? m.timestamp ?? null;
  const senderType = m.senderType ?? m.sender_type ?? null;
  const headerParts = [
    `seq=${m.seq}`,
    `msg=${messageId}`,
    `time=${createdAt ? toLocalTime(createdAt) : "-"}`,
  ];
  if (senderType) headerParts.push(`type=${senderType}`);
  if (m.threadId) headerParts.push(`threadId=${m.threadId}`);
  if ((m.replyCount ?? 0) > 0) headerParts.push(`replyCount=${m.replyCount}`);
  if (m.threadId || (m.replyCount ?? 0) > 0) {
    const replyTarget = buildReplyTarget(channel, messageId);
    if (replyTarget) headerParts.push(`replyTarget=${replyTarget}`);
  }

  const attachSuffix = formatAttachmentSuffix(m.attachments);
  const taskSuffix = m.taskStatus
    ? ` [task #${m.taskNumber} status=${m.taskStatus}${m.taskAssigneeId ? ` assignee=${m.taskAssigneeType}:${m.taskAssigneeId}` : ""}]`
    : "";
  const handle = senderDescription ? `@${senderName} — ${senderDescription}` : `@${senderName}`;
  return `[${headerParts.join(" ")}] ${handle}: ${m.content}${attachSuffix}${taskSuffix}`;
}

interface HistoryData {
  messages?: HistoryMessage[];
  has_more?: boolean;
  has_older?: boolean;
  has_newer?: boolean;
  historyLimited?: boolean;
  historyLimitMessage?: string;
  last_read_seq?: number;
}

export function formatHistory(channel: string, data: HistoryData, opts?: { around?: string; after?: number; before?: number }): string {
  if (!data.messages || data.messages.length === 0) return "No messages in this channel.";

  const formatted = data.messages
    .map((m) => formatHistoryMessageLine(channel, {
      ...m,
      senderName: m.senderName ?? m.sender_name ?? "unknown",
      senderDescription: m.senderDescription ?? m.sender_description ?? null,
    }))
    .join("\n");

  let footer = "";
  if (data.historyLimited) {
    footer = `\n\n--- ${data.historyLimitMessage || "Message history is limited on this plan."} ---`;
  } else if (opts?.around && data.messages.length > 0 && (data.has_older || data.has_newer)) {
    const minSeq = data.messages[0].seq;
    const maxSeq = data.messages[data.messages.length - 1].seq;
    footer = `\n\n--- Context window shown. Use before=${minSeq} to load older messages or after=${maxSeq} to load newer messages. ---`;
  } else if (data.has_more && data.messages.length > 0) {
    if (opts?.after) {
      const maxSeq = data.messages[data.messages.length - 1].seq;
      footer = `\n\n--- ${data.messages.length} messages shown. Use after=${maxSeq} to load more recent messages. ---`;
    } else {
      const minSeq = data.messages[0].seq;
      footer = `\n\n--- ${data.messages.length} messages shown. Use before=${minSeq} to load older messages. ---`;
    }
  }

  let header = `## Message History for ${channel}${opts?.around ? ` around ${opts.around}` : ""} (${data.messages.length} messages)`;
  if ((data.last_read_seq ?? 0) > 0 && !opts?.after && !opts?.before && !opts?.around) {
    header += `\nYour last read position: seq ${data.last_read_seq}. Use slock message read --channel "${channel}" --after ${data.last_read_seq} to see only unread messages.`;
  }

  return `${header}\n\n${formatted}${footer}`;
}

// --- Search formatting (matches MCP search_messages output) ---

interface SearchResult {
  id: string;
  seq: number;
  createdAt?: string;
  channelType?: string;
  channelName?: string;
  parentChannelType?: string;
  parentChannelName?: string;
  senderName?: string;
  senderType?: string;
  content?: string;
  snippet?: string;
  threadId?: string;
  [key: string]: unknown;
}

function formatSearchTarget(result: SearchResult): string {
  if (result.channelType === "thread") {
    const shortId = typeof result.channelName === "string" && result.channelName.startsWith("thread-")
      ? result.channelName.slice(7)
      : (typeof result.threadId === "string" && result.threadId ? result.threadId.slice(0, 8) : result.channelName);
    if (result.parentChannelType === "dm") {
      return `dm:@${result.parentChannelName}:${shortId}`;
    }
    return `#${result.parentChannelName}:${shortId}`;
  }
  if (result.channelType === "dm") {
    return `dm:@${result.channelName}`;
  }
  return `#${result.channelName}`;
}

interface SearchData {
  results?: SearchResult[];
}

export function formatSearchResults(query: string, data: SearchData): string {
  if (!data.results || data.results.length === 0) return "No search results.";

  const formatted = data.results.map((result, index) => {
    const target = formatSearchTarget(result);
    const threadInfo = result.channelType === "thread"
      ? `\nthread: ${result.parentChannelName} -> ${target}`
      : "";
    return [
      `[${index + 1}] msg=${result.id} seq=${result.seq} time=${result.createdAt ? toLocalTime(result.createdAt) : "-"}`,
      `target: ${target}${threadInfo}`,
      `sender: @${result.senderName} (${result.senderType})`,
      `content: ${result.content}`,
      `match: ${result.snippet}`,
      `next: slock message read --channel "${target}" --around "${result.id}" --limit 20`,
    ].join("\n");
  }).join("\n\n");

  return `## Search Results for "${query}" (${data.results.length} results)\n\n${formatted}`;
}
