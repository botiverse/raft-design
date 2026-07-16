import { useContext } from "react";

import { ChatSidebarDndContext } from "./chat-sidebar-dnd-context.ts";

export function useChatSidebarDnd() {
  const value = useContext(ChatSidebarDndContext);
  if (!value) throw new Error("useChatSidebarDnd must be used within ChatSidebarDndProvider");
  return value;
}
