import {
  Progress,
  ProgressHeader,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  type ProgressProps,
} from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { SIZES, VARIANTS } from "./progress.constants.ts";

type PlaygroundValues = {
  value: string;
  variant: NonNullable<ProgressProps["variant"]>;
  size: NonNullable<ProgressProps["size"]>;
  indeterminate: boolean;
};

export function ProgressPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        value: "64",
        variant: "primary",
        size: "md",
        indeterminate: false,
      }}
      controls={[
        { name: "value", label: "Value", type: "text" },
        { name: "variant", label: "Variant", type: "select", options: VARIANTS },
        { name: "size", label: "Size", type: "select", options: SIZES },
        { name: "indeterminate", label: "Indeterminate", type: "boolean" },
      ]}
      render={(values) => {
        const value = Math.max(0, Math.min(100, Number(values.value) || 0));

        return (
          <div className="w-full max-w-sm">
            <Progress
              value={values.indeterminate ? null : value}
              variant={values.variant}
              size={values.size}
            >
              <ProgressHeader>
                <ProgressLabel>
                  {values.indeterminate ? "Generating response" : "Uploading transcript"}
                </ProgressLabel>
                <ProgressValue />
              </ProgressHeader>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </div>
        );
      }}
    />
  );
}
