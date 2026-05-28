import ConversationPreviewCard from "../ui/cards/ConversationPreviewCard";
import { formatSearchRelativeTime } from "../search/searchGrouping";

export interface AgentDMConversation {
  id: string;
  createdAt: string;
  peerId: string;
  peerName: string;
  peerDisplayName: string | null;
  peerAvatarUrl: string | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
}

export function AgentDMConversationList({
  items,
}: {
  items: AgentDMConversation[];
}) {
  return (
    <div className="p-4 space-y-3">
      {items.map((item) => (
        <ConversationPreviewCard
          key={item.id}
          channelLabel="Agent DM"
          timestamp={formatSearchRelativeTime(item.lastMessageAt || item.createdAt)}
          author={{
            name: item.peerDisplayName || item.peerName,
            kind: "agent",
            avatarUrl: item.peerAvatarUrl || null,
            subtitle: `@${item.peerName}`,
          }}
          preview={item.lastMessagePreview || "No messages yet"}
          ariaLabel={`${item.peerDisplayName || item.peerName} agent DM activity`}
          title="Agent DM activity"
          footer={<span className="text-[11px] font-mono uppercase tracking-wide text-black/45">Activity only</span>}
        />
      ))}
    </div>
  );
}
