import { Fragment, useCallback, useState } from "react";
import {
  Button,
  IslandIndicator,
  OtterTraveler,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Step,
  Steps,
} from "raft-ui";
import type { StepIndicatorState, StepStatus, StepTravelerState } from "raft-ui";
import type { CSSProperties } from "react";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

/**
 * Room for the islands: every marker slot grows to match, and each reach runs
 * straight into its island's shallows. In a column a reach leaves from under
 * one island and reaches into the next one's shallows.
 */
const ISLAND_SIZE = {
  "--r-steps-indicator-size": "48px",
  "--r-steps-connector-gap": "0px",
  "--r-steps-traveler-size": "44px",
  "--r-steps-river-overlap-start": "14px",
  "--r-steps-river-overlap-end": "16px",
} as CSSProperties;

/** Every step is an island; a finished one flies the Raft flag. */
function renderIndicator({ status }: StepIndicatorState) {
  return <IslandIndicator status={status} />;
}

/** One otter swims the reach of the step in progress, posed by that step. */
function renderTraveler({ status }: StepTravelerState) {
  return <OtterTraveler status={status} />;
}

const STEPS = [
  { title: "Pack", description: "armbian-jzm" },
  { title: "Transfer", description: "4.6 GB" },
  { title: "Unpack", description: "184,215 files" },
  { title: "Online", description: "armbian-1" },
];

const STATUSES: StepStatus[] = ["wait", "process", "finish", "error"];

const START: StepStatus[] = ["process", "wait", "wait", "wait"];

function setAt(statuses: StepStatus[], index: number, status: StepStatus) {
  return statuses.map((value, i) => (i === index ? status : value));
}

/**
 * The step the move is on: the first one not finished. Next finishes it (or
 * retries it after a failure) and starts the one after if it is waiting; Fail
 * fails it.
 */
function advance(statuses: StepStatus[]): StepStatus[] {
  const at = statuses.findIndex((status) => status !== "finish");
  if (at === -1) return statuses;
  if (statuses[at] === "error") return setAt(statuses, at, "process");
  const next = setAt(statuses, at, "finish");
  // The step after starts, unless it was already set some other way.
  return next[at + 1] === "wait" ? setAt(next, at + 1, "process") : next;
}

function fail(statuses: StepStatus[]): StepStatus[] {
  const at = statuses.findIndex((status) => status !== "finish");
  return at === -1 ? statuses : setAt(statuses, at, "error");
}

/** Sets one step's status from its picker. */
function StepStatusPicker({
  index,
  value,
  onChange,
}: {
  index: number;
  value: StepStatus;
  onChange: (index: number, status: StepStatus) => void;
}) {
  const handleValueChange = useCallback(
    (status: StepStatus) => onChange(index, status),
    [index, onChange],
  );
  return (
    <SegmentedControl<StepStatus>
      aria-label={`${STEPS[index]?.title} status`}
      value={value}
      onValueChange={handleValueChange}
    >
      {STATUSES.map((status) => (
        <SegmentedControlItem key={status} value={status}>
          <SegmentedControlLabel>{status}</SegmentedControlLabel>
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}

export function StepsMigrationContent() {
  const [statuses, setStatuses] = useState(START);
  const [vertical, setVertical] = useState(false);

  const at = statuses.findIndex((status) => status !== "finish");
  const done = at === -1;
  const failed = statuses[at] === "error";

  const handleNext = useCallback(() => setStatuses(advance), []);
  const handleFail = useCallback(() => setStatuses(fail), []);
  const handleRestart = useCallback(() => setStatuses(START), []);
  const handleToggleVertical = useCallback(() => setVertical((value) => !value), []);
  const handleStatusChange = useCallback(
    (index: number, status: StepStatus) => setStatuses((value) => setAt(value, index, status)),
    [],
  );

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <Steps
        current={done ? undefined : at + 1}
        track="river"
        vertical={vertical}
        renderIndicator={renderIndicator}
        renderTraveler={renderTraveler}
        style={ISLAND_SIZE}
        className={vertical ? "self-start" : "w-full"}
      >
        {STEPS.map((step, index) => (
          <Step
            key={step.title}
            title={step.title}
            description={step.description}
            status={statuses[index]}
          />
        ))}
      </Steps>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" disabled={done} onClick={handleNext}>
          {failed ? "Retry" : at === STEPS.length - 1 ? "Finish" : "Next"}
        </Button>
        <Button variant="danger-secondary" size="sm" disabled={done || failed} onClick={handleFail}>
          Fail
        </Button>
        <Button variant="ghost" size="sm" onClick={handleRestart}>
          Restart
        </Button>
        <Button variant="ghost" size="sm" onClick={handleToggleVertical}>
          {vertical ? "Horizontal" : "Vertical"}
        </Button>
      </div>
      <div className="grid grid-cols-[auto_auto] items-center gap-x-4 gap-y-2">
        {STEPS.map((step, index) => (
          <Fragment key={step.title}>
            <span className="text-sm text-foreground-muted">{step.title}</span>
            <StepStatusPicker
              index={index}
              value={statuses[index] ?? "wait"}
              onChange={handleStatusChange}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

// @docs-source-strip-start
export function StepsMigrationComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <StepsMigrationContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
