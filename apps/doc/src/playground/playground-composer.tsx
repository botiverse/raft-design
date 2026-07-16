import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { GitBranch, Hash, ImagePlus, Lock, Paperclip, Send, UserX, X } from "lucide-react";
import { Avatar, AvatarFallback, Checkbox, Spinner } from "raft-ui";
import {
  ConversationPanelFooter,
  ThreadPanelFooter,
  Composer,
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentMeta,
  ComposerAttachmentProgress,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  ComposerDropOverlay,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerSuggestionAside,
  ComposerSuggestionBadge,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionList,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
} from "raft-ui/wip";

import { ComposerDropOverlayPrompt } from "#/modules/chat-composer/compositions/composer-drop-overlay-prompt.composition.tsx";
import { ComposerAttachmentsComposition } from "#/modules/chat-composer/compositions/composer-shared.composition.tsx";
import { usePlaygroundSingleComposerMentionTarget } from "./playground-composer-mentions.tsx";
import type {
  PlaygroundChannel,
  PlaygroundComposerAttachment,
  PlaygroundInitialComposer,
} from "./mock/index.ts";
import {
  usePlaygroundComposerAutocomplete,
  type ComposerSuggestion,
} from "./use-playground-composer-autocomplete.ts";

type AutocompleteApi = ReturnType<typeof usePlaygroundComposerAutocomplete>;
type OptionProps = ReturnType<AutocompleteApi["getOptionProps"]>;
type ComposerAttachmentState =
  | { kind: "none" }
  | { kind: "generic" }
  | { kind: "seeded"; attachments: readonly PlaygroundComposerAttachment[] };

function filePreviewLabel(name: string) {
  const extension = name.split(".").at(-1);
  return extension ? extension.slice(0, 4).toUpperCase() : "FILE";
}

function AutocompleteOption({
  suggestion,
  optionProps,
}: {
  suggestion: ComposerSuggestion;
  optionProps: OptionProps;
}) {
  if (suggestion.kind === "mention") {
    return (
      <ComposerSuggestionOption {...optionProps}>
        <ComposerSuggestionIcon render={<Avatar size="sm" type={suggestion.type} />}>
          <AvatarFallback />
        </ComposerSuggestionIcon>
        {suggestion.disabled ? (
          <ComposerSuggestionIcon variant="auxiliary" render={<UserX />} />
        ) : null}
        <ComposerSuggestionContent>
          <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
          {suggestion.type === "agent" ? (
            <ComposerSuggestionBadge aria-hidden variant="indicator" />
          ) : null}
          <ComposerSuggestionAside>
            <ComposerSuggestionMeta variant="code">@{suggestion.handle}</ComposerSuggestionMeta>
          </ComposerSuggestionAside>
        </ComposerSuggestionContent>
      </ComposerSuggestionOption>
    );
  }

  const ChannelIcon =
    suggestion.roomKind === "joint" ? GitBranch : suggestion.roomKind === "private" ? Lock : Hash;
  return (
    <ComposerSuggestionOption {...optionProps} tone="accent">
      <ComposerSuggestionIcon variant="framed">
        <ChannelIcon />
      </ComposerSuggestionIcon>
      <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
      {suggestion.subtitle ? (
        <ComposerSuggestionMeta>{suggestion.subtitle}</ComposerSuggestionMeta>
      ) : null}
      {suggestion.archived ? (
        <ComposerSuggestionAside>
          <ComposerSuggestionBadge>archived</ComposerSuggestionBadge>
        </ComposerSuggestionAside>
      ) : null}
    </ComposerSuggestionOption>
  );
}

