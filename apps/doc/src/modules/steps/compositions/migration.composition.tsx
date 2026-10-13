import { useCallback, useState } from "react";
import { Button, Step, Steps } from "raft-ui";
import type { StepIndicatorState } from "raft-ui";
import type { CSSProperties } from "react";

import { SwimmingOtter } from "../swimming-otter.tsx";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const LAST_STEP = 4;

/** Room for the otter: every marker slot grows to match. */
const OTTER_SIZE = { "--r-steps-indicator-size": "48px" } as CSSProperties;

/** The otter swims with the current step; the other steps keep their markers. */
function renderIndicator({ current, status }: StepIndicatorState) {
  if (!current) return undefined;
  return <SwimmingOtter resting={status === "finish"} />;
}

export function StepsMigrationContent() {
  const [current, setCurrent] = useState(1);
  const done = current === LAST_STEP;

  const handleNext = useCallback(() => setCurrent((value) => Math.min(LAST_STEP, value + 1)), []);
  const handleRestart = useCallback(() => setCurrent(1), []);

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-8">
      <Steps
        current={current}
        status={done ? "finish" : "process"}
        track="river"
        renderIndicator={renderIndicator}
        style={OTTER_SIZE}
        className="w-full"
      >
        <Step title="Pack" description="armbian-jzm" />
        <Step title="Transfer" description="4.6 GB" />
        <Step title="Unpack" description="184,215 files" />
        <Step title="Online" description="armbian-1" />
      </Steps>
      <div className="flex gap-2">
        <Button variant="primary" size="sm" disabled={done} onClick={handleNext}>
          {current === LAST_STEP - 1 ? "Finish" : "Next"}
        </Button>
        <Button variant="ghost" size="sm" disabled={current === 1} onClick={handleRestart}>
          Restart
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
