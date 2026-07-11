import type { PlaygroundActorId } from "./actors.ts";
import {
  ALL_SHOWCASE_THREAD_IDS,
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
    title: "Check default seed member permissions",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "ada",
  }),
  defineTask({
    channelId: "all",
    number: 14,
    title:
      "Audit long task titles across narrow columns without truncating the decision or losing the task number",
    description: "This task intentionally exercises the longest card content in the fixture.",
    status: "todo",
    creatorActorId: "cindy",
  }),
  defineTask({
    channelId: "all",
    number: 11,
    title: "Verify RustFS attachment previews",
    status: "in_progress",
    creatorActorId: "developer",
    assigneeActorId: "cuvii",
  }),
  defineTask({
    channelId: "all",
    number: 1,
    title: "Migrate the original task registry",
    status: "in_progress",
    creatorActorId: "legacyBot",
    assigneeActorId: "legacyBot",
    legacy: true,
    movable: false,
  }),
  defineTask({
    channelId: "all",
    number: 15,
    title: "Review task filter empty states",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
  }),
  defineTask({
    channelId: "all",
    number: 12,
    title: "Review the thread reminder wake regression",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "specWriter",
  }),
  defineTask({
    channelId: "all",
    number: 3,
    title: "Verify imported legacy task metadata",
    status: "in_review",
    creatorActorId: "legacyBot",
    legacy: true,
    movable: false,
  }),
  defineTask({
    channelId: "all",
    number: 13,
    title: "Run the archived-channel smoke check",
    status: "done",
    creatorActorId: "specWriter",
    assigneeActorId: "cuvii",
  }),
  defineTask({
    channelId: "all",
    number: 2,
    title: "Archive duplicate task fixtures",
    status: "done",
    creatorActorId: "legacyBot",
    legacy: true,
    movable: false,
  }),
  defineTask({
    channelId: "all",
    number: 16,
    title: "Retire the superseded release checklist",
    status: "closed",
    creatorActorId: "releaseScribe",
    assigneeActorId: "avery",
  }),
  defineTask({
    channelId: "all",
    number: 21,
    title: "Document the state ownership boundary",
    description: "Keep server state out of the local store before changing the state model.",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "atlas",
    sourceMessageId: ALL_SHOWCASE_THREAD_IDS.stateModel,
  }),
  defineTask({
    channelId: "all",
    number: 22,
    title: "Narrow message-list selectors",
    description: "Subscribe only to the visible conversation and isolate presence updates.",
    status: "in_progress",
    creatorActorId: "developer",
    assigneeActorId: "cuvii",
    sourceMessageId: ALL_SHOWCASE_THREAD_IDS.selectorPerformance,
  }),
  defineTask({
    channelId: "all",
    number: 23,
    title: "Review invite-code rate limiting",
    description: "Confirm rejected probes do not reveal whether an invite code exists.",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "samira",
    sourceMessageId: ALL_SHOWCASE_THREAD_IDS.inviteSecurity,
  }),
  defineTask({
    channelId: "all",
    number: 24,
    title: "Compare generated API docs with current examples",
    status: "in_review",
    creatorActorId: "atlas",
    assigneeActorId: "specWriter",
    sourceMessageId: ALL_SHOWCASE_THREAD_IDS.apiDocs,
  }),
  defineTask({
    channelId: "frontend",
    number: 10,
    title: "Check default seed member permissions",
    status: "todo",
    creatorActorId: "developer",
    assigneeActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 11,
    title: "Verify the RustFS attachment previews",
    status: "in_progress",
    creatorActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 12,
    title: "Review the thread reminder wake regression",
    status: "in_review",
    creatorActorId: "developer",
  }),
  defineTask({
    channelId: "frontend",
    number: 13,
    title: "Run the archived-channel smoke check",
    status: "done",
    creatorActorId: "ada",
  }),
  defineTask({
    channelId: "frontend",
    number: 15,
    title: "Close the duplicate migration ticket",
    status: "closed",
    creatorActorId: "developer",
  }),
  defineTask({
    channelId: "frontend",
    number: 16,
    title: "Update the task status from the agent run",
    status: "in_progress",
    creatorActorId: "atlas",
    assigneeActorId: "atlas",
  }),
  defineTask({
    channelId: "general",
    number: 17,
    title: "Claim the playground data pass",
    description: "Keep Tasks aligned with the canonical conversation registry.",
    status: "in_progress",
    creatorActorId: "avery",
    assigneeActorId: "cuvii",
    sourceMessageId: "general:reply",
  }),
  defineTask({
    channelId: "design",
    number: 18,
    title: "Review empty, muted, and unread combinations",
    status: "todo",
    creatorActorId: "cindy",
    assigneeActorId: "mira",
    sourceMessageId: "design:opening",
  }),
  defineTask({
    channelId: "launch",
    number: 19,
    title: "Finish the support handoff",
    status: "in_review",
    creatorActorId: "avery",
    assigneeActorId: "releaseScribe",
    sourceMessageId: "launch:opening",
  }),
  defineTask({
    channelId: "incidents",
    number: 20,
    title: "Document the retry-queue detection gap",
    status: "closed",
    creatorActorId: "incidentTriage",
    assigneeActorId: "deployBot",
  }),
] as const satisfies readonly PlaygroundTask[];

export function getPlaygroundTasks(channelId: PlaygroundChannelId): readonly PlaygroundTask[] {
  return PLAYGROUND_TASKS.filter((task) => task.channelId === channelId);
}
