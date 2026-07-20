import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { GitBranch, Hash, ImagePlus, Lock, Paperclip, Send, UserX, X } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Checkbox,
  ConversationPanelFooter,
  ThreadPanelFooter,
  Spinner,
  Status,
} from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerAttachment,
  ComposerAttachmentBody,
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentFile,
  ComposerAttachmentImage,
  ComposerAttachmentMeta,
  ComposerAttachmentRemove,
  ComposerAttachments,
  ComposerAttachmentTitle,
  ComposerAttachmentUploadingOverlay,
  ComposerAttachmentUploadProgressBar,
  ComposerDropOverlay,
  ComposerDropOverlayPrompt,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerSuggestionAside,
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
  FilePreviewMedia,
} from "raft-ui/wip";

import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";
import { usePlaygroundSingleComposerMentionTarget } from "./use-playground-single-composer-mention-target.ts";
import type {
  PlaygroundChannel,
  PlaygroundComposerAttachment,
  PlaygroundInitialComposer,
} from "../mock/index.ts";
import {
  usePlaygroundComposerAutocomplete,
  type ComposerSuggestion,
} from "./use-playground-composer-autocomplete.ts";

type AutocompleteApi = ReturnType<typeof usePlaygroundComposerAutocomplete>;
type OptionProps = ReturnType<AutocompleteApi["getOptionProps"]>;
type ComposerAttachmentState =
  | { kind: "none" }
  | { kind: "seeded"; attachments: readonly PlaygroundComposerAttachment[] };
type ComposerSendState = { kind: "idle" } | { kind: "sending" } | { kind: "failed" };

const ATTACHMENT_UPLOAD_DELAY_MS = 900;
const MESSAGE_SEND_DELAY_MS = 750;

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
          {suggestion.type === "agent" ? <Status aria-hidden size="md" variant="success" /> : null}
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
    <ComposerSuggestionOption {...optionProps}>
      <ComposerSuggestionIcon variant="framed">
        <ChannelIcon />
      </ComposerSuggestionIcon>
      <ComposerSuggestionContent>
        <ComposerSuggestionTitle>{suggestion.name}</ComposerSuggestionTitle>
        {suggestion.subtitle ? (
          <ComposerSuggestionMeta>{suggestion.subtitle}</ComposerSuggestionMeta>
        ) : null}
        {suggestion.archived ? (
          <ComposerSuggestionAside>
            <Badge appearance="soft" variant="muted">
              archived
            </Badge>
          </ComposerSuggestionAside>
        ) : null}
      </ComposerSuggestionContent>
    </ComposerSuggestionOption>
  );
}

function AutocompleteOptions({
  autocomplete,
  items,
}: {
  autocomplete: AutocompleteApi;
  items: readonly { index: number; suggestion: ComposerSuggestion }[];
}) {
  return items.map(({ index, suggestion }) => (
    <AutocompleteOption
      key={suggestion.kind === "mention" ? suggestion.handle : suggestion.id}
      suggestion={suggestion}
      optionProps={autocomplete.getOptionProps(suggestion, index)}
    />
  ));
}