function AutocompleteList({ autocomplete }: { autocomplete: AutocompleteApi }) {
  const indexedItems = autocomplete.items.map((suggestion, index) => ({ index, suggestion }));
  const inChannel = indexedItems.filter(
    ({ suggestion }) => suggestion.kind === "mention" && suggestion.group === "in-channel",
  );
  const outsideChannel = indexedItems.filter(
    ({ suggestion }) => suggestion.kind === "mention" && suggestion.group === "outside-channel",
  );
  const renderOption = ({
    index,
    suggestion,
  }: {
    index: number;
    suggestion: ComposerSuggestion;
  }) => (
    <AutocompleteOption
      key={suggestion.kind === "mention" ? suggestion.handle : suggestion.id}
      suggestion={suggestion}
      optionProps={autocomplete.getOptionProps(suggestion, index)}
    />
  );

  return (
    <ComposerSuggestionList
      {...autocomplete.getListProps({ "aria-label": "Mention and channel suggestions" })}
    >
      {inChannel.length > 0 ? (
        <ComposerSuggestionGroup role="group" aria-label="In this channel">
          <ComposerSuggestionGroupLabel aria-hidden>In this channel</ComposerSuggestionGroupLabel>
          {inChannel.map(renderOption)}
        </ComposerSuggestionGroup>
      ) : null}
      {outsideChannel.length > 0 ? (
        <ComposerSuggestionGroup separated role="group" aria-label="Not in this channel">
          <ComposerSuggestionGroupLabel aria-hidden>
            Not in this channel
          </ComposerSuggestionGroupLabel>
          {outsideChannel.map(renderOption)}
        </ComposerSuggestionGroup>
      ) : null}
      {inChannel.length === 0 && outsideChannel.length === 0
        ? indexedItems.map(renderOption)
        : null}
    </ComposerSuggestionList>
  );
}

function PlaygroundSeededComposerAttachments({
  attachments,
  onRemove,
  onRetry,
}: {
  attachments: readonly PlaygroundComposerAttachment[];
  onRemove: (name: string) => void;
  onRetry: (name: string) => void;
}) {
  return (
    <ComposerAttachments>
      {attachments.map((attachment) => (
        <ComposerAttachment key={attachment.name}>
          <ComposerAttachmentFile>
            <FilePreview>
              <FilePreviewDocument>
                <FilePreviewBadge>{filePreviewLabel(attachment.name)}</FilePreviewBadge>
              </FilePreviewDocument>
            </FilePreview>
            <ComposerAttachmentBody>
              <ComposerAttachmentTitle>{attachment.name}</ComposerAttachmentTitle>
              <ComposerAttachmentMeta>{attachment.mediaType}</ComposerAttachmentMeta>
            </ComposerAttachmentBody>
          </ComposerAttachmentFile>
          {attachment.state.kind === "uploading" ? (
            <>
              <ComposerAttachmentUploadingOverlay>
                <Spinner size="sm" />
                {attachment.state.progress}%
              </ComposerAttachmentUploadingOverlay>
              <ComposerAttachmentProgress
                aria-label={`Upload progress for ${attachment.name}`}
                value={attachment.state.progress}
              />
            </>
          ) : null}
          {attachment.state.kind === "failed" ? (
            <ComposerAttachmentFailedOverlay
              render={<button type="button" />}
              onClick={() => onRetry(attachment.name)}
            >
              Upload failed
              <span className="underline">Tap to retry</span>
            </ComposerAttachmentFailedOverlay>
          ) : null}
          <ComposerAttachmentRemove
            aria-label={`Remove ${attachment.name}`}
            onClick={() => onRemove(attachment.name)}
          >
            <X />
          </ComposerAttachmentRemove>
        </ComposerAttachment>
      ))}
    </ComposerAttachments>
  );
}

