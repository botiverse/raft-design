import type { ComponentProps } from "react";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { MarkdownBlockquote } from "../markdown/markdown-parts";
import type { MarkdownBlockquoteProps } from "../markdown/markdown-parts";
import { ProgressTrack } from "../progress";
import type { ProgressTrackProps } from "../progress";
import { messageTranslation } from "./message-translation.recipe";

export type MessageItemTranslationOriginalProps = MarkdownBlockquoteProps;

export function MessageItemTranslationOriginal({
  className,
  ...props
}: MessageItemTranslationOriginalProps) {
  const theme = useThemeFamily();
  const { translationOriginal } = messageTranslation({ theme });

  return (
    <MarkdownBlockquote
      data-slot="message-item-translation-original"
      className={translationOriginal({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationOriginalLabelProps = ComponentProps<"div">;

export function MessageItemTranslationOriginalLabel({
  className,
  ...props
}: MessageItemTranslationOriginalLabelProps) {
  const theme = useThemeFamily();
  const { translationOriginalLabel } = messageTranslation({ theme });

  return (
    <div
      data-slot="message-item-translation-original-label"
      className={translationOriginalLabel({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationStatusProps = ComponentProps<"div">;

export function MessageItemTranslationStatus({
  className,
  ...props
}: MessageItemTranslationStatusProps) {
  const theme = useThemeFamily();
  const { translationStatus } = messageTranslation({ theme });

  return (
    <div
      data-slot="message-item-translation-status"
      className={translationStatus({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationProgressTrackProps = ProgressTrackProps;

export function MessageItemTranslationProgressTrack({
  className,
  ...props
}: MessageItemTranslationProgressTrackProps) {
  const theme = useThemeFamily();
  const { translationProgressTrack } = messageTranslation({ theme });

  return <ProgressTrack className={translationProgressTrack({ className })} {...props} />;
}

export type MessageItemTranslationFailedStatusProps = ComponentProps<"div">;

export function MessageItemTranslationFailedStatus({
  className,
  ...props
}: MessageItemTranslationFailedStatusProps) {
  const theme = useThemeFamily();
  const { translationFailedStatus } = messageTranslation({ theme });

  return (
    <div
      data-slot="message-item-translation-status"
      className={translationFailedStatus({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationActionProps = ComponentProps<"button">;

export function MessageItemTranslationAction({
  className,
  ...props
}: MessageItemTranslationActionProps) {
  const theme = useThemeFamily();
  const { translationAction } = messageTranslation({ theme });

  return (
    <button
      type="button"
      data-slot="message-item-translation-action"
      className={translationAction({ className })}
      {...props}
    />
  );
}

export type MessageItemTranslationRetryActionProps = ComponentProps<"button">;

export function MessageItemTranslationRetryAction({
  className,
  ...props
}: MessageItemTranslationRetryActionProps) {
  const theme = useThemeFamily();
  const { translationRetryAction } = messageTranslation({ theme });

  return (
    <button
      type="button"
      data-slot="message-item-translation-retry-action"
      className={translationRetryAction({ className })}
      {...props}
    />
  );
}
