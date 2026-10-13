import { useCallback, useState } from "react";
import { Button, Step, Steps } from "raft-ui";
import type { StepIndicatorState } from "raft-ui";
import type { CSSProperties } from "react";

import { OtterIndicator } from "../otter-indicator.tsx";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const LAST_STEP = 4;

/**
 * Room for the otter: every marker slot grows to match. In a column the river
 * reaches up under the otter's pond, which ends above the bottom of its box.
 */
const OTTER_SIZE = {
  "--r-steps-indicator-size": "48px",
  "--r-steps-river-indicator-overlap": "12px",
} as CSSProperties;

/** Every step has its own otter, posed by the step's status. */
function renderIndicator({ status }: StepIndicatorState) {
  return <OtterIndicator status={status} />;
}

export function StepsMigrationContent() {
  const [current, setCurrent] = useState(1);
  const [failed, setFailed] = useState(false);
  const [vertical, setVertical] = useState(false);
  const done = current === LAST_STEP;

  // After a failure the primary button retries the same step.
  const handleNext = useCallback(() => {
    if (failed) setFailed(false);
    else setCurrent((value) => Math.min(LAST_STEP, value + 1));
  }, [failed]);
  const handleFail = useCallback(() => setFailed(true), []);
  const handleToggleVertical = useCallback(() => setVertical((value) => !value), []);
  const handleRestart = useCallback(() => {
    setFailed(false);
    setCurrent(1);
  }, []);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <Steps
        current={current}
        status={failed ? "error" : done ? "finish" : "process"}
        track="river"
        vertical={vertical}
        renderIndicator={renderIndicator}
        style={OTTER_SIZE}
        className={vertical ? "self-start" : "w-full"}
      >
        <Step title="Pack" description="armbian-jzm" />
        <Step title="Transfer" description="4.6 GB" />
        <Step title="Unpack" description="184,215 files" />
        <Step title="Online" description="armbian-1" />
      </Steps>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" disabled={done} onClick={handleNext}>
          {failed ? "Retry" : current === LAST_STEP - 1 ? "Finish" : "Next"}
        </Button>
        <Button variant="danger-secondary" size="sm" disabled={done || failed} onClick={handleFail}>
          Fail
        </Button>
        <Button variant="ghost" size="sm" disabled={current === 1} onClick={handleRestart}>
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
