import { useState, type ReactNode } from "react";
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

// Section eyebrow (source ui/SectionEyebrow) used by the mention groups.
function ComboboxEyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-black/60 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

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
    <div
      data-testid="mention-autocomplete-popover"
      className="card-brutal absolute bottom-full left-7 right-[calc(1.75rem+var(--message-scroller-gutter,0px))] mb-1 max-h-48 overflow-y-auto"
    >
      <ComboboxEyebrow>In this channel</ComboboxEyebrow>
      {inChannel.map((candidate, index) => {
        const selected = index === 0;
        return (
          <button
            key={candidate.handle}
            type="button"
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? "bg-soft-signal font-bold text-black"
                : "text-black hover:bg-soft-signal/50"
            }`}
          >
            <Avatar
              size="sm"
              type={candidate.variant === "agent" ? "agent" : "human"}
              className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:text-black"
            >
              <AvatarFallback />
            </Avatar>
            <div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
              <span className="min-w-0 truncate text-black">{candidate.name}</span>
              {candidate.variant === "agent" ? (
                <span
                  aria-hidden
                  className="inline-block size-2.5 shrink-0 rounded-full border border-line-strong bg-brutal-lime [[data-preview-theme=brutal]_&]:border-black"
                />
              ) : null}
              <span className="ml-auto shrink-0 font-mono text-xs text-black/40">
                @{candidate.handle}
              </span>
            </div>
          </button>
        );
      })}
      <ComboboxEyebrow className="border-t-2 border-black">Not in this channel</ComboboxEyebrow>
      {notInChannel.map((candidate) => (
        <button
          key={candidate.handle}
          type="button"
          className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-black/50 transition-colors hover:bg-black/5"
        >
          <Avatar
            size="sm"
            type={candidate.variant === "agent" ? "agent" : "human"}
            className="opacity-60 [[data-preview-theme=brutal]_&]:border-black/40 [[data-preview-theme=brutal]_&]:text-black"
          >
            <AvatarFallback />
          </Avatar>
          <UserX size={12} className="-ml-1 shrink-0 text-black/40" />
          <div className="flex min-w-0 flex-1 items-center gap-1.5 text-left">
            <span className="min-w-0 truncate text-black/50">{candidate.name}</span>
            <span className="ml-auto shrink-0 font-mono text-xs text-black/30">
              @{candidate.handle}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// #channel autocomplete (source MessageInput channel dropdown): bordered Hash box
// per row; selected row washes pink; archived rows dim with an `archived` badge.
function ChannelAutocomplete() {
  return (
    <div
      data-testid="channel-autocomplete-popover"
      className="card-brutal absolute bottom-full left-7 right-[calc(1.75rem+var(--message-scroller-gutter,0px))] mb-1 max-h-48 overflow-y-auto"
    >
      {CHANNEL_CANDIDATES.map((channel, index) => {
        const selected = index === 0;
        const archived = channel.archived;
        const ChannelIcon =
          channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
        return (
          <button
            key={channel.name}
            type="button"
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
              selected
                ? archived
                  ? "bg-black/10 font-bold text-black/70"
                  : "bg-brutal-pink font-bold text-black"
                : archived
                  ? "text-black/45 hover:bg-black/5"
                  : "text-black hover:bg-soft-signal"
            }`}
          >
            <div
              className={`flex size-5 shrink-0 items-center justify-center border ${
                archived
                  ? "border-black/40 bg-black/5 text-black/45"
                  : "border-black bg-soft-signal text-black"
              }`}
            >
              <ChannelIcon size={12} />
            </div>
            <span className="truncate">{channel.name}</span>
            <span className={`truncate text-xs ${archived ? "text-black/30" : "text-black/40"}`}>
              {channel.subtitle}
            </span>
            {archived ? (
              <span className="ml-auto shrink-0 border border-black/40 bg-black/5 px-1 py-0.5 text-[9px] font-bold leading-none text-black/45">
                archived
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

type ComposerAutocomplete = "mention" | "channel" | null;

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
  const [autocomplete, setAutocomplete] = useState<ComposerAutocomplete>(null);

  // Demo trigger: `@` / `#` open the matching panel, Escape closes (source uses
  // a caret regex against the draft; a keydown check is enough for the preview).
  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "@") setAutocomplete("mention");
    else if (event.key === "#") setAutocomplete("channel");
    else if (event.key === "Escape") setAutocomplete(null);
  };

  return (
    <ChatMainPanelFooter onSubmit={(event) => event.preventDefault()}>
      <div className="relative flex w-full flex-col gap-2">
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
              <label className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md border-0 bg-transparent px-2.5 py-1 transition-colors hover:bg-layer-muted">
                <Checkbox size="sm" aria-label="Send as task" />
                <span className="text-xs font-medium text-foreground-muted [[data-preview-theme=brutal]_&]:font-bold [[data-preview-theme=brutal]_&]:text-black/60">
                  As Task
                </span>
              </label>
              <ChatMainPanelComposerSubmit aria-label="Send">
                <span>Send</span>
                <Send />
              </ChatMainPanelComposerSubmit>
            </ChatMainPanelComposerMeta>
          </ChatMainPanelComposerToolbar>
        </ChatMainPanelComposer>
      </div>
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