function AutocompleteList({ autocomplete }: { autocomplete: AutocompleteApi }) {
  const indexedItems = autocomplete.items.map((suggestion, index) => ({ index, suggestion }));
  const inChannel = indexedItems.filter(
    ({ suggestion }) => suggestion.kind === "mention" && suggestion.group === "in-channel",
  );
  const outsideChannel = indexedItems.filter(
    ({ suggestion }) => suggestion.kind === "mention" && suggestion.group === "outside-channel",
  );
  return (
    <ComposerSuggestionList
      {...autocomplete.getListProps({ "aria-label": "Mention and channel suggestions" })}
    >
      {inChannel.length > 0 ? (
        <ComposerSuggestionGroup role="group" aria-label="In this channel">
          <ComposerSuggestionGroupLabel aria-hidden>In this channel</ComposerSuggestionGroupLabel>
          <AutocompleteOptions autocomplete={autocomplete} items={inChannel} />
        </ComposerSuggestionGroup>
      ) : null}
      {outsideChannel.length > 0 ? (
        <ComposerSuggestionGroup separated role="group" aria-label="Not in this channel">
          <ComposerSuggestionGroupLabel aria-hidden>
            Not in this channel
          </ComposerSuggestionGroupLabel>
          <AutocompleteOptions autocomplete={autocomplete} items={outsideChannel} />
        </ComposerSuggestionGroup>
      ) : null}
      {inChannel.length === 0 && outsideChannel.length === 0 ? (
        <AutocompleteOptions autocomplete={autocomplete} items={indexedItems} />
      ) : null}
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
          {attachment.mediaType.startsWith("image/") ? (
            <ComposerAttachmentImage>
              <FilePreview>
                <FilePreviewMedia>
                  <img alt="" className="size-full object-cover" src={COMPOSER_IMAGE_SRC} />
                </FilePreviewMedia>
              </FilePreview>
            </ComposerAttachmentImage>
          ) : (
            <ComposerAttachmentFile>
              <FilePreview className="h-[46px]">
                <FilePreviewDocument
                  className={
                    attachment.state.kind === "uploading"
                      ? "h-[46px] !shadow-none !ring-0"
                      : "h-[46px]"
                  }
                />
                <FilePreviewBadge
                  className={attachment.state.kind === "uploading" ? "!shadow-none" : undefined}
                >
                  {filePreviewLabel(attachment.name)}
                </FilePreviewBadge>
              </FilePreview>
              <ComposerAttachmentBody>
                <ComposerAttachmentTitle>{attachment.name}</ComposerAttachmentTitle>
                <ComposerAttachmentMeta>{attachment.mediaType}</ComposerAttachmentMeta>
              </ComposerAttachmentBody>
              {attachment.state.kind === "uploading" ? (
                <>
                  <ComposerAttachmentUploadingOverlay>
                    <Spinner size="sm" className="mb-1" />
                    {Math.round(attachment.state.progress)}%
                  </ComposerAttachmentUploadingOverlay>
                  <ComposerAttachmentUploadProgressBar value={attachment.state.progress} />
                </>
              ) : null}
            </ComposerAttachmentFile>
          )}
          {attachment.mediaType.startsWith("image/") && attachment.state.kind === "uploading" ? (
            <>
              <ComposerAttachmentUploadingOverlay>
                <Spinner size="sm" className="mb-1" />
                {Math.round(attachment.state.progress)}%
              </ComposerAttachmentUploadingOverlay>
              <ComposerAttachmentUploadProgressBar value={attachment.state.progress} />
            </>
          ) : null}
          {attachment.state.kind === "failed" ? (
            <ComposerAttachmentFailedOverlay
              render={<button type="button" />}
              onClick={() => onRetry(attachment.name)}
            >
              <span>Upload failed</span>
              <span className="underline underline-offset-2">Retry</span>
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
  const hasBlockingAttachments =
    attachmentState.kind === "seeded" &&
    attachmentState.attachments.some((attachment) => attachment.state.kind !== "ready");
  const [sendState, setSendState] = useState<ComposerSendState>({ kind: "idle" });
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dragDepthRef = useRef(0);
  const insertMentionRef = useRef<(handle: string) => void>(() => undefined);
  const attachmentTimersRef = useRef(new Map<string, number>());
  const sendTimerRef = useRef<number | null>(null);
  const shouldFailNextSendRef = useRef(true);

  const mentionTarget = usePlaygroundSingleComposerMentionTarget();

  // Keep the latest insert handler in a ref so the registration below stays subscribed
  // to `mentionTarget` alone without re-running as the composer draft changes.
  useEffect(() => {
    insertMentionRef.current = (handle) => autocomplete.insert(`@${handle} `);
  }, [autocomplete]);

  useEffect(() => {
    if (!mentionTarget) return;
    return mentionTarget.registerComposer((handle) => insertMentionRef.current(handle));
  }, [mentionTarget]);

  useEffect(() => {
    if (focusOnMount && window.matchMedia("(hover: hover)").matches) {
      autocomplete.inputRef.current?.focus();
    }
  }, [autocomplete.inputRef, focusOnMount]);

  useEffect(
    () => () => {
      for (const timer of attachmentTimersRef.current.values()) {
        window.clearTimeout(timer);
      }
      if (sendTimerRef.current !== null) {
        window.clearTimeout(sendTimerRef.current);
      }
    },
    [],
  );

  const scheduleAttachmentReady = (name: string) => {
    const currentTimer = attachmentTimersRef.current.get(name);
    if (currentTimer !== undefined) window.clearTimeout(currentTimer);

    const timer = window.setTimeout(() => {
      attachmentTimersRef.current.delete(name);
      setAttachmentState((state) =>
        state.kind === "seeded"
          ? {
              kind: "seeded",
              attachments: state.attachments.map((attachment) =>
                attachment.name === name ? { ...attachment, state: { kind: "ready" } } : attachment,
              ),
            }
          : state,
      );
      setStatusMessage(`${name} uploaded`);
    }, ATTACHMENT_UPLOAD_DELAY_MS);
    attachmentTimersRef.current.set(name, timer);
  };

  const addUploadingAttachments = (attachments: readonly { name: string; mediaType: string }[]) => {
    const pendingAttachments = attachments.map(
      (attachment): PlaygroundComposerAttachment => ({
        ...attachment,
        state: { kind: "uploading", progress: 0 },
      }),
    );
    setAttachmentState((state) => {
      const currentAttachments = state.kind === "seeded" ? state.attachments : [];
      const incomingNames = new Set(pendingAttachments.map((attachment) => attachment.name));
      return {
        kind: "seeded",
        attachments: [
          ...currentAttachments.filter((attachment) => !incomingNames.has(attachment.name)),
          ...pendingAttachments,
        ],
      };
    });
    for (const attachment of pendingAttachments) scheduleAttachmentReady(attachment.name);
    setSendState({ kind: "idle" });
  };

  const handleSubmit = () => {
    const text = draft.trim();
    if (sendState.kind === "sending" || hasBlockingAttachments || (!text && !attachmentsVisible)) {
      return;
    }

    const submittedDraft = draft;
    const submittedAttachments = attachmentState;
    const shouldFail = shouldFailNextSendRef.current;
    shouldFailNextSendRef.current = false;

    setSendState({ kind: "sending" });
    setStatusMessage("Sending message");
    dragDepthRef.current = 0;
    setIsDragging(false);
    autocomplete.clear();
    setAttachmentState({ kind: "none" });

    if (sendTimerRef.current !== null) window.clearTimeout(sendTimerRef.current);
    sendTimerRef.current = window.setTimeout(() => {
      sendTimerRef.current = null;
      if (shouldFail) {
        setDraft(submittedDraft);
        setAttachmentState(submittedAttachments);
        setSendState({ kind: "failed" });
        setStatusMessage("Send failed. Draft and attachments restored; try again.");
        return;
      }

      setSendState({ kind: "idle" });
      setStatusMessage(text ? `Sent: ${text}` : "Attachments sent");
    }, MESSAGE_SEND_DELAY_MS);
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
  const { onBlur: handleAutocompleteBlur, ...inputProps } = autocomplete.getInputProps({
    onKeyDown: handleInputKeyDown,
  });

  const isFileDrag = (event: DragEvent<HTMLFormElement>) =>
    event.dataTransfer.types.includes("Files");
  const handleDragEnter = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    if (sendState.kind === "sending") return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  };
  const handleDragOver = (event: DragEvent<HTMLFormElement>) => {
    if (!isFileDrag(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = sendState.kind === "sending" ? "none" : "copy";
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
    if (sendState.kind === "sending") return;
    dragDepthRef.current = 0;
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files, (file, index) => ({
      name: file.name || `dropped-file-${index + 1}`,
      mediaType: file.type || "application/octet-stream",
    }));
    addUploadingAttachments(
      droppedFiles.length > 0
        ? droppedFiles
        : [{ name: "dropped-file.txt", mediaType: "text/plain" }],
    );
    setStatusMessage("Uploading dropped files");
  };

  const composer = (
    <ComposerRoot
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
            const timer = attachmentTimersRef.current.get(name);
            if (timer !== undefined) {
              window.clearTimeout(timer);
              attachmentTimersRef.current.delete(name);
            }
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
            scheduleAttachmentReady(name);
          }}
        />
      ) : null}
      <Composer>
        <ComposerInput
          {...inputProps}
          aria-label={label}
          placeholder={label}
          disabled={sendState.kind === "sending"}
          onBlur={handleAutocompleteBlur}
        />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton
              aria-label="Attach image"
              disabled={sendState.kind === "sending"}
              onClick={() => {
                addUploadingAttachments([{ name: "screenshot.png", mediaType: "image/png" }]);
                setStatusMessage("Uploading screenshot.png");
              }}
            >
              <ImagePlus />
            </ComposerIconButton>
            <ComposerIconButton
              aria-label="Attach file"
              disabled={sendState.kind === "sending"}
              onClick={() => {
                addUploadingAttachments([
                  { name: "release-notes.pdf", mediaType: "application/pdf" },
                ]);
                setStatusMessage("Uploading release-notes.pdf");
              }}
            >
              <Paperclip />
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            {sendState.kind === "failed" ? (
              <span className="text-xs font-medium text-danger-base">Send failed · retry</span>
            ) : null}
            {footer === "main" ? (
              <ComposerToolbarLabel>
                <Checkbox
                  size="sm"
                  aria-label="Send as task"
                  disabled={sendState.kind === "sending"}
                />
                As Task
              </ComposerToolbarLabel>
            ) : null}
            <ComposerSubmit
              aria-label={sendState.kind === "failed" ? "Retry send" : "Send"}
              aria-busy={sendState.kind === "sending"}
              disabled={
                sendState.kind === "sending" ||
                hasBlockingAttachments ||
                (!draft.trim() && !attachmentsVisible)
              }
            >
              <span>{sendState.kind === "sending" ? "Sending…" : "Send"}</span>
              {sendState.kind === "sending" ? <Spinner size="sm" /> : <Send />}
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
    <ConversationPanelFooter>{composer}</ConversationPanelFooter>
  ) : (
    <ThreadPanelFooter>{composer}</ThreadPanelFooter>
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
