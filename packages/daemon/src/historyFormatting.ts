function toLocalHistoryTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

type HistoryAttachment = {
  id: string;
  filename: string;
};

type HistoryMessageLine = {
  seq: number;
  id?: string;
  createdAt?: string;
  senderType?: string;
  senderName: string;
  senderDescription?: string | null;
  content: string;
  attachments?: HistoryAttachment[];
  taskStatus?: string | null;
  taskNumber?: number | null;
  taskAssigneeType?: string | null;
  taskAssigneeId?: string | null;
  threadId?: string | null;
  replyCount?: number | null;
};

function formatHistorySenderHandle(message: Pick<HistoryMessageLine, "senderName" | "senderDescription">): string {
  return message.senderDescription ? `@${message.senderName} — ${message.senderDescription}` : `@${message.senderName}`;
}

export function formatHistoryMessageLine(message: HistoryMessageLine): string {
  const headerParts = [
    `seq=${message.seq}`,
    `msg=${message.id || "-"}`,
    `time=${message.createdAt ? toLocalHistoryTime(message.createdAt) : "-"}`,
  ];

  if (message.senderType) {
    headerParts.push(`type=${message.senderType}`);
  }
  if (message.threadId) {
    headerParts.push(`threadId=${message.threadId}`);
  }
  if ((message.replyCount ?? 0) > 0) {
    headerParts.push(`replyCount=${message.replyCount}`);
  }

  const attachSuffix = message.attachments?.length
    ? ` [${message.attachments.length} attachment${message.attachments.length > 1 ? "s" : ""}: ${message.attachments.map((attachment) => `${attachment.filename} (id:${attachment.id})`).join(", ")} — use view_file to download]`
    : "";
  const taskSuffix = message.taskStatus
    ? ` [task #${message.taskNumber} status=${message.taskStatus}${message.taskAssigneeId ? ` assignee=${message.taskAssigneeType}:${message.taskAssigneeId}` : ""}]`
    : "";

  return `[${headerParts.join(" ")}] ${formatHistorySenderHandle(message)}: ${message.content}${attachSuffix}${taskSuffix}`;
}
