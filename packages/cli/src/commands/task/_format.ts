// Canonical task formatting for agent-facing output.
// Must match the MCP chat-bridge's list_tasks output exactly —
// this is an AX contract, not an implementation detail.

interface TaskLike {
  taskNumber?: number;
  status?: string;
  title?: string;
  claimedByName?: string | null;
  createdByName?: string | null;
  messageId?: string | null;
  isLegacy?: boolean;
  [key: string]: unknown;
}

interface TaskListData {
  tasks?: TaskLike[];
}

export function formatTaskList(channel: string, data: TaskListData, statusFilter?: string): string {
  if (!data.tasks || data.tasks.length === 0) {
    return `No${statusFilter && statusFilter !== "all" ? ` ${statusFilter}` : ""} tasks in ${channel}.`;
  }

  const formatted = data.tasks
    .map((t) => {
      const assignee = t.claimedByName ? ` → @${t.claimedByName}` : "";
      const creator = t.createdByName ? ` (by @${t.createdByName})` : "";
      const msgId = t.messageId ? ` msg=${t.messageId.slice(0, 8)}` : "";
      const legacy = t.isLegacy ? " [LEGACY — read-only]" : "";
      return `#${t.taskNumber} [${t.status}] ${t.title}${assignee}${creator}${msgId}${legacy}`;
    })
    .join("\n");

  return `## Task Board for ${channel} (${data.tasks.length} tasks)\n\n${formatted}`;
}

// --- create_tasks formatting ---

interface CreatedTask {
  taskNumber: number;
  messageId: string;
  title: string;
}

interface CreateTasksData {
  tasks: CreatedTask[];
}

export function formatTasksCreated(channel: string, data: CreateTasksData): string {
  const created = data.tasks
    .map((t) => `#${t.taskNumber} msg=${t.messageId.slice(0, 8)} "${t.title}"`)
    .join("\n");

  const threadHints = data.tasks
    .map((t) => `#${t.taskNumber} → slock message send --target "${channel}:${t.messageId.slice(0, 8)}"`)
    .join("\n");

  return `Created ${data.tasks.length} task(s) in ${channel}:\n${created}\n\nTo follow up in each task's thread:\n${threadHints}`;
}

// --- claim_tasks formatting ---

interface ClaimResult {
  taskNumber?: number;
  messageId?: string;
  success: boolean;
  reason?: string;
}

interface ClaimTasksData {
  results: ClaimResult[];
}

export function formatClaimResults(channel: string, data: ClaimTasksData): string {
  const lines = data.results.map((r) => {
    const label = r.taskNumber ? `#${r.taskNumber}` : `msg:${r.messageId}`;
    if (r.success) {
      const msgShort = r.messageId ? r.messageId.slice(0, 8) : "";
      return `${label} (msg:${msgShort}): claimed`;
    }
    return `${label}: FAILED — ${r.reason || "already claimed"}. Do not reply.`;
  });

  const succeeded = data.results.filter((r) => r.success).length;
  const failed = data.results.length - succeeded;
  let summary = `${succeeded} claimed`;
  if (failed > 0) summary += `, ${failed} failed`;

  const claimedMsgs = data.results
    .filter((r) => r.success && r.messageId)
    .map((r) => `#${r.taskNumber} → slock message send --target "${channel}:${r.messageId!.slice(0, 8)}"`)
    .join("\n");
  const threadHint = claimedMsgs
    ? `\n\nFollow up in each task's thread:\n${claimedMsgs}`
    : "";

  return `Claim results (${summary}):\n${lines.join("\n")}${threadHint}`;
}

// --- unclaim / update formatting ---

export function formatTaskUnclaimed(taskNumber: number): string {
  return `#${taskNumber} unclaimed — now open.`;
}

export function formatTaskStatusUpdated(taskNumber: number, status: string): string {
  return `#${taskNumber} moved to ${status}.`;
}
