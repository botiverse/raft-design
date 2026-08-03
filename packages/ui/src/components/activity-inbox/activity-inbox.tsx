import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import type { ElementType, MouseEvent } from "react";

import type { SlotElementProps } from "../../lib/data-attributes";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import {
  ContextMenuContent,
  ContextMenuItem,
  type ContextMenuContentProps,
  type ContextMenuItemProps,
} from "../context-menu/context-menu";
import { DropdownMenuContent, type DropdownMenuContentProps } from "../dropdown-menu/dropdown-menu";
import { Panel, PanelHeader } from "../panel/panel";
import { activityInbox } from "./activity-inbox.recipe";

type DivProps = useRender.ComponentProps<"div">;
type SpanProps = useRender.ComponentProps<"span">;
type ButtonProps = useRender.ComponentProps<"button">;

function withSlot<Tag extends ElementType>(props: SlotElementProps<Tag>): SlotElementProps<Tag> {
  return props;
}

export type ActivityInboxRootProps = DivProps;
export function ActivityInboxRoot({ className, render, ...props }: ActivityInboxRootProps) {
  const theme = useThemeFamily();
  const { root } = activityInbox({ theme });
  return (
    <Panel
      render={render ?? <div />}
      {...props}
      data-slot="activity-inbox-root"
      className={root({ className })}
    />
  );
}

export type ActivityInboxHeaderProps = DivProps;
export function ActivityInboxHeader({ className, render, ...props }: ActivityInboxHeaderProps) {
  const theme = useThemeFamily();
  const { header } = activityInbox({ theme });
  return (
    <PanelHeader
      render={render}
      {...props}
      data-slot="activity-inbox-header"
      className={header({ className })}
    />
  );
}

