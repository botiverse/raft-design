import type { ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import messageRowCompositionsSource from "#/modules/message-item/compositions/row.compositions.tsx?raw";
import messageMediaCompositionsSource from "#/modules/message-item/compositions/media.compositions.tsx?raw";
import messageRowToolbarCompositionSource from "#/modules/message-item/compositions/row-toolbar.composition.tsx?raw";

import {
  AuthoredMessageRow,
  ConsecutiveMessageRow,
  ContextMenuMessageRow,
  FileAttachmentMessageRow,
  ImageGalleryMessageRow,
  InteractiveStateRows,
  RemovedSenderMessageRow,
  RichAttachmentMessageRow,
  SavedToolbarMessageRow,
  ThreadArchiveEventRow,
  VideoPreviewMessageRow,
} from "#/modules/message-item/compositions/row.compositions.tsx";
import { MessageReactionOverlaysComposition } from "#/modules/message-item/compositions/reaction.compositions.tsx";
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
} from "#/modules/message-item/message-item.source-renderers.tsx";
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
      compositionCode: code.rowCompositions,
      compositionPath: "apps/doc/src/modules/message-item/compositions/row.compositions.tsx",
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
      compositionCode: code.rowToolbarComposition,
      compositionPath: "apps/doc/src/modules/message-item/compositions/row-toolbar.composition.tsx",
      compositionSource: messageRowToolbarCompositionSource,
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
      compositionCode: code.mediaCompositions,
      compositionPath: "apps/doc/src/modules/message-item/compositions/media.compositions.tsx",
      compositionSource: messageMediaCompositionsSource,
    },
    {
      label: "Video preview",
      status: "review",
      source: <SourceVideoPreviewMessageRow />,
      brutal: <VideoPreviewMessageRow />,
      elegant: <VideoPreviewMessageRow />,
      elegantDark: <VideoPreviewMessageRow />,
      compositionCode: code.mediaCompositions,
      compositionPath: "apps/doc/src/modules/message-item/compositions/media.compositions.tsx",
      compositionSource: messageMediaCompositionsSource,
    },
    {
      label: "File attachment row",
      status: "review",
      source: <SourceFileAttachmentMessageRow />,
      brutal: <FileAttachmentMessageRow />,
      elegant: <FileAttachmentMessageRow />,
      elegantDark: <FileAttachmentMessageRow />,
      compositionCode: code.mediaCompositions,
      compositionPath: "apps/doc/src/modules/message-item/compositions/media.compositions.tsx",
      compositionSource: messageMediaCompositionsSource,
    },
    {
      label: "Reaction overlays",
      status: "review",
      source: <SourceReactionOverlays />,
      brutal: <MessageReactionOverlaysComposition />,
      elegant: <MessageReactionOverlaysComposition />,
      elegantDark: <MessageReactionOverlaysComposition />,
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
