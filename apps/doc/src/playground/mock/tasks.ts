import type { PlaygroundActorId } from "./actors.ts";
import {
  RAFT_UI_MIGRATION_THREAD_IDS,
  getPlaygroundThread,
  type PlaygroundChannelId,
  type PlaygroundMessageId,
} from "./conversations.ts";

export const PLAYGROUND_TASK_STATUSES = [
  "todo",
  "in_progress",
  "in_review",
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
  legacy?: boolean;
  movable?: boolean;
};

function defineTask<const TChannelId extends PlaygroundChannelId>(task: {
  channelId: TChannelId;
  number: number;
  title: string;
  description?: string;
  status: PlaygroundTaskStatus;
  creatorActorId: PlaygroundActorId;
  assigneeActorId?: PlaygroundActorId;
  sourceMessageId?: PlaygroundMessageId;
  legacy?: boolean;
  movable?: boolean;
}): PlaygroundTask {
  return { id: `task:${task.channelId}:${task.number}`, ...task };
}

export const PLAYGROUND_TASKS = [
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
    status: "in_progress",
    creatorActorId: "developer",
    assigneeActorId: "cuvii",
  }),
  defineTask({
    channelId: "all",
    number: 1,
    title: "Migrate legacy task records into the Raft UI board",
    status: "in_progress",
    creatorActorId: "legacyBot",
    assigneeActorId: "legacyBot",
    legacy: true,
    movable: false,
  }),
  defineTask({
    channelId: "all",
    number: 15,
    title: "Review empty states in the migration task filters",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
  }),
  defineTask({
    channelId: "all",
    number: 12,
    title: "Resolve the migrated thread reminder wake regression",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "specWriter",
  }),
  defineTask({
    channelId: "all",
    number: 3,
    title: "Verify metadata preserved from imported migration tasks",
    status: "in_review",
    creatorActorId: "legacyBot",
    legacy: true,
    movable: false,
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
    legacy: true,
    movable: false,
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
    status: "in_progress",
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
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  }),
  defineTask({
    channelId: "all",
    number: 24,
    title: "Compare generated API docs with canonical compositions",
    status: "in_review",
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
    status: "in_progress",
    creatorActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 12,
    title: "Review the thread reminder wake state",
    status: "in_review",
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
    status: "in_progress",
    creatorActorId: "atlas",
    assigneeActorId: "atlas",
  }),
  defineTask({
    channelId: "general",
    number: 17,
    title: "Confirm owners for this week's engineering priorities",
    description: "Close the two unowned decisions before tomorrow's planning checkpoint.",
    status: "in_progress",
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
    status: "in_review",
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
] as const satisfies readonly PlaygroundTask[];

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
