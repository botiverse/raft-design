import { ChatSidebarComposition } from "../chat-sidebar.composition.tsx";

export function ChatSidebarPreviewContent() {
  return (
    <div className="flex h-full w-[308px] items-stretch bg-layer-page">
      <ChatSidebarComposition contentState="populated" liveActivityState="active" />
    </div>
  );
}
