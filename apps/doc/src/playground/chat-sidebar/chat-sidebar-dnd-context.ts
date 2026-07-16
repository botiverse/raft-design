import { createContext } from "react";

import type { PlaygroundChannelId } from "../mock/index.ts";
import type { ChatSidebarDragSection } from "./chat-sidebar-dnd-ids.ts";

export type ChatSidebarDndValue = {
  getDragId: (section: ChatSidebarDragSection, channelId: PlaygroundChannelId) => string;
  isPinned: (channelId: PlaygroundChannelId) => boolean;
  orderRows: <TRow extends { id: PlaygroundChannelId }>(
    section: ChatSidebarDragSection,
    rows: readonly TRow[],
  ) => TRow[];
  togglePinned: (channelId: PlaygroundChannelId) => void;
};

export const ChatSidebarDndContext = createContext<ChatSidebarDndValue | null>(null);
