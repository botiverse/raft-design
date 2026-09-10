import { ActionCardComposition } from "#/modules/message-action-card/compositions/action-card-message.composition.tsx";
import { ForwardedBundleEmbeddedComposition } from "#/modules/message-forwarded-bundle/compositions/forwarded-bundle.composition.tsx";
import { QuotedPreviewLoadingEmbeddedComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-loading.composition.tsx";
import { QuotedPreviewEmbeddedComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-message.composition.tsx";
import { QuotedPreviewUnavailableEmbeddedComposition } from "#/modules/message-quoted-preview/compositions/quoted-preview-unavailable.composition.tsx";
import {
  getPlaygroundActor,
  getPlaygroundChannel,
  isPlaygroundChannelId,
  PLAYGROUND_SERVER_SLUG,
} from "../mock/index.ts";
import type {
  PlaygroundActionCardPresentation,
  PlaygroundActionCardResolution,
  PlaygroundForwardedBundlePresentation,
  PlaygroundMessagePresentation,
  PlaygroundQuotedPreviewPresentation,
} from "../mock/index.ts";

function conversationHref(
  channelId: string,
  messageId?: string,
  thread = false,
): string | undefined {
  if (!isPlaygroundChannelId(channelId)) return undefined;
  const channel = getPlaygroundChannel(channelId);
  const kind = channel.kind === "dm" ? "dm" : "channel";
  const search = thread && messageId ? `?thread=${encodeURIComponent(messageId)}` : "";
  const anchor = messageId ? `#${thread ? "thread-message" : "message"}-${messageId}` : "";
  return `/playground/s/${PLAYGROUND_SERVER_SLUG}/${kind}/${encodeURIComponent(channelId)}${search}${anchor}`;
}

function PlaygroundActionCard({
  presentation,
  resolution,
  onAction,
}: {
  presentation: PlaygroundActionCardPresentation;
  resolution: PlaygroundActionCardResolution;
  onAction?: () => void;
}) {
  return (
    <ActionCardComposition
      title={presentation.title}
      properties={presentation.properties}
      hint={presentation.hint}
      resolution={resolution}
      onAction={resolution.kind === "ready" ? onAction : undefined}
    />
  );
}

function PlaygroundForwardedBundle({
  presentation,
}: {
  presentation: PlaygroundForwardedBundlePresentation;
}) {
  const sourceHref = conversationHref(presentation.source.channelId, presentation.source.messageId);
  const sourceChannel = isPlaygroundChannelId(presentation.source.channelId)
    ? getPlaygroundChannel(presentation.source.channelId)
    : undefined;

  return (
    <ForwardedBundleEmbeddedComposition
      items={presentation.items.map((item) => ({
        id: item.id,
        author: getPlaygroundActor(item.senderId).name,
        createdAt: item.createdAt,
        createdAtDateTime: item.createdAtDateTime,
        content: item.content,
        attachment: item.attachment
          ? { name: item.attachment.name, meta: item.attachment.mediaType }
          : undefined,
      }))}
      sourceLabel={sourceChannel?.name ?? presentation.source.channelId}
      sourceHref={sourceHref ?? null}
      sourceAriaLabel={
        sourceHref
          ? `Open source ${presentation.source.messageId ? "message" : "channel"} in ${
              sourceChannel?.name ?? presentation.source.channelId
            }`
          : undefined
      }
      sourceTitle={presentation.source.messageId ? "Open source message" : "Open source channel"}
      collapsible={presentation.display === "collapsible"}
    />
  );
}

function PlaygroundQuotedPreview({
  presentation,
}: {
  presentation: PlaygroundQuotedPreviewPresentation;
}) {
  if (presentation.state === "loading") {
    return <QuotedPreviewLoadingEmbeddedComposition label={presentation.label} />;
  }
  if (presentation.state === "unavailable") {
    return <QuotedPreviewUnavailableEmbeddedComposition reason={presentation.reason} />;
  }

  const actor = getPlaygroundActor(presentation.senderId);
  const channel = isPlaygroundChannelId(presentation.target.channelId)
    ? getPlaygroundChannel(presentation.target.channelId)
    : undefined;
  const href = conversationHref(
    presentation.target.channelId,
    presentation.target.messageId,
    presentation.target.thread,
  );

  return (
    <QuotedPreviewEmbeddedComposition
      href={href}
      ariaLabel={`Open quoted message in ${channel?.name ?? "conversation"}`}
      author={{
        name: actor.name,
        meta: actor.meta,
        type: actor.type,
        avatarSrc: actor.avatarSrc,
        fallback: actor.fallback ?? actor.name.slice(0, 2),
      }}
      channel={channel?.name ?? presentation.target.channelId}
      thread={presentation.target.thread}
      timestamp={presentation.createdAt}
      content={presentation.content}
      attachmentCount={presentation.attachmentCount}
    />
  );
}

export function PlaygroundMessagePresentation({
  presentation,
  actionCardResolution,
  onActionCardResolve,
}: {
  presentation: PlaygroundMessagePresentation;
  actionCardResolution?: PlaygroundActionCardResolution;
  onActionCardResolve?: () => void;
}) {
  switch (presentation.kind) {
    case "action-card":
      return (
        <PlaygroundActionCard
          presentation={presentation}
          resolution={actionCardResolution ?? presentation.resolution}
          onAction={onActionCardResolve}
        />
      );
    case "forwarded-bundle":
      return <PlaygroundForwardedBundle presentation={presentation} />;
    case "quoted-preview":
      return <PlaygroundQuotedPreview presentation={presentation} />;
    default: {
      const exhaustive: never = presentation;
      return exhaustive;
    }
  }
}
