import { useCallback, useState } from "react";
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

const LAST_STEP = 4;

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

const STATUSES: StepStatus[] = ["wait", "process", "finish", "error"];

export function StepsMigrationContent() {
  const [current, setCurrent] = useState(1);
  const [status, setStatus] = useState<StepStatus>("process");
  const [vertical, setVertical] = useState(false);

  // Next moves on to the step after, which starts in progress.
  const handleNext = useCallback(() => {
    setCurrent((value) => value + 1);
    setStatus("process");
  }, []);
  const handleRestart = useCallback(() => {
    setCurrent(1);
    setStatus("process");
  }, []);
  const handleToggleVertical = useCallback(() => setVertical((value) => !value), []);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <Steps
        current={current}
        status={status}
        track="river"
        vertical={vertical}
        renderIndicator={renderIndicator}
        renderTraveler={renderTraveler}
        style={ISLAND_SIZE}
        className={vertical ? "self-start" : "w-full"}
      >
        <Step title="Pack" description="armbian-jzm" />
        <Step title="Transfer" description="4.6 GB" />
        <Step title="Unpack" description="184,215 files" />
        <Step title="Online" description="armbian-1" />
      </Steps>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <SegmentedControl<StepStatus>
          aria-label="Current step status"
          value={status}
          onValueChange={setStatus}
        >
          {STATUSES.map((value) => (
            <SegmentedControlItem key={value} value={value}>
              <SegmentedControlLabel>{value}</SegmentedControlLabel>
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <Button variant="primary" size="sm" disabled={current === LAST_STEP} onClick={handleNext}>
          Next
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={current === 1 && status === "process"}
          onClick={handleRestart}
        >
          Restart
        </Button>
        <Button variant="ghost" size="sm" onClick={handleToggleVertical}>
          {vertical ? "Horizontal" : "Vertical"}
        </Button>
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
