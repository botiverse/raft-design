import { Checkbox } from "raft-ui";

import type { PreviewCheckboxProps } from "./preview.types.ts";

export function PreviewCheckbox({ id, label, checked, onCheckedChange }: PreviewCheckboxProps) {
  return (
    <Checkbox id={id} aria-label={label} checked={checked} onCheckedChange={onCheckedChange} />
  );
}
