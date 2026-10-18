import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Button, Step, Steps } from "raft-ui";
import type { StepStatus, StepsProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { STATUSES, STEP_STATUS_OPTIONS } from "./steps.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type StepsPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

const STEPS = [
  { title: "Create", description: "Name and region" },
  { title: "Configure", description: "Pick the machine" },
  { title: "Share", description: "Invite your team" },
  { title: "Launch" },
] as const;

/** `auto` leaves the step's status to `current`. */
type StepOverride = "auto" | StepStatus;

const INITIAL_OVERRIDES: readonly StepOverride[] = STEPS.map(() => "auto");

export function StepsPlaygroundPreview({ code, collapsedCode }: StepsPlaygroundPreviewProps) {
  const [status, setStatus] = useState<NonNullable<StepsProps["status"]>>("process");
  const [vertical, setVertical] = useState(false);
  // One past the last step: every step is finished.
  const [current, setCurrent] = useState(2);
  const [overrides, setOverrides] = useState<readonly StepOverride[]>(INITIAL_OVERRIDES);

  const handleStatusChange = useCallback(
    (value: string) => setStatus(value as NonNullable<StepsProps["status"]>),
    [],
  );
  const handlePrevious = useCallback(() => setCurrent((value) => Math.max(1, value - 1)), []);
  const handleNext = useCallback(
    () => setCurrent((value) => Math.min(STEPS.length + 1, value + 1)),
    [],
  );
  const handleReset = useCallback(() => {
    setCurrent(1);
    setStatus("process");
    setOverrides(INITIAL_OVERRIDES);
  }, []);
  const handleOverrideChange = useCallback((index: number, value: string) => {
    setOverrides((previous) =>
      previous.map((override, i) => (i === index ? (value as StepOverride) : override)),
    );
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <div className="flex w-full flex-col items-center gap-6">
          <Steps
            current={current}
            status={status}
            vertical={vertical}
            onUpdateCurrent={setCurrent}
            className={vertical ? "w-full max-w-sm" : "w-full max-w-2xl"}
          >
            {STEPS.map((step, index) => (
              <Step
                key={step.title}
                title={step.title}
                description={"description" in step ? step.description : undefined}
                status={overrides[index] === "auto" ? undefined : overrides[index]}
              />
            ))}
          </Steps>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={handlePrevious}>
              Previous
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={current > STEPS.length}
              onClick={handleNext}
            >
              {current >= STEPS.length ? "Finish" : "Next"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Current status" htmlFor="steps-preview-status">
          <Preview.Select
            id="steps-preview-status"
            label="Current status"
            options={STATUSES}
            value={status}
            onValueChange={handleStatusChange}
          />
        </Preview.Control>
        {STEPS.map((step, index) => (
          <StepStatusControl
            key={step.title}
            index={index}
            value={overrides[index]}
            onChange={handleOverrideChange}
          />
        ))}
        <Preview.Control label="Vertical" htmlFor="steps-preview-vertical">
          <Preview.Checkbox
            id="steps-preview-vertical"
            label="Vertical"
            checked={vertical}
            onCheckedChange={setVertical}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

type StepStatusControlProps = {
  index: number;
  value: StepOverride;
  onChange: (index: number, value: string) => void;
};

/** One step's own status: `auto` or a fixed status. */
function StepStatusControl({ index, value, onChange }: StepStatusControlProps) {
  const id = `steps-preview-step-${index + 1}`;
  const label = `Step ${index + 1} status`;
  const handleValueChange = useCallback((next: string) => onChange(index, next), [index, onChange]);
  return (
    <Preview.Control label={label} htmlFor={id}>
      <Preview.Select
        id={id}
        label={label}
        options={STEP_STATUS_OPTIONS}
        value={value}
        onValueChange={handleValueChange}
      />
    </Preview.Control>
  );
}
