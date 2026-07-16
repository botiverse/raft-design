import {
  RAFT_UI_MIGRATION_THREAD_IDS,
  getPlaygroundThread,
  type PlaygroundChannelId,
  type PlaygroundMessageId,
} from "./conversations.ts";

export type PlaygroundFile = {
  id: PlaygroundFileId;
  channelId: PlaygroundChannelId;
  filename: string;
  size: string;
  createdAt: string;
  type: "archive" | "file" | "image" | "pdf" | "video";
  previewUrl: string;
  thumbnailUrl?: string;
  imageFit?: "contain" | "cover";
  sourceMessageId: PlaygroundMessageId;
};

export type PlaygroundFileId = `file:${PlaygroundChannelId}:${string}`;

export const PLAYGROUND_FILES = [
  {
    id: "file:all:raft-ui-mark",
    channelId: "all",
    filename: "raft-ui-mark.svg",
    size: "6 KB",
    createdAt: "Today, 10:32 AM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    id: "file:all:state-ownership-notes",
    channelId: "all",
    filename: "state-ownership-migration-notes.md",
    size: "124 B",
    createdAt: "Today, 10:28 AM",
    type: "file",
    previewUrl:
      "data:text/plain;charset=utf-8,Raft%20UI%20migration%20notes%0A%0AKeep%20server%20state%20outside%20the%20local%20message%20store.%0AAssign%20interaction%20state%20to%20the%20narrowest%20owner.",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    id: "file:all:invite-security-acceptance",
    channelId: "all",
    filename: "invite-security-acceptance.txt",
    size: "122 B",
    createdAt: "Yesterday, 4:18 PM",
    type: "file",
    previewUrl:
      "data:text/plain;charset=utf-8,Invite%20security%20acceptance%0A%0ARate-limit%20workspace%20probes.%0AKeep%20rejection%20copy%20generic.%0ALog%20the%20migration%20security%20decision.",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    id: "file:all:canonical-composition-source-index",
    channelId: "all",
    filename: "canonical-composition-source-index.txt",
    size: "150 B",
    createdAt: "Yesterday, 3:54 PM",
    type: "file",
    previewUrl:
      "data:text/plain;charset=utf-8,Canonical%20composition%20source%20index%0A%0AMessage%20items%3A%20message-item-compositions.tsx%0AFiles%3A%20files-panel-composition.tsx%0ATasks%3A%20tasks-panel-composition.tsx",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
] as const satisfies readonly PlaygroundFile[];

for (const file of PLAYGROUND_FILES) {
  const source = getPlaygroundThread(file.sourceMessageId);
  if (!source) {
    throw new Error(`Unknown source message for playground file: ${file.id}`);
  }
  if (source.channelId !== file.channelId) {
    throw new Error(`Playground file source is in another channel: ${file.id}`);
  }
}

export function getPlaygroundFiles(channelId: PlaygroundChannelId): readonly PlaygroundFile[] {
  return PLAYGROUND_FILES.filter((file) => file.channelId === channelId);
}

export function getPlaygroundFilesForMessage(
  messageId: PlaygroundMessageId,
): readonly PlaygroundFile[] {
  return PLAYGROUND_FILES.filter((file) => file.sourceMessageId === messageId);
}

export function getPlaygroundFile(id: string): PlaygroundFile | undefined {
  return PLAYGROUND_FILES.find((file) => file.id === id);
}

export function requirePlaygroundFile(id: string): PlaygroundFile {
  const file = getPlaygroundFile(id);
  if (!file) throw new Error(`Unknown playground file: ${id}`);
  return file;
}
