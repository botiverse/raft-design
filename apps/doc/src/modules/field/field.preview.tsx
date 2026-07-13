import { Field, FieldDescription, FieldError, FieldLabel, Input } from "raft-ui";

import { ComponentPlayground } from "#/components/component-playground.tsx";

type PlaygroundValues = {
  invalid: boolean;
  required: boolean;
  optional: boolean;
  label: string;
  description: string;
};

export function FieldPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        invalid: false,
        required: true,
        optional: false,
        label: "Email",
        description: "Use your work email.",
      }}
      controls={[
        { name: "invalid", label: "Invalid", type: "boolean" },
        { name: "required", label: "Required", type: "boolean" },
        { name: "optional", label: "Optional", type: "boolean" },
        { name: "label", label: "Label", type: "text" },
        { name: "description", label: "Description", type: "text" },
      ]}
      render={(values) => {
        const markerProps = values.required
          ? ({ required: true } as const)
          : values.optional
            ? ({ optional: true } as const)
            : {};

        return (
          <Field className="w-80" invalid={values.invalid}>
            <FieldLabel htmlFor="field-preview-email" {...markerProps}>
              {values.label}
            </FieldLabel>
            <Input
              id="field-preview-email"
              type="email"
              aria-invalid={values.invalid || undefined}
              defaultValue={values.invalid ? "oops" : undefined}
              placeholder="you@example.com"
            />
            {values.invalid ? (
              <FieldError match>Email is required.</FieldError>
            ) : values.description ? (
              <FieldDescription>{values.description}</FieldDescription>
            ) : null}
          </Field>
        );
      }}
    />
  );
}
