import { useState, type ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel, Input } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type FieldPlaygroundPreviewProps = {
  code: CodeContent;
};

export function FieldPlaygroundPreview({ code }: FieldPlaygroundPreviewProps) {
  const [invalid, setInvalid] = useState(false);
  const [required, setRequired] = useState(true);
  const [optional, setOptional] = useState(false);
  const [label, setLabel] = useState("Email");
  const [description, setDescription] = useState("Use your work email.");

  const markerProps = required
    ? ({ required: true } as const)
    : optional
      ? ({ optional: true } as const)
      : {};

  return (
    <Preview>
      <Preview.Canvas>
        <Field className="w-80" invalid={invalid}>
          <FieldLabel htmlFor="field-preview-email" {...markerProps}>
            {label}
          </FieldLabel>
          <Input
            id="field-preview-email"
            type="email"
            aria-invalid={invalid || undefined}
            defaultValue={invalid ? "oops" : undefined}
            placeholder="you@example.com"
          />
          {invalid ? (
            <FieldError match>Email is required.</FieldError>
          ) : description ? (
            <FieldDescription>{description}</FieldDescription>
          ) : null}
        </Field>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Invalid" htmlFor="field-preview-invalid">
          <Preview.Checkbox
            id="field-preview-invalid"
            label="Invalid"
            checked={invalid}
            onCheckedChange={setInvalid}
          />
        </Preview.Control>
        <Preview.Control label="Required" htmlFor="field-preview-required">
          <Preview.Checkbox
            id="field-preview-required"
            label="Required"
            checked={required}
            onCheckedChange={setRequired}
          />
        </Preview.Control>
        <Preview.Control label="Optional" htmlFor="field-preview-optional">
          <Preview.Checkbox
            id="field-preview-optional"
            label="Optional"
            checked={optional}
            onCheckedChange={setOptional}
          />
        </Preview.Control>
        <Preview.Control label="Label" htmlFor="field-preview-label">
          <Preview.Text
            id="field-preview-label"
            label="Label"
            value={label}
            onValueChange={setLabel}
          />
        </Preview.Control>
        <Preview.Control label="Description" htmlFor="field-preview-description">
          <Preview.Text
            id="field-preview-description"
            label="Description"
            value={description}
            onValueChange={setDescription}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
