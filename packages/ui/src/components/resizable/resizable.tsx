import {
  Group as ResizableGroupPrimitive,
  Panel as ResizablePanelPrimitive,
  Separator as ResizableHandlePrimitive,
  type GroupProps as ResizableGroupPrimitiveProps,
  type PanelProps as ResizablePanelPrimitiveProps,
  type SeparatorProps as ResizableHandlePrimitiveProps,
} from "react-resizable-panels";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { resizable } from "./resizable.recipe";

export type ResizableGroupProps = Omit<ResizableGroupPrimitiveProps, "className"> & {
  className?: string;
};

export function ResizableGroup({
  className,
  orientation = "horizontal",
  ...props
}: ResizableGroupProps) {
  const { group } = resizable();

  return (
    <ResizableGroupPrimitive
      data-slot="resizable-group"
      orientation={orientation}
      className={group({ className })}
      {...props}
    />
  );
}

export type ResizablePanelProps = Omit<ResizablePanelPrimitiveProps, "className"> & {
  className?: string;
};

export function ResizablePanel({ className, ...props }: ResizablePanelProps) {
  const { panel } = resizable();

  return (
    <ResizablePanelPrimitive
      data-slot="resizable-panel"
      className={panel({ className })}
      {...props}
    />
  );
}

export type ResizableHandleProps = Omit<ResizableHandlePrimitiveProps, "className"> & {
  className?: string;
};

export function ResizableHandle({ className, ...props }: ResizableHandleProps) {
  const theme = useThemeFamily();
  const { handle } = resizable({ theme });

  return (
    <ResizableHandlePrimitive
      data-slot="resizable-handle"
      className={handle({ className })}
      {...props}
    />
  );
}
