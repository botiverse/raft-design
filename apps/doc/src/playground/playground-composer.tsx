import { useState } from "react";
import {
  FileText,
  GitBranch,
  Hash,
  ImagePlus,
  Lock,
  Paperclip,
  Send,
  UserX,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, Checkbox, Spinner } from "raft-ui";
import {
  ChatMainPanelComposer,
  ChatMainPanelComposerActions,
  ChatMainPanelComposerAttachment,
  ChatMainPanelComposerAttachmentBody,
  ChatMainPanelComposerAttachmentFile,
  ChatMainPanelComposerAttachmentImage,
  ChatMainPanelComposerAttachmentMeta,
  ChatMainPanelComposerAttachmentOverlay,
  ChatMainPanelComposerAttachmentProgress,
  ChatMainPanelComposerAttachmentRemove,
  ChatMainPanelComposerAttachmentTitle,
  ChatMainPanelComposerAttachments,
  ChatMainPanelComposerDropOverlay,
  ChatMainPanelComposerDropOverlayLabel,
  ChatMainPanelComposerIconButton,
  ChatMainPanelComposerInput,
  ChatMainPanelComposerMeta,
  ChatMainPanelComposerSubmit,
  ChatMainPanelComposerToolbar,
  ChatMainPanelFooter,
  ComposerAutocomplete,
  ComposerAutocompleteAside,
  ComposerAutocompleteBadge,
  ComposerAutocompleteContent,
  ComposerAutocompleteGroup,
  ComposerAutocompleteGroupLabel,
  ComposerAutocompleteIcon,
  ComposerAutocompleteItem,
  ComposerAutocompleteMeta,
  ComposerAutocompleteTitle,
  ComposerStack,
  ComposerTaskLabel,
  ComposerTaskToggle,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/compositions/chat-main-panel-states-composition.tsx";
import type { RowVariant } from "#/playground/playground-main-panel.tsx";
import {
  PLAYGROUND_ACTORS,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
  getPlaygroundMembers,
  type PlaygroundChannel,
} from "./mock/index.ts";

type MentionCandidate = { name: string; handle: string; variant: RowVariant };

const CHANNEL_CANDIDATES = [...PLAYGROUND_ROOM_CHANNELS, ...PLAYGROUND_JOINT_CHANNELS];

// @mention autocomplete (source MessageInput mention dropdown): upward panel with
// In-/Not-in-channel eyebrow groups; the first in-channel row is selected.
function MentionAutocomplete({ channel }: { channel: PlaygroundChannel }) {
  const inChannel = getPlaygroundMembers(channel).map(
    (actor): MentionCandidate => ({
      name: actor.name,
      handle: actor.id,
      variant: actor.type === "agent" ? "agent" : "member",
    }),
  );
  const memberIds = new Set(channel.memberIds);
  const notInChannel = Object.values(PLAYGROUND_ACTORS)
    .filter((actor) => !memberIds.has(actor.id))
    .slice(0, 3)
    .map(
      (actor): MentionCandidate => ({
        name: actor.name,
        handle: actor.id,
        variant: actor.type === "agent" ? "agent" : "member",
      }),
    );

  return (
    <ComposerAutocomplete data-testid="mention-autocomplete-popover">
      <ComposerAutocompleteGroup>
        <ComposerAutocompleteGroupLabel>In this channel</ComposerAutocompleteGroupLabel>
        {inChannel.map((candidate, index) => {
          const selected = index === 0;
          return (
            <ComposerAutocompleteItem key={candidate.handle} selected={selected}>
              <ComposerAutocompleteIcon
                render={
                  <Avatar size="sm" type={candidate.variant === "agent" ? "agent" : "human"} />
                }
              >
                <AvatarFallback />
              </ComposerAutocompleteIcon>
              <ComposerAutocompleteContent>
                <ComposerAutocompleteTitle>{candidate.name}</ComposerAutocompleteTitle>
                {candidate.variant === "agent" ? (
                  <ComposerAutocompleteBadge aria-hidden variant="indicator" />
                ) : null}
                <ComposerAutocompleteAside>
                  <ComposerAutocompleteMeta variant="code">
                    @{candidate.handle}
                  </ComposerAutocompleteMeta>
                </ComposerAutocompleteAside>
              </ComposerAutocompleteContent>
            </ComposerAutocompleteItem>
          );
        })}
      </ComposerAutocompleteGroup>
      <ComposerAutocompleteGroup separated>
        <ComposerAutocompleteGroupLabel>Not in this channel</ComposerAutocompleteGroupLabel>
        {notInChannel.map((candidate) => (
          <ComposerAutocompleteItem key={candidate.handle} muted>
            <ComposerAutocompleteIcon
              muted
              render={<Avatar size="sm" type={candidate.variant === "agent" ? "agent" : "human"} />}
            >
              <AvatarFallback />
            </ComposerAutocompleteIcon>
            <ComposerAutocompleteIcon variant="auxiliary" render={<UserX />} />
            <ComposerAutocompleteContent>
              <ComposerAutocompleteTitle>{candidate.name}</ComposerAutocompleteTitle>
              <ComposerAutocompleteAside>
                <ComposerAutocompleteMeta muted variant="code">
                  @{candidate.handle}
                </ComposerAutocompleteMeta>
              </ComposerAutocompleteAside>
            </ComposerAutocompleteContent>
          </ComposerAutocompleteItem>
        ))}
      </ComposerAutocompleteGroup>
    </ComposerAutocomplete>
  );
}

// #channel autocomplete (source MessageInput channel dropdown): bordered Hash box
// per row; selected row washes pink; archived rows dim with an `archived` badge.
function ChannelAutocomplete() {
  return (
    <ComposerAutocomplete data-testid="channel-autocomplete-popover">
      {CHANNEL_CANDIDATES.map((channel, index) => {
        const selected = index === 0;
        const archived = channel.archived;
        const ChannelIcon =
          channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
        return (
          <ComposerAutocompleteItem
            key={channel.name}
            selected={selected}
            muted={archived}
            tone="accent"
          >
            <ComposerAutocompleteIcon variant="framed" muted={archived}>
              <ChannelIcon />
            </ComposerAutocompleteIcon>
            <ComposerAutocompleteTitle>{channel.name}</ComposerAutocompleteTitle>
            {channel.subtitle ? (
              <ComposerAutocompleteMeta muted={archived}>
                {channel.subtitle}
              </ComposerAutocompleteMeta>
            ) : null}
            {archived ? (
              <ComposerAutocompleteAside>
                <ComposerAutocompleteBadge>archived</ComposerAutocompleteBadge>
              </ComposerAutocompleteAside>
            ) : null}
          </ComposerAutocompleteItem>
        );
      })}
    </ComposerAutocomplete>
  );
}

type ComposerAutocompleteKind = "mention" | "channel" | null;

// Pending-upload attachment chips (source MessageInput SortableAttachment):
// an image still uploading (spinner + progress), a resting file chip, and a
// failed upload with a retry affordance.
function ComposerAttachments() {
  return (
    <ChatMainPanelComposerAttachments>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentImage alt="" src={COMPOSER_IMAGE_SRC} />
        <ChatMainPanelComposerAttachmentOverlay tone="uploading">
          <Spinner size="sm" className="mb-1" />
          64%
        </ChatMainPanelComposerAttachmentOverlay>
        <ChatMainPanelComposerAttachmentProgress value={64} />
        <ChatMainPanelComposerAttachmentRemove aria-label="Remove screenshot.png">
          <X />
        </ChatMainPanelComposerAttachmentRemove>
      </ChatMainPanelComposerAttachment>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentFile>
          <FileText />
          <ChatMainPanelComposerAttachmentBody>
            <ChatMainPanelComposerAttachmentTitle>
              release-notes.pdf
            </ChatMainPanelComposerAttachmentTitle>
            <ChatMainPanelComposerAttachmentMeta>
              application/pdf
            </ChatMainPanelComposerAttachmentMeta>
          </ChatMainPanelComposerAttachmentBody>
        </ChatMainPanelComposerAttachmentFile>
        <ChatMainPanelComposerAttachmentRemove aria-label="Remove release-notes.pdf">
          <X />
        </ChatMainPanelComposerAttachmentRemove>
      </ChatMainPanelComposerAttachment>
      <ChatMainPanelComposerAttachment>
        <ChatMainPanelComposerAttachmentFile>
          <FileText />
          <ChatMainPanelComposerAttachmentBody>
            <ChatMainPanelComposerAttachmentTitle>deck.key</ChatMainPanelComposerAttachmentTitle>
            <ChatMainPanelComposerAttachmentMeta>
              application/octet-stream
            </ChatMainPanelComposerAttachmentMeta>
          </ChatMainPanelComposerAttachmentBody>
        </ChatMainPanelComposerAttachmentFile>
        <ChatMainPanelComposerAttachmentOverlay tone="failed">
          Upload failed
          <span className="underline">Tap to retry</span>
        </ChatMainPanelComposerAttachmentOverlay>
      </ChatMainPanelComposerAttachment>
    </ChatMainPanelComposerAttachments>
  );
}

export function Composer({
  channel,
  label,
  uploads = false,
}: {
  channel: PlaygroundChannel;
  label: string;
  uploads?: boolean;
}) {
  const [autocomplete, setAutocomplete] = useState<ComposerAutocompleteKind>(null);

  // Demo trigger: `@` / `#` open the matching panel, Escape closes (source uses
  // a caret regex against the draft; a keydown check is enough for the preview).
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "@") setAutocomplete("mention");
    else if (event.key === "#") setAutocomplete("channel");
    else if (event.key === "Escape") setAutocomplete(null);
  };

  return (
    <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
      <ComposerStack positioned>
        {autocomplete === "mention" ? <MentionAutocomplete channel={channel} /> : null}
        {autocomplete === "channel" ? <ChannelAutocomplete /> : null}
        {uploads ? <ComposerAttachments /> : null}
        <ChatMainPanelComposer>
          <ChatMainPanelComposerInput
            aria-label={label}
            placeholder={label}
            onKeyDown={handleKeyDown}
          />
          <ChatMainPanelComposerToolbar>
            <ChatMainPanelComposerActions>
              <ChatMainPanelComposerIconButton aria-label="Attach image">
                <ImagePlus />
              </ChatMainPanelComposerIconButton>
              <ChatMainPanelComposerIconButton aria-label="Attach file">
                <Paperclip />
              </ChatMainPanelComposerIconButton>
            </ChatMainPanelComposerActions>
            <ChatMainPanelComposerMeta>
              <ComposerTaskToggle>
                <Checkbox size="sm" aria-label="Send as task" />
                <ComposerTaskLabel>As Task</ComposerTaskLabel>
              </ComposerTaskToggle>
              <ChatMainPanelComposerSubmit aria-label="Send">
                <span>Send</span>
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </ComposerStack>
      {uploads ? (
        <ChatMainPanelComposerDropOverlay aria-hidden>
          <ChatMainPanelComposerDropOverlayLabel>
            Drop files to attach
          </ChatMainPanelComposerDropOverlayLabel>
        </ChatMainPanelComposerDropOverlay>
      ) : null}
    </ChatMainPanelFooter>
  );
}
