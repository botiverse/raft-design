import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import messageRowCompositionsSource from "#/compositions/message-item/message-row-compositions.tsx?raw";

import {
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  ContextMenuMessageRow,
  FileAttachmentMessageRow,
  ImageGalleryMessageRow,
  InteractiveStateRows,
  ReactionOverlays,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SavedToolbarMessageRow,
  ThreadArchiveEventRow,
  VideoPreviewMessageRow,
} from "#/compositions/message-item/message-row-compositions.tsx";
import {
  SourceAuthoredMessageRow,
  SourceConsecutiveMessageRow,
  SourceContextMenu,
  SourceFileAttachmentMessageRow,
  SourceImageGalleryMessageRow,
  SourceInteractiveStateRows,
  SourceReactionOverlays,
  SourceRemovedSenderMessageRow,
  SourceRichAttachmentMessageRow,
  SourceSavedToolbarMessageRow,
  SourceThreadArchiveEventRow,
  SourceVideoPreviewMessageRow,
} from "./message-item.source-fixtures";
type CodeContent = ReactNode | AnyRenderableServerComponent;

export function getMessageItemComparisonItems(code: Record<string, CodeContent>) {
  return [
    {
      label: "Authored row",
      status: "review",
      source: <SourceAuthoredMessageRow />,
      brutal: <AuthoredMessageRow />,
      elegant: <AuthoredMessageRow />,
      elegantDark: <AuthoredMessageRow />,
      sourceCode: code.sourceAuthoredRow,
      brutalCode: code.currentAuthoredRow,
      elegantCode: code.currentAuthoredRow,
      elegantDarkCode: code.currentAuthoredRow,
      compositionCode: code.currentAuthoredRow,
      compositionPath: "apps/doc/src/compositions/message-item/message-row-compositions.tsx",
      compositionSource: messageRowCompositionsSource,
      sourceScenes: [
        {
          label: "Source",
          scenes: [
            {
              label: "MessageItem.tsx:1270-1480",
              path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageItem.tsx:1270-1480",
            },
            {
              label: "MessageHoverToolbar.tsx:1-90",
              path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageHoverToolbar.tsx:1-90",
            },
          ],
        },
      ],
    },
    {
      label: "Saved toolbar row",
      status: "review",
      source: <SourceSavedToolbarMessageRow />,
      brutal: <SavedToolbarMessageRow />,
      elegant: <SavedToolbarMessageRow />,
      elegantDark: <SavedToolbarMessageRow />,
      sourceScenes: [
        {
          label: "Source",
          scenes: [
            {
              label: "MessageHoverToolbar.tsx:1-90",
              path: "/Users/cuvii/Development/zolplay/slock/packages/web/src/components/message/MessageHoverToolbar.tsx:1-90",
            },
          ],
        },
      ],
    },
    {
      label: "Consecutive row",
      status: "review",
      source: <SourceConsecutiveMessageRow />,
      brutal: <ConsecutiveMessageRow />,
      elegant: <ConsecutiveMessageRow />,
      elegantDark: <ConsecutiveMessageRow />,
    },
    {
      label: "System event row",
      status: "review",
      source: <SourceThreadArchiveEventRow />,
      brutal: <ThreadArchiveEventRow />,
      elegant: <ThreadArchiveEventRow />,
      elegantDark: <ThreadArchiveEventRow />,
    },
    {
      label: "Removed sender row",
      status: "review",
      source: <SourceRemovedSenderMessageRow />,
      brutal: <RemovedSenderMessageRow />,
      elegant: <RemovedSenderMessageRow />,
      elegantDark: <RemovedSenderMessageRow />,
    },
    {
      label: "Interactive state rows",
      status: "review",
      source: <SourceInteractiveStateRows />,
      brutal: <InteractiveStateRows />,
      elegant: <InteractiveStateRows />,
      elegantDark: <InteractiveStateRows />,
    },
    {
      label: "Image gallery",
      status: "review",
      source: <SourceImageGalleryMessageRow />,
      brutal: <ImageGalleryMessageRow />,
      elegant: <ImageGalleryMessageRow />,
      elegantDark: <ImageGalleryMessageRow />,
    },
    {
      label: "Video preview",
      status: "review",
      source: <SourceVideoPreviewMessageRow />,
      brutal: <VideoPreviewMessageRow />,
      elegant: <VideoPreviewMessageRow />,
      elegantDark: <VideoPreviewMessageRow />,
    },
    {
      label: "File attachment row",
      status: "review",
      source: <SourceFileAttachmentMessageRow />,
      brutal: <FileAttachmentMessageRow />,
      elegant: <FileAttachmentMessageRow />,
      elegantDark: <FileAttachmentMessageRow />,
    },
    {
      label: "Reaction overlays",
      status: "review",
      source: <SourceReactionOverlays />,
      brutal: <ReactionOverlays />,
      elegant: <ReactionOverlays />,
      elegantDark: <ReactionOverlays />,
    },
    {
      label: "Context menu",
      status: "review",
      source: <SourceContextMenu />,
      brutal: <ContextMenuMessageRow />,
      elegant: <ContextMenuMessageRow />,
      elegantDark: <ContextMenuMessageRow />,
    },
    {
      label: "Rich attachment row",
      status: "review",
      note: "Rich attachment row verifies the composition stack; business state and handlers remain caller-owned.",
      source: <SourceRichAttachmentMessageRow />,
      brutal: <RichAttachmentMessageRow />,
      elegant: <RichAttachmentMessageRow />,
      elegantDark: <RichAttachmentMessageRow />,
    },
  ] as const;
}