export type ActivityInboxHeaderBackProps = ButtonProps;
export function ActivityInboxHeaderBack({
  className,
  render,
  ...props
}: ActivityInboxHeaderBackProps) {
  const theme = useThemeFamily();
  const { headerBack } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-header-back",
    className: headerBack({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxHeaderIconProps = DivProps;
export function ActivityInboxHeaderIcon({
  className,
  render,
  ...props
}: ActivityInboxHeaderIconProps) {
  const theme = useThemeFamily();
  const { headerIcon } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-header-icon",
        className: headerIcon({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxHeaderContentProps = DivProps;
export function ActivityInboxHeaderContent({
  className,
  render,
  ...props
}: ActivityInboxHeaderContentProps) {
  const theme = useThemeFamily();
  const { headerContent } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-header-content",
        className: headerContent({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxHeaderHeadingProps = DivProps;
export function ActivityInboxHeaderHeading({
  className,
  render,
  ...props
}: ActivityInboxHeaderHeadingProps) {
  const theme = useThemeFamily();
  const { headerHeading } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-header-heading",
        className: headerHeading({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxHeaderTitleProps = useRender.ComponentProps<"h2">;
export function ActivityInboxHeaderTitle({
  className,
  render,
  ...props
}: ActivityInboxHeaderTitleProps) {
  const theme = useThemeFamily();
  const { headerTitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "h2",
    render,
    props: mergeProps<"h2">(
      withSlot<"h2">({
        "data-slot": "activity-inbox-header-title",
        className: headerTitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxHeaderSubtitleProps = useRender.ComponentProps<"p">;
export function ActivityInboxHeaderSubtitle({
  className,
  render,
  ...props
}: ActivityInboxHeaderSubtitleProps) {
  const theme = useThemeFamily();
  const { headerSubtitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      withSlot<"p">({
        "data-slot": "activity-inbox-header-subtitle",
        className: headerSubtitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxLayoutProps = DivProps;
export function ActivityInboxLayout({ className, render, ...props }: ActivityInboxLayoutProps) {
  const theme = useThemeFamily();
  const { layout } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "activity-inbox-layout", className: layout({ className }) }),
      props,
    ),
  });
}

export type ActivityInboxSidebarProps = useRender.ComponentProps<"aside">;
export function ActivityInboxSidebar({ className, render, ...props }: ActivityInboxSidebarProps) {
  const theme = useThemeFamily();
  const { sidebar } = activityInbox({ theme });
  return useRender({
    defaultTagName: "aside",
    render,
    props: mergeProps<"aside">(
      withSlot<"aside">({
        "data-slot": "activity-inbox-sidebar",
        className: sidebar({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSidebarSectionProps = DivProps;
export function ActivityInboxSidebarSection({
  className,
  render,
  ...props
}: ActivityInboxSidebarSectionProps) {
  const theme = useThemeFamily();
  const { sidebarSection } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-sidebar-section",
        className: sidebarSection({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSidebarHeadingProps = DivProps;
export function ActivityInboxSidebarHeading({
  className,
  render,
  ...props
}: ActivityInboxSidebarHeadingProps) {
  const theme = useThemeFamily();
  const { sidebarHeading } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-sidebar-heading",
        className: sidebarHeading({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSidebarHeadingLabelProps = SpanProps;
export function ActivityInboxSidebarHeadingLabel({
  className,
  render,
  ...props
}: ActivityInboxSidebarHeadingLabelProps) {
  const theme = useThemeFamily();
  const { sidebarHeadingLabel } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-sidebar-heading-label",
        className: sidebarHeadingLabel({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxNavigationItemProps = ButtonProps;
export function ActivityInboxNavigationItem({
  className,
  render,
  ...props
}: ActivityInboxNavigationItemProps) {
  const theme = useThemeFamily();
  const { navigationItem } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-navigation-item",
    className: navigationItem({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxNavigationLabelProps = SpanProps;
export function ActivityInboxNavigationLabel({
  className,
  render,
  ...props
}: ActivityInboxNavigationLabelProps) {
  const theme = useThemeFamily();
  const { navigationLabel } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-navigation-label",
        className: navigationLabel({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxNavigationCountProps = SpanProps;
export function ActivityInboxNavigationCount({
  className,
  render,
  ...props
}: ActivityInboxNavigationCountProps) {
  const theme = useThemeFamily();
  const { navigationCount } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-navigation-count",
        className: navigationCount({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxMainProps = useRender.ComponentProps<"section">;
export function ActivityInboxMain({ className, render, ...props }: ActivityInboxMainProps) {
  const theme = useThemeFamily();
  const { main } = activityInbox({ theme });
  return useRender({
    defaultTagName: "section",
    render,
    props: mergeProps<"section">(
      withSlot<"section">({ "data-slot": "activity-inbox-main", className: main({ className }) }),
      props,
    ),
  });
}

export type ActivityInboxControlsProps = DivProps;
export function ActivityInboxControls({ className, render, ...props }: ActivityInboxControlsProps) {
  const theme = useThemeFamily();
  const { controls } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-controls",
        className: controls({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxMobileNavigationProps = DivProps;
export function ActivityInboxMobileNavigation({
  className,
  render,
  ...props
}: ActivityInboxMobileNavigationProps) {
  const theme = useThemeFamily();
  const { mobileNavigation } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-mobile-navigation",
        className: mobileNavigation({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxMobileNavigationButtonProps = ButtonProps;
export function ActivityInboxMobileNavigationButton({
  className,
  render,
  ...props
}: ActivityInboxMobileNavigationButtonProps) {
  const theme = useThemeFamily();
  const { mobileNavigationButton } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-mobile-navigation-button",
    className: mobileNavigationButton({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxMobileNavigationLabelProps = SpanProps;
export function ActivityInboxMobileNavigationLabel({
  className,
  render,
  ...props
}: ActivityInboxMobileNavigationLabelProps) {
  const theme = useThemeFamily();
  const { mobileNavigationLabel } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-mobile-navigation-label",
        className: mobileNavigationLabel({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSwitcherProps = BaseDialog.Root.Props;
export function ActivityInboxSwitcher(props: ActivityInboxSwitcherProps) {
  return <BaseDialog.Root data-slot="activity-inbox-switcher" {...props} />;
}

export type ActivityInboxSwitcherTriggerProps = BaseDialog.Trigger.Props;
export function ActivityInboxSwitcherTrigger(props: ActivityInboxSwitcherTriggerProps) {
  return <BaseDialog.Trigger data-slot="activity-inbox-switcher-trigger" {...props} />;
}

export type ActivityInboxSwitcherPortalProps = BaseDialog.Portal.Props;

export type ActivityInboxSwitcherContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: ActivityInboxSwitcherPortalProps;
};
export function ActivityInboxSwitcherContent({
  className,
  portalProps,
  ...props
}: ActivityInboxSwitcherContentProps) {
  const theme = useThemeFamily();
  const { switcherBackdrop, switcherContent } = activityInbox({ theme });
  return (
    <BaseDialog.Portal
      data-slot="activity-inbox-switcher-portal"
      {...useThemeScopeProps(portalProps ?? {})}
    >
      <BaseDialog.Backdrop
        data-slot="activity-inbox-switcher-backdrop"
        className={switcherBackdrop()}
      />
      <BaseDialog.Popup
        data-slot="activity-inbox-switcher-content"
        className={switcherContent({ className })}
        {...props}
      />
    </BaseDialog.Portal>
  );
}

export type ActivityInboxSwitcherHeaderProps = DivProps;
export function ActivityInboxSwitcherHeader({
  className,
  render,
  ...props
}: ActivityInboxSwitcherHeaderProps) {
  const theme = useThemeFamily();
  const { switcherHeader } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-switcher-header",
        className: switcherHeader({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSwitcherTitleProps = StyledProps<BaseDialog.Title.Props>;
export function ActivityInboxSwitcherTitle({
  className,
  ...props
}: ActivityInboxSwitcherTitleProps) {
  const theme = useThemeFamily();
  const { switcherTitle } = activityInbox({ theme });
  return (
    <BaseDialog.Title
      data-slot="activity-inbox-switcher-title"
      className={switcherTitle({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherCloseProps = StyledProps<BaseDialog.Close.Props>;
export function ActivityInboxSwitcherClose({
  className,
  ...props
}: ActivityInboxSwitcherCloseProps) {
  const theme = useThemeFamily();
  const { switcherClose } = activityInbox({ theme });
  return (
    <BaseDialog.Close
      data-slot="activity-inbox-switcher-close"
      className={switcherClose({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSwitcherBodyProps = DivProps;
export function ActivityInboxSwitcherBody({
  className,
  render,
  ...props
}: ActivityInboxSwitcherBodyProps) {
  const theme = useThemeFamily();
  const { switcherBody } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-switcher-body",
        className: switcherBody({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSwitcherItemProps = ButtonProps;
export function ActivityInboxSwitcherItem({
  className,
  render,
  ...props
}: ActivityInboxSwitcherItemProps) {
  const theme = useThemeFamily();
  const { switcherItem } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-switcher-item",
    className: switcherItem({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxSwitcherItemLabelProps = SpanProps;
export function ActivityInboxSwitcherItemLabel({
  className,
  render,
  ...props
}: ActivityInboxSwitcherItemLabelProps) {
  const theme = useThemeFamily();
  const { switcherItemLabel } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-switcher-item-label",
        className: switcherItemLabel({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSwitcherItemCountProps = SpanProps;
export function ActivityInboxSwitcherItemCount({
  className,
  render,
  ...props
}: ActivityInboxSwitcherItemCountProps) {
  const theme = useThemeFamily();
  const { switcherItemCount } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-switcher-item-count",
        className: switcherItemCount({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSwitcherSeparatorProps = DivProps;
export function ActivityInboxSwitcherSeparator({
  className,
  render,
  ...props
}: ActivityInboxSwitcherSeparatorProps) {
  const theme = useThemeFamily();
  const { switcherSeparator } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-switcher-separator",
        className: switcherSeparator({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSearchProps = DivProps;
export function ActivityInboxSearch({ className, render, ...props }: ActivityInboxSearchProps) {
  const theme = useThemeFamily();
  const { search } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "activity-inbox-search", className: search({ className }) }),
      props,
    ),
  });
}

export type ActivityInboxSearchIconProps = SpanProps;
export function ActivityInboxSearchIcon({
  className,
  render,
  ...props
}: ActivityInboxSearchIconProps) {
  const theme = useThemeFamily();
  const { searchIcon } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-search-icon",
        className: searchIcon({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSearchInputProps = useRender.ComponentProps<"input">;
export function ActivityInboxSearchInput({
  className,
  render,
  ...props
}: ActivityInboxSearchInputProps) {
  const theme = useThemeFamily();
  const { searchInput } = activityInbox({ theme });
  return useRender({
    defaultTagName: "input",
    render,
    props: mergeProps<"input">(
      withSlot<"input">({
        "data-slot": "activity-inbox-search-input",
        className: searchInput({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSearchClearProps = ButtonProps;
export function ActivityInboxSearchClear({
  className,
  render,
  ...props
}: ActivityInboxSearchClearProps) {
  const theme = useThemeFamily();
  const { searchClear } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-search-clear",
    className: searchClear({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxSelectionToolbarProps = DivProps;
export function ActivityInboxSelectionToolbar({
  className,
  render,
  ...props
}: ActivityInboxSelectionToolbarProps) {
  const theme = useThemeFamily();
  const { selectionToolbar } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-selection-toolbar",
        className: selectionToolbar({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxSelectionCountProps = SpanProps;
export function ActivityInboxSelectionCount({
  className,
  render,
  ...props
}: ActivityInboxSelectionCountProps) {
  const theme = useThemeFamily();
  const { selectionCount } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-selection-count",
        className: selectionCount({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxToolbarButtonProps = ButtonProps;
export function ActivityInboxToolbarButton({
  className,
  render,
  ...props
}: ActivityInboxToolbarButtonProps) {
  const theme = useThemeFamily();
  const { toolbarButton } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-toolbar-button",
    className: toolbarButton({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxToolbarPrimaryActionProps = ButtonProps;
export function ActivityInboxToolbarPrimaryAction({
  className,
  render,
  ...props
}: ActivityInboxToolbarPrimaryActionProps) {
  const theme = useThemeFamily();
  const { toolbarPrimaryAction } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-toolbar-primary-action",
    className: toolbarPrimaryAction({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxToolbarLinkProps = ButtonProps;
export function ActivityInboxToolbarLink({
  className,
  render,
  ...props
}: ActivityInboxToolbarLinkProps) {
  const theme = useThemeFamily();
  const { toolbarLink } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-toolbar-link",
    className: toolbarLink({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxSortTriggerProps = ButtonProps;
export function ActivityInboxSortTrigger({
  className,
  render,
  ...props
}: ActivityInboxSortTriggerProps) {
  const theme = useThemeFamily();
  const { sortTrigger } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-sort-trigger",
    className: sortTrigger({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxSortContentProps = DropdownMenuContentProps;
export function ActivityInboxSortContent({ className, ...props }: ActivityInboxSortContentProps) {
  const theme = useThemeFamily();
  const { sortContent } = activityInbox({ theme });
  return <DropdownMenuContent className={sortContent({ className })} {...props} />;
}

export type ActivityInboxSortItemProps = StyledProps<BaseMenu.RadioItem.Props>;
export function ActivityInboxSortItem({ className, ...props }: ActivityInboxSortItemProps) {
  const theme = useThemeFamily();
  const { sortItem } = activityInbox({ theme });
  return (
    <BaseMenu.RadioItem
      data-slot="activity-inbox-sort-item"
      className={sortItem({ className })}
      {...props}
    />
  );
}

export type ActivityInboxSortItemIndicatorProps = SpanProps;
export function ActivityInboxSortItemIndicator({
  className,
  render,
  ...props
}: ActivityInboxSortItemIndicatorProps) {
  const { sortItemIndicator } = activityInbox();
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-sort-item-indicator",
        className: sortItemIndicator({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxViewportProps = DivProps;
export function ActivityInboxViewport({ className, render, ...props }: ActivityInboxViewportProps) {
  const theme = useThemeFamily();
  const { viewport } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-viewport",
        className: viewport({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxListProps = DivProps;
export function ActivityInboxList({ className, render, ...props }: ActivityInboxListProps) {
  const theme = useThemeFamily();
  const { list } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({ "data-slot": "activity-inbox-list", className: list({ className }) }),
      props,
    ),
  });
}

export type ActivityInboxItemProps = DivProps;
export function ActivityInboxItem({ className, render, ...props }: ActivityInboxItemProps) {
  const theme = useThemeFamily();
  const { item } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"div"> = {
    "data-slot": "activity-inbox-item",
    className: item({ className: `group/activity-item ${className ?? ""}`.trim() }),
  };
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
  });
}

export type ActivityInboxItemMenuContentProps = ContextMenuContentProps;
export function ActivityInboxItemMenuContent({
  className,
  ...props
}: ActivityInboxItemMenuContentProps) {
  const theme = useThemeFamily();
  const { itemMenuContent } = activityInbox({ theme });
  return <ContextMenuContent className={itemMenuContent({ className })} {...props} />;
}

export type ActivityInboxItemMenuItemProps = ContextMenuItemProps;
export function ActivityInboxItemMenuItem({ className, ...props }: ActivityInboxItemMenuItemProps) {
  const theme = useThemeFamily();
  const { itemMenuItem } = activityInbox({ theme });
  return <ContextMenuItem className={itemMenuItem({ className })} {...props} />;
}

export type ActivityInboxItemOpenProps = ButtonProps;
export function ActivityInboxItemOpen({ className, render, ...props }: ActivityInboxItemOpenProps) {
  const theme = useThemeFamily();
  const { itemOpen } = activityInbox({ theme });
  const defaultProps: SlotElementProps<"button"> = {
    "data-slot": "activity-inbox-item-open",
    className: itemOpen({ className }),
    type: "button",
  };
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type ActivityInboxItemSelectionProps = Omit<ButtonProps, "onChange"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};
export function ActivityInboxItemSelection({
  checked,
  className,
  onCheckedChange,
  onClick,
  render,
  ...props
}: ActivityInboxItemSelectionProps) {
  const theme = useThemeFamily();
  const { itemSelection } = activityInbox({ theme });
  const activate = () => onCheckedChange(!checked);
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "aria-checked": checked,
        "data-slot": "activity-inbox-item-selection",
        className: itemSelection({ className }),
        onClick: (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          activate();
          onClick?.(event);
        },
        role: "checkbox",
        type: "button",
      }),
      props,
    ),
  });
}

export type ActivityInboxItemContentProps = DivProps;
export function ActivityInboxItemContent({
  className,
  render,
  ...props
}: ActivityInboxItemContentProps) {
  const theme = useThemeFamily();
  const { itemContent } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-content",
        className: itemContent({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemSubtitleProps = DivProps;
export function ActivityInboxItemSubtitle({
  className,
  render,
  ...props
}: ActivityInboxItemSubtitleProps) {
  const theme = useThemeFamily();
  const { itemSubtitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-subtitle",
        className: itemSubtitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemHeadingProps = DivProps;
export function ActivityInboxItemHeading({
  className,
  render,
  ...props
}: ActivityInboxItemHeadingProps) {
  const theme = useThemeFamily();
  const { itemHeading } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-heading",
        className: itemHeading({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTitleProps = DivProps;
export function ActivityInboxItemTitle({
  className,
  render,
  ...props
}: ActivityInboxItemTitleProps) {
  const theme = useThemeFamily();
  const { itemTitle } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-title",
        className: itemTitle({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTitleIconProps = SpanProps;
export function ActivityInboxItemTitleIcon({
  className,
  render,
  ...props
}: ActivityInboxItemTitleIconProps) {
  const theme = useThemeFamily();
  const { itemTitleIcon } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "aria-hidden": true,
        "data-slot": "activity-inbox-item-title-icon",
        className: itemTitleIcon({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemTimestampProps = SpanProps;
export function ActivityInboxItemTimestamp({
  className,
  render,
  ...props
}: ActivityInboxItemTimestampProps) {
  const theme = useThemeFamily();
  const { itemTimestamp } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-item-timestamp",
        className: itemTimestamp({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemBodyProps = useRender.ComponentProps<"p">;
export function ActivityInboxItemBody({ className, render, ...props }: ActivityInboxItemBodyProps) {
  const theme = useThemeFamily();
  const { itemBody } = activityInbox({ theme });
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      withSlot<"p">({
        "data-slot": "activity-inbox-item-body",
        className: itemBody({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemSenderProps = SpanProps;
export function ActivityInboxItemSender({
  className,
  render,
  ...props
}: ActivityInboxItemSenderProps) {
  const theme = useThemeFamily();
  const { itemSender } = activityInbox({ theme });
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      withSlot<"span">({
        "data-slot": "activity-inbox-item-sender",
        className: itemSender({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemMetadataProps = DivProps;
export function ActivityInboxItemMetadata({
  className,
  render,
  ...props
}: ActivityInboxItemMetadataProps) {
  const theme = useThemeFamily();
  const { itemMetadata } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-metadata",
        className: itemMetadata({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemActionsProps = DivProps;
export function ActivityInboxItemActions({
  className,
  render,
  ...props
}: ActivityInboxItemActionsProps) {
  const theme = useThemeFamily();
  const { itemActions } = activityInbox({ theme });
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      withSlot<"div">({
        "data-slot": "activity-inbox-item-actions",
        className: itemActions({ className }),
      }),
      props,
    ),
  });
}

export type ActivityInboxItemActionProps = ButtonProps;
export function ActivityInboxItemAction({
  className,
  render,
  ...props
}: ActivityInboxItemActionProps) {
  const theme = useThemeFamily();
  const { itemAction } = activityInbox({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "activity-inbox-item-action",
        className: itemAction({ className }),
        type: "button",
      }),
      props,
    ),
  });
}

export type ActivityInboxItemSavedActionProps = ActivityInboxItemActionProps;
export function ActivityInboxItemSavedAction({
  className,
  render,
  ...props
}: ActivityInboxItemSavedActionProps) {
  const theme = useThemeFamily();
  const { itemSavedAction } = activityInbox({ theme });
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      withSlot<"button">({
        "data-slot": "activity-inbox-item-saved-action",
        className: itemSavedAction({ className }),
        type: "button",
      }),
      props,
    ),
  });
}
