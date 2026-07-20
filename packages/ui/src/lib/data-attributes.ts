import type { useRender } from "@base-ui/react/use-render";
import type { ElementType } from "react";

export type DataAttributes = Record<`data-${string}`, string | undefined>;

export type SlotElementProps<Tag extends ElementType> = useRender.ElementProps<Tag> &
  DataAttributes;

/** True for React aria boolean attrs (`true`, `""`, or `"true"`). */
export function isAriaTrue(value: boolean | string | undefined | null): boolean {
  return value === true || value === "" || value === "true";
}

/** Presence `data-*` value matching Base UI state attribute mapping (`""` when set). */
export function dataPresence(active: boolean | undefined): "" | undefined {
  return active ? "" : undefined;
}
