import { createContext, useContext } from "react";
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

type ResizableOrientation = NonNullable<ResizableGroupPrimitiveProps["orientation"]>;

const ResizableOrientationContext = createContext<ResizableOrientation>("horizontal");

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
    <ResizableOrientationContext.Provider value={orientation}>
      <ResizableGroupPrimitive
        data-slot="resizable-group"
        data-orientation={orientation}
        orientation={orientation}
        className={group({ className })}
        {...props}
      />
    </ResizableOrientationContext.Provider>
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
  const groupOrientation = useContext(ResizableOrientationContext);
  // Match react-resizable-panels: handle aria/data orientation is inverted from the group.
  const handleOrientation = groupOrientation === "horizontal" ? "vertical" : "horizontal";

  return (
    <ResizableHandlePrimitive
      data-slot="resizable-handle"
      data-orientation={handleOrientation}
      className={handle({ className })}
      {...props}
    />
  );
}