function PlaygroundComposer({
  channel,
  label,
  initialComposer,
  focusOnMount = false,
  footer,
}: {
  channel: PlaygroundChannel;
  label: string;
  initialComposer?: PlaygroundInitialComposer;
  focusOnMount?: boolean;
  footer: "main" | "thread";
}) {
  const [draft, setDraft] = useState("");
  const autocomplete = usePlaygroundComposerAutocomplete(channel, draft, setDraft);
  const [attachmentState, setAttachmentState] = useState<ComposerAttachmentState>(
    initialComposer
      ? { kind: "seeded", attachments: initialComposer.attachments }
      : { kind: "none" },
  );
  const attachmentsVisible = attachmentState.kind !== "none";
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);
  const insertMentionRef = useRef<(handle: string) => void>(() => undefined);

  const mentionTarget = usePlaygroundSingleComposerMentionTarget();

  // Keep the latest insert handler in a ref so the registration below stays subscribed
  // to `mentionTarget` alone without re-running as the composer draft changes.
  insertMentionRef.current = (handle) => autocomplete.insert(`@${handle} `);

  useEffect(() => {
    if (!mentionTarget) return;
    return mentionTarget.registerComposer((handle) => insertMentionRef.current(handle));
  }, [mentionTarget]);

  useEffect(() => {
    if (focusOnMount && window.matchMedia("(hover: hover)").matches) {
      autocomplete.inputRef.current?.focus();
    }
  }, [autocomplete.inputRef, focusOnMount]);

  const handleSubmit = () => {
    const text = draft.trim();
    if (!text && !attachmentsVisible) return;
    setStatusMessage(text ? `Sent: ${text}` : "Attachments sent");
    autocomplete.clear();
    setAttachmentState({ kind: "none" });
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.defaultPrevented) return;
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.nativeEvent.isComposing &&
      event.keyCode !== 229 &&
      !window.matchMedia("(pointer: coarse) and (orientation: portrait)").matches
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };
  const inputProps = autocomplete.getInputProps({ onKeyDown: handleInputKeyDown });

  const isFileDrag = (event: DragEvent<HTMLFormElement>) =>
    event.dataTransfer.types.includes("Files");
  const handleDragEnter = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current += 1;
    setIsDragging(true);
  };
  const handleDragOver = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  };
  const handleDragLeave = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setIsDragging(false);
    }
  };
  const handleDrop = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    setAttachmentState({ kind: "generic" });
    setStatusMessage("Files attached");
  };

  const composer = (
    <ComposerRoot
      positioned
      onSubmit={handleFormSubmit}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {autocomplete.open ? <AutocompleteList autocomplete={autocomplete} /> : null}
      {attachmentState.kind === "seeded" ? (
        <PlaygroundSeededComposerAttachments
          attachments={attachmentState.attachments}
          onRemove={(name) => {
            setAttachmentState((state) => {
              if (state.kind !== "seeded") return state;
              const attachments = state.attachments.filter(
                (attachment) => attachment.name !== name,
              );
              return attachments.length > 0 ? { kind: "seeded", attachments } : { kind: "none" };
            });
            setStatusMessage(`${name} removed`);
          }}
          onRetry={(name) => {
            setAttachmentState((state) =>
              state.kind === "seeded"
                ? {
                    kind: "seeded",
                    attachments: state.attachments.map((attachment) =>
                      attachment.name === name
                        ? { ...attachment, state: { kind: "uploading", progress: 0 } }
                        : attachment,
                    ),
                  }
                : state,
            );
            setStatusMessage(`Retrying ${name}`);
          }}
        />
      ) : attachmentState.kind === "generic" ? (
        <ComposerAttachmentsComposition
          onRemove={(name) => {
            setAttachmentState({ kind: "none" });
            setStatusMessage(`${name} removed`);
          }}
          onRetry={(name) => setStatusMessage(`Retrying ${name}`)}
        />
      ) : null}
      <Composer>
        <ComposerInput {...inputProps} aria-label={label} placeholder={label} />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton
              aria-label="Attach image"
              onClick={() => {
                setAttachmentState({ kind: "generic" });
                setStatusMessage("Mock image attached");
              }}
            >
              <ImagePlus />
            </ComposerIconButton>
            <ComposerIconButton
              aria-label="Attach file"
              onClick={() => {
                setAttachmentState({ kind: "generic" });
                setStatusMessage("Mock file attached");
              }}
            >
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            {footer === "main" ? (
              <ComposerToolbarLabel>
                <Checkbox size="sm" aria-label="Send as task" />
                As Task
              </ComposerToolbarLabel>
            ) : null}
            <ComposerSubmit aria-label="Send" disabled={!draft.trim() && !attachmentsVisible}>
              <span>Send</span>
              <Send />
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>
      {isDragging ? (
        <ComposerDropOverlay aria-hidden>
          <ComposerDropOverlayPrompt />
        </ComposerDropOverlay>
      ) : null}
      <span className="sr-only" aria-live="polite">
        {statusMessage}
      </span>
    </ComposerRoot>
  );

  return footer === "main" ? (
    <ConversationPanelFooter className="max-md:!fixed max-md:inset-x-0 max-md:bottom-0">
      {composer}
    </ConversationPanelFooter>
  ) : (
    <ThreadPanelFooter className="max-md:!fixed max-md:inset-x-0 max-md:bottom-0">
      {composer}
    </ThreadPanelFooter>
  );
}

type PlaygroundComposerProps = {
  channel: PlaygroundChannel;
  label: string;
};

export function PlaygroundMainComposer({
  channel,
  label,
  initialComposer,
}: PlaygroundComposerProps & { initialComposer?: PlaygroundInitialComposer }) {
  return (
    <PlaygroundComposer
      channel={channel}
      label={label}
      initialComposer={initialComposer}
      focusOnMount
      footer="main"
    />
  );
}

export function PlaygroundThreadComposer({ channel, label }: PlaygroundComposerProps) {
  return <PlaygroundComposer channel={channel} label={label} footer="thread" />;
}
