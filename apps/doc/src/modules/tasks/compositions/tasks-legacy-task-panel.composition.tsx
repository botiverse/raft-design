import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  BrutalOnly,
  ElegantOnly,
  LegacyTaskPanelActions,
  LegacyTaskPanelBody,
  LegacyTaskPanelField,
  LegacyTaskPanelFieldLabel,
  LegacyTaskPanelFieldText,
  LegacyTaskPanelFieldTitle,
  LegacyTaskPanelHeader,
  LegacyTaskPanelIcon,
  LegacyTaskPanelMeta,
  LegacyTaskPanelMetaLabel,
  LegacyTaskPanelMetaRow,
  LegacyTaskPanelMetaValue,
  LegacyTaskPanelRoot,
  LegacyTaskPanelSection,
  LegacyTaskPanelStatus,
  LegacyTaskPanelTitle,
  LegacyTaskPanelTitleMeta,
  PanelAction,
  TaskCardStatus,
  TaskStatusIcon,
} from "raft-ui";

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
 * Legacy task panel = LegacyTaskPanel shell + consumer metadata / status / notice.
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
  const statusLabel = getTaskStatusLabel(status);
  const channelLabel = channelName.startsWith("#") ? channelName : `#${channelName}`;

  return (
    <LegacyTaskPanelRoot framed={framed}>
      <LegacyTaskPanelHeader>
        {mobileBack}
        <LegacyTaskPanelIcon />
        <LegacyTaskPanelTitle>
          {channelLabel}
          <LegacyTaskPanelTitleMeta className="font-mono text-xs">
            Task #{taskNumber} · LEGACY
          </LegacyTaskPanelTitleMeta>
        </LegacyTaskPanelTitle>
        <LegacyTaskPanelActions>
          {closeAction ?? (
            <PanelAction aria-label="Close legacy task">
              <X />
            </PanelAction>
          )}
        </LegacyTaskPanelActions>
      </LegacyTaskPanelHeader>

      <LegacyTaskPanelBody>
        <LegacyTaskPanelStatus>
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
        </LegacyTaskPanelStatus>

        <LegacyTaskPanelSection>
          <LegacyTaskPanelField>
            <LegacyTaskPanelFieldLabel>Title</LegacyTaskPanelFieldLabel>
            <LegacyTaskPanelFieldTitle>{title}</LegacyTaskPanelFieldTitle>
          </LegacyTaskPanelField>
          <LegacyTaskPanelField>
            <LegacyTaskPanelFieldLabel>Description</LegacyTaskPanelFieldLabel>
            <LegacyTaskPanelFieldText>
              {description?.trim() || "No description"}
            </LegacyTaskPanelFieldText>
          </LegacyTaskPanelField>
        </LegacyTaskPanelSection>

        <LegacyTaskPanelMeta>
          {(
            [
              ["Created by", createdBy],
              ["Created at", createdAt],
              ["Assignee", assignee],
              ["Completed", completed],
            ] as const
          ).map(([label, value]) => (
            <LegacyTaskPanelMetaRow key={label}>
              <LegacyTaskPanelMetaLabel>{label}</LegacyTaskPanelMetaLabel>
              <LegacyTaskPanelMetaValue>{value}</LegacyTaskPanelMetaValue>
            </LegacyTaskPanelMetaRow>
          ))}
        </LegacyTaskPanelMeta>

        <Banner status="warning">
          <BannerTitle>Read-only panel</BannerTitle>
          <BannerDescription>
            Legacy tasks do not map to a message thread. This panel shows task metadata only, and
            posting is disabled.
          </BannerDescription>
        </Banner>
      </LegacyTaskPanelBody>
    </LegacyTaskPanelRoot>
  );
}
