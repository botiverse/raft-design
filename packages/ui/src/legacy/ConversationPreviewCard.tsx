import { forwardRef } from "react";
import type { MouseEvent, ReactNode } from "react";
import AvatarSlot from "./AvatarSlot";

type ConversationAuthor =
  | {
      kind: "agent";
      name: string;
      avatarUrl?: string | null;
      subtitle?: string | null;
    }
  | {
      kind: "user";
      name: string;
      avatarUrl?: string | null;
      gravatarHash?: string | null;
      subtitle?: string | null;
    };

export interface ConversationPreviewCardProps {
  channelLabel: string;
  author?: ConversationAuthor | null;
  timestamp?: string | null;
  preview: string;
  previewAuthor?: string | null;
  previewLeading?: ReactNode;
  previewLineClampClassName?: "line-clamp-2" | "line-clamp-3";
  previewClassName?: string;
  secondaryPreview?: ReactNode;
  secondaryPreviewClassName?: string;
  ariaLabel?: string;
  title?: string;
  testId?: string;
  marker?: ReactNode;
  footer?: ReactNode;
  action?: ReactNode;
  emphasized?: boolean;
  focused?: boolean;
  active?: boolean;
  onClick?: () => void;
  onContextMenu?: (event: MouseEvent) => void;
}

const ConversationPreviewCard = forwardRef<HTMLButtonElement, ConversationPreviewCardProps>(
  function ConversationPreviewCard(
    {
      channelLabel,
      author,
      timestamp,
      preview,
      previewAuthor,
      previewLeading,
      previewLineClampClassName = "line-clamp-3",
      previewClassName,
      secondaryPreview,
      secondaryPreviewClassName,
      ariaLabel,
      title,
      testId,
      marker,
      footer,
      action,
      emphasized = false,
      focused = false,
      active = false,
      onClick,
      onContextMenu,
    },
    ref,
  ) {
    const interactive = Boolean(onClick || onContextMenu);
    const className = `relative flex w-full items-start gap-3 border-2 p-3 text-left transition-colors hover:border-black hover:shadow-brutal-sm ${
      interactive ? "active:border-black active:shadow-brutal-sm" : "cursor-default"
    } ${
      focused
        ? "border-black bg-brutal-cyan/25 shadow-brutal"
        : active
          ? "border-black bg-white shadow-brutal-sm"
          : "border-black/30 bg-white"
    }`;
    const content = (
      <>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-4">
            <span className="font-bold text-black/50">{channelLabel}</span>
            {author && !previewAuthor ? (
              <span className="inline-flex min-w-0 items-center gap-1 font-bold text-black">
                {author.kind === "agent" ? (
                  <AvatarSlot
                    context="preview-mini"
                    type="agent"
                    agentAvatarUrl={author.avatarUrl ?? null}
                  />
                ) : (
                  <AvatarSlot
                    context="preview-mini"
                    type="human"
                    humanAvatarUrl={author.avatarUrl ?? null}
                    gravatarHash={author.gravatarHash ?? null}
                  />
                )}
                <span className="truncate">{author.name}</span>
                {author.subtitle ? (
                  <span className="font-mono text-[10px] text-black/40">{author.subtitle}</span>
                ) : null}
              </span>
            ) : null}
            {marker}
            {timestamp ? (
              <span className="font-mono text-xs leading-4 text-black/40">{timestamp}</span>
            ) : null}
          </div>
          <p
            className={`${previewLineClampClassName} text-sm ${emphasized ? "font-bold" : ""} ${previewClassName ?? ""}`}
          >
            {previewLeading ? (
              <span className="mr-1 inline-flex align-[-1px]">{previewLeading}</span>
            ) : null}
            {previewAuthor ? (
              <span className="font-bold text-black/70">{previewAuthor}: </span>
            ) : null}
            <span>{preview}</span>
          </p>
          {secondaryPreview ? (
            <p
              className={`mt-1 line-clamp-1 text-xs ${secondaryPreviewClassName ?? "text-black/45"}`}
            >
              {secondaryPreview}
            </p>
          ) : null}
          {footer ? <div className="mt-1 flex items-center gap-3">{footer}</div> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </>
    );

    if (!interactive) {
      return (
        <div
          aria-label={ariaLabel}
          title={title}
          data-testid={testId}
          data-focused={focused ? "true" : undefined}
          className={className}
        >
          {content}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onContextMenu={onContextMenu}
        aria-label={ariaLabel}
        title={title}
        data-testid={testId}
        data-focused={focused ? "true" : undefined}
        className={className}
      >
        {content}
      </button>
    );
  },
);

export default ConversationPreviewCard;
