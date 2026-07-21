import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useDropzone } from "react-dropzone";
import {
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Hash,
  ImagePlus,
  Lock,
  Paperclip,
  Send,
  UserX,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Checkbox,
  ConversationPanelFooter,
  Lightbox,
  LightboxClose,
  LightboxContent,
  LightboxMedia,
  LightboxNavigationButton,
  LightboxStage,
  LightboxTitle,
  ThreadPanelFooter,
  Spinner,
  Status,
} from "raft-ui";
import {
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
  ComposerMeta,
  ComposerSuggestionAside,
  ComposerSuggestionContent,
  ComposerSuggestionGroup,
  ComposerSuggestionGroupLabel,
  ComposerSuggestionIcon,
  ComposerSuggestionMeta,
  ComposerSuggestionOption,
  ComposerSuggestionTitle,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
  FilePreview,
  FilePreviewBadge,
  FilePreviewDocument,
  FilePreviewMedia,
  SortableComposerAttachment,
  SortableComposerAttachmentsScroll,
  type FilePreviewBadgeType,
} from "raft-ui/wip";
import {
  Composer,
  ComposerInput,
  ComposerSuggestionList,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";

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

const FILE_PREVIEW_BADGE_TYPES = new Set<string>([
  "pdf",
  "doc",
  "docx",
  "txt",
  "md",
  "csv",
  "json",
  "zip",
  "html",
  "code",
  "img",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "mp4",
  "mov",
]);

function filePreviewLabel(name: string) {
  const extension = name.split(".").at(-1);
  return extension ? extension.slice(0, 4).toUpperCase() : "FILE";
}

function filePreviewBadgeType(name: string): FilePreviewBadgeType | undefined {
  const extension = name.split(".").at(-1)?.toLowerCase();
  if (!extension || !FILE_PREVIEW_BADGE_TYPES.has(extension)) return undefined;
  return extension as FilePreviewBadgeType;
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
        <ComposerSuggestionGroup
          separated={inChannel.length > 0}
          role="group"
          aria-label="Not in this channel"
        >
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

function reorderAttachmentsByNames(
  items: readonly PlaygroundComposerAttachment[],
  nextNames: readonly string[],
): PlaygroundComposerAttachment[] {
  const byName = new Map(items.map((item) => [item.name, item]));
  return nextNames.flatMap((name) => {
    const item = byName.get(name);
    return item ? [item] : [];
  });
}

function PlaygroundSeededComposerAttachments({
  attachments,
  onRemove,
  onReorder,
  onRetry,
}: {
  attachments: readonly PlaygroundComposerAttachment[];
  onRemove: (name: string) => void;
  onReorder: (attachments: PlaygroundComposerAttachment[]) => void;
  onRetry: (name: string) => void;
}) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const ids = attachments.map((attachment) => attachment.name);
  const previewImages = attachments.flatMap((attachment) => {
    if (!attachment.mediaType.startsWith("image/") || attachment.state.kind !== "ready") return [];
    return [{ name: attachment.name, src: attachment.previewUrl ?? COMPOSER_IMAGE_SRC }];
  });
  const open = previewIndex !== null;
  const currentImage = previewImages[previewIndex ?? 0];
  const isFirstImage = previewIndex === 0;
  const isLastImage = previewIndex === previewImages.length - 1;

  return (
    <>
      <ComposerAttachments>
        <SortableComposerAttachmentsScroll
          items={ids}
          onReorder={(nextIds) => onReorder(reorderAttachmentsByNames(attachments, nextIds))}
        >
          {attachments.map((attachment) => {
            const isImage = attachment.mediaType.startsWith("image/");
            const canPreview = isImage && attachment.state.kind === "ready";
            const badgeType = filePreviewBadgeType(attachment.name);
            const badgeClassName =
              attachment.state.kind === "uploading" ? "!shadow-none" : undefined;
            const badgeLabel = filePreviewLabel(attachment.name);

            return (
              <SortableComposerAttachment
                key={attachment.name}
                id={attachment.name}
                label={attachment.name}
              >
                <ComposerAttachment>
                  {isImage ? (
                    <ComposerAttachmentImage
                      render={canPreview ? <button type="button" /> : undefined}
                      className={canPreview ? "cursor-zoom-in" : undefined}
                      aria-label={canPreview ? `Preview ${attachment.name}` : undefined}
                      onClick={
                        canPreview
                          ? () => {
                              const index = previewImages.findIndex(
                                (image) => image.name === attachment.name,
                              );
                              if (index >= 0) setPreviewIndex(index);
                            }
                          : undefined
                      }
                    >
                      <FilePreview>
                        <FilePreviewMedia>
                          <img
                            alt=""
                            className="size-full object-cover"
                            src={attachment.previewUrl ?? COMPOSER_IMAGE_SRC}
                          />
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
                        {badgeType ? (
                          <FilePreviewBadge type={badgeType} className={badgeClassName}>
                            {badgeLabel}
                          </FilePreviewBadge>
                        ) : (
                          <FilePreviewBadge className={badgeClassName}>
                            {badgeLabel}
                          </FilePreviewBadge>
                        )}
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
                  {isImage && attachment.state.kind === "uploading" ? (
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
              </SortableComposerAttachment>
            );
          })}
        </SortableComposerAttachmentsScroll>
      </ComposerAttachments>
      <Lightbox
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setPreviewIndex(null);
        }}
      >
        <LightboxContent>
          <LightboxTitle className="sr-only">
            {currentImage?.name ?? "Attachment preview"}
          </LightboxTitle>
          <LightboxClose aria-label="Close">
            <X />
          </LightboxClose>
          <LightboxStage>
            <LightboxNavigationButton
              direction="previous"
              disabled={isFirstImage || previewImages.length <= 1}
              aria-label="Previous image"
              onClick={() =>
                setPreviewIndex((index) => (index === null ? index : Math.max(0, index - 1)))
              }
            >
              <ChevronLeft />
            </LightboxNavigationButton>
            <LightboxNavigationButton
              direction="next"
              disabled={isLastImage || previewImages.length <= 1}
              aria-label="Next image"
              onClick={() =>
                setPreviewIndex((index) =>
                  index === null ? index : Math.min(previewImages.length - 1, index + 1),
                )
              }
            >
              <ChevronRight />
            </LightboxNavigationButton>
            {currentImage ? (
              <LightboxMedia render={<img src={currentImage.src} alt={currentImage.name} />} />
            ) : null}
          </LightboxStage>
        </LightboxContent>
      </Lightbox>
    </>
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
  const insertMentionRef = useRef<(handle: string) => void>(() => undefined);
  const attachmentTimersRef = useRef(new Map<string, number>());
  const previewUrlsRef = useRef(new Set<string>());
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
      for (const previewUrl of previewUrlsRef.current) {
        URL.revokeObjectURL(previewUrl);
      }
      previewUrlsRef.current.clear();
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

  const trackPreviewUrl = (previewUrl: string | undefined) => {
    if (!previewUrl) return previewUrl;
    previewUrlsRef.current.add(previewUrl);
    return previewUrl;
  };

  const revokePreviewUrl = (previewUrl: string | undefined) => {
    if (!previewUrl) return;
    if (!previewUrlsRef.current.delete(previewUrl)) return;
    URL.revokeObjectURL(previewUrl);
  };

  const addUploadingAttachments = (
    attachments: readonly Omit<PlaygroundComposerAttachment, "state">[],
  ) => {
    const pendingAttachments = attachments.map(
      (attachment): PlaygroundComposerAttachment => ({
        ...attachment,
        state: { kind: "uploading", progress: 64 },
      }),
    );
    setAttachmentState((state) => {
      const currentAttachments = state.kind === "seeded" ? state.attachments : [];
      const incomingNames = new Set(pendingAttachments.map((attachment) => attachment.name));
      for (const attachment of currentAttachments) {
        if (incomingNames.has(attachment.name)) revokePreviewUrl(attachment.previewUrl);
      }
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

  const ingestFiles = (files: readonly File[]) => {
    if (files.length === 0) return;
    addUploadingAttachments(
      files.map((file, index) => {
        const mediaType = file.type || "application/octet-stream";
        return {
          name: file.name || `upload-${index + 1}`,
          mediaType,
          previewUrl: mediaType.startsWith("image/")
            ? trackPreviewUrl(URL.createObjectURL(file))
            : undefined,
        };
      }),
    );
    setStatusMessage(
      files.length === 1 ? `Uploading ${files[0]?.name}` : `Uploading ${files.length} files`,
    );
  };

  const dropzoneDisabled = sendState.kind === "sending";
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFilePicker,
  } = useDropzone({
    noClick: true,
    noKeyboard: true,
    disabled: dropzoneDisabled,
    onDrop: ingestFiles,
  });
  const { getInputProps: getImageInputProps, open: openImagePicker } = useDropzone({
    noClick: true,
    noKeyboard: true,
    noDrag: true,
    disabled: dropzoneDisabled,
    accept: { "image/*": [] },
    onDrop: ingestFiles,
  });

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

      if (submittedAttachments.kind === "seeded") {
        for (const attachment of submittedAttachments.attachments) {
          revokePreviewUrl(attachment.previewUrl);
        }
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

  const composer = (
    <div {...getRootProps({ className: "relative w-full" })}>
      <input {...getInputProps()} />
      <input {...getImageInputProps()} />
      <ComposerRoot onSubmit={handleFormSubmit}>
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
                const removed = state.attachments.find((attachment) => attachment.name === name);
                revokePreviewUrl(removed?.previewUrl);
                const attachments = state.attachments.filter(
                  (attachment) => attachment.name !== name,
                );
                return attachments.length > 0 ? { kind: "seeded", attachments } : { kind: "none" };
              });
              setStatusMessage(`${name} removed`);
            }}
            onReorder={(attachments) => {
              setAttachmentState({ kind: "seeded", attachments });
            }}
            onRetry={(name) => {
              setAttachmentState((state) =>
                state.kind === "seeded"
                  ? {
                      kind: "seeded",
                      attachments: state.attachments.map((attachment) =>
                        attachment.name === name
                          ? { ...attachment, state: { kind: "uploading", progress: 64 } }
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
                onClick={() => openImagePicker()}
              >
                <ImagePlus />
              </ComposerIconButton>
              <ComposerIconButton
                aria-label="Attach file"
                disabled={sendState.kind === "sending"}
                onClick={() => openFilePicker()}
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
        <span className="sr-only" aria-live="polite">
          {statusMessage}
        </span>
      </ComposerRoot>
      {isDragActive ? (
        <ComposerDropOverlay aria-hidden>
          <ComposerDropOverlayPrompt />
        </ComposerDropOverlay>
      ) : null}
    </div>
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
