import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { createContext, useContext, useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import "./collapsible.css";

interface CollapsibleContextValue {
  triggerId: string;
  panelId: string;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext() {
  return useContext(CollapsibleContext);
}

export type CollapsibleProps = Omit<ComponentProps<typeof BaseCollapsible.Root>, "className"> & {
  className?: string;
  children?: ReactNode;
};

export function Collapsible({ className, children, render, ...props }: CollapsibleProps) {
  const generatedId = useId();
  const triggerId = `r-collapsible-trigger-${generatedId}`;
  const panelId = `r-collapsible-panel-${generatedId}`;

  const rootClasses = ["r-collapsible", className].filter(Boolean).join(" ");

  const defaultProps: ComponentProps<typeof BaseCollapsible.Root> & DataAttributes = {
    "data-slot": "collapsible",
    className: rootClasses,
  };

  return (
    <CollapsibleContext.Provider value={{ triggerId, panelId }}>
      <BaseCollapsible.Root render={render} {...mergeProps(defaultProps, props)}>
        {children}
      </BaseCollapsible.Root>
    </CollapsibleContext.Provider>
  );
}

export type CollapsibleTriggerProps = Omit<
  ComponentProps<typeof BaseCollapsible.Trigger>,
  "className"
> & {
  className?: string;
  children?: ReactNode;
};

export function CollapsibleTrigger({
  className,
  children,
  render,
  id: idProp,
  "aria-controls": ariaControlsProp,
  ...props
}: CollapsibleTriggerProps) {
  const ctx = useCollapsibleContext();
  const id = idProp ?? ctx?.triggerId;
  const ariaControls = ariaControlsProp ?? ctx?.panelId;

  const triggerClasses = ["r-collapsible-trigger", className].filter(Boolean).join(" ");

  const defaultProps: ComponentProps<typeof BaseCollapsible.Trigger> & DataAttributes = {
    "data-slot": "collapsible-trigger",
    id,
    "aria-controls": ariaControls,
    className: triggerClasses,
  };

  return (
    <BaseCollapsible.Trigger render={render} {...mergeProps(defaultProps, props)}>
      {children}
    </BaseCollapsible.Trigger>
  );
}

export type CollapsiblePanelProps = Omit<
  ComponentProps<typeof BaseCollapsible.Panel>,
  "className"
> & {
  className?: string;
  children?: ReactNode;
};

export function CollapsiblePanel({
  className,
  children,
  render,
  id: idProp,
  role = "region",
  "aria-labelledby": ariaLabelledbyProp,
  ...props
}: CollapsiblePanelProps) {
  const ctx = useCollapsibleContext();
  const id = idProp ?? ctx?.panelId;
  const ariaLabelledby = ariaLabelledbyProp ?? ctx?.triggerId;

  const panelClasses = ["r-collapsible-panel", className].filter(Boolean).join(" ");

  const defaultProps: ComponentProps<typeof BaseCollapsible.Panel> & DataAttributes = {
    "data-slot": "collapsible-panel",
    id,
    role,
    "aria-labelledby": ariaLabelledby,
    className: panelClasses,
  };

  return (
    <BaseCollapsible.Panel render={render} {...mergeProps(defaultProps, props)}>
      {children}
    </BaseCollapsible.Panel>
  );
}
