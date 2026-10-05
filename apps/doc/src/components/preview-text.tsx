import { useCallback } from "react";
import type { ChangeEvent } from "react";
import { Input } from "raft-ui";

import type { PreviewTextProps } from "./preview.types.ts";

export function PreviewText({ id, label, value, onValueChange }: PreviewTextProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value),
    [onValueChange],
  );

  return (
    <Input
      id={id}
      aria-label={label}
      type="text"
      value={value}
      onChange={handleChange}
      className="h-7 w-full px-2 py-1 text-sm"
      suppressPasswordManager
    />
  );
}
