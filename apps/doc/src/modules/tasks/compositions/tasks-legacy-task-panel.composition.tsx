import type { ReactNode } from "react";
import { FileText, X } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  BrutalOnly,
  cn,
  ElegantOnly,
  ThreadPanelActions,
  ThreadPanelBody,
  ThreadPanelContent,
  ThreadPanelHeader,
  ThreadPanelRoot,
  ThreadPanelTitle,
  ThreadPanelTitleMeta,
  useThemeFamily,
} from "raft-ui";
import { PanelAction, TaskCardStatus, TaskStatusIcon } from "raft-ui/wip";

import { getTaskStatusLabel, type TaskStatus } from "#/modules/task-card/task-card.fixtures.ts";

export type TasksLegacyTaskPanelCompositionProps = {
  channelName: string;
  taskNumber: number;
  status: TaskStatus;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  assignee: string;
  completed: string;
  /** Docs preview chrome (bordered card). Playground shell leaves this off. */
  framed?: boolean;
  mobileBack?: ReactNode;
  closeAction?: ReactNode;
};

/**
 * Legacy task panel = ThreadPanel shell + consumer metadata body.
 * No OriginalMessage / replies / search / composer.
 */
export function TasksLegacyTaskPanelComposition({
  channelName,
  taskNumber,
  status,
  title,
  description,
  createdBy,
  createdAt,
  assignee,
  completed,
  framed = false,
  mobileBack,
  closeAction,
}: TasksLegacyTaskPanelCompositionProps) {
  const elegant = useThemeFamily() === "elegant";
  const statusLabel = getTaskStatusLabel(status);
  const channelLabel = channelName.startsWith("#") ? channelName : `#${channelName}`;

  const panel = (
    <ThreadPanelRoot>
      <ThreadPanelHeader>
        {mobileBack}
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center",
            elegant
              ? "rounded-md border-[0.5px] border-line-subtle bg-white text-foreground-icon"
              : "border-2 border-black bg-soft-signal text-black",
          )}
        >
          <FileText aria-hidden size={18} />
        </div>
        <ThreadPanelTitle className="flex flex-col items-start gap-0.5 overflow-visible whitespace-normal">
          {channelLabel}
          <ThreadPanelTitleMeta className="font-mono text-xs">
            Task #{taskNumber} · LEGACY
          </ThreadPanelTitleMeta>
        </ThreadPanelTitle>
        <ThreadPanelActions>
          {closeAction ?? (
            <PanelAction aria-label="Close legacy task">
              <X />
            </PanelAction>
          )}
        </ThreadPanelActions>
      </ThreadPanelHeader>

      <ThreadPanelContent>
        <ThreadPanelBody className="space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <ElegantOnly>
              <TaskCardStatus
                status={status}
                render={<span />}
                aria-label={statusLabel}
                className="ml-0"
              >
                <TaskStatusIcon status={status} />
              </TaskCardStatus>
            </ElegantOnly>
            <BrutalOnly>
              <TaskCardStatus
                status={status}
                render={<span />}
                aria-label={statusLabel}
                className="ml-0"
              >
                <span data-slot="task-card-status-label">
                  <TaskStatusIcon status={status} />
                  {statusLabel}
                </span>
              </TaskCardStatus>
            </BrutalOnly>
          </div>

          <section
            className={cn(
              "space-y-3 p-4",
              elegant
                ? "rounded-lg border-[0.5px] border-line-subtle bg-white shadow-xs"
                : "border-2 border-black bg-white shadow-md",
            )}
          >
            <div>
              <p
                className={cn(
                  "mb-1 font-mono text-xs",
                  elegant ? "text-foreground-muted" : "text-black/40",
                )}
              >
                Title
              </p>
              <h3
                className={cn(
                  "m-0 text-lg break-words",
                  elegant ? "font-heading font-medium text-foreground" : "font-bold text-black",
                )}
              >
                {title}
              </h3>
            </div>
            <div>
              <p
                className={cn(
                  "mb-1 font-mono text-xs",
                  elegant ? "text-foreground-muted" : "text-black/40",
                )}
              >
                Description
              </p>
              <p
                className={cn(
                  "m-0 text-sm whitespace-pre-wrap break-words",
                  elegant ? "text-foreground/80" : "text-black/80",
                )}
              >
                {description?.trim() || "No description"}
              </p>
            </div>
          </section>

          <section
            className={cn(
              "space-y-2 p-4 text-sm",
              elegant
                ? "rounded-lg border-[0.5px] border-line-subtle bg-white shadow-xs"
                : "border-2 border-black bg-white shadow-md",
            )}
          >
            {(
              [
                ["Created by", createdBy],
                ["Created at", createdAt],
                ["Assignee", assignee],
                ["Completed", completed],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "font-mono",
                    elegant ? "text-xs text-foreground-placeholder" : "text-black/50",
                  )}
                >
                  {label}
                </span>
                <span className={cn("text-right", elegant ? "text-foreground" : "text-black")}>
                  {value}
                </span>
              </div>
            ))}
          </section>

          <Banner status="warning">
            <BannerTitle>Read-only panel</BannerTitle>
            <BannerDescription>
              Legacy tasks do not map to a message thread. This panel shows task metadata only, and
              posting is disabled.
            </BannerDescription>
          </Banner>
        </ThreadPanelBody>
      </ThreadPanelContent>
    </ThreadPanelRoot>
  );

  if (!framed) return panel;

  return (
    <div
      className={cn(
        "h-full min-h-[32rem] w-full max-w-md overflow-hidden",
        elegant && "rounded-xl border border-line-subtle shadow-sm",
        !elegant && "border-2 border-black shadow-md",
      )}
    >
      {panel}
    </div>
  );
}
