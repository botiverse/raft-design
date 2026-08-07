import { useState, type RefObject } from "react";
import { EllipsisVertical } from "lucide-react";
import {
  Button,
  TaskCard,
  TaskCardBody,
  TaskCardDescription,
  TaskCardLegacy,
  TaskCardMeta,
  TaskCardNumber,
  TaskCardRow,
  TaskCardStatus,
  TaskCardTitle,
  TaskStatusIcon,
  useThemeFamily,
} from "raft-ui";

import { getTaskStatusLabel, type TaskStatus } from "../task-card.fixtures";
import { TaskStatusSelect } from "./task-status-select.composition";

export function TaskCardStateMatrixComposition({
  portalRef,
}: {
  portalRef?: RefObject<HTMLElement | null>;
}) {
  const theme = useThemeFamily();
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>("todo");
  const [longStatus, setLongStatus] = useState<TaskStatus>("todo");
  const [legacyStatus, setLegacyStatus] = useState<TaskStatus>("in-progress");
  const [menuStatus, setMenuStatus] = useState<TaskStatus>("in-review");

  return (
    <>
      <TaskCard>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect
                value={defaultStatus}
                onValueChange={setDefaultStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={defaultStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #142"
                >
                  <TaskStatusIcon status={defaultStatus} />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#142</TaskCardNumber>
              <TaskStatusSelect
                value={defaultStatus}
                onValueChange={setDefaultStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={false}
                  aria-label="Edit status for task #142"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect
                value={defaultStatus}
                onValueChange={setDefaultStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={defaultStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #142"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={defaultStatus} />
                    {getTaskStatusLabel(defaultStatus)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>Match the Tasks tab toolbar and board spacing</TaskCardTitle>
            <TaskCardDescription>
              Preserve the source hierarchy before connecting product state.
            </TaskCardDescription>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>

      <TaskCard>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect
                value={longStatus}
                onValueChange={setLongStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={longStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #139"
                >
                  <TaskStatusIcon status={longStatus} />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#139</TaskCardNumber>
              <TaskStatusSelect
                value={longStatus}
                onValueChange={setLongStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={false}
                  aria-label="Edit status for task #139"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect
                value={longStatus}
                onValueChange={setLongStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={longStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #139"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={longStatus} />
                    {getTaskStatusLabel(longStatus)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>
              Verify a deliberately long task title wraps to three lines without pushing the status
              control outside the card
            </TaskCardTitle>
            <TaskCardDescription>
              The description also wraps and clamps so dense board columns remain scannable at the
              source width.
            </TaskCardDescription>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>

      <TaskCard>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect
                value={legacyStatus}
                onValueChange={setLegacyStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={legacyStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #126"
                >
                  <TaskStatusIcon status={legacyStatus} />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#126</TaskCardNumber>
              <TaskCardLegacy>LEGACY</TaskCardLegacy>
              <TaskStatusSelect
                value={legacyStatus}
                onValueChange={setLegacyStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={false}
                  aria-label="Edit status for task #126"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect
                value={legacyStatus}
                onValueChange={setLegacyStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={legacyStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #126"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={legacyStatus} />
                    {getTaskStatusLabel(legacyStatus)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>Retire the legacy task inspector</TaskCardTitle>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>

      <TaskCard disabled>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect value={defaultStatus} disabled title="Change task status">
                <TaskCardStatus
                  status={defaultStatus}
                  busy={false}
                  disabled
                  aria-label="Change status for task #142"
                >
                  <TaskStatusIcon status={defaultStatus} />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#142</TaskCardNumber>
              <TaskStatusSelect value={defaultStatus} disabled title="Change task status">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled
                  aria-label="Edit status for task #142"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect value={defaultStatus} disabled title="Change task status">
                <TaskCardStatus
                  status={defaultStatus}
                  busy={false}
                  disabled
                  aria-label="Change status for task #142"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={defaultStatus} />
                    {getTaskStatusLabel(defaultStatus)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>Match the Tasks tab toolbar and board spacing</TaskCardTitle>
            <TaskCardDescription>
              Preserve the source hierarchy before connecting product state.
            </TaskCardDescription>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>

      <TaskCard>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect value="in-progress" disabled title="Change task status">
                <TaskCardStatus
                  status="in-progress"
                  busy
                  disabled
                  aria-label="Change status for task #137"
                >
                  <TaskStatusIcon status="in-progress" />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#137</TaskCardNumber>
              <TaskStatusSelect value="in-progress" disabled title="Change task status">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled
                  aria-label="Edit status for task #137"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect value="in-progress" disabled title="Change task status">
                <TaskCardStatus
                  status="in-progress"
                  busy
                  disabled
                  aria-label="Change status for task #137"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status="in-progress" />
                    In Progress
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>Connect keyboard drag feedback</TaskCardTitle>
            <TaskCardDescription>Announce allowed and blocked status targets.</TaskCardDescription>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>

      <TaskCard>
        <TaskCardRow>
          <TaskCardBody>
            <TaskCardMeta>
              <TaskStatusSelect
                value={menuStatus}
                onValueChange={setMenuStatus}
                portalRef={portalRef}
                defaultOpen={theme === "elegant" ? true : undefined}
                title="Change task status"
              >
                <TaskCardStatus
                  status={menuStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #121"
                >
                  <TaskStatusIcon status={menuStatus} />
                </TaskCardStatus>
              </TaskStatusSelect>
              <TaskCardNumber>#121</TaskCardNumber>
              <TaskStatusSelect
                value={menuStatus}
                onValueChange={setMenuStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={false}
                  aria-label="Edit status for task #121"
                  className="ml-auto in-data-[theme=brutal]:hidden"
                >
                  <EllipsisVertical />
                </Button>
              </TaskStatusSelect>
              <TaskStatusSelect
                value={menuStatus}
                onValueChange={setMenuStatus}
                portalRef={portalRef}
                title="Change task status"
              >
                <TaskCardStatus
                  status={menuStatus}
                  busy={false}
                  disabled={false}
                  aria-label="Change status for task #121"
                >
                  <span data-slot="task-card-status-label">
                    <TaskStatusIcon status={menuStatus} />
                    {getTaskStatusLabel(menuStatus)}
                  </span>
                </TaskCardStatus>
              </TaskStatusSelect>
            </TaskCardMeta>
            <TaskCardTitle>Review task filter empty states</TaskCardTitle>
            <TaskCardDescription>
              Compare empty, filtered empty, loading, and failure structures.
            </TaskCardDescription>
          </TaskCardBody>
        </TaskCardRow>
      </TaskCard>
    </>
  );
}
