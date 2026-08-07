import type { useRender } from "@base-ui/react/use-render";
import type { ElementType } from "react";

export type DataAttributes = Record<`data-${string}`, string | undefined>;

export type SlotElementProps<Tag extends ElementType> = useRender.ElementProps<Tag> &
  DataAttributes;
