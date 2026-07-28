import { useState, type ReactNode } from "react";
import { Textarea } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { TEXTAREA_PREVIEW_CLASS } from "./textarea.constants.ts";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type TextareaPreviewProps = {
  code: CodeContent;
};

export function TextareaPreview({ code }: TextareaPreviewProps) {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [placeholder, setPlaceholder] = useState("Type your message here.");

  return (
    <Preview previewClassName={TEXTAREA_PREVIEW_CLASS}>
      <Preview.Canvas>
        <Textarea
          className="w-80"
          rows={4}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Disabled" htmlFor="textarea-preview-disabled">
          <Preview.Checkbox
            id="textarea-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
        <Preview.Control label="Invalid" htmlFor="textarea-preview-invalid">
          <Preview.Checkbox
            id="textarea-preview-invalid"
            label="Invalid"
            checked={invalid}
            onCheckedChange={setInvalid}
          />
        </Preview.Control>
        <Preview.Control label="Placeholder" htmlFor="textarea-preview-placeholder">
          <Preview.Text
            id="textarea-preview-placeholder"
            label="Placeholder"
            value={placeholder}
            onValueChange={setPlaceholder}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
