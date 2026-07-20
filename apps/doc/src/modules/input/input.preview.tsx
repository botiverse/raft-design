import { useState, type ReactNode } from "react";
import { Input } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type InputPlaygroundPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function InputPlaygroundPreview({ code, collapsedCode }: InputPlaygroundPreviewProps) {
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [placeholder, setPlaceholder] = useState("you@example.com");
  const [suppressPasswordManager, setSuppressPasswordManager] = useState(false);

  return (
    <Preview>
      <Preview.Canvas>
        <Input
          className="w-80"
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          suppressPasswordManager={suppressPasswordManager}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Disabled" htmlFor="input-preview-disabled">
          <Preview.Checkbox
            id="input-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
        <Preview.Control label="Invalid" htmlFor="input-preview-invalid">
          <Preview.Checkbox
            id="input-preview-invalid"
            label="Invalid"
            checked={invalid}
            onCheckedChange={setInvalid}
          />
        </Preview.Control>
        <Preview.Control label="Placeholder" htmlFor="input-preview-placeholder">
          <Preview.Text
            id="input-preview-placeholder"
            label="Placeholder"
            value={placeholder}
            onValueChange={setPlaceholder}
          />
        </Preview.Control>
        <Preview.Control label="Suppress PM" htmlFor="input-preview-suppress-pm">
          <Preview.Checkbox
            id="input-preview-suppress-pm"
            label="Suppress PM"
            checked={suppressPasswordManager}
            onCheckedChange={setSuppressPasswordManager}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}
