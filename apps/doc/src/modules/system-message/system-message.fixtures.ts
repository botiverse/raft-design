export type SystemMessageSlice = {
  id: string;
  messageType: "system";
  content: string;
};

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
  taskClaimed: {
    id: "sys-task-claimed",
    messageType: "system",
    content: '📌 Ada claimed #42 "Polish SystemMessage docs"',
  },
  taskMovedDone: {
    id: "sys-task-moved-done",
    messageType: "system",
    content: '✅ Atlas moved #41 "Release review checklist" to Done',
  },
} as const satisfies Record<string, SystemMessageSlice>;
