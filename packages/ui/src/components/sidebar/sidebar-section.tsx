import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, MouseEvent } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import type { ButtonProps } from "../button";
import { Status } from "../status";
import type { StatusProps } from "../status";
import type { DataAttributes, SlotElementProps } from "../../lib/data-attributes";
import { sidebarSectionRecipe } from "./sidebar-section.recipe";

export type SidebarSectionProps = Omit<ComponentProps<typeof Collapsible.Root>, "className"> & {
  className?: string;
};

export function SidebarSection({
  className,
  defaultOpen = true,
  render,
  ...props
}: SidebarSectionProps) {
  const { sidebarSection } = sidebarSectionRecipe();
  const defaultProps: ComponentProps<typeof Collapsible.Root> & DataAttributes = {
    "data-slot": "sidebar-section",
    defaultOpen,
    className: sidebarSection({ className }),
  };

  return <Collapsible.Root render={render ?? <section />} {...mergeProps(defaultProps, props)} />;
}

export type SidebarListProps = Omit<ComponentProps<typeof Collapsible.Panel>, "className"> & {
  className?: string;
};

export function SidebarList({ className, render, ...props }: SidebarListProps) {
  const { sidebarList } = sidebarSectionRecipe();
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "sidebar-list",
    className: sidebarList({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type SidebarSectionEmptyProps = Omit<
  ComponentProps<typeof Collapsible.Panel>,
  "className"
> & {
  className?: string;
};

export function SidebarSectionEmpty({ className, render, ...props }: SidebarSectionEmptyProps) {
  const { sidebarSectionEmpty } = sidebarSectionRecipe();
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "sidebar-section-empty",
    className: sidebarSectionEmpty({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type SidebarSectionHeaderProps = useRender.ComponentProps<"div"> & {
  /**
   * The header ends with a `SidebarSectionEndChevron`: with a mouse on a
   * desktop the chevron is that last control, so the one before the title
   * hides. On a touch screen the chevron stays before the title.
   */
  chevronAtEnd?: boolean;
};

export function SidebarSectionHeader({
  className,
  render,
  chevronAtEnd = false,
  ...props
}: SidebarSectionHeaderProps) {
  const { sidebarSectionHeader } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-section-header",
    "data-chevron-at-end": chevronAtEnd ? "" : undefined,
    className: sidebarSectionHeader({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarSectionDisclosureProps = useRender.ComponentProps<"button">;

export function SidebarSectionDisclosure({
  className,
  render,
  ...props
}: SidebarSectionDisclosureProps) {
  const { sidebarSectionDisclosure } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "sidebar-section-disclosure",
    className: sidebarSectionDisclosure({ className }),
  };

  return useRender({
    render: render ?? <Collapsible.Trigger />,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type SidebarSectionChevronProps = useRender.ComponentProps<"svg">;

export function SidebarSectionChevron({ className, render, ...props }: SidebarSectionChevronProps) {
  const { sidebarSectionChevronSlot } = sidebarSectionRecipe();
  const defaultProps: useRender.ElementProps<"svg"> & DataAttributes = {
    "data-slot": "sidebar-section-chevron",
    className: cn("size-3", className),
  };

  const chevron = useRender({
    render: render ?? <ChevronRight />,
    props: mergeProps<"svg">(defaultProps, props),
  });

  // Match SidebarItemIcon slot width so section chevrons share the item icon axis.
  // In a header whose chevron is at its end (`chevronAtEnd`), gone with a
  // mouse on a desktop: an ancestor's data attribute, not `:has()` (#386).
  return (
    <span className={sidebarSectionChevronSlot()} aria-hidden="true">
      {chevron}
    </span>
  );
}

export type SidebarSectionTitleProps = useRender.ComponentProps<"span">;

export function SidebarSectionTitle({ className, render, ...props }: SidebarSectionTitleProps) {
  const { sidebarSectionTitle } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-section-title",
    className: sidebarSectionTitle({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarSectionCountProps = useRender.ComponentProps<"span">;

export function SidebarSectionCount({ className, render, ...props }: SidebarSectionCountProps) {
  const { sidebarSectionCount } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"span"> = {
    "data-slot": "sidebar-section-count",
    className: sidebarSectionCount({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export type SidebarSectionAttentionProps = StatusProps;

export function SidebarSectionAttention({
  className,
  size = "md",
  variant,
  ...props
}: SidebarSectionAttentionProps) {
  const { sidebarSectionAttention } = sidebarSectionRecipe();
  const resolvedVariant = variant ?? "accent";
  return (
    <span aria-hidden data-slot="sidebar-section-attention" className={sidebarSectionAttention()}>
      <Status size={size} variant={resolvedVariant} className={className} {...props} />
    </span>
  );
}

export type SidebarSectionTrailingProps = useRender.ComponentProps<"div">;
export type SidebarSectionControlsProps = useRender.ComponentProps<"div">;

export function SidebarSectionTrailing({
  className,
  render,
  ...props
}: SidebarSectionTrailingProps) {
  const { sidebarSectionTrailing } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-section-trailing",
    className: sidebarSectionTrailing({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export function SidebarSectionControls({
  className,
  render,
  ...props
}: SidebarSectionControlsProps) {
  const { sidebarSectionControls } = sidebarSectionRecipe();
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-section-controls",
    className: sidebarSectionControls({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type SidebarSectionControlProps = useRender.ComponentProps<"button"> &
  Pick<ButtonProps, "size" | "variant" | "loading" | "loadingLabel">;

export function SidebarSectionControl({
  className,
  render,
  size = "icon-md",
  variant = "ghost",
  loading = false,
  loadingLabel = "Loading",
  children,
  disabled,
  ...props
}: SidebarSectionControlProps) {
  const { sidebarSectionControl } = sidebarSectionRecipe();

  return (
    <Button
      data-slot="sidebar-section-control"
      size={size}
      variant={variant}
      loading={loading}
      loadingLabel={loadingLabel}
      disabled={disabled}
      className={sidebarSectionControl({ className })}
      render={render}
      {...props}
    >
      {children}
    </Button>
  );
}

export type SidebarSectionEndChevronProps = Omit<SidebarSectionControlProps, "children" | "render">;

/**
 * The section's chevron as the last of its controls, with a mouse on a
 * desktop (sidebar.md, Section headers): a SidebarSectionControl that is a
 * second trigger of the section, so it toggles it and turns with it. The
 * title stays the section's one toggle for the keyboard and a screen reader,
 * so this one is out of the tab order and the accessibility tree, and a press
 * doesn't move focus onto it (focus on a hidden element would be read as
 * nothing). Put it in a `SidebarSectionHeader` with `chevronAtEnd`.
 */
// A press would focus the button; it keeps focus where it was instead.
function keepFocus(event: MouseEvent) {
  event.preventDefault();
}

export function SidebarSectionEndChevron({ className, ...props }: SidebarSectionEndChevronProps) {
  const { sidebarSectionEndChevron } = sidebarSectionRecipe();
  return (
    <SidebarSectionControl
      data-end-chevron=""
      render={<Collapsible.Trigger />}
      tabIndex={-1}
      aria-hidden
      className={sidebarSectionEndChevron({ className })}
      {...mergeProps<"button">({ onMouseDown: keepFocus }, props)}
    >
      <ChevronRight />
    </SidebarSectionControl>
  );
}

export type SidebarControlProps = SidebarSectionControlProps;
export const SidebarControl = SidebarSectionControl;
