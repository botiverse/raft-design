import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";

const ADDON_VARIANTS = ["default", "container"] as const;

type CodeContent = ReactNode | AnyRenderableServerComponent;

type InputGroupPlaygroundPreviewProps = {
  code: CodeContent;
};

export function InputGroupPlaygroundPreview({ code }: InputGroupPlaygroundPreviewProps) {
  const [addonVariant, setAddonVariant] = useState<(typeof ADDON_VARIANTS)[number]>("container");
  const [disabled, setDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [placeholder, setPlaceholder] = useState("Default");

  const handleAddonVariantChange = useCallback((value: string) => {
    setAddonVariant(value as (typeof ADDON_VARIANTS)[number]);
  }, []);

  return (
    <Preview>
      <Preview.Canvas>
        <InputGroup className="w-96">
          <InputGroupAddon.Text variant={addonVariant}>https://</InputGroupAddon.Text>
          <InputGroupInput
            placeholder={placeholder}
            disabled={disabled}
            data-invalid={invalid || undefined}
          />
          <InputGroupAddon.Text align="inline-end" variant={addonVariant}>
            .com
          </InputGroupAddon.Text>
        </InputGroup>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Addon" htmlFor="input-group-preview-addon">
          <Preview.Select
            id="input-group-preview-addon"
            label="Addon"
            options={ADDON_VARIANTS}
            value={addonVariant}
            onValueChange={handleAddonVariantChange}
          />
        </Preview.Control>
        <Preview.Control label="Disabled" htmlFor="input-group-preview-disabled">
          <Preview.Checkbox
            id="input-group-preview-disabled"
            label="Disabled"
            checked={disabled}
            onCheckedChange={setDisabled}
          />
        </Preview.Control>
        <Preview.Control label="Invalid" htmlFor="input-group-preview-invalid">
          <Preview.Checkbox
            id="input-group-preview-invalid"
            label="Invalid"
            checked={invalid}
            onCheckedChange={setInvalid}
          />
        </Preview.Control>
        <Preview.Control label="Placeholder" htmlFor="input-group-preview-placeholder">
          <Preview.Text
            id="input-group-preview-placeholder"
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
