import type { PlaygroundActorId } from "./actors.ts";
import {
  RAFT_UI_MIGRATION_THREAD_IDS,
  getPlaygroundThread,
  type PlaygroundChannelId,
  type PlaygroundMessageId,
} from "./conversations.ts";

export const PLAYGROUND_TASK_STATUSES = [
  "todo",
  "in-progress",
  "in-review",
  "done",
  "closed",
] as const;

export type PlaygroundTaskStatus = (typeof PLAYGROUND_TASK_STATUSES)[number];
export type PlaygroundTaskId = `task:${PlaygroundChannelId}:${number}`;

export type PlaygroundTask = {
  id: PlaygroundTaskId;
  channelId: PlaygroundChannelId;
  number: number;
  title: string;
  description?: string;
  status: PlaygroundTaskStatus;
  creatorActorId: PlaygroundActorId;
  assigneeActorId?: PlaygroundActorId;
  sourceMessageId?: PlaygroundMessageId;
  createdAt?: string;
  completedAt?: string;
  legacy?: boolean;
  movable?: boolean;
};

export function isPlaygroundTaskId(value: string): value is PlaygroundTaskId {
  return /^task:[^:]+:\d+$/.test(value);
}

function defineTask<const TChannelId extends PlaygroundChannelId>(task: {
  channelId: TChannelId;
  number: number;
  title: string;
  description?: string;
  status: PlaygroundTaskStatus;
  creatorActorId: PlaygroundActorId;
  assigneeActorId?: PlaygroundActorId;
  sourceMessageId?: PlaygroundMessageId;
  createdAt?: string;
  completedAt?: string;
  legacy?: boolean;
  movable?: boolean;
}): PlaygroundTask {
  return { id: `task:${task.channelId}:${task.number}`, ...task };
}

