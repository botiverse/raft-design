import type { SystemMessageSlice } from "raft-ui/wip";

export const SYSTEM_MESSAGE_FIXTURE_NOW = new Date("2026-07-16T01:00:00.000Z");

export const SYSTEM_MESSAGE_REMINDER_FIRE_AT = "2026-07-16T09:00:00.000Z";

export const SYSTEM_MESSAGE_FIXTURES = {
  channelArchive: {
    id: "sys-channel-archive",
    messageType: "system",
    content: "📦 Atlas archived this channel",
  },
  channelUnarchive: {
    id: "sys-channel-unarchive",
    messageType: "system",
    content: "📤 Atlas unarchived this channel",
  },
  channelRename: {
    id: "sys-channel-rename",
    messageType: "system",
    content: "@atlas renamed this channel from #rename-before to #rename-after.",
  },
  agentAdded: {
    id: "sys-agent-added",
    messageType: "system",
    content: "@hermes was added to this channel.",
  },
  agentRemoved: {
    id: "sys-agent-removed",
    messageType: "system",
    content: "@hermes was removed from this channel.",
  },
  agentJoined: {
    id: "sys-agent-joined",
    messageType: "system",
    content: "@hermes joined this channel.",
  },
  taskCreated: {
    id: "sys-task-created",
    messageType: "system",
    content:
      '📋 2 new tasks created: #41 "Release review checklist", #42 "Polish SystemMessage docs"',
  },
  taskConverted: {
    id: "sys-task-converted",
    messageType: "system",
    content: '📋 Atlas converted a message to task #41 "Release review checklist"',
  },
  taskClaimed: {
    id: "sys-task-claimed",
    messageType: "system",
    content: '📌 Ada claimed #42 "Polish SystemMessage docs"',
  },
  taskReleased: {
    id: "sys-task-released",
    messageType: "system",
    content: '🔓 Ada released #42 "Polish SystemMessage docs"',
  },
  taskMovedTodo: {
    id: "sys-task-moved-todo",
    messageType: "system",
    content: '📝 Atlas moved #41 "Release review checklist" to Todo',
  },
  taskMovedInProgress: {
    id: "sys-task-moved-in-progress",
    messageType: "system",
    content: '🔄 Atlas moved #41 "Release review checklist" to In Progress',
  },
  taskMovedInReview: {
    id: "sys-task-moved-in-review",
    messageType: "system",
    content: '👀 Atlas moved #41 "Release review checklist" to In Review',
  },
  taskMovedDone: {
    id: "sys-task-moved-done",
    messageType: "system",
    content: '✅ Atlas moved #41 "Release review checklist" to Done',
  },
  taskMovedClosed: {
    id: "sys-task-moved-closed",
    messageType: "system",
    content: '🚫 Atlas moved #41 "Release review checklist" to Closed',
  },
  taskDeleted: {
    id: "sys-task-deleted",
    messageType: "system",
    content: '🗑 Atlas deleted #41 "Release review checklist"',
  },
  taskAssigned: {
    id: "sys-task-assigned",
    messageType: "system",
    content: '📌 Assigned @Ada to task #42 "Polish SystemMessage docs"',
  },
  taskStarted: {
    id: "sys-task-started",
    messageType: "system",
    content: '📌 @Ada started task #42 "Polish SystemMessage docs"',
  },
  reminderScheduled: {
    id: "sys-reminder-scheduled",
    messageType: "system",
    content: `@Atlas scheduled a reminder: "Ship the docs cut" — fires <span data-reminder-fire-at="${SYSTEM_MESSAGE_REMINDER_FIRE_AT}">2026-07-16 09:00 UTC</span>`,
  },
  reminderFireNotice: {
    id: "sys-reminder-fire",
    messageType: "system",
    content:
      '🔔 Reminder #7ddfdf1d (one-time) — #proj-uiux:141a05fd — "Check PR #1306 CI for task #103"',
  },
  reminderRecurring: {
    id: "sys-reminder-recurring",
    messageType: "system",
    content:
      "Reminder (recurring): #users:a545a4d3 — Check tong07@163.com reply re: outbound DM test result, relay to Kai",
  },
  onboardingAllUnlock: {
    id: "sys-onboarding-all",
    messageType: "system",
    content: [
      "#all is now live — Hermes just joined the team.",
      "This channel is where all your agents and team members can collaborate together.",
      "Your agents can @mention each other here, and you can coordinate across the whole team.",
    ].join("\n\n"),
  },
  genericArchive: {
    id: "sys-generic-archive",
    messageType: "system",
    content: "Channel archived",
  },
  genericUnarchive: {
    id: "sys-generic-unarchive",
    messageType: "system",
    content: "Channel unarchived",
  },
} as const satisfies Record<string, SystemMessageSlice>;

export const SYSTEM_MESSAGE_GROUPED_UPDATES: SystemMessageSlice[] = [
  SYSTEM_MESSAGE_FIXTURES.taskMovedDone,
  SYSTEM_MESSAGE_FIXTURES.taskClaimed,
  SYSTEM_MESSAGE_FIXTURES.reminderFireNotice,
];

export const SYSTEM_MESSAGE_GROUPED_GENERIC: SystemMessageSlice[] = [
  SYSTEM_MESSAGE_FIXTURES.genericArchive,
  SYSTEM_MESSAGE_FIXTURES.genericUnarchive,
];

export const SYSTEM_MESSAGE_PREVIEW_CATALOG: ReadonlyArray<{
  title: string;
  messages: readonly SystemMessageSlice[];
}> = [
  {
    title: "Channel",
    messages: [
      SYSTEM_MESSAGE_FIXTURES.channelArchive,
      SYSTEM_MESSAGE_FIXTURES.channelUnarchive,
      SYSTEM_MESSAGE_FIXTURES.channelRename,
      SYSTEM_MESSAGE_FIXTURES.agentAdded,
      SYSTEM_MESSAGE_FIXTURES.agentRemoved,
      SYSTEM_MESSAGE_FIXTURES.agentJoined,
    ],
  },
  {
    title: "Task",
    messages: [
      SYSTEM_MESSAGE_FIXTURES.taskCreated,
      SYSTEM_MESSAGE_FIXTURES.taskConverted,
      SYSTEM_MESSAGE_FIXTURES.taskClaimed,
      SYSTEM_MESSAGE_FIXTURES.taskReleased,
      SYSTEM_MESSAGE_FIXTURES.taskMovedTodo,
      SYSTEM_MESSAGE_FIXTURES.taskMovedInProgress,
      SYSTEM_MESSAGE_FIXTURES.taskMovedInReview,
      SYSTEM_MESSAGE_FIXTURES.taskMovedDone,
      SYSTEM_MESSAGE_FIXTURES.taskMovedClosed,
      SYSTEM_MESSAGE_FIXTURES.taskDeleted,
      SYSTEM_MESSAGE_FIXTURES.taskAssigned,
      SYSTEM_MESSAGE_FIXTURES.taskStarted,
    ],
  },
  {
    title: "Reminder",
    messages: [
      SYSTEM_MESSAGE_FIXTURES.reminderScheduled,
      SYSTEM_MESSAGE_FIXTURES.reminderFireNotice,
      SYSTEM_MESSAGE_FIXTURES.reminderRecurring,
    ],
  },
  {
    title: "Onboarding",
    messages: [SYSTEM_MESSAGE_FIXTURES.onboardingAllUnlock],
  },
];
