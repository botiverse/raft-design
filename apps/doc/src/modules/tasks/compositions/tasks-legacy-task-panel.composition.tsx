import type { ReactNode } from "react";
import { X } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
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
  LegacyTaskPanelTitle,
  LegacyTaskPanelTitleMeta,
  PanelAction,
} from "@botiverse/raft-ui";

export type TasksLegacyTaskPanelCompositionProps = {
  channelName: string;
  taskNumber: number;
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
 * Legacy task panel = LegacyTaskPanel shell + consumer metadata / notice.
 * No OriginalMessage / replies / search / composer.
 */
export function TasksLegacyTaskPanelComposition({
  channelName,
  taskNumber,
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
