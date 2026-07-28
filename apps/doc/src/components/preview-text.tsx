import { Input } from "raft-ui";

import type { PreviewTextProps } from "./preview.types.ts";

export function PreviewText({ id, label, value, onValueChange }: PreviewTextProps) {
  return (
    <Input
      id={id}
      aria-label={label}
      type="text"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      className="h-7 w-full px-2 py-1 text-sm"
      suppressPasswordManager
    />
  );
}
