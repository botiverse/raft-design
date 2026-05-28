import { useEffect, useMemo, useState } from "react";
import type { ParsedSlockPermalink } from "@slock-ai/shared";
import api from "../../api/client";
import { useTimeFormatter } from "../../hooks/useTimeFormatter";
import { useAgentStore } from "../../store/agentStore";
import { useAuthStore } from "../../store/authStore";
import { useChannelStore } from "../../store/channelStore";
import type { Message } from "../../store/messageStore";
import { useServerStore } from "../../store/serverStore";
import { resolveMessageSenderMemberFromList } from "../../utils/messageSenderMember";
import QuotedMessageCard from "../ui/cards/QuotedMessageCard";
import { buildQuotedMessageAttachmentLabel } from "./quotedMessagePermalink";

type PreviewState =
  | { status: "loading" }
  | { status: "loaded"; target: Message; channelArchived: boolean }
  | { status: "unavailable" };

export default function QuotedMessagePermalinkPreview({
  permalink,
  onOpen,
}: {
  permalink: ParsedSlockPermalink;
  onOpen: (permalink: ParsedSlockPermalink) => void;
}) {
  const [state, setState] = useState<PreviewState>({ status: "loading" });
  const channels = useChannelStore((s) => s.channels);
  const dmChannels = useChannelStore((s) => s.dmChannels);
  const agents = useAgentStore((s) => s.agents);
  const members = useServerStore((s) => s.members);
  const currentUser = useAuthStore((s) => s.user);
  const { formatShortDateTime } = useTimeFormatter();

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    void api.get(`/messages/context/${permalink.messageId}`, {
      params: { channelId: permalink.threadParentMessageId ? undefined : permalink.channelId },
    })
      .then(({ data }) => {
        if (cancelled) return;
        const payload = data as { messages?: Message[]; channelArchived?: boolean; targetMessageId?: string };
        const messages = payload.messages ?? [];
        const targetMessageId = payload.targetMessageId ?? permalink.messageId;
        const target = messages.find((message) => message.id === targetMessageId);
        setState(
          target
            ? { status: "loaded", target, channelArchived: !!payload.channelArchived }
            : { status: "unavailable" },
        );
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "unavailable" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [permalink.channelId, permalink.messageId, permalink.threadParentMessageId]);

  const channel = useMemo(
    () => channels.find((entry) => entry.id === permalink.channelId) ?? dmChannels.find((entry) => entry.id === permalink.channelId),
    [channels, dmChannels, permalink.channelId],
  );

  if (state.status === "loading") {
    return (
      <div className="w-full animate-pulse border-2 border-black bg-white">
        <div className="h-[34px] border-b-2 border-black bg-white/60" />
        <div className="flex gap-3 px-3 py-2.5">
          <div className="size-7 shrink-0 border-2 border-black bg-black/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-black/10" />
            <div className="h-3 w-full bg-black/10" />
            <div className="size-3/4 bg-black/10" />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "unavailable") {
    return <QuotedMessageCard unavailable onClick={() => onOpen(permalink)} channelName="" timestamp="" author={{ name: "", kind: "user" }} content="" />;
  }

  const { target } = state;
  const agent = target.senderType === "agent" ? agents.find((entry) => entry.id === target.senderId) : null;
  const member = resolveMessageSenderMemberFromList(target, members, currentUser) ?? null;
  const attachmentLabel = buildQuotedMessageAttachmentLabel(target.attachments);
  const isArchived = state.channelArchived || (channel ? !!channel.archivedAt : false);

  return (
    <QuotedMessageCard
      channelName={
        channel
          ? channel.type === "dm"
            ? (channel.peerDisplayName || channel.peerName || channel.name)
            : channel.name
          : (permalink.routeKind === "dm" ? "Direct message" : "Channel")
      }
      channelKind={permalink.routeKind}
      isThread={Boolean(permalink.threadParentMessageId)}
      isArchived={isArchived}
      timestamp={formatShortDateTime(target.createdAt).replace(",", " ·")}
      author={{
        name: target.senderName || (target.senderType === "agent" ? "Agent" : "User"),
        kind: target.senderType,
        avatar: target.senderType === "agent" ? (agent?.avatarUrl ?? undefined) : (member?.avatarUrl ?? undefined),
        gravatarHash: target.senderType === "user" ? (member?.gravatarHash ?? undefined) : undefined,
        subtitle: target.senderType === "agent"
          ? (agent?.description ?? undefined)
          : (member?.description || member?.role || undefined),
      }}
      content={target.content}
      attachments={attachmentLabel ? [{ label: attachmentLabel }] : undefined}
      onClick={() => onOpen(permalink)}
    />
  );
}
