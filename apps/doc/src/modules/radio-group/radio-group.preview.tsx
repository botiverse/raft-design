import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { RadioGroupReferralSourceComposition } from "./compositions/referral-source.composition.tsx";

type CodeContent = ReactNode | AnyRenderableServerComponent;

type RadioGroupPreviewProps = {
  value: string;
  onValueChange: (value: string) => void;
  code: CodeContent;
};

export function RadioGroupPreview({ value, onValueChange, code }: RadioGroupPreviewProps) {
  const [disabled, setDisabled] = useState(false);

  return (
    <Preview>
      <Preview.Canvas>
        <RadioGroupReferralSourceComposition
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Disabled" htmlFor="radio-group-preview-disabled">
          <Preview.Checkbox
            id="radio-group-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
