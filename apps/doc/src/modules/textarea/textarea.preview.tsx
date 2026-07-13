import { Textarea } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { TEXTAREA_PREVIEW_CLASS } from "./textarea.constants.ts";

type PlaygroundValues = {
  disabled: boolean;
  invalid: boolean;
  placeholder: string;
};

export function TextareaPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      previewClassName={TEXTAREA_PREVIEW_CLASS}
      defaultValues={{
        disabled: false,
        invalid: false,
        placeholder: "Type your message here.",
      }}
      controls={[
        { name: "disabled", label: "Disabled", type: "boolean" },
        { name: "invalid", label: "Invalid", type: "boolean" },
        { name: "placeholder", label: "Placeholder", type: "text" },
      ]}
      render={(values) => (
        <Textarea
          className="w-80"
          rows={4}
          placeholder={values.placeholder}
          disabled={values.disabled}
          aria-invalid={values.invalid || undefined}
        />
      )}
    />
  );
}
