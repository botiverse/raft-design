import { Button as BaseButton } from "@base-ui/react/button";
import { Collapsible } from "@base-ui/react/collapsible";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button";
import type { ButtonProps } from "../button";
import { Spinner } from "../spinner";
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
  const theme = useThemeFamily();
  const { sidebarSection } = sidebarSectionRecipe({ theme });
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
  const theme = useThemeFamily();
  const { sidebarSectionEmpty } = sidebarSectionRecipe({ theme });
  const defaultProps: ComponentProps<typeof Collapsible.Panel> & DataAttributes = {
    "data-slot": "sidebar-section-empty",
    className: sidebarSectionEmpty({ className }),
  };

  return <Collapsible.Panel render={render} {...mergeProps(defaultProps, props)} />;
}

export type SidebarSectionHeaderProps = useRender.ComponentProps<"div">;

export function SidebarSectionHeader({ className, render, ...props }: SidebarSectionHeaderProps) {
  const theme = useThemeFamily();
  const { sidebarSectionHeader } = sidebarSectionRecipe({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "sidebar-section-header",
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
  const theme = useThemeFamily();
  const { sidebarSectionDisclosure } = sidebarSectionRecipe({ theme });
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
  const defaultProps: useRender.ElementProps<"svg"> & DataAttributes = {
    "data-slot": "sidebar-section-chevron",
    className: cn("size-3", className),
  };

  const chevron = useRender({
    render: render ?? <ChevronRight />,
    props: mergeProps<"svg">(defaultProps, props),
  });

  // Match SidebarItemIcon slot width so section chevrons share the item icon axis.
  return (
    <span className="flex size-4.5 shrink-0 items-center justify-center" aria-hidden="true">
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
  const theme = useThemeFamily();
  const { sidebarSectionCount } = sidebarSectionRecipe({ theme });
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
  const theme = useThemeFamily();
  const { sidebarSectionAttention } = sidebarSectionRecipe();
  const resolvedVariant = variant ?? (theme === "elegant" ? "primary" : "accent");
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
  const theme = useThemeFamily();
  const { sidebarSectionTrailing } = sidebarSectionRecipe({ theme });
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
  const theme = useThemeFamily();
  const { sidebarSectionControls } = sidebarSectionRecipe({ theme });
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
  size = "icon-sm",
  variant = "ghost",
  loading = false,
  loadingLabel = "Loading",
  children,
  disabled,
  ...props
}: SidebarSectionControlProps) {
  const theme = useThemeFamily();
  const { sidebarSectionControl } = sidebarSectionRecipe({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    type: "button",
    "data-slot": "sidebar-section-control",
    "data-loading": loading ? "true" : undefined,
    disabled: disabled || loading,
    "aria-disabled": loading || undefined,
    className: sidebarSectionControl({ className }),
    children: loading ? <Spinner aria-label={loadingLabel} /> : children,
  };
  const brutalControl = useRender({
    render: render ?? <BaseButton />,
    props: mergeProps<"button">(defaultProps, props),
  });

  if (theme === "elegant") {
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

  return brutalControl;
}

export type SidebarControlProps = SidebarSectionControlProps;
export const SidebarControl = SidebarSectionControl;
