import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Step, Steps } from "raft-ui";
import type { StepsProps } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { SIZES, STATUSES } from "./steps.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type StepsPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function StepsPlaygroundPreview({ code, collapsedCode }: StepsPlaygroundPreviewProps) {
  const [size, setSize] = useState<NonNullable<StepsProps["size"]>>("md");
  const [status, setStatus] = useState<NonNullable<StepsProps["status"]>>("process");
  const [vertical, setVertical] = useState(false);

  const handleSizeChange = useCallback(
    (value: string) => setSize(value as NonNullable<StepsProps["size"]>),
    [],
  );
  const handleStatusChange = useCallback(
    (value: string) => setStatus(value as NonNullable<StepsProps["status"]>),
    [],
  );

  return (
    <Preview>
      <Preview.Canvas>
        <Steps
          current={2}
          size={size}
          status={status}
          vertical={vertical}
          className={vertical ? "w-full max-w-sm" : "w-full max-w-2xl"}
        >
          <Step title="Create" description="Name and region" />
          <Step title="Configure" description="Pick the machine" />
          <Step title="Share" description="Invite your team" />
          <Step title="Launch" />
        </Steps>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Size" htmlFor="steps-preview-size">
          <Preview.Select
            id="steps-preview-size"
            label="Size"
            options={SIZES}
            value={size}
            onValueChange={handleSizeChange}
          />
        </Preview.Control>
        <Preview.Control label="Current status" htmlFor="steps-preview-status">
          <Preview.Select
            id="steps-preview-status"
            label="Current status"
            options={STATUSES}
            value={status}
            onValueChange={handleStatusChange}
          />
        </Preview.Control>
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