/** Extra board density for `#raft-ui-migration` — every status, enough to scroll. */
const ALL_CHANNEL_BULK_TASKS = (
  [
    {
      number: 30,
      title: "Audit TaskBoard column empty-state copy",
      description: "Confirm idle, allowed, and blocked empty hosts match the product tone.",
      status: "todo",
      creatorActorId: "cindy",
      assigneeActorId: "mira",
    },
    {
      number: 31,
      title: "Seed denser fixtures for ScrollArea board previews",
      status: "todo",
      creatorActorId: "developer",
      assigneeActorId: "ada",
    },
    {
      number: 32,
      title: "Map filter chips to shared task-query helpers",
      status: "todo",
      creatorActorId: "atlas",
      assigneeActorId: "dataWeaver",
    },
    {
      number: 33,
      title: "Document consumer-owned virtualization for tall columns",
      description: "Keep useVirtualizer outside TaskBoard and show mounted vs total in docs.",
      status: "todo",
      creatorActorId: "specWriter",
      assigneeActorId: "cuvii",
    },
    {
      number: 34,
      title: "Normalize TaskCard assignee fallbacks in playground",
      status: "todo",
      creatorActorId: "ada",
      assigneeActorId: "olivia",
    },
    {
      number: 35,
      title: "Add keyboard shortcuts for status transitions",
      status: "todo",
      creatorActorId: "developer",
      assigneeActorId: "elliot",
    },
    {
      number: 36,
      title: "Catalog drag-disabled legacy cards in the board demo",
      status: "todo",
      creatorActorId: "legacyBot",
      assigneeActorId: "qaSentinel",
    },
    {
      number: 37,
      title: "Write acceptance checks for collapsed board columns",
      status: "todo",
      creatorActorId: "qaSentinel",
      assigneeActorId: "samira",
    },
    {
      number: 38,
      title: "Wire Tasks tab unread counts from channel filters",
      status: "todo",
      creatorActorId: "noah",
      assigneeActorId: "mateo",
    },
    {
      number: 39,
      title: "Sketch elegant hover states for dense task lists",
      status: "todo",
      creatorActorId: "mira",
      assigneeActorId: "cindy",
    },
    {
      number: 40,
      title: "Implement shared ScrollArea viewport for board and list",
      status: "in-progress",
      creatorActorId: "cuvii",
      assigneeActorId: "cuvii",
    },
    {
      number: 41,
      title: "Port TaskStatusIcon colors to token pairs",
      status: "in-progress",
      creatorActorId: "developer",
      assigneeActorId: "ada",
    },
    {
      number: 42,
      title: "Stabilize DnD placeholders under virtualized stacks",
      description: "Measure scrollMargin when preceding sections collapse or remount.",
      status: "in-progress",
      creatorActorId: "atlas",
      assigneeActorId: "codePilot",
    },
    {
      number: 43,
      title: "Connect create-task sheet to playground task state",
      status: "in-progress",
      creatorActorId: "cindy",
      assigneeActorId: "olivia",
    },
    {
      number: 44,
      title: "Reconcile list-section badges with board column badges",
      status: "in-progress",
      creatorActorId: "developer",
      assigneeActorId: "samira",
    },
    {
      number: 45,
      title: "Profile board re-renders when dragging across columns",
      status: "in-progress",
      creatorActorId: "atlas",
      assigneeActorId: "dataWeaver",
    },
    {
      number: 46,
      title: "Finish brutal status-label density pass",
      status: "in-progress",
      creatorActorId: "mira",
      assigneeActorId: "cindy",
    },
    {
      number: 47,
      title: "Hook TaskCard more-menu into playground actions",
      status: "in-progress",
      creatorActorId: "ada",
      assigneeActorId: "elliot",
    },
    {
      number: 48,
      title: "Keep closed-column drop rules documented in TaskDnd",
      status: "in-progress",
      creatorActorId: "specWriter",
      assigneeActorId: "atlas",
    },
    {
      number: 49,
      title: "Sync agent activity chips with in-progress tasks",
      status: "in-progress",
      creatorActorId: "claudeAssistant",
      assigneeActorId: "atlas",
    },
    {
      number: 50,
      title: "Review TaskBoard anatomy against live compositions",
      status: "in-review",
      creatorActorId: "atlas",
      assigneeActorId: "specWriter",
    },
    {
      number: 51,
      title: "Review ScrollArea graduation checklist",
      status: "in-review",
      creatorActorId: "releaseScribe",
      assigneeActorId: "avery",
    },
    {
      number: 52,
      title: "Review elegant TaskCard hover against layer-panel",
      status: "in-review",
      creatorActorId: "mira",
      assigneeActorId: "cindy",
    },
    {
      number: 53,
      title: "Review playground Tasks filters for assignee coverage",
      status: "in-review",
      creatorActorId: "qaSentinel",
      assigneeActorId: "samira",
    },
    {
      number: 54,
      title: "Review virtualization usage copy for consumer clarity",
      status: "in-review",
      creatorActorId: "specWriter",
      assigneeActorId: "cuvii",
    },
    {
      number: 55,
      title: "Review DnD blocked-state messaging on Closed",
      status: "in-review",
      creatorActorId: "atlas",
      assigneeActorId: "ada",
    },
    {
      number: 56,
      title: "Review list empty-section host parity with board",
      status: "in-review",
      creatorActorId: "developer",
      assigneeActorId: "olivia",
    },
    {
      number: 57,
      title: "Review task thread deep-links from the board card",
      status: "in-review",
      creatorActorId: "noah",
      assigneeActorId: "mateo",
    },
    {
      number: 58,
      title: "Ship TaskCard dual-trigger status control",
      status: "done",
      creatorActorId: "cuvii",
      assigneeActorId: "cuvii",
    },
    {
      number: 59,
      title: "Ship token-based in-review icon color",
      status: "done",
      creatorActorId: "developer",
      assigneeActorId: "ada",
    },
    {
      number: 60,
      title: "Ship denser board demo fixtures for scroll",
      status: "done",
      creatorActorId: "cindy",
      assigneeActorId: "mira",
    },
    {
      number: 61,
      title: "Ship TaskBoard usage snippet slim-down",
      status: "done",
      creatorActorId: "specWriter",
      assigneeActorId: "atlas",
    },
    {
      number: 62,
      title: "Ship elegant ghost more-button on TaskCard meta",
      status: "done",
      creatorActorId: "mira",
      assigneeActorId: "cindy",
    },
    {
      number: 63,
      title: "Ship shared TaskStatusIcon across board and list",
      status: "done",
      creatorActorId: "developer",
      assigneeActorId: "samira",
    },
    {
      number: 64,
      title: "Ship playground task-state cloning on shell mount",
      status: "done",
      creatorActorId: "atlas",
      assigneeActorId: "codePilot",
    },
    {
      number: 65,
      title: "Ship closed-task archive affordance in filters",
      status: "done",
      creatorActorId: "releaseScribe",
      assigneeActorId: "avery",
    },
    {
      number: 66,
      title: "Close superseded TasksPanel layout experiments",
      status: "closed",
      creatorActorId: "legacyBot",
      assigneeActorId: "qaSentinel",
    },
    {
      number: 67,
      title: "Close duplicate ScrollArea ownership tickets",
      status: "closed",
      creatorActorId: "developer",
      assigneeActorId: "cuvii",
    },
    {
      number: 68,
      title: "Close abandoned per-column scroll containers",
      description: "Board columns must share one viewport; independent scrollers were rejected.",
      status: "closed",
      creatorActorId: "atlas",
      assigneeActorId: "specWriter",
    },
    {
      number: 69,
      title: "Close obsolete TaskBoard kind/state prop proposals",
      status: "closed",
      creatorActorId: "cindy",
      assigneeActorId: "mira",
    },
    {
      number: 70,
      title: "Close pre-token brutal status color one-offs",
      status: "closed",
      creatorActorId: "releaseScribe",
      assigneeActorId: "ada",
    },
    {
      number: 71,
      title: "Close temporary source-repo virtualization docs section",
      status: "closed",
      creatorActorId: "specWriter",
      assigneeActorId: "atlas",
    },
  ] as const
).map((task) => defineTask({ channelId: "all", ...task }));

