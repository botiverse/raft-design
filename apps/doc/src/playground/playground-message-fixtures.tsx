import { useState } from "react";
import { Ban, Check, CheckCircle, Circle, Download, Eye, Play, X } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeader,
  LightboxMedia,
  LightboxStage,
  LightboxTitle,
  LightboxTrigger,
} from "raft-ui";

type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "closed";

const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  {
    variant: "accent" | "information" | "muted" | "success" | "warning";
    icon: typeof Circle;
    label: string;
  }
> = {
  todo: { variant: "warning", icon: Circle, label: "Todo" },
  in_progress: { variant: "information", icon: Play, label: "In Progress" },
  in_review: { variant: "accent", icon: Eye, label: "In Review" },
  done: { variant: "success", icon: CheckCircle, label: "Done" },
  closed: { variant: "muted", icon: Ban, label: "Closed" },
};

const TASK_STATUS_ORDER: readonly TaskStatus[] = [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "closed",
];

export function openMockAttachmentPreview() {
  window.open(
    "data:text/plain;charset=utf-8,Playground%20attachment%20preview",
    "_blank",
    "noopener,noreferrer",
  );
}

export function TaskStatusBadge({
  status: initialStatus,
  taskNumber,
  assignee,
  busy,
}: {
  status: TaskStatus;
  taskNumber: number;
  assignee?: string;
  busy?: boolean;
}) {
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const config = TASK_STATUS_CONFIG[status];
  const Icon = config.icon;
  const fullLabel = assignee ? `task #${taskNumber} @${assignee}` : `task #${taskNumber}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Badge
            appearance="soft"
            variant={config.variant}
            render={
              <button
                type="button"
                disabled={busy}
                title={`${fullLabel} · Change task status`}
                aria-label={`Change status for ${fullLabel}`}
              />
            }
          />
        }
      >
        <Icon size={10} />
        <span>#{taskNumber}</span>
        {assignee ? <span>@{assignee}</span> : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {TASK_STATUS_ORDER.map((id) => (
          <DropdownMenuItem key={id} onClick={() => setStatus(id)}>
            <span>{TASK_STATUS_CONFIG[id].label}</span>
            {id === status ? <Check size={14} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ImagePreviewButton({ src, name }: { src: string; name: string }) {
  return (
    <Lightbox>
      <LightboxTrigger
        render={
          <button type="button" aria-label={`Preview ${name}`} className="absolute inset-0" />
        }
      />
      <LightboxContent>
        <LightboxHeader>
          <LightboxTitle>{name}</LightboxTitle>
          <LightboxActions>
            <Button
              size="icon-sm"
              variant="outline"
              aria-label="Download"
              title="Download"
              onClick={openMockAttachmentPreview}
            >
              <Download />
            </Button>
            <LightboxClose
              render={
                <Button size="icon-sm" variant="outline" aria-label="Close" title="Close">
                  <X />
                </Button>
              }
            />
          </LightboxActions>
        </LightboxHeader>
        <LightboxStage>
          <LightboxMedia render={<img src={src} alt="" />} />
        </LightboxStage>
      </LightboxContent>
    </Lightbox>
  );
}
