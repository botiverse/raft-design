import type { PlaygroundChannelId, PlaygroundMessageId } from "./conversations.ts";

export type PlaygroundFile = {
  id: string;
  channelId: PlaygroundChannelId;
  filename: string;
  size: string;
  createdAt: string;
  type: "archive" | "file" | "image" | "pdf" | "video";
  previewUrl: string;
  thumbnailUrl?: string;
  imageFit?: "contain" | "cover";
  sourceMessageId?: PlaygroundMessageId;
};

export const PLAYGROUND_FILES = [
  {
    id: "file:all:design-preview",
    channelId: "all",
    filename: "message-layout-preview.svg",
    size: "84 KB",
    createdAt: "Today, 10:32 AM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
  },
  {
    id: "file:all:migration-notes",
    channelId: "all",
    filename: "migration-notes.md",
    size: "12 KB",
    createdAt: "Today, 10:28 AM",
    type: "file",
    previewUrl:
      "data:text/plain;charset=utf-8,Message%20layout%20migration%20notes%0A%0AUse%20the%20source%20DOM%20as%20the%20baseline.",
  },
  {
    id: "file:all:interaction-spec",
    channelId: "all",
    filename: "interaction-spec.pdf",
    size: "418 KB",
    createdAt: "Yesterday, 4:18 PM",
    type: "pdf",
    previewUrl: "data:text/plain;charset=utf-8,Interaction%20spec%20preview",
  },
  {
    id: "file:all:source-bundle",
    channelId: "all",
    filename: "source-fixtures.zip",
    size: "2.4 MB",
    createdAt: "Yesterday, 3:54 PM",
    type: "archive",
    previewUrl: "data:text/plain;charset=utf-8,Source%20fixture%20bundle",
  },
] as const satisfies readonly PlaygroundFile[];

export function getPlaygroundFiles(channelId: PlaygroundChannelId): readonly PlaygroundFile[] {
  return PLAYGROUND_FILES.filter((file) => file.channelId === channelId);
}