export const PLAYGROUND_TASKS = [
  ...ALL_CHANNEL_BULK_TASKS,
  defineTask({
    channelId: "all",
    number: 10,
    title: "Confirm migration ownership for shared message primitives",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "ada",
  }),
  defineTask({
    channelId: "all",
    number: 14,
    title:
      "Resolve the remaining Raft UI migration blockers across message actions, thread routing, and narrow task views",
    description:
      "The migration can leave review once every blocker has an owner and a verified canonical composition.",
    status: "todo",
    creatorActorId: "cindy",
  }),
  defineTask({
    channelId: "all",
    number: 11,
    title: "Verify migrated attachment previews against source behavior",
    status: "in-progress",
    creatorActorId: "developer",
    assigneeActorId: "cuvii",
  }),
  defineTask({
    channelId: "all",
    number: 1,
    title: "Migrate legacy task records into the Raft UI board",
    description:
      "Imported from the pre-migration store. Metadata is read-only here; open a message task when you need thread replies.",
    status: "in-progress",
    creatorActorId: "legacyBot",
    assigneeActorId: "legacyBot",
    createdAt: "2026-07-12T09:18:00.000Z",
    legacy: true,
  }),
  defineTask({
    channelId: "all",
    number: 15,
    title: "Review empty states in the migration task filters",
    status: "in-review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
  }),
  defineTask({
    channelId: "all",
    number: 12,
    title: "Resolve the migrated thread reminder wake regression",
    status: "in-review",
    creatorActorId: "atlas",
    assigneeActorId: "specWriter",
  }),
  defineTask({
    channelId: "all",
    number: 3,
    title: "Verify metadata preserved from imported migration tasks",
    status: "in-review",
    creatorActorId: "legacyBot",
    createdAt: "2026-07-10T14:02:00.000Z",
    legacy: true,
  }),
  defineTask({
    channelId: "all",
    number: 13,
    title: "Complete the archived-channel migration check",
    status: "done",
    creatorActorId: "specWriter",
    assigneeActorId: "cuvii",
  }),
  defineTask({
    channelId: "all",
    number: 2,
    title: "Archive superseded migration tasks",
    status: "done",
    creatorActorId: "legacyBot",
    createdAt: "2026-07-08T11:40:00.000Z",
    completedAt: "2026-07-15T16:05:00.000Z",
    legacy: true,
  }),
  defineTask({
    channelId: "all",
    number: 16,
    title: "Close the superseded Raft UI release checklist",
    status: "closed",
    creatorActorId: "releaseScribe",
    assigneeActorId: "avery",
  }),
  defineTask({
    channelId: "all",
    number: 21,
    title: "Document state ownership for migrated message flows",
    description:
      "Keep server state outside the local store and assign each interaction to its narrowest owner.",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "atlas",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  }),
  defineTask({
    channelId: "all",
    number: 22,
    title: "Narrow selectors for the migrated message list",
    description:
      "Subscribe only to the visible conversation and isolate presence updates before the migration ships.",
    status: "in-progress",
    creatorActorId: "developer",
    assigneeActorId: "cuvii",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  }),
  defineTask({
    channelId: "all",
    number: 23,
    title: "Clear the invite-security migration gate",
    description:
      "Confirm rate limits and generic errors prevent rejected probes from revealing valid invite codes.",
    status: "in-review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  }),
  defineTask({
    channelId: "all",
    number: 24,
    title: "Compare generated API docs with canonical compositions",
    status: "in-review",
    creatorActorId: "atlas",
    assigneeActorId: "specWriter",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  }),
  defineTask({
    channelId: "frontend",
    number: 10,
    title: "Verify default member actions across message states",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 11,
    title: "Verify attachment previews across pending and failed messages",
    status: "in-progress",
    creatorActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 12,
    title: "Review the thread reminder wake state",
    status: "in-review",
    creatorActorId: "developer",
  }),
  defineTask({
    channelId: "frontend",
    number: 13,
    title: "Confirm message actions in archived channels",
    status: "done",
    creatorActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 15,
    title: "Close duplicate message-state coverage work",
    status: "closed",
    creatorActorId: "developer",
  }),
  defineTask({
    channelId: "frontend",
    number: 16,
    title: "Sync agent progress messages with task state",
    status: "in-progress",
    creatorActorId: "atlas",
    assigneeActorId: "atlas",
  }),
  defineTask({
    channelId: "general",
    number: 17,
    title: "Confirm owners for this week's engineering priorities",
    description: "Close the two unowned decisions before tomorrow's planning checkpoint.",
    status: "in-progress",
    creatorActorId: "avery",
    assigneeActorId: "cuvii",
    sourceMessageId: "general:reply",
  }),
  defineTask({
    channelId: "design",
    number: 18,
    title: "Audit empty, muted, and unread sidebar states",
    description: "Confirm every navigation state has clear context and an accountable owner.",
    status: "todo",
    creatorActorId: "cindy",
    assigneeActorId: "mira",
    sourceMessageId: "design:reply",
  }),
  defineTask({
    channelId: "launch",
    number: 19,
    title: "Complete the public-launch support handoff",
    description: "Get Support sign-off on escalation paths and the customer-facing launch guide.",
    status: "in-review",
    creatorActorId: "avery",
    assigneeActorId: "releaseScribe",
    sourceMessageId: "launch:reply",
  }),
  defineTask({
    channelId: "incidents",
    number: 20,
    title: "Document the webhook retry-queue detection gap",
    description: "Record the missing alert, its trigger threshold, and the follow-up owner.",
    status: "closed",
    creatorActorId: "incidentTriage",
    assigneeActorId: "deployBot",
  }),
] satisfies readonly PlaygroundTask[];

for (const task of PLAYGROUND_TASKS) {
  if (!task.sourceMessageId) continue;
  const source = getPlaygroundThread(task.sourceMessageId);
  if (!source) {
    throw new Error(`Unknown source message for playground task: ${task.id}`);
  }
  if (source.channelId !== task.channelId) {
    throw new Error(`Playground task source is in another channel: ${task.id}`);
  }
}

export function getPlaygroundTasks(channelId: PlaygroundChannelId): readonly PlaygroundTask[] {
  return PLAYGROUND_TASKS.filter((task) => task.channelId === channelId);
}
